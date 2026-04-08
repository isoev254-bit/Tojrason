<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>auth.service.test.ts</title>
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
// tests/unit/auth.service.test.ts - Тестҳои воҳид барои AuthService
import { AuthService } from '../../src/modules/auth/auth.service';
import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { hashPassword, comparePassword } from '../../src/common/utils/hash';
import { generateToken } from '../../src/common/utils/token';

// Мок кардани модулҳо
jest.mock('../../src/modules/auth/auth.repository');
jest.mock('../../src/common/utils/hash');
jest.mock('../../src/common/utils/token');
jest.mock('../../src/config/logger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
}));

describe('AuthService', () => {
    let authService: AuthService;
    let mockRepository: jest.Mocked&lt;AuthRepository&gt;;

    beforeEach(() => {
        mockRepository = new AuthRepository() as jest.Mocked&lt;AuthRepository&gt;;
        authService = new AuthService();
        (authService as any).repository = mockRepository;
        jest.clearAllMocks();
    });

    describe('register', () => {
        const registerData = {
            email: 'test@example.com',
            phone: '+992901234567',
            password: 'password123',
            fullName: 'Test User',
            role: 'CLIENT' as const,
        };

        it('бояд корбари нав сабт кунад', async () => {
            const mockUser = {
                id: '123',
                ...registerData,
                passwordHash: 'hashedPassword',
                role: 'CLIENT',
                isAvailable: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const mockToken = 'jwt-token-123';

            mockRepository.findByEmail.mockResolvedValue(null);
            mockRepository.findByPhone.mockResolvedValue(null);
            mockRepository.createUser.mockResolvedValue(mockUser);
            (hashPassword as jest.Mock).mockResolvedValue('hashedPassword');
            (generateToken as jest.Mock).mockReturnValue(mockToken);

            const result = await authService.register(registerData);

            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    role: mockUser.role,
                    fullName: mockUser.fullName,
                },
                token: mockToken,
            });
            expect(mockRepository.createUser).toHaveBeenCalledTimes(1);
        });

        it('бояд хатогӣ диҳад агар email аллакай мавҷуд бошад', async () => {
            const existingUser = { id: '456', email: registerData.email } as any;
            mockRepository.findByEmail.mockResolvedValue(existingUser);

            await expect(authService.register(registerData)).rejects.toThrow(
                'Ин почтаи электронӣ аллакай истифода шудааст'
            );
            expect(mockRepository.createUser).not.toHaveBeenCalled();
        });

        it('бояд хатогӣ диҳад агар телефон аллакай мавҷуд бошад', async () => {
            mockRepository.findByEmail.mockResolvedValue(null);
            const existingUser = { id: '456', phone: registerData.phone } as any;
            mockRepository.findByPhone.mockResolvedValue(existingUser);

            await expect(authService.register(registerData)).rejects.toThrow(
                'Ин рақами телефон аллакай истифода шудааст'
            );
            expect(mockRepository.createUser).not.toHaveBeenCalled();
        });
    });

    describe('login', () => {
        const loginData = {
            email: 'test@example.com',
            password: 'password123',
        };

        it('бояд бомуваффақият ворид шавад', async () => {
            const mockUser = {
                id: '123',
                email: loginData.email,
                phone: '+992901234567',
                fullName: 'Test User',
                role: 'CLIENT',
                passwordHash: 'hashedPassword',
                isAvailable: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const mockToken = 'jwt-token-123';

            mockRepository.findByEmail.mockResolvedValue(mockUser);
            (comparePassword as jest.Mock).mockResolvedValue(true);
            (generateToken as jest.Mock).mockReturnValue(mockToken);

            const result = await authService.login(loginData);

            expect(result).toEqual({
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    role: mockUser.role,
                    fullName: mockUser.fullName,
                },
                token: mockToken,
            });
        });

        it('бояд хатогӣ диҳад агар email нодуруст бошад', async () => {
            mockRepository.findByEmail.mockResolvedValue(null);

            await expect(authService.login(loginData)).rejects.toThrow(
                'Email ё парол нодуруст аст'
            );
        });

        it('бояд хатогӣ диҳад агар парол нодуруст бошад', async () => {
            const mockUser = {
                id: '123',
                email: loginData.email,
                passwordHash: 'hashedPassword',
            } as any;
            mockRepository.findByEmail.mockResolvedValue(mockUser);
            (comparePassword as jest.Mock).mockResolvedValue(false);

            await expect(authService.login(loginData)).rejects.toThrow(
                'Email ё парол нодуруст аст'
            );
        });
    });

    describe('getUserById', () => {
        it('бояд маълумоти корбарро баргардонад', async () => {
            const mockUser = {
                id: '123',
                email: 'test@example.com',
                fullName: 'Test User',
                role: 'CLIENT',
            } as any;
            mockRepository.findById.mockResolvedValue(mockUser);

            const result = await authService.getUserById('123');
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
                fullName: mockUser.fullName,
            });
        });

        it('бояд null баргардонад агар корбар ёфт нашуд', async () => {
            mockRepository.findById.mockResolvedValue(null);
            const result = await authService.getUserById('999');
            expect(result).toBeNull();
        });
    });
});
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
