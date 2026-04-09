<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Footer.tsx</title>
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
// frontend/admin/src/components/layout/Footer/Footer.tsx
import React from 'react';
import './Footer.module.css';

export interface FooterProps {
    /** Номи ширкат */
    companyName?: string;
    /** Сол */
    year?: number;
    /** Версия */
    version?: string;
    /** Массив линкҳои иловагӣ */
    links?: Array<{ label: string; href: string; onClick?: () => void }>;
    /** Классҳои иловагӣ */
    className?: string;
}

export const Footer: React.FC&lt;FooterProps&gt; = ({
    companyName = 'Tojrason',
    year = new Date().getFullYear(),
    version = '1.0.0',
    links = [
        { label: 'Дастури корбар', href: '/docs' },
        { label: 'Дастгирӣ', href: '/support' },
        { label: 'Шароитҳо', href: '/terms' },
    ],
    className = '',
}) => {
    return (
        &lt;footer className={`footer ${className}`}&gt;
            &lt;div className="footer-content"&gt;
                &lt;div className="footer-copyright"&gt;
                    &lt;span&gt;© {year} {companyName}. Ҳамаи ҳуқуқҳо маҳфуз.&lt;/span&gt;
                    &lt;span className="footer-version"&gt;Версия {version}&lt;/span&gt;
                &lt;/div&gt;
                {links && links.length > 0 && (
                    &lt;div className="footer-links"&gt;
                        {links.map((link, index) => (
                            &lt;React.Fragment key={index}&gt;
                                &lt;a
                                    href={link.href}
                                    className="footer-link"
                                    onClick={(e) => {
                                        if (link.onClick) {
                                            e.preventDefault();
                                            link.onClick();
                                        }
                                    }}
                                &gt;
                                    {link.label}
                                &lt;/a&gt;
                                {index < links.length - 1 && &lt;span className="footer-separator"&gt;•&lt;/span&gt;}
                            &lt;/React.Fragment&gt;
                        ))}
                    &lt;/div&gt;
                )}
            &lt;/div&gt;
        &lt;/footer&gt;
    );
};

Footer.displayName = 'Footer';

export default Footer;
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
