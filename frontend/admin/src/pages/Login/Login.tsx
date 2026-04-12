<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Login.tsx</title>
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
// frontend/admin/src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../hooks/useAuth';
import './Login.module.css';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Лутфан email ва паролро ворид кунед');
            return;
        }

        const success = await login(email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Email ё парол нодуруст аст');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <div className="logo-icon">Т</div>
                            <span className="logo-text">Tojrason</span>
                        </div>
                        <h1 className="login-title">Воридшавӣ</h1>
                        <p className="login-subtitle">Ба панели идоракунӣ ворид шавед</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {error && (
                            <div className="error-message">
                                ⚠️ {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@tojrason.com"
                            fullWidth
                            required
                        />

                        <Input
                            label="Парол"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            fullWidth
                            required
                        />

                        <div className="login-options">
                            <label className="checkbox-label">
                                <input type="checkbox" />
                                <span>Дар хотир нигоҳ доштан</span>
                            </label>
                            <a href="#" className="forgot-link">Паролро фаромӯш кардед?</a>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            loading={loading}
                            fullWidth
                        >
                            Воридшавӣ
                        </Button>
                    </form>

                    <div className="login-footer">
                        <p>© 2024 Tojrason. Ҳамаи ҳуқуқҳо маҳфуз.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
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
