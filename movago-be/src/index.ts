import express, { type Request, type Response } from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"

import authRoutes from "./routes/auth.routes"
import lessonsRoutes from "./routes/lesson.routes"
import statsRoutes from "./routes/stats.routes"
import passwordResetRoutes from "./routes/password-reset.routes"

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/uploads", express.static(path.join(__dirname, "uploads")))

app.use("/api/auth", authRoutes)
app.use("/api/lessons", lessonsRoutes)
app.use("/api/stats", statsRoutes)
app.use("/api/password-reset", passwordResetRoutes)

const angularDistPath = path.join(__dirname, "../../movago-fe/dist/movago-fe/browser")
app.use(express.static(angularDistPath))

app.get(/.*/, (req: Request, res: Response) => {
  res.sendFile(path.join(angularDistPath, "index.html"))
})

// Environment-based MongoDB URI selection
const getMongoURI = (): string => {
  const nodeEnv = process.env.NODE_ENV || "development"

  if (nodeEnv === "production" && process.env.MONGODB_URI_PROD) {
    console.log("Using production MongoDB URI")
    return process.env.MONGODB_URI_PROD
  }

  if (nodeEnv === "development" && process.env.MONGODB_URI) {
    console.log("Using development MongoDB URI")
    return process.env.MONGODB_URI
  }

  console.error("No MongoDB URI found in environment variables")
  console.log("Available environment variables:", {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI ? "SET" : "NOT SET",
    MONGODB_URI_PROD: process.env.MONGODB_URI_PROD ? "SET" : "NOT SET",
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
  })

  throw new Error("MongoDB URI not configured")
}

const MONGODB_URI = getMongoURI()

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully")
    console.log("Database name:", mongoose.connection.db?.databaseName)
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
    })
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err.message)
    console.error("Full error:", err)
    process.exit(1)
  })
