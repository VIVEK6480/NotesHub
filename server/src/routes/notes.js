import express from "express";

import prisma from "../lib/prisma.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

const cleanString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [
    ...new Set(
      tags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
};

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return fallback;
};

const parseImageData = (imageData) => {
  if (!imageData) {
    return null;
  }

  if (typeof imageData !== "string") {
    return null;
  }

  try {
    let base64 = imageData;

    if (imageData.includes(",")) {
      base64 = imageData.split(",")[1];
    }

    base64 = base64.replace(/\s/g, "");

    if (!base64) {
      return null;
    }

    return Buffer.from(base64, "base64");
  } catch (error) {
    console.error("Failed to parse image:", error);

    return null;
  }
};

const formatNote = (note) => {
  let imageData = null;

  if (note.imageData) {
    imageData = Buffer.from(note.imageData).toString("base64");
  }

  return {
    id: note.id,

    title: note.title,

    content: note.content,

    tags: note.tags,

    pinned: note.isPinned,

    archived: note.isArchived,

    trash: note.isTrashed,

    isPinned: note.isPinned,

    isArchived: note.isArchived,

    isTrashed: note.isTrashed,

    userId: note.userId,

    imageData,

    imageMimeType: note.imageMimeType || null,

    hasImage: Boolean(note.imageData),

    createdAt: note.createdAt,

    updatedAt: note.updatedAt,
  };
};

/* =========================================================
   GET ALL NOTES
========================================================= */

router.get("/", requireAuth, async (req, res) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user.id,
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json({
      success: true,
      notes: notes.map(formatNote),
    });
  } catch (error) {
    console.error("GET /notes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch notes.",
    });
  }
});

/* =========================================================
   GET SINGLE NOTE
========================================================= */

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    return res.json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    console.error("GET /notes/:id error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch note.",
    });
  }
});

/* =========================================================
   CREATE NOTE
========================================================= */

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      title,
      content,
      tags,
      pinned,
      archived,
      trash,
      isPinned,
      isArchived,
      isTrashed,
      imageData,
      imageMimeType,
    } = req.body;

    const cleanTitle = cleanString(title);
    const cleanContent =
      typeof content === "string" ? content.trim() : "";

    if (!cleanTitle) {
      return res.status(400).json({
        success: false,
        message: "Note title is required.",
      });
    }

    const imageBuffer = parseImageData(imageData);

    if (imageData && !imageBuffer) {
      return res.status(400).json({
        success: false,
        message: "Invalid image data.",
      });
    }

    const note = await prisma.note.create({
      data: {
        title: cleanTitle,

        content: cleanContent,

        tags: normalizeTags(tags),

        isPinned: parseBoolean(
          pinned ?? isPinned,
          false
        ),

        isArchived: parseBoolean(
          archived ?? isArchived,
          false
        ),

        isTrashed: parseBoolean(
          trash ?? isTrashed,
          false
        ),

        imageData: imageBuffer,

        imageMimeType:
          imageBuffer && imageMimeType
            ? String(imageMimeType)
            : null,

        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Note created successfully.",

      note: formatNote(note),
    });
  } catch (error) {
    console.error("POST /notes error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create note.",
    });
  }
});

/* =========================================================
   UPDATE NOTE
========================================================= */

router.put("/:id", requireAuth, async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const {
      title,
      content,
      tags,
      pinned,
      archived,
      trash,
      isPinned,
      isArchived,
      isTrashed,
      imageData,
      imageMimeType,
      removeImage,
    } = req.body;

    const data = {};

    if (typeof title === "string") {
      const cleanTitle = cleanString(title);

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Note title is required.",
        });
      }

      data.title = cleanTitle;
    }

    if (typeof content === "string") {
      data.content = content.trim();
    }

    if (Array.isArray(tags)) {
      data.tags = normalizeTags(tags);
    }

    if (
      pinned !== undefined ||
      isPinned !== undefined
    ) {
      data.isPinned = parseBoolean(
        pinned ?? isPinned,
        existingNote.isPinned
      );
    }

    if (
      archived !== undefined ||
      isArchived !== undefined
    ) {
      data.isArchived = parseBoolean(
        archived ?? isArchived,
        existingNote.isArchived
      );
    }

    if (
      trash !== undefined ||
      isTrashed !== undefined
    ) {
      data.isTrashed = parseBoolean(
        trash ?? isTrashed,
        existingNote.isTrashed
      );
    }

    if (removeImage === true) {
      data.imageData = null;
      data.imageMimeType = null;
    } else if (imageData !== undefined) {
      const imageBuffer = parseImageData(imageData);

      if (!imageBuffer) {
        return res.status(400).json({
          success: false,
          message: "Invalid image data.",
        });
      }

      data.imageData = imageBuffer;

      data.imageMimeType =
        imageMimeType
          ? String(imageMimeType)
          : "application/octet-stream";
    }

    const note = await prisma.note.update({
      where: {
        id: existingNote.id,
      },

      data,
    });

    return res.json({
      success: true,
      message: "Note updated successfully.",

      note: formatNote(note),
    });
  } catch (error) {
    console.error("PUT /notes/:id error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update note.",
    });
  }
});

/* =========================================================
   DELETE NOTE
========================================================= */

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    await prisma.note.delete({
      where: {
        id: existingNote.id,
      },
    });

    return res.json({
      success: true,
      message: "Note permanently deleted.",
    });
  } catch (error) {
    console.error("DELETE /notes/:id error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete note.",
    });
  }
});

/* =========================================================
   PIN
========================================================= */

router.patch("/:id/pin", requireAuth, async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: {
        id: existingNote.id,
      },

      data: {
        isPinned: !existingNote.isPinned,
      },
    });

    return res.json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    console.error("PATCH /notes/:id/pin error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update pin status.",
    });
  }
});

/* =========================================================
   ARCHIVE
========================================================= */

router.patch("/:id/archive", requireAuth, async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: {
        id: existingNote.id,
      },

      data: {
        isArchived: !existingNote.isArchived,
        isPinned: false,
        isTrashed: false,
      },
    });

    return res.json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    console.error(
      "PATCH /notes/:id/archive error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update archive status.",
    });
  }
});

/* =========================================================
   TRASH
========================================================= */

router.patch("/:id/trash", requireAuth, async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: {
        id: existingNote.id,
      },

      data: {
        isTrashed: true,
        isPinned: false,
        isArchived: false,
      },
    });

    return res.json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    console.error(
      "PATCH /notes/:id/trash error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to move note to trash.",
    });
  }
});

/* =========================================================
   RESTORE
========================================================= */

router.patch("/:id/restore", requireAuth, async (req, res) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        message: "Note not found.",
      });
    }

    const note = await prisma.note.update({
      where: {
        id: existingNote.id,
      },

      data: {
        isTrashed: false,
        isArchived: false,
      },
    });

    return res.json({
      success: true,
      note: formatNote(note),
    });
  } catch (error) {
    console.error(
      "PATCH /notes/:id/restore error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to restore note.",
    });
  }
});

export default router;