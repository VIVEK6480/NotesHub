import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Archive as ArchiveIcon,
  Clock3,
  FileText,
  RotateCcw,
  Trash2,
  X,
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
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  return fmtDate(date);
};

/* =========================================================
   IMAGE HELPERS
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
  typeof value === "string" && /^https?:\/\//i.test(value.trim());

const isBlobUrl = (value) =>
  typeof value === "string" && /^blob:/i.test(value.trim());

const isDataImage = (value) =>
  typeof value === "string" &&
  /^data:image\/[a-zA-Z0-9.+-]+;base64,/i.test(value.trim());

const looksLikeBase64 = (value) => {
  if (typeof value !== "string") return false;

  const normalized = value.replace(/\s+/g, "").trim();
  if (normalized.length < 32) return false;

  return /^[A-Za-z0-9+/]+={0,2}$/.test(normalized);
};

const base64ToDataUrl = (value, mimeType = "image/jpeg") => {
  if (typeof value !== "string") return null;

  const normalized = value.replace(/\s+/g, "").trim();
  if (!looksLikeBase64(normalized)) return null;

  return `data:${mimeType};base64,${normalized}`;
};

const arrayBufferToDataUrl = (data, mimeType = "image/jpeg") => {
  try {
    if (!Array.isArray(data) || data.length === 0) return null;

    let binary = "";
    const chunkSize = 0x8000;

    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }

    return `data:${mimeType};base64,${btoa(binary)}`;
  } catch (error) {
    console.error("Unable to convert image buffer:", error);
    return null;
  }
};

const getNoteImageValue = (note) => {
  if (!note || typeof note !== "object") return null;

  for (const field of IMAGE_FIELDS) {
    const value = note[field];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
};

const getSafeStringImageUrl = (value) => {
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (isDataImage(trimmed)) return trimmed;
  if (isHttpUrl(trimmed)) return trimmed;
  if (isBlobUrl(trimmed)) return trimmed;

  if (isKnownLocalPath(trimmed)) return trimmed;

  // Check base64 before generic "/" paths.
  if (looksLikeBase64(trimmed)) {
    return base64ToDataUrl(trimmed);
  }

  if (trimmed.startsWith("/") && trimmed.length <= 2048) {
    return trimmed;
  }

  return null;
};

/* =========================================================
   MINI THUMBNAIL
========================================================= */
function ArchiveNoteImage({ note }) {
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

      if (typeof File !== "undefined" && value instanceof File) {
        objectUrl = URL.createObjectURL(value);
        if (!cancelled) setSrc(objectUrl);
        return;
      }

      if (typeof Blob !== "undefined" && value instanceof Blob) {
        objectUrl = URL.createObjectURL(value);
        if (!cancelled) setSrc(objectUrl);
        return;
      }

      if (typeof value === "object" && value !== null) {
        if (value.type === "Buffer" && Array.isArray(value.data)) {
          const result = arrayBufferToDataUrl(
            value.data,
            value.mimeType || value.contentType || "image/jpeg"
          );
          if (!cancelled) setSrc(result);
          return;
        }

        if (Array.isArray(value.data)) {
          const result = arrayBufferToDataUrl(
            value.data,
            value.mimeType || value.contentType || "image/jpeg"
          );
          if (!cancelled) setSrc(result);
          return;
        }

        if (typeof value.url === "string") {
          if (!cancelled) setSrc(getSafeStringImageUrl(value.url));
          return;
        }

        if (typeof value.href === "string") {
          if (!cancelled) setSrc(getSafeStringImageUrl(value.href));
          return;
        }

        setSrc(null);
        return;
      }

      if (typeof value === "string") {
        if (!cancelled) setSrc(getSafeStringImageUrl(value));
        return;
      }

      setSrc(null);
    };

    loadImage();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [note]);

  if (!src) return null;

  return (
    <div className="archive-image-wrap" title="Attached image">
      <img
        className="archive-image"
        src={src}
        alt={`${note?.title || "Note"} attachment`}
        loading="lazy"
        onError={(event) => {
          const wrapper = event.currentTarget.parentElement;
          if (wrapper) wrapper.style.display = "none";
        }}
      />
    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */
const CSS = `
.archive-page{
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
  --warning:#fbbf24;
  min-height:calc(100vh - 68px);
  width:100%;
  padding:clamp(18px,2vw,28px);
  color:var(--tx);
  background:
    radial-gradient(circle at 15% 10%,rgba(16,185,129,.10),transparent 28%),
    radial-gradient(circle at 85% 85%,rgba(124,92,240,.12),transparent 30%),
    var(--bg);
  font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
  overflow-x:hidden;
}

.archive-page.light{
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
  --warning:#d97706;
}

.archive-page *,.archive-page *::before,.archive-page *::after{
  box-sizing:border-box;
}

.archive-shell{width:100%;margin:0;}

.archive-head{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:18px;
  margin-bottom:24px;
}

.archive-title-wrap{
  display:flex;
  align-items:center;
  gap:14px;
  min-width:0;
}

.archive-icon{
  width:48px;
  height:48px;
  display:grid;
  place-items:center;
  flex-shrink:0;
  border-radius:14px;
  color:var(--on);
  background:linear-gradient(135deg,#8ff0c9,#34d399);
  box-shadow:0 10px 28px rgba(52,211,153,.25);
}

.archive-title{
  margin:0;
  font-size:28px;
  font-weight:800;
  letter-spacing:-.7px;
}

.archive-sub{
  margin:5px 0 0;
  color:var(--mu);
  font-size:13px;
}

.archive-count{
  display:inline-flex;
  align-items:center;
  gap:7px;
  height:40px;
  padding:0 14px;
  border-radius:12px;
  border:1px solid var(--bd);
  background:var(--panel);
  color:var(--mu);
  font-size:13px;
  font-weight:600;
  flex-shrink:0;
}

.archive-count strong{color:var(--ac);}

.archive-grid{
  width:100%;
  display:grid;
  grid-template-columns:repeat(3,minmax(0,1fr));
  gap:16px;
}

.archive-card{
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
  background:linear-gradient(150deg,var(--panel),var(--panel2));
  transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease;
}

.archive-card::before{
  content:"";
  position:absolute;
  top:0;
  left:14%;
  right:14%;
  height:2px;
  border-radius:2px;
  background:linear-gradient(90deg,transparent,var(--ac),transparent);
}

.archive-card:hover{
  transform:translateY(-3px);
  border-color:rgba(52,211,153,.40);
  box-shadow:0 18px 40px rgba(16,185,129,.13);
}

.archive-card-top{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
}

.archive-file-icon{
  width:38px;
  height:38px;
  display:grid;
  place-items:center;
  border-radius:11px;
  color:var(--ac);
  background:rgba(52,211,153,.10);
  box-shadow:inset 0 0 0 1px rgba(52,211,153,.15);
}

.archive-status{
  display:inline-flex;
  align-items:center;
  gap:6px;
  height:30px;
  padding:0 9px;
  border-radius:9px;
  color:var(--warning);
  background:rgba(251,191,36,.08);
  border:1px solid rgba(251,191,36,.16);
  font-size:11px;
  font-weight:700;
}

/* Text + thumbnail side-by-side */
.archive-content-row{
  display:flex;
  align-items:flex-start;
  gap:14px;
  min-width:0;
  flex:1;
}

.archive-body{
  flex:1;
  min-width:0;
  cursor:pointer;
}

.archive-body h3{
  margin:0 0 8px;
  display:flex;
  align-items:center;
  gap:8px;
  font-size:16px;
  font-weight:700;
  letter-spacing:-.2px;
  word-break:break-word;
}

.archive-body h3 svg{
  color:var(--warning);
  flex-shrink:0;
}

.archive-body p{
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

.archive-tags{
  display:flex;
  flex-wrap:wrap;
  gap:6px;
  margin-top:12px;
}

.archive-tag{
  color:var(--ac);
  background:rgba(52,211,153,.08);
  border:1px solid rgba(52,211,153,.16);
  padding:3px 9px;
  border-radius:999px;
  font-size:11px;
}

/* Small right-side image */
.archive-image-wrap{
  width:88px;
  height:88px;
  flex:0 0 88px;
  overflow:hidden;
  position:relative;
  border-radius:12px;
  border:1px solid var(--bd2);
  background:var(--panel2);
  box-shadow:0 7px 18px rgba(0,0,0,.16);
  isolation:isolate;
}

.archive-image-wrap::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(180deg,transparent 55%,rgba(0,0,0,.20));
}

.archive-image{
  display:block;
  width:100%;
  height:100%;
  object-fit:cover;
  transition:transform .2s ease;
}

.archive-card:hover .archive-image{transform:scale(1.04);}

.archive-foot{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  padding-top:12px;
  border-top:1px solid var(--bd);
}

.archive-date{
  display:flex;
  align-items:center;
  gap:6px;
  color:var(--dim);
  font-size:11.5px;
}

.archive-actions{display:flex;gap:4px;}

.archive-action{
  width:31px;
  height:31px;
  display:grid;
  place-items:center;
  border:0;
  border-radius:8px;
  background:none;
  color:var(--mu);
  cursor:pointer;
  transition:background .15s ease,color .15s ease,transform .15s ease;
}

.archive-action:hover{
  color:var(--tx);
  background:var(--panel2);
  transform:scale(1.06);
}

.archive-action.restore:hover{color:var(--ac);}
.archive-action.d:hover{color:var(--danger);}

.archive-empty{
  width:100%;
  min-height:420px;
  display:grid;
  place-items:center;
  padding:40px 20px;
  border:1px dashed var(--bd2);
  border-radius:20px;
  background:var(--panel);
  text-align:center;
}

.archive-empty-inner{width:100%;max-width:450px;}

.archive-empty-icon{
  width:70px;
  height:70px;
  margin:0 auto 18px;
  display:grid;
  place-items:center;
  border-radius:20px;
  color:var(--ac);
  background:rgba(52,211,153,.10);
  box-shadow:0 0 30px rgba(52,211,153,.18);
}

.archive-empty h2{margin:0 0 8px;font-size:20px;}

.archive-empty p{
  margin:0 0 22px;
  color:var(--mu);
  line-height:1.65;
  font-size:13.5px;
}

.archive-empty button{
  height:44px;
  padding:0 18px;
  border:0;
  border-radius:12px;
  cursor:pointer;
  color:var(--on);
  background:linear-gradient(135deg,#8ff0c9,#34d399);
  font:inherit;
  font-weight:700;
  box-shadow:0 8px 26px rgba(52,211,153,.25);
}

@media(max-width:1100px){
  .archive-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
}

@media(max-width:700px){
  .archive-page{padding:18px 12px;}
  .archive-head{align-items:flex-start;flex-direction:column;}
  .archive-count{align-self:flex-start;}
  .archive-grid{grid-template-columns:1fr;}
  .archive-title{font-size:24px;}
}

@media(max-width:450px){
  .archive-page{padding:16px 10px;}
  .archive-title-wrap{gap:10px;}
  .archive-icon{width:44px;height:44px;}
  .archive-title{font-size:22px;}
  .archive-sub{font-size:12px;}
  .archive-card{padding:16px;}
  .archive-image-wrap{width:72px;height:72px;flex-basis:72px;}
  .archive-body p{-webkit-line-clamp:4;}
  .archive-foot{flex-wrap:wrap;}
}

@media(prefers-reduced-motion:reduce){
  .archive-page *,.archive-page *::before,.archive-page *::after{
    transition:none!important;
  }
}
`;

/* =========================================================
   ARCHIVE PAGE
========================================================= */
export default function Archive() {
  const navigate = useNavigate();
  const { light } = useTheme();

  const {
    archivedNotes,
    restoreNote,
    toggleTrash,
  } = useNotes();

  const notes = useMemo(
    () =>
      [...(archivedNotes || [])].sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.createdAt || 0)
      ),
    [archivedNotes]
  );

  /* =======================================================
     RESTORE
     Uses the dedicated optimistic context action.
     Do NOT use updateNote({ status: "active" }) here.
  ======================================================= */
  const restore = (id) => {
    const promise = Promise.resolve(restoreNote(id));

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
     MOVE TO TRASH
     Uses dedicated optimistic context action.
  ======================================================= */
  const trash = (id) => {
    const promise = Promise.resolve(toggleTrash(id));

    toast.promise(
      promise,
      {
        loading: "Moving to trash...",
        success: "Moved to trash",
        error: (error) =>
          error?.response?.data?.message ||
          "Unable to move note to trash",
      },
      {
        duration: 1600,
      }
    );
  };

  /* Same operation as restore, kept for the existing X button. */
  const removeFromArchive = (id) => {
    const promise = Promise.resolve(restoreNote(id));

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

  return (
    <>
      <style>{CSS}</style>

      <main className={`archive-page${light ? " light" : ""}`}>
        <div className="archive-shell">
          <header className="archive-head">
            <div className="archive-title-wrap">
              <div className="archive-icon">
                <ArchiveIcon size={23} />
              </div>

              <div>
                <h1 className="archive-title">Archive</h1>
                <p className="archive-sub">
                  Keep completed notes safely organized.
                </p>
              </div>
            </div>

            <div className="archive-count">
              <ArchiveIcon size={14} />
              <strong>{notes.length}</strong>
              archived
            </div>
          </header>

          {notes.length > 0 ? (
            <section className="archive-grid">
              {notes.map((note) => (
                <article className="archive-card" key={note.id}>
                  <div className="archive-card-top">
                    <div className="archive-file-icon">
                      <FileText size={18} />
                    </div>

                    <div className="archive-status">
                      <ArchiveIcon size={13} />
                      Archived
                    </div>
                  </div>

                  {/* Text on left + mini image on right */}
                  <div className="archive-content-row">
                    <div
                      className="archive-body"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(`/notes/${note.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          navigate(`/notes/${note.id}`);
                        }
                      }}
                    >
                      <h3>
                        {note.title || "Untitled note"}
                        <ArchiveIcon size={14} />
                      </h3>

                      <p>{note.content || "No content"}</p>

                      <div className="archive-tags">
                        {Array.isArray(note.tags) &&
                          note.tags.map((tag) => (
                            <span className="archive-tag" key={tag}>
                              #{tag}
                            </span>
                          ))}
                      </div>
                    </div>

                    <ArchiveNoteImage note={note} />
                  </div>

                  <div className="archive-foot">
                    <div
                      className="archive-date"
                      title={fmtDate(
                        note.updatedAt || note.createdAt
                      )}
                    >
                      <Clock3 size={13} />
                      {ago(note.updatedAt || note.createdAt)}
                    </div>

                    <div className="archive-actions">
                      <button
                        type="button"
                        className="archive-action restore"
                        onClick={() => restore(note.id)}
                        title="Restore note"
                        aria-label="Restore note"
                      >
                        <RotateCcw size={15} />
                      </button>

                      <button
                        type="button"
                        className="archive-action d"
                        onClick={() => trash(note.id)}
                        title="Move to trash"
                        aria-label="Move to trash"
                      >
                        <Trash2 size={15} />
                      </button>

                      <button
                        type="button"
                        className="archive-action"
                        onClick={() => removeFromArchive(note.id)}
                        title="Remove from archive"
                        aria-label="Remove from archive"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="archive-empty">
              <div className="archive-empty-inner">
                <div className="archive-empty-icon">
                  <ArchiveIcon size={28} />
                </div>

                <h2>No archived notes</h2>

                <p>
                  Notes that you archive will appear here. You can
                  restore them anytime and continue working.
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/notes")}
                >
                  Go to All Notes
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
