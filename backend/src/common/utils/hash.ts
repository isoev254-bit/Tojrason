<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>hash.ts</title>
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
// common/utils/hash.ts - Функсияҳо барои хэш кардани парол ва муқоиса
import bcrypt from 'bcryptjs';

/**
 * Хэш кардани парол
 * @param password - Пароли оддӣ (матн)
 * @returns Пароли хэшшуда
 */
export const hashPassword = async (password: string): Promise&lt;string&gt; => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/**
 * Муқоисаи пароли оддӣ бо хэш
 * @param password - Пароли оддӣ (матн)
 * @param hash - Пароли хэшшуда
 * @returns true агар мувофиқат кунад, false дар акси ҳол
 */
export const comparePassword = async (password: string, hash: string): Promise&lt;boolean&gt; => {
    return bcrypt.compare(password, hash);
};
    </pre>
</div>
<script>
function copyCode() {
    const code = document.getElementById('codeBlock').innerText;
    navigator.clipboard.writeText(code).then(() => {
        alert('Код копия карда шуд!');
    }).catch(() => {
        alert('Хатогӣ ҳангоми копия кардан');
    });
}
</script>
</body>
</html>
