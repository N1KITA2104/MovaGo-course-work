import mongoose, { Schema, Document, Model } from 'mongoose';
import validator from 'validator';

interface IProgress {
    completedLessons: mongoose.Types.ObjectId[];
    lessonCompletionCounts: Record<string, number>;
    xp: number;
    level: number;
    streakDays: number;
    activityCalendar: {
        date: Date;
        completed: boolean;
    }[];
}

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    description?: string;
    profilePhoto?: string;
    status: 'active' | 'inactive' | 'pending';
    role: 'user' | 'admin' | 'moderator';
    progress: IProgress;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
            maxlength: 50,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
            validate: {
                validator: (value: string) => validator.isEmail(value),
                message: 'Invalid email address',
            },
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        description: {
            type: String,
            trim: true,
        },
        profilePhoto: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'pending',
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
        },
        progress: {
            completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
            lessonCompletionCounts: {
                type: Map,
                of: Number,
                default: {},
            },
            xp: {
                type: Number,
                default: 0,
            },
            level: {
                type: Number,
                default: 1,
            },
            streakDays: {
                type: Number,
                default: 0,
            },
            activityCalendar: [
                {
                    date: Date,
                    completed: Boolean,
                },
            ],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);