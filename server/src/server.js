import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import { prisma } from "./lib/prisma.js";

import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";

const app = express();

const PORT = process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// --------------------------------------------------
// FILE PATH CONFIGURATION
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// SECURITY
// --------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// --------------------------------------------------
// CORS
// --------------------------------------------------

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// --------------------------------------------------
// BODY PARSER
// --------------------------------------------------
//
// Notes images are sent from the frontend as Base64
// inside JSON. Base64 increases the request size, so
// the JSON request limit must be larger than 1 MB.
//
// 20 MB is used to comfortably support note images.
//
// --------------------------------------------------

app.use(
  express.json({
    limit: "20mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  })
);

// --------------------------------------------------
// COOKIES
// --------------------------------------------------

app.use(cookieParser());

// --------------------------------------------------
// PROFILE PHOTO / UPLOADS
// --------------------------------------------------
//
// Profile images are stored in:
//
// server/uploads/avatars
//
// They are accessible through:
//
// http://localhost:5000/uploads/avatars/<filename>
//
// Note images are NOT stored here.
// Note images are stored directly in PostgreSQL
// as binary data in the Note.imageData field.
// --------------------------------------------------

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// --------------------------------------------------
// BASIC RATE LIMITING
// --------------------------------------------------

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 100,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      success: true,
      message: "NotesHub API is running.",
      database: "connected",
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "NotesHub API is running, but database connection failed.",
    });
  }
});

// --------------------------------------------------
// TEST ROUTE
// --------------------------------------------------

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to NotesHub API.",
  });
});

// --------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------
//
// POST /api/auth/signup
// POST /api/auth/login
// GET  /api/auth/me
// POST /api/auth/logout
// POST /api/auth/forgot-password
// POST /api/auth/reset-password
//
// Profile:
//
// PUT  /api/auth/profile
// PUT  /api/auth/password
// POST /api/auth/avatar
//
// --------------------------------------------------

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

// --------------------------------------------------
// NOTES ROUTES
// --------------------------------------------------
//
// GET    /api/notes
// GET    /api/notes/:id
// POST   /api/notes
// PUT    /api/notes/:id
// DELETE /api/notes/:id
//
// PATCH  /api/notes/:id/pin
// PATCH  /api/notes/:id/archive
// PATCH  /api/notes/:id/trash
// PATCH  /api/notes/:id/restore
//
// --------------------------------------------------

app.use(
  "/api/notes",
  notesRoutes
);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((error, req, res, next) => {
  console.error(
    "Server error:",
    error
  );

  // Payload too large
  if (
    error?.type ===
      "entity.too.large" ||
    error?.status === 413
  ) {
    return res.status(413).json({
      success: false,
      message:
        "Request is too large. Please select a smaller image.",
    });
  }

  return res.status(
    error.status || 500
  ).json({
    success: false,
    message:
      error.message ||
      "Internal server error.",
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

async function startServer() {
  try {
    // Connect Prisma to Neon PostgreSQL
    await prisma.$connect();

    console.log(
      "✅ Neon PostgreSQL connected."
    );

    app.listen(
      PORT,
      "0.0.0.0",
      () => {
        console.log(
          `🚀 NotesHub API running on port ${PORT}`
        );

        console.log(
          `📡 Local: http://localhost:${PORT}`
        );

        console.log(
          `❤️ Health: http://localhost:${PORT}/api/health`
        );

        console.log(
          `📝 Notes: http://localhost:${PORT}/api/notes`
        );

        console.log(
          `🖼️ Uploads: http://localhost:${PORT}/uploads`
        );

        console.log(
          `📦 JSON body limit: 20MB`
        );
      }
    );
  } catch (error) {
    console.error(
      "❌ Failed to start server."
    );

    console.error(error);

    await prisma.$disconnect();

    process.exit(1);
  }
}

// --------------------------------------------------
// RUN SERVER
// --------------------------------------------------

startServer();