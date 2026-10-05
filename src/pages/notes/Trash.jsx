import React, { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Clock3,
  FileText,
  RotateCcw,
  Search,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import { useTheme } from "../../context/ThemeContext";
import { useNotes } from "../../context/NotesContext";

/* =========================================================
   DATE HELPERS
========================================================= */

const fmtDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const ago = (date) => {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(date)) / 60000)
  );

  if (minutes < 1) return "Just now";

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.round(hours / 24);

  if (days < 30) {
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return fmtDate(date);
};

/* =========================================================
   IMAGE HELPERS
   SAME LOGIC AS ARCHIVE
========================================================= */

const IMAGE_FIELDS = [
  "imageData",
  "imageUrl",
  "imageURL",
  "image",
  "image_url",
  "attachmentUrl",
  "attachmentURL",
  "coverImage",
  "coverImageUrl",
];

const isKnownLocalPath = (value) => {
  if (typeof value !== "string") return false;

  const trimmed = value.trim();

  return /^\/?(?:uploads?|images?|media|storage|files|attachments|assets)(?:\/|$)/i.test(
    trimmed
  );
};

const isHttpUrl = (value) =>
  typeof value === "string" &&
  /^https?:\/\//i.test(value.trim());

const isBlobUrl = (value) =>
  typeof value === "string" &&
  /^blob:/i.test(value.trim());

const isDataImage = (value) =>
  typeof value === "string" &&
  /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(
    value.trim()
  );

const looksLikeBase64 = (value) => {
  if (typeof value !== "string") return false;

  const normalized = value
    .replace(/\s+/g, "")
    .trim();

  if (normalized.length < 32) return false;

  return /^[A-Za-z0-9+/]+={0,2}$/.test(normalized);
};

const base64ToDataUrl = (
  value,
  mimeType = "image/jpeg"
) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value
    .replace(/\s+/g, "")
    .trim();

  if (!looksLikeBase64(normalized)) {
    return null;
  }

  return `data:${mimeType};base64,${normalized}`;
};

const arrayBufferToDataUrl = (
  data,
  mimeType = "image/jpeg"
) => {
  try {
    if (
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return null;
    }

    let binary = "";

    const chunkSize = 0x8000;

    for (
      let i = 0;
      i < data.length;
      i += chunkSize
    ) {
      const chunk = data.slice(
        i,
        i + chunkSize
      );

      binary += String.fromCharCode(...chunk);
    }

    return `data:${mimeType};base64,${btoa(
      binary
    )}`;
  } catch (error) {
    console.error(
      "Unable to convert image buffer:",
      error
    );

    return null;
  }
};

const getNoteImageValue = (note) => {
  if (
    !note ||
    typeof note !== "object"
  ) {
    return null;
  }

  for (const field of IMAGE_FIELDS) {
    const value = note[field];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      return value;
    }
  }

  return null;
};

const getSafeStringImageUrl = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) return null;

  if (isDataImage(trimmed)) {
    return trimmed;
  }

  if (isHttpUrl(trimmed)) {
    return trimmed;
  }

  if (isBlobUrl(trimmed)) {
    return trimmed;
  }

  if (isKnownLocalPath(trimmed)) {
    return trimmed;
  }

  if (looksLikeBase64(trimmed)) {
    return base64ToDataUrl(trimmed);
  }

  if (
    trimmed.startsWith("/") &&
    trimmed.length <= 2048
  ) {
    return trimmed;
  }

  return null;
};

/* =========================================================
   MINI THUMBNAIL
   SAME APPROACH AS ARCHIVE
========================================================= */

