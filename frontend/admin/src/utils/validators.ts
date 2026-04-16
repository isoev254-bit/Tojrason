<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>validators.ts</title>
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
// frontend/admin/src/utils/validators.ts

/**
 * Валидаторҳои майдонҳои маъмулӣ барои формҳо
 */

export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

// ============================================
// Email
// ============================================
export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === '') {
        return { isValid: false, message: 'Email ҳатмист' };
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { isValid: false, message: 'Формати email нодуруст аст' };
    }
    return { isValid: true };
};

// ============================================
// Телефон (рақамҳои тоҷикӣ/байналмилалӣ)
// ============================================
export const validatePhone = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === '') {
        return { isValid: false, message: 'Рақами телефон ҳатмист' };
    }
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    if (!phoneRegex.test(phone)) {
        return { isValid: false, message: 'Рақами телефон бояд 9-15 рақам дошта бошад' };
    }
    return { isValid: true };
};

// ============================================
// Парол
// ============================================
export const validatePassword = (password: string, minLength: number = 6): ValidationResult => {
    if (!password) {
        return { isValid: false, message: 'Парол ҳатмист' };
    }
    if (password.length < minLength) {
        return { isValid: false, message: `Парол бояд ҳадди ақал ${minLength} рамз дошта бошад` };
    }
    if (password.length > 100) {
        return { isValid: false, message: 'Парол набояд аз 100 рамз зиёд бошад' };
    }
    return { isValid: true };
};

export const validatePasswordMatch = (password: string, confirmPassword: string): ValidationResult => {
    if (password !== confirmPassword) {
        return { isValid: false, message: 'Паролҳо мувофиқат намекунанд' };
    }
    return { isValid: true };
};

// ============================================
// Номи пурра
// ============================================
export const validateFullName = (name: string): ValidationResult => {
    if (!name || name.trim() === '') {
        return { isValid: false, message: 'Номи пурра ҳатмист' };
    }
    if (name.trim().length < 2) {
        return { isValid: false, message: 'Ном бояд ҳадди ақал 2 ҳарф дошта бошад' };
    }
    if (name.length > 100) {
        return { isValid: false, message: 'Ном набояд аз 100 ҳарф зиёд бошад' };
    }
    return { isValid: true };
};

// ============================================
// Маблағ (нарх)
// ============================================
export const validateAmount = (amount: number | string): ValidationResult => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) {
        return { isValid: false, message: 'Маблағ бояд адад бошад' };
    }
    if (num < 0) {
        return { isValid: false, message: 'Маблағ набояд манфӣ бошад' };
    }
    if (num > 10000000) {
        return { isValid: false, message: 'Маблағ набояд аз 10,000,000 зиёд бошад' };
    }
    return { isValid: true };
};

// ============================================
// Суроға (ноҳия, кӯча, бино)
// ============================================
export const validateAddress = (address: string): ValidationResult => {
    if (!address || address.trim() === '') {
        return { isValid: false, message: 'Суроға ҳатмист' };
    }
    if (address.trim().length < 3) {
        return { isValid: false, message: 'Суроға бояд ҳадди ақал 3 ҳарф дошта бошад' };
    }
    return { isValid: true };
};

// ============================================
// Координатаҳо (lat, lng)
// ============================================
export const validateLatitude = (lat: number): ValidationResult => {
    if (typeof lat !== 'number' || isNaN(lat)) {
        return { isValid: false, message: 'Арзиши паҳноӣ бояд адад бошад' };
    }
    if (lat < -90 || lat > 90) {
        return { isValid: false, message: 'Арзиши паҳноӣ бояд дар байни -90 ва 90 бошад' };
    }
    return { isValid: true };
};

export const validateLongitude = (lng: number): ValidationResult => {
    if (typeof lng !== 'number' || isNaN(lng)) {
        return { isValid: false, message: 'Арзиши дарозӣ бояд адад бошад' };
    }
    if (lng < -180 || lng > 180) {
        return { isValid: false, message: 'Арзиши дарозӣ бояд дар байни -180 ва 180 бошад' };
    }
    return { isValid: true };
};

// ============================================
// Воситаи нақлиёт (барои курьер)
// ============================================
export const validateVehicle = (vehicle: string): ValidationResult => {
    if (!vehicle || vehicle.trim() === '') {
        return { isValid: false, message: 'Воситаи нақлиёт ҳатмист' };
    }
    const allowed = ['🏍 Мотосикл', '🚗 Мошин', '🚲 Велосипед', '🛵 Скутер'];
    if (!allowed.includes(vehicle)) {
        return { isValid: false, message: 'Воситаи нақлиёт нодуруст аст' };
    }
    return { isValid: true };
};

// ============================================
// URL (барои redirect)
// ============================================
export const validateUrl = (url: string): ValidationResult => {
    if (!url) return { isValid: true }; // ихтиёрӣ
    try {
        new URL(url);
        return { isValid: true };
    } catch {
        return { isValid: false, message: 'URL нодуруст аст' };
    }
};

// ============================================
// Валидатор барои тамоми форма (объект)
// ============================================
export type ValidatorRule<T> = {
    field: keyof T;
    validate: (value: any) => ValidationResult;
};

export const validateForm = <T extends Record<string, any>>(
    data: T,
    rules: ValidatorRule<T>[]
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};
    let isValid = true;
    
    for (const rule of rules) {
        const value = data[rule.field];
        const result = rule.validate(value);
        if (!result.isValid) {
            errors[rule.field] = result.message;
            isValid = false;
        }
    }
    
    return { isValid, errors };
};
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
