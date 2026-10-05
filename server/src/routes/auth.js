import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { Resend } from "resend";

import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

const COOKIE_NAME = "noteshub_token";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const avatarDirectory = path.join(
  __dirname,
  "../../uploads/avatars"
);

fs.mkdirSync(avatarDirectory, {
  recursive: true,
});

/* =========================
   RESEND
========================= */

const resend = new Resend(
  process.env.RESEND_API_KEY
);

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.CLIENT_URL ||
  "http://localhost:5173";

const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "onboarding@resend.dev";

/* =========================
   AVATAR UPLOAD
========================= */

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const safeExtension =
      extension || ".jpg";

    cb(
      null,
      `${req.user.id}-${Date.now()}${safeExtension}`
    );
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, PNG, WEBP and GIF images are allowed."
        )
      );
    }

    cb(null, true);
  },
});

/* =========================
   AUTH HELPERS
========================= */

function createToken(userId) {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",

    maxAge:
      7 *
      24 *
      60 *
      60 *
      1000,

    path: "/",
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure:
      process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

/* =========================
   PASSWORD RESET HELPERS
========================= */

function createResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashResetToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/* =========================
   SIGNUP
========================= */

router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
    } = req.body;

    const cleanName =
      String(name || "").trim();

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const cleanPassword =
      String(password || "");

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Name is required.",
      });
    }

    if (cleanName.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Name must contain at least 2 characters.",
      });
    }

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    if (cleanPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least 8 characters.",
      });
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists.",
      });
    }

    const passwordHash =
      await bcrypt.hash(
        cleanPassword,
        12
      );

    const user =
      await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash,
        },

        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

    const token =
      createToken(user.id);

    setAuthCookie(
      res,
      token
    );

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",
      user,
    });
  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to create account.",
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const cleanPassword =
      String(password || "");

    if (
      !cleanEmail ||
      !cleanPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const user =
      await prisma.user.findUnique({
        where: {
          email: cleanEmail,
        },
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        cleanPassword,
        user.passwordHash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token =
      createToken(user.id);

    setAuthCookie(
      res,
      token
    );

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl:
          user.avatarUrl,
        createdAt:
          user.createdAt,
        updatedAt:
          user.updatedAt,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login.",
    });
  }
});

/* =========================
   FORGOT PASSWORD
========================= */

