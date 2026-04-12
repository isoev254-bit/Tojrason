<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>useSocket.ts</title>
    <style>
        .code-container {
            background-color: #1e1e1e;
            color: #d4d4d4;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            position: relative;
            margin: 20px 0;
        }
        .copy-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background-color: #007acc;
            color: white;
            border: none;
            padding: 5px 12px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 12px;
        }
        .copy-btn:hover {
            background-color: #005a9e;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
<div class="code-container">
    <button class="copy-btn" onclick="copyCode()">Копия кардан</button>
    <pre id="codeBlock">
// frontend/admin/src/hooks/useSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface SocketOptions {
    /** URL-и сервери Socket.IO */
    url?: string;
    /** Автоматикӣ пайваст шавад */
    autoConnect?: boolean;
    /** Рӯйдодҳои гӯшкунӣ */
    events?: Record&lt;string, (data: any) =&gt; void&gt;;
}

export interface UseSocketReturn {
    /** Оям пайваст аст */
    isConnected: boolean;
    /** Оям дар ҳоли пайвастшавӣ аст */
    isConnecting: boolean;
    /** Хатогӣ */
    error: string | null;
    /** Функсия барои фиристодани рӯйдод */
    emit: (event: string, data?: any) =&gt; void;
    /** Функсия барои пайвастшавӣ */
    connect: () =&gt; void;
    /** Функсия барои ҷудошавӣ */
    disconnect: () =&gt; void;
    /** Функсия барои гӯш кардани рӯйдод */
    on: (event: string, callback: (data: any) =&gt; void) =&gt; void;
    /** Функсия барои нест кардани гӯшкунӣ */
    off: (event: string, callback?: (data: any) =&gt; void) =&gt; void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = (options?: SocketOptions): UseSocketReturn =&gt; {
    const socketRef = useRef&lt;Socket | null&gt;(null);
    const [isConnected, setIsConnected] = useState&lt;boolean&gt;(false);
    const [isConnecting, setIsConnecting] = useState&lt;boolean&gt;(false);
    const [error, setError] = useState&lt;string | null&gt;(null);
    const eventHandlersRef = useRef&lt;Map&lt;string, Set&lt;(data: any) =&gt; void&gt;&gt;&gt;(new Map());

    const url = options?.url || SOCKET_URL;

    const on = useCallback((event: string, callback: (data: any) =&gt; void) =&gt; {
        if (!eventHandlersRef.current.has(event)) {
            eventHandlersRef.current.set(event, new Set());
        }
        eventHandlersRef.current.get(event)!.add(callback);
        
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    }, []);

    const off = useCallback((event: string, callback?: (data: any) =&gt; void) =&gt; {
        if (callback) {
            eventHandlersRef.current.get(event)?.delete(callback);
            if (socketRef.current) {
                socketRef.current.off(event, callback);
            }
        } else {
            eventHandlersRef.current.delete(event);
            if (socketRef.current) {
                socketRef.current.off(event);
            }
        }
    }, []);

    const emit = useCallback((event: string, data?: any) =&gt; {
        if (socketRef.current &amp;&amp; isConnected) {
            socketRef.current.emit(event, data);
        } else {
            console.warn(`Socket not connected, cannot emit ${event}`);
        }
    }, [isConnected]);

    const connect = useCallback(() =&gt; {
        if (socketRef.current &amp;&amp; socketRef.current.connected) return;
        if (isConnecting) return;

        setIsConnecting(true);
        setError(null);

        const token = localStorage.getItem('accessToken');
        
        socketRef.current = io(url, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current.on('connect', () =&gt; {
            setIsConnected(true);
            setIsConnecting(false);
            setError(null);
            
            // Азнав бақайдгирии ҳамаи гӯшкуниҳо
            eventHandlersRef.current.forEach((handlers, event) =&gt; {
                handlers.forEach(handler =&gt; {
                    socketRef.current?.on(event, handler);
                });
            });
        });

        socketRef.current.on('disconnect', (reason) =&gt; {
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // Сервер ҷудо кардааст, бояд дастӣ пайваст шавем
                socketRef.current?.connect();
            }
        });

        socketRef.current.on('connect_error', (err) =&gt; {
            setError(err.message);
            setIsConnecting(false);
        });

        // Рӯйдодҳои гӯшкунии иловагӣ аз options
        if (options?.events) {
            Object.entries(options.events).forEach(([event, handler]) =&gt; {
                on(event, handler);
            });
        }
    }, [url, options, on, isConnecting]);

    const disconnect = useCallback(() =&gt; {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
        setIsConnected(false);
        setIsConnecting(false);
    }, []);

    // Пайвастшавӣ ҳангоми насби компонент (агар autoConnect true бошад)
    useEffect(() =&gt; {
        if (options?.autoConnect !== false) {
            connect();
        }
        
        return () =&gt; {
            disconnect();
        };
    }, [connect, disconnect, options?.autoConnect]);

    return {
        isConnected,
        isConnecting,
        error,
        emit,
        connect,
        disconnect,
        on,
        off,
    };
};

// Хук барои гӯш кардани рӯйдодҳои мушаххас
export const useSocketEvent = &lt;T = any&gt;(
    eventName: string,
    handler: (data: T) =&gt; void,
    deps: any[] = []
) =&gt; {
    const { on, off, isConnected } = useSocket();
    
    useEffect(() =&gt; {
        if (!isConnected) return;
        
        on(eventName, handler);
        
        return () =&gt; {
            off(eventName, handler);
        };
    }, [eventName, handler, isConnected, on, off, ...deps]);
};

// Хук барои фиристодани рӯйдодҳо
export const useSocketEmit = () =&gt; {
    const { emit, isConnected } = useSocket();
    
    const emitSafe = useCallback((event: string, data?: any) =&gt; {
        if (!isConnected) {
            console.warn(`Socket not connected, cannot emit ${event}`);
            return false;
        }
        emit(event, data);
        return true;
    }, [emit, isConnected]);
    
    return { emit: emitSafe, isConnected };
};

export default useSocket;
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('✅ Код копия карда шуд!');
    }).catch(() => {
        alert('❌ Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
