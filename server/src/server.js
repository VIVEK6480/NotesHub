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

// --------------------------------------------------
// ENVIRONMENT
// --------------------------------------------------

const isProduction =
  process.env.NODE_ENV === "production";

const isVercel =
  process.env.VERCEL === "1";

// --------------------------------------------------
// FILE PATH CONFIGURATION
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------
//
// Production frontend:
// https://notes-hub-frontend-eight.vercel.app
//
// Vercel can also generate deployment/preview URLs such as:
// https://notes-hub-frontend-xxxxx-vivek-kumar-s-projects4.vercel.app
//
// Local development:
// http://localhost:5173
// http://127.0.0.1:5173
//
// --------------------------------------------------

const configuredClientUrls = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "https://notes-hub-frontend-eight.vercel.app",
]
  .filter(Boolean)
  .map((url) =>
    String(url)
      .trim()
      .replace(/\/+$/, "")
  );

const isAllowedOrigin = (origin) => {
  // Non-browser requests such as server-to-server calls
  // do not always contain an Origin header.
  if (!origin) {
    return true;
  }

  const normalizedOrigin = String(origin)
    .trim()
    .replace(/\/+$/, "");

  // Explicitly configured origins
  if (
    configuredClientUrls.includes(
      normalizedOrigin
    )
  ) {
    return true;
  }

  // Local development
  if (
    normalizedOrigin ===
      "http://localhost:5173" ||
    normalizedOrigin ===
      "http://127.0.0.1:5173"
  ) {
    return true;
  }

  // Allow Vercel deployment/preview URLs
  // for this NotesHub frontend project.
  try {
    const url = new URL(normalizedOrigin);

    if (
      url.protocol === "https:" &&
      url.hostname.endsWith(
        ".vercel.app"
      ) &&
      (
        url.hostname.startsWith(
          "notes-hub-frontend-"
        ) ||
        url.hostname ===
          "notes-hub-frontend-eight.vercel.app"
      )
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(
      `CORS blocked origin: ${origin}`
    );

    return callback(
      new Error(
        "Origin is not allowed by CORS."
      )
    );
  },

  credentials: true,

  methods: [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],

  exposedHeaders: [],

  optionsSuccessStatus: 204,
};

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
//
// IMPORTANT:
// This middleware must be registered before
// authentication routes and before the 404 handler.
//
// It automatically handles browser OPTIONS
// preflight requests.
//
// --------------------------------------------------

app.use(
  cors(corsOptions)
);

// Explicitly answer OPTIONS requests as well.
// This makes the preflight behavior reliable when
// deployed behind Vercel/proxy infrastructure.

app.options(
  /.* /,
  cors(corsOptions)
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
//
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

app.get(
  "/api/health",
  async (req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;

      return res.status(200).json({
        success: true,
        message:
          "NotesHub API is running.",
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
  }
);

// --------------------------------------------------
// TEST ROUTE
// --------------------------------------------------

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Welcome to NotesHub API.",
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

app.use(
  (error, req, res, next) => {
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

    // CORS error
    if (
      error?.message ===
      "Origin is not allowed by CORS."
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Origin is not allowed by CORS.",
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
  }
);

// --------------------------------------------------
// LOCAL SERVER
// --------------------------------------------------
//
// Vercel handles the HTTP server itself.
// app.listen() should only run during local
// development.
//
// Prisma is intentionally NOT connected here
// during Vercel startup. Prisma connects lazily
// when the first database query is executed.
//
// This prevents database initialization from
// blocking the Vercel function from serving
// CORS/preflight requests.
//
// --------------------------------------------------

if (!isVercel) {
  const startServer = async () => {
    try {
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
  };

  startServer();
}

// --------------------------------------------------
// VERCEL / SERVERLESS EXPORT
// --------------------------------------------------
//
// Vercel imports this Express application and
// handles the HTTP server lifecycle.
//
// --------------------------------------------------

export default app;