router.post(
  "/forgot-password",
  async (req, res) => {
    try {
      const cleanEmail =
        String(req.body?.email || "")
          .trim()
          .toLowerCase();

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          cleanEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      /*
       * Always return the same response for
       * unknown emails so we don't reveal
       * whether an account exists.
       */

      const user =
        await prisma.user.findUnique({
          where: {
            email: cleanEmail,
          },
        });

      if (!user) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this email, password reset instructions have been sent.",
        });
      }

      /*
       * Remove previous unused reset tokens
       * for this user.
       */

      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      /*
       * Generate a secure random token.
       *
       * Raw token goes into the email.
       * Only its SHA-256 hash is stored in DB.
       */

      const rawResetToken =
        createResetToken();

      const tokenHash =
        hashResetToken(
          rawResetToken
        );

      /*
       * Token valid for 30 minutes.
       */

      const expiresAt =
        new Date(
          Date.now() +
            30 * 60 * 1000
        );

      await prisma.passwordResetToken.create({
        data: {
          tokenHash,
          userId: user.id,
          expiresAt,
        },
      });

      /*
       * Reset link sent to user's email.
       */

      const resetUrl =
        `${FRONTEND_URL}/reset-password?token=${encodeURIComponent(
          rawResetToken
        )}`;

      const { data, error } =
        await resend.emails.send({
          from: `NotesHub <${RESEND_FROM_EMAIL}>`,
          to: [cleanEmail],

          subject:
            "Reset your NotesHub password",

          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reset your NotesHub password</title>
              </head>

              <body
                style="
                  margin:0;
                  padding:0;
                  background:#f5f7fb;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#111827;
                "
              >
                <div
                  style="
                    max-width:600px;
                    margin:40px auto;
                    background:#ffffff;
                    border-radius:16px;
                    padding:40px 32px;
                    box-shadow:0 10px 30px rgba(0,0,0,0.08);
                  "
                >
                  <h1
                    style="
                      margin:0 0 16px;
                      font-size:28px;
                    "
                  >
                    Reset your password
                  </h1>

                  <p
                    style="
                      font-size:16px;
                      line-height:1.6;
                      color:#4b5563;
                    "
                  >
                    Hi ${user.name},
                  </p>

                  <p
                    style="
                      font-size:16px;
                      line-height:1.6;
                      color:#4b5563;
                    "
                  >
                    We received a request to reset your
                    NotesHub password.
                  </p>

                  <div
                    style="
                      margin:30px 0;
                      text-align:center;
                    "
                  >
                    <a
                      href="${resetUrl}"
                      style="
                        display:inline-block;
                        padding:14px 24px;
                        background:#111827;
                        color:#ffffff;
                        text-decoration:none;
                        border-radius:10px;
                        font-weight:600;
                      "
                    >
                      Reset Password
                    </a>
                  </div>

                  <p
                    style="
                      font-size:14px;
                      line-height:1.6;
                      color:#6b7280;
                    "
                  >
                    This link will expire in
                    <strong>30 minutes</strong>.
                  </p>

                  <p
                    style="
                      font-size:14px;
                      line-height:1.6;
                      color:#6b7280;
                    "
                  >
                    If you did not request a password
                    reset, you can safely ignore this
                    email.
                  </p>

                  <hr
                    style="
                      border:0;
                      border-top:1px solid #e5e7eb;
                      margin:30px 0;
                    "
                  />

                  <p
                    style="
                      font-size:12px;
                      color:#9ca3af;
                      margin:0;
                    "
                  >
                    NotesHub
                  </p>
                </div>
              </body>
            </html>
          `,
        });

      if (error) {
        /*
         * If email sending failed, remove the token
         * because the user never received it.
         */

        await prisma.passwordResetToken.delete({
          where: {
            id: (
              await prisma.passwordResetToken.findUnique({
                where: {
                  tokenHash,
                },
                select: {
                  id: true,
                },
              })
            )?.id,
          },
        }).catch(() => {});

        console.error(
          "Resend forgot-password error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to send password reset email. Please try again later.",
        });
      }

      console.log(
        "Password reset email sent:",
        {
          email: cleanEmail,
          messageId: data?.id,
        }
      );

      return res.status(200).json({
        success: true,
        message:
          "Password reset instructions have been sent to your email.",
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to process password reset request.",
      });
    }
  }
);

/* =========================
   RESET PASSWORD
========================= */

router.post(
  "/reset-password/:token",
  async (req, res) => {
    try {
      const rawToken =
        String(
          req.params?.token || ""
        ).trim();

      const newPassword =
        String(
          req.body?.password || ""
        );

      if (!rawToken) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or missing reset token.",
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password is required.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters.",
        });
      }

      const tokenHash =
        hashResetToken(
          rawToken
        );

      const resetToken =
        await prisma.passwordResetToken.findUnique({
          where: {
            tokenHash,
          },

          include: {
            user: true,
          },
        });

      if (!resetToken) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired reset link.",
        });
      }

      if (resetToken.usedAt) {
        return res.status(400).json({
          success: false,
          message:
            "This reset link has already been used.",
        });
      }

      if (
        resetToken.expiresAt.getTime() <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This reset link has expired. Please request a new one.",
        });
      }

      const samePassword =
        await bcrypt.compare(
          newPassword,
          resetToken.user.passwordHash
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your current password.",
        });
      }

      const newPasswordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      /*
       * Update password and mark reset token
       * as used in one database transaction.
       */

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id: resetToken.userId,
          },

          data: {
            passwordHash:
              newPasswordHash,
          },
        }),

        prisma.passwordResetToken.update({
          where: {
            id: resetToken.id,
          },

          data: {
            usedAt: new Date(),
          },
        }),

        /*
         * Remove other unused reset tokens
         * belonging to this user.
         */

        prisma.passwordResetToken.deleteMany({
          where: {
            userId: resetToken.userId,
            id: {
              not: resetToken.id,
            },
            usedAt: null,
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully.",
      });
    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password. Please try again.",
      });
    }
  }
);

/* =========================
   GET CURRENT USER
========================= */

router.get(
  "/me",
  requireAuth,
  async (req, res) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user.id,
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "Get current user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load user.",
      });
    }
  }
);

/* =========================
   UPDATE PROFILE
========================= */

router.put(
  "/profile",
  requireAuth,
  async (req, res) => {
    try {
      const {
        name,
        email,
      } = req.body;

      const cleanName =
        String(name || "").trim();

      const cleanEmail =
        String(email || "")
          .trim()
          .toLowerCase();

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Name is required.",
        });
      }

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Name must contain at least 2 characters.",
        });
      }

      if (!cleanEmail) {
        return res.status(400).json({
          success: false,
          message:
            "Email is required.",
        });
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          cleanEmail
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
      }

      const existingUser =
        await prisma.user.findFirst({
          where: {
            email: cleanEmail,

            NOT: {
              id: req.user.id,
            },
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "This email is already in use.",
        });
      }

      const updatedUser =
        await prisma.user.update({
          where: {
            id: req.user.id,
          },

          data: {
            name: cleanName,
            email: cleanEmail,
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      return res.status(200).json({
        success: true,
        message:
          "Profile updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        "Update profile error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update profile.",
      });
    }
  }
);

/* =========================
   CHANGE PASSWORD
========================= */

router.put(
  "/password",
  requireAuth,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword,
      } = req.body;

      const cleanCurrentPassword =
        String(
          currentPassword || ""
        );

      const cleanNewPassword =
        String(
          newPassword || ""
        );

      if (!cleanCurrentPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Current password is required.",
        });
      }

      if (!cleanNewPassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password is required.",
        });
      }

      if (
        cleanNewPassword.length < 8
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password must contain at least 8 characters.",
        });
      }

      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user.id,
          },
        });

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      const passwordMatches =
        await bcrypt.compare(
          cleanCurrentPassword,
          user.passwordHash
        );

      if (!passwordMatches) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect.",
        });
      }

      const samePassword =
        await bcrypt.compare(
          cleanNewPassword,
          user.passwordHash
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from your current password.",
        });
      }

      const newPasswordHash =
        await bcrypt.hash(
          cleanNewPassword,
          12
        );

      await prisma.user.update({
        where: {
          id: req.user.id,
        },

        data: {
          passwordHash:
            newPasswordHash,
        },
      });

      return res.status(200).json({
        success: true,
        message:
          "Password updated successfully.",
      });
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update password.",
      });
    }
  }
);

/* =========================
   UPLOAD AVATAR
========================= */

router.post(
  "/avatar",
  requireAuth,
  uploadAvatar.single("avatar"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please select an image.",
        });
      }

      const oldUser =
        await prisma.user.findUnique({
          where: {
            id: req.user.id,
          },

          select: {
            avatarUrl: true,
          },
        });

      const avatarUrl =
        `/uploads/avatars/${req.file.filename}`;

      const updatedUser =
        await prisma.user.update({
          where: {
            id: req.user.id,
          },

          data: {
            avatarUrl,
          },

          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      if (
        oldUser?.avatarUrl &&
        oldUser.avatarUrl.startsWith(
          "/uploads/avatars/"
        )
      ) {
        const oldFilename =
          path.basename(
            oldUser.avatarUrl
          );

        const oldFilePath =
          path.join(
            avatarDirectory,
            oldFilename
          );

        if (
          fs.existsSync(
            oldFilePath
          )
        ) {
          fs.unlink(
            oldFilePath,
            (unlinkError) => {
              if (unlinkError) {
                console.error(
                  "Unable to remove old avatar:",
                  unlinkError
                );
              }
            }
          );
        }
      }

      return res.status(200).json({
        success: true,
        message:
          "Profile photo updated successfully.",
        user: updatedUser,
      });
    } catch (error) {
      if (
        req.file?.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlink(
          req.file.path,
          () => {}
        );
      }

      console.error(
        "Upload avatar error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Unable to upload profile photo.",
      });
    }
  }
);

/* =========================
   LOGOUT
========================= */

router.post(
  "/logout",
  async (req, res) => {
    try {
      clearAuthCookie(res);

      return res.status(200).json({
        success: true,
        message:
          "Logged out successfully.",
      });
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to logout.",
      });
    }
  }
);

export default router;