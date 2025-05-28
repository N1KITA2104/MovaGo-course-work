import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/user.model';

declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'admin') {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
        return;
    }

    next();
};
