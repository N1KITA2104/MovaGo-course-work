import { Request, Response } from 'express';
import { User, IUser } from '../models/user.model';
import { Lesson, ILesson } from '../models/lesson.model';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: IUser;
    }
  }
}

export const getUserCategoryStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const allLessons = await Lesson.find({ isPublished: true });
    const categoryCounts: Record<string, number> = {};
    const completedCounts: Record<string, number> = {};

    allLessons.forEach((lesson) => {
      categoryCounts[lesson.category] = (categoryCounts[lesson.category] || 0) + 1;
      completedCounts[lesson.category] = completedCounts[lesson.category] || 0;
    });

    if (user.progress?.completedLessons?.length) {
      const completedLessons = await Lesson.find({ _id: { $in: user.progress.completedLessons } });
      completedLessons.forEach((lesson) => {
        if (completedCounts[lesson.category] !== undefined) {
          completedCounts[lesson.category]++;
        }
      });
    }

    const categoryStats = Object.keys(categoryCounts).map((category) => ({
      category,
      total: categoryCounts[category],
      completed: completedCounts[category],
      progress:
        categoryCounts[category] > 0
          ? Math.round((completedCounts[category] / categoryCounts[category]) * 100)
          : 0,
    }));

    res.status(200).json({ categoryStats });
  } catch (err) {
    console.error('Error getting category stats:', err);
    res.status(500).json({ message: 'Failed to get category stats', error: (err as Error).message });
  }
};

export const getRecommendedLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const allLessons = await Lesson.find({ isPublished: true });
    const completedIds = user.progress?.completedLessons.map(id => id.toString()) || [];
    const uncompleted = allLessons.filter((l) => !completedIds.includes(l._id.toString()));

    const xp = user.progress?.xp || 0;
    let level = 'beginner';
    if (xp >= 500) level = 'advanced';
    else if (xp >= 200) level = 'intermediate';

    let recommended = uncompleted.filter(l => l.difficulty === level);
    if (recommended.length < 3) {
      const nextLevel = level === 'beginner' ? 'intermediate' : level === 'intermediate' ? 'advanced' : 'beginner';
      const additional = uncompleted.filter(
        l => l.difficulty === nextLevel && !recommended.some(r => r._id.toString() === l._id.toString())
      );
      recommended = [...recommended, ...additional];
    }

    res.status(200).json({ recommendedLessons: recommended.slice(0, 3) });
  } catch (err) {
    console.error('Error getting recommended lessons:', err);
    res.status(500).json({ message: 'Failed to get recommended lessons', error: (err as Error).message });
  }
};

export const getRecentLessons = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const completedIds = user.progress?.completedLessons.map(id => id.toString()) || [];
    let recentLessons: ILesson[] = [];

    if (completedIds.length) {
      recentLessons = await Lesson.find({ _id: { $in: completedIds } }).sort({ updatedAt: -1 }).limit(2);
    }

    if (recentLessons.length < 3) {
      const additional = await Lesson.find({
        _id: { $nin: completedIds },
        isPublished: true,
      }).sort({ order: 1 }).limit(3 - recentLessons.length);

      recentLessons = [...recentLessons, ...additional];
    }

    res.status(200).json({ recentLessons });
  } catch (err) {
    console.error('Error getting recent lessons:', err);
    res.status(500).json({ message: 'Failed to get recent lessons', error: (err as Error).message });
  }
};
