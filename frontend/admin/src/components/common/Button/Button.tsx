<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Button.tsx</title>
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
// frontend/admin/src/components/common/Button/Button.tsx
import React from 'react';
import './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes&lt;HTMLButtonElement&gt; {
    /** Варианти услубӣ */
    variant?: ButtonVariant;
    /** Андозаи тугма */
    size?: ButtonSize;
    /** Оё тугма пурра паҳн шавад (full width) */
    fullWidth?: boolean;
    /** Оё тугма дар ҳоли боркунӣ аст */
    loading?: boolean;
    /** Иконка дар тарафи чап */
    leftIcon?: React.ReactNode;
    /** Иконка дар тарафи рост */
    rightIcon?: React.ReactNode;
    /** Матни тугма */
    children?: React.ReactNode;
}

export const Button: React.FC&lt;ButtonProps&gt; = ({
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    className = '',
    ...restProps
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const widthClass = fullWidth ? 'btn-full-width' : '';
    const loadingClass = loading ? 'btn-loading' : '';

    const combinedClassName = [
        baseClass,
        variantClass,
        sizeClass,
        widthClass,
        loadingClass,
        className,
    ].filter(Boolean).join(' ');

    return (
        &lt;button
            className={combinedClassName}
            disabled={disabled || loading}
            {...restProps}
        &gt;
            {loading && (
                &lt;span className="btn-spinner"&gt;
                    &lt;svg className="spinner" viewBox="0 0 50 50"&gt;
                        &lt;circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4" /&gt;
                    &lt;/svg&gt;
                &lt;/span&gt;
            )}
            {!loading && leftIcon && &lt;span className="btn-icon-left"&gt;{leftIcon}&lt;/span&gt;}
            &lt;span className="btn-text"&gt;{children}&lt;/span&gt;
            {!loading && rightIcon && &lt;span className="btn-icon-right"&gt;{rightIcon}&lt;/span&gt;}
        &lt;/button&gt;
    );
};

Button.displayName = 'Button';

export default Button;
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
