import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User, IUser } from '../models/user.model';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            user?: IUser;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { id: string };
        req.userId = decoded.id;

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Token Verification Error:', err);
        res.status(403).json({ message: 'Failed to authenticate token', error: (err as Error).message });
    }
};
