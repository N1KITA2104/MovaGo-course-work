import mongoose, { Schema, Document, Model } from 'mongoose';

interface IQuestion {
    question: string;
    correctAnswer: string | string[]; 
    options: (string | Record<string, any>)[];
    hint?: string;
    type: 'multiple-choice' | 'translation' | 'matching' | 'word-order' | 'sentence-completion' | 'image-match';
    media?: string;
}

export interface ILesson extends Document {
    _id: mongoose.Types.ObjectId;
    title: string;
    description: string;
    icon: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: 'vocabulary' | 'grammar' | 'conversation' | 'reading' | 'listening';
    order: number;
    questions: IQuestion[];
    questionBank: IQuestion[];
    questionsCount: number;
    completed: boolean;
    completedCount: number;
    isPublished: boolean;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const LessonSchema: Schema<ILesson> = new Schema<ILesson>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 255,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        icon: {
            type: String,
            required: true,
            trim: true,
        },
        difficulty: {
            type: String,
            enum: ['beginner', 'intermediate', 'advanced'],
            required: true,
            index: true,
        },
        category: {
            type: String,
            enum: ['vocabulary', 'grammar', 'conversation', 'reading', 'listening'],
            default: 'vocabulary',
            index: true,
        },
        order: {
            type: Number,
            default: 0,
            index: true,
        },
        questions: [
            {
                question: { type: String, required: true, trim: true },
                correctAnswer: { type: Schema.Types.Mixed, required: true },
                options: [{ type: Schema.Types.Mixed, trim: true }],
                hint: { type: String, trim: true },
                type: {
                    type: String,
                    enum: ['multiple-choice', 'translation', 'matching', 'word-order', 'sentence-completion', 'image-match'],
                    required: true,
                },
                media: { type: String, trim: true },
            },
        ],
        questionBank: [
            {
                question: { type: String, required: true, trim: true },
                correctAnswer: { type: Schema.Types.Mixed, required: true },
                options: [{ type: Schema.Types.Mixed, trim: true }],
                hint: { type: String, trim: true },
                type: {
                    type: String,
                    enum: ['multiple-choice', 'translation', 'matching', 'word-order', 'sentence-completion', 'image-match'],
                    required: true,
                },
                media: { type: String, trim: true },
            },
        ],
        questionsCount: {
            type: Number,
            default: 5,
            min: 1,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedCount: {
            type: Number,
            default: 0,
            index: true,
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
        tags: [String],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

export const Lesson: Model<ILesson> = mongoose.model<ILesson>('Lesson', LessonSchema);
