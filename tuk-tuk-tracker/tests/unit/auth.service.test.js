const AuthService = require('../../src/services/auth.service');
const UserModel = require('../../src/models/User.model');
const jwt = require('jsonwebtoken');

// Mock dependencies
jest.mock('../../src/models/User.model');
jest.mock('jsonwebtoken');

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      _id: 'user123',
      username: 'testuser',
      password: 'hashedpassword',
      role: 'STATION',
      isActive: true,
      name: 'Officer John'
    };

    test('should login successfully with valid credentials', async () => {
      UserModel.findByUsername.mockResolvedValue(mockUser);
      UserModel.validatePassword.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mocked-jwt-token');

      const result = await AuthService.login('testuser', 'password123');

      expect(UserModel.findByUsername).toHaveBeenCalledWith('testuser');
      expect(UserModel.validatePassword).toHaveBeenCalledWith(mockUser, 'password123');
      expect(UserModel.updateLastLogin).toHaveBeenCalledWith('user123');
      expect(result.token).toBe('mocked-jwt-token');
      expect(result.user.username).toBe('testuser');
    });

    test('should throw error if user not found', async () => {
      UserModel.findByUsername.mockResolvedValue(null);

      await expect(AuthService.login('unknown', 'password'))
        .rejects.toThrow('Invalid credentials');
    });

    test('should throw error if password invalid', async () => {
      UserModel.findByUsername.mockResolvedValue(mockUser);
      UserModel.validatePassword.mockResolvedValue(false);

      await expect(AuthService.login('testuser', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    test('should throw error if account disabled', async () => {
      UserModel.findByUsername.mockResolvedValue({ ...mockUser, isActive: false });
      UserModel.validatePassword.mockResolvedValue(true);

      await expect(AuthService.login('testuser', 'password'))
        .rejects.toThrow('Account disabled');
    });
  });

  describe('verifyToken', () => {
    test('should return payload for valid token', () => {
      const payload = { userId: '123' };
      jwt.verify.mockReturnValue(payload);

      const result = AuthService.verifyToken('valid-token');
      expect(result).toBe(payload);
    });

    test('should throw error for invalid token', () => {
      jwt.verify.mockImplementation(() => { throw new Error(); });

      expect(() => AuthService.verifyToken('invalid-token'))
        .toThrow('Invalid or expired token');
    });
  });
});