function TrashNoteImage({ note }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    let objectUrl = null;
    let cancelled = false;

    const loadImage = () => {
      const value = getNoteImageValue(note);

      if (!value) {
        setSrc(null);
        return;
      }

      /* File */
      if (
        typeof File !== "undefined" &&
        value instanceof File
      ) {
        objectUrl = URL.createObjectURL(value);

        if (!cancelled) {
          setSrc(objectUrl);
        }

        return;
      }

      /* Blob */
      if (
        typeof Blob !== "undefined" &&
        value instanceof Blob
      ) {
        objectUrl = URL.createObjectURL(value);

        if (!cancelled) {
          setSrc(objectUrl);
        }

        return;
      }

      /* Object / Buffer */
      if (
        typeof value === "object" &&
        value !== null
      ) {
        if (
          value.type === "Buffer" &&
          Array.isArray(value.data)
        ) {
          const result =
            arrayBufferToDataUrl(
              value.data,
              value.mimeType ||
                value.contentType ||
                note?.imageMimeType ||
                "image/jpeg"
            );

          if (!cancelled) {
            setSrc(result);
          }

          return;
        }

        if (Array.isArray(value.data)) {
          const result =
            arrayBufferToDataUrl(
              value.data,
              value.mimeType ||
                value.contentType ||
                note?.imageMimeType ||
                "image/jpeg"
            );

          if (!cancelled) {
            setSrc(result);
          }

          return;
        }

        if (
          typeof value.url === "string"
        ) {
          if (!cancelled) {
            setSrc(
              getSafeStringImageUrl(
                value.url
              )
            );
          }

          return;
        }

        if (
          typeof value.href === "string"
        ) {
          if (!cancelled) {
            setSrc(
              getSafeStringImageUrl(
                value.href
              )
            );
          }

          return;
        }

        setSrc(null);
        return;
      }

      /* String */
      if (typeof value === "string") {
        if (!cancelled) {
          setSrc(
            getSafeStringImageUrl(value)
          );
        }

        return;
      }

      setSrc(null);
    };

    loadImage();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [note]);

  if (!src) return null;

  return (
    <div
      className="trash-image-wrap"
      title="Attached image"
    >
      <img
        className="trash-image"
        src={src}
        alt={`${note?.title || "Note"} attachment`}
        loading="lazy"
        onError={(event) => {
          const wrapper =
            event.currentTarget.parentElement;

          if (wrapper) {
            wrapper.style.display = "none";
          }
        }}
      />
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const CSS = `

.trash-page{
  --bg:#080b0d;
  --panel:#0f1519;
  --panel2:#141c21;
  --bd:rgba(255,255,255,.08);
  --bd2:rgba(255,255,255,.14);
  --tx:#f2f6f5;
  --mu:#8e9b98;
  --dim:#5f6c69;
  --ac:#6ee7b7;
  --ac2:#34d399;
  --on:#06281c;
  --danger:#fb7185;

  min-height:calc(100vh - 68px);
  width:100%;
  padding:clamp(18px,2vw,28px);

  color:var(--tx);

  background:
    radial-gradient(
      circle at 15% 10%,
      rgba(16,185,129,.10),
      transparent 28%
    ),
    radial-gradient(
      circle at 85% 85%,
      rgba(124,92,240,.12),
      transparent 30%
    ),
    var(--bg);

  font-family:
    Inter,
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;

  overflow-x:hidden;
}

.trash-page.light{
  --bg:#eef4f1;
  --panel:#fff;
  --panel2:#f3f8f6;
  --bd:rgba(14,48,36,.10);
  --bd2:rgba(14,48,36,.18);
  --tx:#10211b;
  --mu:#566b63;
  --dim:#8a9c95;
  --ac:#0f9f6e;
  --ac2:#10b981;
  --on:#fff;
  --danger:#e11d48;
}

.trash-page *,
.trash-page *::before,
.trash-page *::after{
  box-sizing:border-box;
}

.trash-shell{
  width:100%;
  margin:0;
}

/* =========================================================
   HEADER
========================================================= */

.trash-head{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  margin-bottom:24px;
}

.trash-title-wrap{
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0;
}

.trash-icon{
  width:48px;
  height:48px;
  display:grid;
  place-items:center;
  flex-shrink:0;
  border-radius:14px;
  color:var(--danger);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  border:1px solid var(--bd2);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);
}

.trash-title{
  margin:0;
  font-size:28px;
  font-weight:800;
  letter-spacing:-.7px;
}

.trash-sub{
  margin:5px 0 0;
  color:var(--mu);
  font-size:13px;
}

.trash-count{
  display:inline-flex;
  align-items:center;
  gap:7px;
  height:40px;
  padding:0 14px;
  border-radius:12px;

  border:1px solid var(--bd2);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  color:var(--mu);
  font-size:13px;
  font-weight:600;
  flex-shrink:0;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);
}

.trash-count strong{
  color:var(--tx);
}

/* =========================================================
   SEARCH
========================================================= */

.trash-toolbar{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:14px;
  margin-bottom:20px;
}

.trash-search{
  width:min(100%,460px);
  min-height:44px;

  display:flex;
  align-items:center;
  gap:10px;

  padding:0 13px;

  border:1px solid var(--bd2);
  border-radius:12px;

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  color:var(--mu);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);

  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.trash-search:focus-within{
  border-color:var(--bd2);

  box-shadow:
    0 0 0 3px
    rgba(255,255,255,.025),
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);
}

.trash-search input{
  width:100%;
  border:0;
  outline:0;
  background:transparent;
  color:var(--tx);
  font:inherit;
  font-size:13px;
}

.trash-search input::placeholder{
  color:var(--dim);
}

.clear-search{
  width:28px;
  height:28px;
  display:grid;
  place-items:center;
  border:0;
  border-radius:8px;
  background:transparent;
  color:var(--mu);
  cursor:pointer;
}

.clear-search:hover{
  color:var(--tx);
  background:var(--panel2);
}

.trash-toolbar-count{
  color:var(--mu);
  font-size:12px;
  white-space:nowrap;
}

/* =========================================================
   GRID
========================================================= */

.trash-grid{
  width:100%;
  display:grid;
  grid-template-columns:
    repeat(3,minmax(0,1fr));
  gap:16px;
}

/* =========================================================
   CARD
========================================================= */

.trash-card{
  position:relative;
  overflow:hidden;
  min-width:0;
  min-height:220px;

  display:flex;
  flex-direction:column;
  gap:13px;

  padding:18px;

  border-radius:17px;
  border:1px solid var(--bd);

  background:
    linear-gradient(
      150deg,
      var(--panel),
      var(--panel2)
    );

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);

  transition:
    transform .2s ease,
    border-color .2s ease,
    box-shadow .2s ease;
}

.trash-card::before{
  content:"";

  position:absolute;
  top:0;
  left:14%;
  right:14%;
  height:2px;

  border-radius:2px;

  background:
    linear-gradient(
      90deg,
      transparent,
      var(--bd2),
      transparent
    );
}

.trash-card:hover{
  transform:translateY(-3px);
  border-color:var(--bd2);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.035),
    0 18px 40px rgba(0,0,0,.12);
}

.trash-card-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.trash-file-icon{
  width:38px;
  height:38px;
  display:grid;
  place-items:center;
  border-radius:11px;
  color:var(--mu);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  border:1px solid var(--bd2);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 6px 18px rgba(0,0,0,.06);
}

.trash-status{
  display:inline-flex;
  align-items:center;
  gap:6px;
  height:30px;
  padding:0 9px;
  border-radius:9px;
  color:var(--mu);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  border:1px solid var(--bd2);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.02),
    0 5px 14px rgba(0,0,0,.05);

  font-size:11px;
  font-weight:700;
}

/* =========================================================
   CONTENT + IMAGE
========================================================= */

.trash-card-content-row{
  display:flex;
  align-items:flex-start;
  gap:14px;
  min-width:0;
  flex:1;
}

.trash-card-content{
  flex:1;
  min-width:0;
}

.trash-card-content h3{
  margin:0 0 8px;
  font-size:16px;
  font-weight:700;
  letter-spacing:-.2px;
  word-break:break-word;
}

.trash-card-content p{
  margin:0;
  color:var(--mu);
  font-size:13px;
  line-height:1.65;

  display:-webkit-box;
  -webkit-line-clamp:5;
  -webkit-box-orient:vertical;

  overflow:hidden;
  word-break:break-word;
}

/* =========================================================
   ARCHIVE-STYLE MINI IMAGE
========================================================= */

.trash-image-wrap{
  width:88px;
  height:88px;
  flex:0 0 88px;

  overflow:hidden;
  position:relative;

  border-radius:12px;
  border:1px solid var(--bd2);

  background:var(--panel2);

  box-shadow:
    0 7px 18px rgba(0,0,0,.16);

  isolation:isolate;
}

.trash-image-wrap::after{
  content:"";

  position:absolute;
  inset:0;

  pointer-events:none;

  background:
    linear-gradient(
      180deg,
      transparent 55%,
      rgba(0,0,0,.20)
    );
}

.trash-image{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;

  transition:
    transform .2s ease;
}

.trash-card:hover
.trash-image{
  transform:scale(1.04);
}

/* =========================================================
   TAGS
========================================================= */

.trash-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:12px;
}

.trash-tag{
  color:var(--mu);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  border:1px solid var(--bd2);

  padding:3px 9px;
  border-radius:999px;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.02),
    0 5px 14px rgba(0,0,0,.05);

  font-size:11px;
}

/* =========================================================
   FOOT
========================================================= */

.trash-card-foot{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;

  padding-top:12px;

  border-top:1px solid var(--bd);
}

.trash-date{
  display:flex;
  align-items:center;
  gap:6px;
  color:var(--dim);
  font-size:11.5px;
}

.trash-actions{
  display:flex;
  gap:4px;
}

.trash-action{
  width:31px;
  height:31px;

  display:grid;
  place-items:center;

  border:0;
  border-radius:8px;

  background:none;
  color:var(--mu);

  cursor:pointer;

  transition:
    background .15s ease,
    color .15s ease,
    transform .15s ease;
}

.trash-action:hover{
  color:var(--tx);
  background:var(--panel2);
  transform:scale(1.06);
}

.trash-action.restore:hover{
  color:var(--ac);
}

.trash-action.delete:hover{
  color:var(--danger);
}

/* =========================================================
   EMPTY STATE
========================================================= */

.trash-empty{
  width:100%;
  min-height:420px;

  display:grid;
  place-items:center;

  padding:40px 20px;

  border:1px solid var(--bd2);
  border-radius:20px;

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);

  text-align:center;
}

.trash-empty-inner{
  width:100%;
  max-width:450px;
}

.trash-empty-icon{
  width:70px;
  height:70px;

  margin:0 auto 18px;

  display:grid;
  place-items:center;

  border-radius:20px;

  color:var(--mu);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  border:1px solid var(--bd2);

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);
}

.trash-empty h2{
  margin:0 0 8px;
  font-size:20px;
}

.trash-empty p{
  margin:0 0 22px;
  color:var(--mu);
  line-height:1.65;
  font-size:13.5px;
}

.trash-empty button{
  height:44px;
  padding:0 18px;

  border:1px solid var(--bd2);
  border-radius:12px;

  cursor:pointer;

  color:var(--tx);

  background:
    linear-gradient(
      145deg,
      var(--panel),
      var(--panel2)
    );

  font:inherit;
  font-weight:700;

  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.025),
    0 8px 24px rgba(0,0,0,.08);

  transition:
    background .2s ease,
    transform .2s ease;
}

.trash-empty button:hover{
  background:
    linear-gradient(
      145deg,
      var(--panel2),
      var(--panel)
    );

  transform:translateY(-1px);
}

/* =========================================================
   RESPONSIVE
========================================================= */

@media(max-width:1100px){

  .trash-grid{
    grid-template-columns:
      repeat(2,minmax(0,1fr));
  }

}

@media(max-width:700px){

  .trash-page{
    padding:18px 12px;
  }

  .trash-head{
    align-items:flex-start;
    flex-direction:column;
  }

  .trash-count{
    align-self:flex-start;
  }

  .trash-toolbar{
    align-items:stretch;
    flex-direction:column;
  }

  .trash-search{
    width:100%;
  }

  .trash-grid{
    grid-template-columns:1fr;
  }

  .trash-title{
    font-size:24px;
  }

}

@media(max-width:450px){

  .trash-page{
    padding:16px 10px;
  }

  .trash-title-wrap{
    gap:10px;
  }

  .trash-icon{
    width:44px;
    height:44px;
  }

  .trash-title{
    font-size:22px;
  }

  .trash-sub{
    font-size:12px;
  }

  .trash-card{
    padding:16px;
  }

  /* SAME THUMBNAIL SIZE AS ARCHIVE */

  .trash-image-wrap{
    width:72px;
    height:72px;
    flex-basis:72px;
  }

  .trash-card-content p{
    -webkit-line-clamp:4;
  }

  .trash-card-foot{
    flex-wrap:wrap;
  }

}

@media(prefers-reduced-motion:reduce){

  .trash-page *,
  .trash-page *::before,
  .trash-page *::after{
    transition:none!important;
  }

}

/* =========================================================
   GLOSSY EFFECT  (same look as Dashboard / All Notes)
   Only additions, nothing above was changed.
========================================================= */

/* floating glow orbs behind the page */

.trash-page{
  position:relative;
  overflow:hidden;
}

.trash-page::before,
.trash-page::after{
  content:"";
  position:absolute;
  border-radius:50%;
  pointer-events:none;
  z-index:0;
  will-change:transform;
}

.trash-page::before{
  width:420px;
  height:420px;
  top:-120px;
  left:30%;
  background:radial-gradient(circle,rgba(16,185,129,.22),transparent 68%);
  animation:trashDrift 18s ease-in-out infinite alternate;
}

.trash-page::after{
  width:380px;
  height:380px;
  bottom:-140px;
  right:8%;
  background:radial-gradient(circle,rgba(124,92,240,.20),transparent 68%);
  animation:trashDrift 18s -8s ease-in-out infinite alternate;
}

.trash-page.light::before{
  background:radial-gradient(circle,rgba(16,185,129,.16),transparent 68%);
}

.trash-page.light::after{
  background:radial-gradient(circle,rgba(124,92,240,.12),transparent 68%);
}

.trash-shell{
  position:relative;
  z-index:1;
}

@keyframes trashDrift{
  to{ transform:translate(60px,40px) scale(1.15); }
}

/* cards slide up one after another */

.trash-card{
  animation:trashRise .55s cubic-bezier(.2,.7,.2,1) backwards;
  animation-delay:var(--d,0s);
}

@keyframes trashRise{
  from{ opacity:0; transform:translateY(14px); }
}

/* glass layer inside every card: top sheen + mouse spotlight + shine sweep */

.trash-gloss{
  position:absolute;
  inset:0;
  z-index:0;
  border-radius:inherit;
  overflow:hidden;
  pointer-events:none;
  background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 38%);
}

.trash-gloss::before{
  content:"";
  position:absolute;
  inset:0;
  opacity:0;
  transition:opacity .3s ease;
  background:radial-gradient(
    260px circle at var(--mx,50%) var(--my,50%),
    rgba(52,211,153,.18),
    transparent 70%
  );
}

.trash-gloss::after{
  content:"";
  position:absolute;
  top:0;
  bottom:0;
  left:-40%;
  width:28%;
  opacity:0;
  background:linear-gradient(100deg,transparent,rgba(255,255,255,.12),transparent);
  transform:skewX(-18deg);
}

.trash-card:hover .trash-gloss::before{
  opacity:1;
}

.trash-card:hover .trash-gloss::after{
  opacity:1;
  animation:trashSheen .9s ease forwards;
}

@keyframes trashSheen{
  from{ left:-40%; }
  to{ left:130%; }
}

.trash-page.light .trash-gloss{
  background:linear-gradient(180deg,rgba(255,255,255,.7),transparent 38%);
}

.trash-page.light .trash-gloss::before{
  background:radial-gradient(
    260px circle at var(--mx,50%) var(--my,50%),
    rgba(16,185,129,.16),
    transparent 70%
  );
}

.trash-page.light .trash-gloss::after{
  background:linear-gradient(100deg,transparent,rgba(16,185,129,.12),transparent);
}

/* glowing hover on the card */

.trash-card:hover{
  border-color:rgba(52,211,153,.45);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.06),
    0 16px 36px rgba(16,185,129,.16);
}

.trash-card:hover::before{
  background:linear-gradient(90deg,transparent,var(--ac),transparent);
}

.trash-card:hover .trash-file-icon{
  color:var(--ac);
  border-color:rgba(52,211,153,.35);
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 0 18px rgba(52,211,153,.25);
}

.trash-card:hover .trash-image-wrap{
  border-color:rgba(52,211,153,.4);
  box-shadow:0 8px 22px rgba(16,185,129,.22);
}

.trash-card:hover .trash-tag{
  border-color:rgba(52,211,153,.28);
}

/* glossy search, header icon, counter and buttons */

.trash-search:focus-within{
  border-color:var(--ac2);
  box-shadow:
    0 0 0 4px rgba(52,211,153,.14),
    0 0 24px rgba(52,211,153,.18),
    inset 0 1px 0 rgba(255,255,255,.04);
}

.trash-icon{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.08),
    0 0 22px rgba(251,113,133,.16),
    0 8px 24px rgba(0,0,0,.08);
}

.trash-count{
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.07),
    0 8px 24px rgba(0,0,0,.08);
}

.trash-action:hover{
  box-shadow:0 0 14px rgba(52,211,153,.18);
}

.trash-action.delete:hover{
  box-shadow:0 0 14px rgba(251,113,133,.22);
}

.trash-empty button:hover{
  border-color:rgba(52,211,153,.45);
  box-shadow:0 10px 26px rgba(16,185,129,.18);
}

@media(prefers-reduced-motion:reduce){

  .trash-page::before,
  .trash-page::after,
  .trash-card,
  .trash-card:hover .trash-gloss::after{
    animation:none!important;
  }

}

`;

/* =========================================================
   TRASH PAGE
========================================================= */

export default function Trash() {

  const navigate = useNavigate();

  const { light } = useTheme();

  const {
    trashNotes,
    restoreNote,
    deleteNote,
  } = useNotes();

  const [search, setSearch] = useState("");

  /* mouse spotlight position for the glossy card effect */
  const spot = (event) => {

    const box =
      event.currentTarget.getBoundingClientRect();

    event.currentTarget.style.setProperty(
      "--mx",
      `${event.clientX - box.left}px`
    );

    event.currentTarget.style.setProperty(
      "--my",
      `${event.clientY - box.top}px`
    );

  };

  /* =======================================================
     NOTES
  ======================================================= */

  const notes = useMemo(() => {

    const query = search.trim().toLowerCase();

    return [...(trashNotes || [])]
      .filter((note) => {

        if (!query) return true;

        const title = String(
          note.title || ""
        ).toLowerCase();

        const content = String(
          note.content || ""
        ).toLowerCase();

        const tags = Array.isArray(note.tags)
          ? note.tags.join(" ").toLowerCase()
          : "";

        return (
          title.includes(query) ||
          content.includes(query) ||
          tags.includes(query)
        );

      })
      .sort(
        (a, b) =>
          new Date(
            b.updatedAt ||
              b.createdAt ||
              0
          ) -
          new Date(
            a.updatedAt ||
              a.createdAt ||
              0
          )
      );

  }, [trashNotes, search]);

  /* =======================================================
     RESTORE
     Dedicated optimistic context action.
  ======================================================= */

  const restore = (id) => {

    const promise = Promise.resolve(
      restoreNote(id)
    );

    toast.promise(
      promise,
      {
        loading: "Restoring...",
        success: "Note restored",
        error: (error) =>
          error?.response?.data?.message ||
          "Unable to restore note",
      },
      {
        duration: 1600,
      }
    );

  };

  /* =======================================================
     DELETE FOREVER
  ======================================================= */

  const deleteForever = (id) => {

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this note? This action cannot be undone."
    );

    if (!confirmed) return;

    const promise = Promise.resolve(
      deleteNote(id)
    );

    toast.promise(
      promise,
      {
        loading: "Deleting...",
        success:
          "Note deleted permanently",
        error: (error) =>
          error?.response?.data?.message ||
          "Unable to delete note",
      },
      {
        duration: 1600,
      }
    );

  };

  /* =======================================================
     EMPTY TRASH
  ======================================================= */

  const emptyTrash = async () => {

    if (!notes.length) return;

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete all notes in Trash? This action cannot be undone."
    );

    if (!confirmed) return;

    const promise = Promise.all(
      notes.map((note) =>
        deleteNote(note.id)
      )
    );

    toast.promise(
      promise,
      {
        loading: "Emptying trash...",
        success:
          "Trash emptied successfully",
        error: (error) =>
          error?.response?.data?.message ||
          "Unable to empty trash",
      },
      {
        duration: 1800,
      }
    );

  };

  return (
    <>
      <style>{CSS}</style>

      <main
        className={`trash-page${
          light ? " light" : ""
        }`}
      >

        <div className="trash-shell">

          {/* =================================================
              HEADER
          ================================================= */}

          <header className="trash-head">

            <div className="trash-title-wrap">

              <div className="trash-icon">
                <Trash2 size={23} />
              </div>

              <div>

                <h1 className="trash-title">
                  Trash
                </h1>

                <p className="trash-sub">
                  Deleted notes are kept here
                  until permanently removed.
                </p>

              </div>

            </div>

            <div className="trash-count">

              <Trash2 size={14} />

              <strong>
                {notes.length}
              </strong>

              trashed

            </div>

          </header>

          {/* =================================================
              SEARCH TOOLBAR
          ================================================= */}

          <div className="trash-toolbar">

            <div className="trash-search">

              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search trash..."
              />

              {search && (
                <button
                  type="button"
                  className="clear-search"
                  onClick={() =>
                    setSearch("")
                  }
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

            </div>

            {notes.length > 0 && (

              <button
                type="button"
                className="clear-search"
                onClick={emptyTrash}
                style={{
                  width: "auto",
                  padding: "0 12px",
                  color: "var(--mu)",
                  border:
                    "1px solid var(--bd2)",
                  background:
                    "linear-gradient(145deg, var(--panel), var(--panel2))",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,.025), 0 8px 24px rgba(0,0,0,.08)",
                }}
              >

                <Trash2 size={14} />

                Empty Trash

              </button>

            )}

          </div>

          {/* =================================================
              NOTES
          ================================================= */}

          {notes.length > 0 ? (

            <section className="trash-grid">

              {notes.map((note, index) => {

                const tags = Array.isArray(
                  note.tags
                )
                  ? note.tags
                  : [];

                return (

                  <article
                    className="trash-card"
                    key={note.id}
                    style={{
                      "--d": `${Math.min(index, 12) * 0.05}s`,
                    }}
                    onMouseMove={spot}
                  >

                    {/* GLOSSY LAYER */}

                    <span
                      className="trash-gloss"
                      aria-hidden="true"
                    />

                    {/* CARD TOP */}

                    <div className="trash-card-top">

                      <div className="trash-file-icon">
                        <FileText size={18} />
                      </div>

                      <div className="trash-status">

                        <AlertTriangle
                          size={13}
                        />

                        In Trash

                      </div>

                    </div>

                    {/* =================================================
                        TEXT LEFT + IMAGE RIGHT
                    ================================================= */}

                    <div className="trash-card-content-row">

                      <div
                        className="trash-card-content"
                        role="button"
                        tabIndex={0}
                        onClick={() =>
                          navigate(
                            `/notes/${note.id}`
                          )
                        }
                        onKeyDown={(event) => {

                          if (
                            event.key ===
                              "Enter" ||
                            event.key ===
                              " "
                          ) {

                            event.preventDefault();

                            navigate(
                              `/notes/${note.id}`
                            );

                          }

                        }}
                      >

                        <h3>
                          {note.title ||
                            "Untitled note"}
                        </h3>

                        <p>

                          {note.content
                            ? note.content.length >
                              170
                              ? `${note.content.slice(
                                  0,
                                  170
                                )}...`
                              : note.content
                            : "No content"}

                        </p>

                        {tags.length > 0 && (

                          <div className="trash-tags">

                            {tags
                              .slice(0, 4)
                              .map(
                                (
                                  tag,
                                  index
                                ) => (

                                  <span
                                    className="trash-tag"
                                    key={`${tag}-${index}`}
                                  >
                                    #{tag}
                                  </span>

                                )
                              )}

                          </div>

                        )}

                      </div>

                      {/* =================================================
                          ARCHIVE-STYLE IMAGE
                      ================================================= */}

                      <TrashNoteImage
                        note={note}
                      />

                    </div>

                    {/* CARD FOOT */}

                    <div className="trash-card-foot">

                      <div
                        className="trash-date"
                        title={fmtDate(
                          note.updatedAt ||
                            note.createdAt
                        )}
                      >

                        <Clock3 size={13} />

                        {ago(
                          note.updatedAt ||
                            note.createdAt
                        )}

                      </div>

                      <div className="trash-actions">

                        {/* RESTORE */}

                        <button
                          type="button"
                          className="trash-action restore"
                          onClick={() =>
                            restore(
                              note.id
                            )
                          }
                          title="Restore note"
                          aria-label="Restore note"
                        >

                          <RotateCcw
                            size={15}
                          />

                        </button>

                        {/* DELETE FOREVER */}

                        <button
                          type="button"
                          className="trash-action delete"
                          onClick={() =>
                            deleteForever(
                              note.id
                            )
                          }
                          title="Delete forever"
                          aria-label="Delete forever"
                        >

                          <Trash2
                            size={15}
                          />

                        </button>

                        {/* CLOSE */}

                        <button
                          type="button"
                          className="trash-action"
                          onClick={() =>
                            deleteForever(
                              note.id
                            )
                          }
                          title="Delete permanently"
                          aria-label="Delete permanently"
                        >

                          <X size={16} />

                        </button>

                      </div>

                    </div>

                  </article>

                );

              })}

            </section>

          ) : (

            /* =================================================
               EMPTY
            ================================================= */

            <section className="trash-empty">

              <div className="trash-empty-inner">

                <div className="trash-empty-icon">
                  <Trash2 size={28} />
                </div>

                <h2>
                  {search
                    ? "No notes found"
                    : "Trash is empty"}
                </h2>

                <p>
                  {search
                    ? "Try a different search term."
                    : "Notes that you move to trash will appear here."}
                </p>

                {search ? (

                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                  >
                    Clear Search
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/notes")
                    }
                  >
                    Go to All Notes
                  </button>

                )}

              </div>

            </section>

          )}

        </div>

      </main>
    </>
  );
}