import mongoose from "mongoose";
import {Lesson} from "./models/lesson.model.ts";
import {User} from "./models/user.model.ts";
import lessonsData from "../data/lessonsData.js";
import dotenv from 'dotenv';
import { testData } from "../data/testData.ts";
import * as bcrypt from "bcrypt";

dotenv.config();
const URI: string = process.env.MONGODB_URI ?? "mongodb://localhost:27017/movago";

export async function seedLessons() {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected");

    await Lesson.deleteMany({});
    console.log("Existing lessons deleted");

    await Lesson.insertMany(lessonsData);
    console.log("Lessons seeded successfully");
  } catch (error) {
    console.error("Error seeding lessons:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

export async function seedAdminUser() {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected");

    const existing = await User.findOne({ email: testData.adminUser.email });
    // Check if an admin user already exists
    if (existing) {
      console.log("⚠️ Admin user already exists. Replacing...");
      await User.deleteOne({ _id: existing._id });
    }

    const hashedPassword = await bcrypt.hash(testData.adminUser.password, 10);

    const adminUser = new User({
      username: testData.adminUser.username,
      email: testData.adminUser.email,
      password: hashedPassword,
      role: "admin",
      status: "active"
    });

    await adminUser.save();
    console.log("✅ Admin user seeded.");
  } catch (error) {
    console.error("❌ Failed to seed admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

export async function seedUsers() {
  try {
    await mongoose.connect(URI);
    console.log("MongoDB connected");
    // Check if the user already exists
    const existing = await User.findOne({ email: testData.existentUser.email });
    const existing2 = await User.findOne({ email: testData.newUser.email });
    const existing3 = await User.findOne({ email: testData.userToDelete.email });
    if (existing) {
      console.log("⚠️ Regular user already exists. Replacing...");
      await User.deleteOne({ _id: existing._id });
    }
    if (existing2) {
      console.log("⚠️ New user already exists. Deleting...");
      await User.deleteOne({ _id: existing2._id });
    }
    if (existing3) {
      console.log("⚠️ UserToDelete already exists. Replacing...");
      await User.deleteOne({ _id: existing3._id });
    }

    const hashedPassword = await bcrypt.hash(testData.existentUser.password, 10);

    const now = new Date();
    const yesterday = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - 1,
      0, 0, 0, 0
    ));

    const lesson = await Lesson.findOne({ title: "Привітання" });
    if (!lesson) {
      throw new Error("❌ 'Привітання' lesson not found.");
    }
    const lessonId = lesson._id.toString();

    const regularUser = new User({
      username: testData.existentUser.username,
      email: testData.existentUser.email,
      password: hashedPassword,
      role: "user",
      status: "pending",
      progress: {
        completedLessons: [lessonId],
        xp: 20,
        level: 1,
        streakDays: 1,
        activityCalendar: [
          {
            date: yesterday,
            completed: true
          }
        ],
        lessonCompletionCounts: {
          [lessonId]: 1
        }
      }
    });

    const userToDelete = new User({
      username: testData.userToDelete.username,
      email: testData.userToDelete.email,
      password: hashedPassword,
      role: "user",
      status: "pending"
    });

    await userToDelete.save();
    console.log("✅ User to delete seeded.");
    await regularUser.save();
    console.log("✅ Regular user with 1 completed lesson seeded.");
  } catch (error) {
    console.error("❌ Failed to seed users:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}
