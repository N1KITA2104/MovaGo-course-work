import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import path from 'path';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { validationResult } from 'express-validator';
import { User, IUser } from '../models/user.model';
import { Lesson } from '../models/lesson.model';

declare global {
    namespace Express {
        interface Request {
            userId?: string;
            user?: IUser;
            file?: Express.Multer.File;
        }
    }
}

const storage = multer.memoryStorage();
const fileFilter: multer.Options['fileFilter'] = (req, file, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed') as unknown as null, false);
};
export const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

const deleteOldProfilePhoto = async (photoPath?: string): Promise<boolean> => {
    if (!photoPath || !photoPath.startsWith('/uploads/')) return false;
    const absolutePath = path.join(__dirname, '..', photoPath);
    try {
        await fs.access(absolutePath);
        await fs.unlink(absolutePath);
        return true;
    } catch {
        return false;
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword,
            progress: { completedLessons: [], lessonCompletionCounts: {}, xp: 0, level: 1, streakDays: 0, activityCalendar: [] },
        });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to register user', error: (err as Error).message });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '12h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Failed to log in', error: (err as Error).message });
    }
};

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile', error: (err as Error).message });
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        user ? res.status(200).json({ user }) : res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch user', error: (err as Error).message });
    }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    try {
        const { username, email, description, status } = req.body;
        const updateData = { username, email, description, status };
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (req.file) {
            const uploadDir = path.join(__dirname, '../uploads/profiles');
            await fs.mkdir(uploadDir, { recursive: true });
            const filename = `profile-${Date.now()}.jpg`;
            const filepath = path.join(uploadDir, filename);
            await sharp(req.file.buffer).resize(400, 400).jpeg({ quality: 85 }).toFile(filepath);
            if (user.profilePhoto) await deleteOldProfilePhoto(user.profilePhoto);
            const updateData: Partial<IUser> = { username, email, description, status };
            if (req.file) {
                updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
            }
        }
        const updated = await User.findByIdAndUpdate(req.userId, updateData, { new: true, runValidators: true }).select('-password');
        res.status(200).json({ message: 'Profile updated', user: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update profile', error: (err as Error).message });
    }
};

export const deleteProfilePhoto = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.userId);
        if (!user || !user.profilePhoto) {
            res.status(400).json({ message: 'No profile photo to delete' });
            return;
        }
        await deleteOldProfilePhoto(user.profilePhoto);
        const updated = await User.findByIdAndUpdate(req.userId, { profilePhoto: '' }, { new: true, runValidators: true }).select('-password');
        res.status(200).json({ message: 'Profile photo deleted successfully', user: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete profile photo', error: (err as Error).message });
    }
};

export const uploadProfilePhoto = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        await fs.mkdir(uploadDir, { recursive: true });
        const filename = `profile-${Date.now()}.jpg`;
        const filepath = path.join(uploadDir, filename);
        await sharp(req.file.buffer).resize(400, 400).jpeg({ quality: 85 }).toFile(filepath);
        if (user.profilePhoto) await deleteOldProfilePhoto(user.profilePhoto);
        const profilePhoto = `/uploads/profiles/${filename}`;
        const updated = await User.findByIdAndUpdate(req.userId, { profilePhoto }, { new: true, runValidators: true }).select('-password');
        res.status(200).json({ message: 'Profile photo uploaded successfully', user: updated });
    } catch (err) {
        res.status(500).json({ message: 'Failed to upload profile photo', error: (err as Error).message });
    }
};

export const completeLesson = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lessonId, xp = 10 } = req.body;
        const user = await User.findById(req.userId);
        const lesson = await Lesson.findById(lessonId);
        if (!user || !lesson) {
            res.status(404).json({ message: 'User or Lesson not found' });
            return;
        }
        user.progress = user.progress || { completedLessons: [], lessonCompletionCounts: {}, xp: 0, level: 1, streakDays: 0, activityCalendar: [] };
        if (!user.progress.completedLessons.includes(lessonId)) user.progress.completedLessons.push(lessonId);
        user.progress.lessonCompletionCounts[lessonId] = (user.progress.lessonCompletionCounts[lessonId] || 0) + 1;
        user.progress.xp += xp;
        user.progress.level = Math.floor(user.progress.xp / 100) + 1;
        const today = new Date().setHours(0, 0, 0, 0);
        const todayEntry = user.progress.activityCalendar.find(e => new Date(e.date).setHours(0, 0, 0, 0) === today);
        if (!todayEntry) {
            user.progress.activityCalendar.push({ date: new Date(), completed: true });
            const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0, 0, 0, 0);
            const yesterdayEntry = user.progress.activityCalendar.find(e => new Date(e.date).setHours(0, 0, 0, 0) === yesterday.getTime());
            user.progress.streakDays = (yesterdayEntry && yesterdayEntry.completed) ? user.progress.streakDays + 1 : 1;
        }
        await Lesson.findByIdAndUpdate(lessonId, { $inc: { completedCount: 1 }, completed: true });
        await user.save();
        res.status(200).json({ message: 'Lesson completed', user });
    } catch (err) {
        res.status(500).json({ message: 'Failed to complete lesson', error: (err as Error).message });
    }
};

export const getAllUsers = async (_: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find().select('-password');
        if (users.length === 0) {
            res.status(404).json({ message: 'No users found.' });
            return;
        }
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users', error: (err as Error).message });
    }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!['user', 'admin', 'moderator'].includes(role)) {
            res.status(400).json({ message: 'Invalid role specified' });
            return;
        }
        const user = await User.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select('-password');
        user ? res.status(200).json({ user }) : res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user role', error: (err as Error).message });
    }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['active', 'inactive', 'pending'].includes(status)) {
            res.status(400).json({ message: 'Invalid status specified' });
            return;
        }
        const user = await User.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).select('-password');
        user ? res.status(200).json({ user }) : res.status(404).json({ message: 'User not found' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update user status', error: (err as Error).message });
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        if (id === req.userId) {
            res.status(400).json({ message: 'You cannot delete your own account' });
            return;
        }
        const userToDelete = await User.findById(id);
        if (!userToDelete) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (userToDelete.profilePhoto) await deleteOldProfilePhoto(userToDelete.profilePhoto);
        await User.findByIdAndDelete(id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: (err as Error).message });
    }
};
