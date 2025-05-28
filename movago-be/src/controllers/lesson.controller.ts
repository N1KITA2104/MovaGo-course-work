import { Request, Response } from 'express';
import { Lesson } from '../models/lesson.model';
import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const getAllLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const filter = req.user?.role === 'admin' ? {} : { isPublished: { $ne: false } };
    const lessons = await Lesson.find(filter);
    res.json(lessons);
  } catch (err) {
    console.error('Error in getAllLessons:', err);
    res.status(500).json({ message: (err as Error).message });
  }
};

const getLessonById = async (req: Request, res: Response): Promise<void> => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (!lesson.isPublished && req.user?.role !== 'admin') {
      res.status(404).json({ message: 'Lesson not found' });
      return;
    }

    if (req.user?.role !== 'admin' && lesson.questionBank?.length) {
      const count = Math.min(lesson.questionsCount || 5, lesson.questionBank.length);
      lesson.questions = getRandomQuestions(lesson.questionBank, count);
    }

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

const createLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const newLesson = new Lesson(req.body);
    await newLesson.save();
    res.status(201).json(newLesson);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

const updateLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const updated = await Lesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
    updated ? res.json(updated) : res.status(404).json({ message: 'Lesson not found' });
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
};

const deleteLesson = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Lesson.findByIdAndDelete(req.params.id);
    deleted ? res.json({ message: 'Lesson deleted' }) : res.status(404).json({ message: 'Lesson not found' });
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

const getPaginatedLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const difficulty = req.query.difficulty !== 'all' ? req.query.difficulty : null;
    const category = req.query.category !== 'all' ? req.query.category : null;

    const filter: any = req.user?.role === 'admin' ? {} : { isPublished: { $ne: false } };
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const total = await Lesson.countDocuments(filter);
    const lessons = await Lesson.find(filter).sort({ order: 1 }).skip(skip).limit(limit).lean();

    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      lessons,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error in getPaginatedLessons:', err);
    res.status(500).json({ message: (err as Error).message });
  }
};

const getLessonsByIds = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ message: 'Invalid lesson IDs' });
      return;
    }

    const filter: any = { _id: { $in: ids } };
    if (req.user?.role !== 'admin') filter.isPublished = { $ne: false };

    const lessons = await Lesson.find(filter).lean();

    if (req.user?.role !== 'admin') {
      lessons.forEach((lesson: any) => {
        if (lesson.questionBank?.length) {
          const count = Math.min(lesson.questionsCount || 5, lesson.questionBank.length);
          lesson.questions = getRandomQuestions(lesson.questionBank, count);
        }
      });
    }

    res.set('Cache-Control', 'public, max-age=600');
    res.json(lessons);
  } catch (err) {
    console.error('Error in getLessonsByIds:', err);
    res.status(500).json({ message: (err as Error).message });
  }
};

const getRandomQuestions = (questionBank: any[], count: number): any[] => {
  return [...questionBank].sort(() => 0.5 - Math.random()).slice(0, count);
};

export {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getPaginatedLessons,
  getLessonsByIds,
};
