<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>useLocalStorage.ts</title>
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
// frontend/admin/src/hooks/useLocalStorage.ts
import { useState, useEffect, useCallback } from 'react';

/**
 * Хук барои кор бо localStorage дар React
 * Маълумотро дар localStorage нигоҳ медорад ва ҳангоми тағйирёбӣ state-ро навсозӣ мекунад
 * 
 * @param key - Калиди дар localStorage
 * @param initialValue - Қимати аввала (агар дар localStorage набошад)
 * @returns [value, setValue, removeValue] - Қимат, функсияи навсозӣ, функсияи нест кардан
 * 
 * @example
 * const [user, setUser, removeUser] = useLocalStorage('user', { name: 'Admin' });
 * setUser({ name: 'New Admin', role: 'ADMIN' });
 * removeUser();
 */
export function useLocalStorage&lt;T&gt;(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) =&gt; T)) =&gt; void, () =&gt; void] {
    // Функсия барои гирифтани қимат аз localStorage
    const readValue = useCallback((): T =&gt; {
        // Агар дар муҳити сервер бошем (SSR), қимати авваларо бармегардонем
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                return JSON.parse(item) as T;
            }
            return initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState&lt;T&gt;(readValue);

    // Функсия барои навсозии қимат дар localStorage ва state
    const setValue = useCallback(
        (value: T | ((val: T) =&gt; T)) =&gt; {
            if (typeof window === 'undefined') {
                console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
                return;
            }

            try {
                const newValue = value instanceof Function ? value(storedValue) : value;
                window.localStorage.setItem(key, JSON.stringify(newValue));
                setStoredValue(newValue);
                
                // Барои синхронизатсия дар ҳамон таб (tab)
                window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(newValue) }));
            } catch (error) {
                console.warn(`Error setting localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    // Функсия барои нест кардани қимат аз localStorage
    const removeValue = useCallback(() =&gt; {
        if (typeof window === 'undefined') {
            console.warn(`Tried removing localStorage key "${key}" even though environment is not a client`);
            return;
        }

        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue);
            window.dispatchEvent(new StorageEvent('storage', { key }));
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [initialValue, key]);

    // Гӯш кардани тағйирот дар дигар табҳо (tabs)
    useEffect(() =&gt; {
        const handleStorageChange = (event: StorageEvent) =&gt; {
            if (event.key === key) {
                if (event.newValue === null) {
                    setStoredValue(initialValue);
                } else {
                    try {
                        const newValue = JSON.parse(event.newValue) as T;
                        setStoredValue(newValue);
                    } catch {
                        setStoredValue(initialValue);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () =&gt; window.removeEventListener('storage', handleStorageChange);
    }, [initialValue, key]);

    return [storedValue, setValue, removeValue];
}

/**
 * Хук барои кор бо sessionStorage
 * Ба монанди useLocalStorage, аммо маълумотҳо пас аз бастани таб нест мешаванд
 * 
 * @param key - Калиди дар sessionStorage
 * @param initialValue - Қимати аввала (агар дар sessionStorage набошад)
 * @returns [value, setValue, removeValue]
 */
export function useSessionStorage&lt;T&gt;(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) =&gt; T)) =&gt; void, () =&gt; void] {
    const readValue = useCallback((): T =&gt; {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.sessionStorage.getItem(key);
            if (item) {
                return JSON.parse(item) as T;
            }
            return initialValue;
        } catch (error) {
            console.warn(`Error reading sessionStorage key "${key}":`, error);
            return initialValue;
        }
    }, [initialValue, key]);

    const [storedValue, setStoredValue] = useState&lt;T&gt;(readValue);

    const setValue = useCallback(
        (value: T | ((val: T) =&gt; T)) =&gt; {
            if (typeof window === 'undefined') {
                console.warn(`Tried setting sessionStorage key "${key}" even though environment is not a client`);
                return;
            }

            try {
                const newValue = value instanceof Function ? value(storedValue) : value;
                window.sessionStorage.setItem(key, JSON.stringify(newValue));
                setStoredValue(newValue);
            } catch (error) {
                console.warn(`Error setting sessionStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    const removeValue = useCallback(() =&gt; {
        if (typeof window === 'undefined') {
            console.warn(`Tried removing sessionStorage key "${key}" even though environment is not a client`);
            return;
        }

        try {
            window.sessionStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch (error) {
            console.warn(`Error removing sessionStorage key "${key}":`, error);
        }
    }, [initialValue, key]);

    useEffect(() =&gt; {
        const handleStorageChange = (event: StorageEvent) =&gt; {
            if (event.key === key && event.storageArea === window.sessionStorage) {
                if (event.newValue === null) {
                    setStoredValue(initialValue);
                } else {
                    try {
                        const newValue = JSON.parse(event.newValue) as T;
                        setStoredValue(newValue);
                    } catch {
                        setStoredValue(initialValue);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () =&gt; window.removeEventListener('storage', handleStorageChange);
    }, [initialValue, key]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
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
