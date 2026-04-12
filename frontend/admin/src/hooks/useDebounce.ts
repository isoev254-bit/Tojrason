<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>useDebounce.ts</title>
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
// frontend/admin/src/hooks/useDebounce.ts
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Хук барои таъхир додани навсозии қимат (debounce)
 * Барои ҷустуҷӯ, воридот ва дигар амалҳое, ки бояд пас аз таваққуфи корбар иҷро шаванд
 * 
 * @param value - Қимате, ки бояд таъхир дода шавад
 * @param delay - Таъхир дар миллисония (пешфарз: 500)
 * @returns Қимати таъхирдодашуда
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * 
 * useEffect(() => {
 *   if (debouncedSearch) {
 *     searchApi(debouncedSearch);
 *   }
 * }, [debouncedSearch]);
 */
export function useDebounce&lt;T&gt;(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState&lt;T&gt;(value);

    useEffect(() =&gt; {
        const timer = setTimeout(() =&gt; {
            setDebouncedValue(value);
        }, delay);

        return () =&gt; {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Хук барои функсияи таъхирдодашуда (debounced callback)
 * Барои функсияҳое, ки набояд зуд-зуд иҷро шаванд
 * 
 * @param callback - Функсияе, ки бояд таъхир дода шавад
 * @param delay - Таъхир дар миллисония (пешфарз: 500)
 * @returns Функсияи таъхирдодашуда
 * 
 * @example
 * const debouncedSearch = useDebouncedCallback((term) => {
 *   searchApi(term);
 * }, 500);
 * 
 * // Ҳангоми воридот
 * onChange={(e) => debouncedSearch(e.target.value)}
 */
export function useDebouncedCallback&lt;T extends (...args: any[]) =&gt; any&gt;(
    callback: T,
    delay: number = 500
): (...args: Parameters&lt;T&gt;) =&gt; void {
    const timeoutRef = useRef&lt;ReturnType&lt;typeof setTimeout&gt; | null&gt;(null);
    const callbackRef = useRef(callback);

    useEffect(() =&gt; {
        callbackRef.current = callback;
    }, [callback]);

    const debouncedCallback = useCallback(
        (...args: Parameters&lt;T&gt;) =&gt; {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() =&gt; {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );

    // Тоза кардани таймер ҳангоми unmount
    useEffect(() =&gt; {
        return () =&gt; {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedCallback;
}

/**
 * Хук барои боздоштани иҷрои функсия (throttle)
 * Барои функсияҳое, ки бояд дар фосилаи муайян иҷро шаванд (масалан, ҷойгиршавӣ)
 * 
 * @param callback - Функсияе, ки бояд маҳдуд карда шавад
 * @param limit - Маҳдудият дар миллисония (пешфарз: 1000)
 * @returns Функсияи маҳдудшуда
 * 
 * @example
 * const throttledUpdate = useThrottledCallback((position) => {
 *   updateLocation(position);
 * }, 1000);
 * 
 * // Ҳангоми ҳаракати курсор
 * onMouseMove={(e) => throttledUpdate({ x: e.clientX, y: e.clientY })}
 */
export function useThrottledCallback&lt;T extends (...args: any[]) =&gt; any&gt;(
    callback: T,
    limit: number = 1000
): (...args: Parameters&lt;T&gt;) =&gt; void {
    const lastRunRef = useRef&lt;number&gt;(0);
    const timeoutRef = useRef&lt;ReturnType&lt;typeof setTimeout&gt; | null&gt;(null);
    const callbackRef = useRef(callback);

    useEffect(() =&gt; {
        callbackRef.current = callback;
    }, [callback]);

    const throttledCallback = useCallback(
        (...args: Parameters&lt;T&gt;) =&gt; {
            const now = Date.now();
            const timeSinceLastRun = now - lastRunRef.current;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }

            if (timeSinceLastRun >= limit) {
                // Вақти кофӣ гузаштааст, фавран иҷро кун
                lastRunRef.current = now;
                callbackRef.current(...args);
            } else {
                // Иҷро бо таъхир
                timeoutRef.current = setTimeout(() =&gt; {
                    lastRunRef.current = Date.now();
                    callbackRef.current(...args);
                    timeoutRef.current = null;
                }, limit - timeSinceLastRun);
            }
        },
        [limit]
    );

    useEffect(() =&gt; {
        return () =&gt; {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return throttledCallback;
}

/**
 * Хук барои нигоҳдории қимати қаблӣ
 * 
 * @param value - Қимати ҷорӣ
 * @returns Қимати қаблӣ
 * 
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 */
export function usePrevious&lt;T&gt;(value: T): T | undefined {
    const ref = useRef&lt;T&gt;();
    
    useEffect(() =&gt; {
        ref.current = value;
    }, [value]);
    
    return ref.current;
}

export default useDebounce;
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
