import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const refreshToken = (token: string): string => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return generateToken(decoded.userId, decoded.email);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
