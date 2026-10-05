import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  FileText,
  Hash,
  Pin,
  Save,
} from "lucide-react";

import { useNotes } from "../../context/NotesContext";
import { useTheme } from "../../context/ThemeContext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

.cn-root {
  animation: rise .6s cubic-bezier(.2,.7,.2,1) both;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.cn-card {
  --mx: 50%;
  --my: 50%;
  position: relative;
  overflow: hidden;
  transition: transform .25s, border-color .25s, box-shadow .25s;
  box-sizing: border-box;
}

.cn-card::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity .3s;
  background: radial-gradient(
    260px circle at var(--mx) var(--my),
    rgba(52,211,153,.18),
    transparent 70%
  );
  pointer-events: none;
}

.cn-card:hover::before {
  opacity: 1;
}

.cn-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: var(--orb);
  pointer-events: none;
  animation: drift 18s ease-in-out infinite alternate;
}

.cn-o1 {
  width: 420px;
  height: 420px;
  background: #10b981;
  top: -120px;
  left: 30%;
}

.cn-o2 {
  width: 380px;
  height: 380px;
  background: #7c5cf0;
  bottom: -140px;
  right: 8%;
  animation-delay: -8s;
}

@keyframes drift {
  to {
    transform: translate(60px, 40px) scale(1.15);
  }
}

@keyframes shine {
  from {
    transform: translateX(-120%) skewX(-20deg);
  }
  to {
    transform: translateX(320%) skewX(-20deg);
  }
}

.cn-shine-btn {
  position: relative;
  overflow: hidden;
}

/* =========================
   RESPONSIVE CREATE LAYOUT
   ========================= */

.cn-create-layout {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 320px);
  gap: clamp(16px, 2vw, 24px);
  align-items: start;
  box-sizing: border-box;
}

.cn-create-layout > section,
.cn-create-layout > aside {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.cn-create-layout input,
.cn-create-layout textarea {
  max-width: 100%;
  box-sizing: border-box;
}

/* Medium screens */
@media (max-width: 1100px) {
  .cn-create-layout {
    grid-template-columns: minmax(0, 1fr) minmax(240px, 280px);
    gap: 18px;
  }
}

/* Tablet */
@media (max-width: 900px) {
  .cn-create-layout {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 18px;
  }
}

/* Mobile */
@media (max-width: 640px) {
  .cn-root {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }

  .cn-create-layout {
    grid-template-columns: 1fr !important;
    gap: 14px;
  }

  .cn-create-layout > section,
  .cn-create-layout > aside {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }
}

/* Small mobile */
@media (max-width: 480px) {
  .cn-root {
    padding-left: 10px !important;
    padding-right: 10px !important;
  }

  .cn-create-layout {
    gap: 12px;
  }
}

/* Prevent text/input overflow */
.cn-create-layout *,
.cn-create-layout input,
.cn-create-layout textarea,
.cn-create-layout button {
  min-width: 0;
  box-sizing: border-box;
}
`;

export default function CreateNote() {
  const navigate = useNavigate();
  const { createNote } = useNotes();
  const { light } = useTheme();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errors, setErrors] = useState({
    title: "",
  });

  const tags = useMemo(() => {
    return [
      ...new Set(
        tagsInput
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean)
      ),
    ];
  }, [tagsInput]);

  const handleSave = async () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      setErrors({
        title: "Please enter a title for your note.",
      });
      return;
    }

    setErrors({
      title: "",
    });

    setSaving(true);

    try {
      await createNote({
        title: cleanTitle,
        content: cleanContent,
        tags,
        pinned,
        status: "active",
      });

      setSaving(false);
      navigate("/notes");
    } catch (error) {
      console.error("Failed to create note:", error);

      setSaving(false);

      setErrors({
        title:
          error?.response?.data?.message ||
          error?.message ||
          "Unable to create note. Please try again.",
      });
    }
  };

  const handleCancel = () => {
    navigate("/notes");
  };

  const handleTitleChange = (event) => {
    setTitle(event.target.value);

    if (errors.title) {
      setErrors({
        title: "",
      });
    }
  };

  const spot = (e) => {
    const b = e.currentTarget.getBoundingClientRect();

    e.currentTarget.style.setProperty(
      "--mx",
      e.clientX - b.left + "px"
    );

    e.currentTarget.style.setProperty(
      "--my",
      e.clientY - b.top + "px"
    );
  };

  const background = light ? "#eef4f1" : "#080b0d";
  const panel = light ? "#ffffff" : "#0f1519";
  const panelSoft = light ? "#f3f8f6" : "#141c21";
  const border = light
    ? "rgba(14,48,36,.1)"
    : "rgba(255,255,255,.07)";
  const text = light ? "#10211b" : "#f2f6f5";
  const muted = light ? "#566b63" : "#8e9b98";
  const inputBg = light ? "#ffffff" : "#141c21";
  const orbOpacity = light ? "0.35" : "0.5";

  return (
    <div
      className="cn-root"
      style={{
        minHeight: "calc(100vh - 68px)",
        background,
        color: text,
        padding: "28px clamp(16px, 2.2vw, 40px) 50px",
        fontFamily: "Inter, system-ui, sans-serif",
        position: "relative",
        overflow: "hidden",
        "--orb": orbOpacity,
      }}
    >
      <style>{CSS}</style>

      <div className="cn-orb cn-o1" />
      <div className="cn-orb cn-o2" />

      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          margin: "0",
          position: "relative",
          zIndex: 2,
          boxSizing: "border-box",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            marginBottom: 28,
            flexWrap: "wrap",
            width: "100%",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              minWidth: 0,
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="cn-card"
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                border: `1px solid ${border}`,
                background: panel,
                color: text,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                boxShadow: light
                  ? "0 10px 28px rgba(16,80,58,.08)"
                  : "0 10px 30px rgba(0,0,0,.25)",
                flexShrink: 0,
              }}
              onMouseMove={spot}
              title="Back to notes"
            >
              <ArrowLeft size={19} />
            </button>

            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 5,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    display: "grid",
                    placeItems: "center",
                    background:
                      "linear-gradient(135deg, #8ff0c9, #34d399)",
                    color: "#052e20",
                    boxShadow: "0 0 14px rgba(52,211,153,.3)",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={17} />
                </div>

                <h1
                  style={{
                    margin: 0,
                    fontSize: 25,
                    fontWeight: 750,
                    letterSpacing: "-0.5px",
                    minWidth: 0,
                  }}
                >
                  Create Note
                </h1>
              </div>

              <p
                style={{
                  margin: 0,
                  color: muted,
                  fontSize: 13,
                }}
              >
                Capture your thoughts, ideas and important information.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={handleCancel}
              className="cn-card"
              style={{
                height: 42,
                padding: "0 17px",
                borderRadius: 11,
                border: `1px solid ${border}`,
                background: panel,
                color: text,
                fontWeight: 650,
                cursor: "pointer",
                boxShadow: light
                  ? "0 10px 28px rgba(16,80,58,.08)"
                  : "0 10px 30px rgba(0,0,0,.25)",
              }}
              onMouseMove={spot}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="cn-card cn-shine-btn"
              style={{
                height: 42,
                padding: "0 18px",
                borderRadius: 11,
                border: "none",
                background:
                  "linear-gradient(135deg, #86d9b6, #5cb893)",
                color: "#effff8",
                fontWeight: 750,
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                boxShadow: "0 8px 26px rgba(52,211,153,.32)",
              }}
              onMouseMove={spot}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Note"}
            </button>
          </div>
        </div>

        {/* Main Editor Layout */}
        <div
          className="cn-create-layout"
          style={{
            display: "grid",
            alignItems: "start",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
          }}
        >
          {/* Editor */}
          <section
            className="cn-card"
            style={{
              background: `linear-gradient(180deg, ${panelSoft}, ${panel})`,
              border: `1px solid ${border}`,
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: light
                ? "0 14px 34px rgba(16,80,58,.12)"
                : "0 14px 38px rgba(0,0,0,.4)",
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              boxSizing: "border-box",
            }}
            onMouseMove={spot}
          >
            {/* Editor Toolbar */}
            <div
              style={{
                height: 54,
                padding: "0 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: `1px solid ${border}`,
                background: panelSoft,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: muted,
                  fontSize: 12,
                  fontWeight: 600,
                  minWidth: 0,
                }}
              >
                <FileText size={15} />
                Note Editor
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: muted,
                  flexShrink: 0,
                }}
              >
                {content.length} characters
              </div>
            </div>

            <div
              style={{
                padding: "28px 30px 32px",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            >
              {/* Title */}
              <label
                style={{
                  display: "block",
                  marginBottom: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  color: muted,
                  textTransform: "uppercase",
                  letterSpacing: ".7px",
                }}
              >
                Title
              </label>

              <input
                value={title}
                onChange={handleTitleChange}
                placeholder="Give your note a meaningful title..."
                maxLength={120}
                autoFocus
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: text,
                  fontSize: 30,
                  fontWeight: 750,
                  letterSpacing: "-0.7px",
                  padding: "5px 0 13px",
                }}
              />

              <div
                style={{
                  height: 1,
                  background: errors.title ? "#ef4444" : border,
                  marginBottom: 24,
                }}
              />

              {errors.title && (
                <div
                  style={{
                    marginTop: -17,
                    marginBottom: 19,
                    color: "#ef4444",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {errors.title}
                </div>
              )}

              {/* Content */}
              <label
                style={{
                  display: "block",
                  marginBottom: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  color: muted,
                  textTransform: "uppercase",
                  letterSpacing: ".7px",
                }}
              >
                Content
              </label>

              <textarea
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                placeholder="Start writing your note here..."
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  minHeight: 450,
                  boxSizing: "border-box",
                  resize: "vertical",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  color: text,
                  fontSize: 15,
                  lineHeight: 1.8,
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              />
            </div>
          </section>

          {/* Settings Panel */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: "100%",
              maxWidth: "100%",
              minWidth: 0,
              boxSizing: "border-box",
            }}
          >
            {/* Note Settings */}
            <div
              className="cn-card"
              style={{
                background: `linear-gradient(180deg, ${panelSoft}, ${panel})`,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 22,
                boxShadow: light
                  ? "0 14px 34px rgba(16,80,58,.12)"
                  : "0 14px 38px rgba(0,0,0,.4)",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
              }}
              onMouseMove={spot}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 750,
                  marginBottom: 18,
                }}
              >
                Note Settings
              </div>

              {/* Pin */}
              <button
                type="button"
                onClick={() => setPinned(!pinned)}
                style={{
                  width: "100%",
                  minWidth: 0,
                  border: `1px solid ${
                    pinned
                      ? "rgba(52,211,153,.35)"
                      : border
                  }`,
                  background: pinned
                    ? light
                      ? "#ecfdf5"
                      : "rgba(52,211,153,.08)"
                    : inputBg,
                  color: pinned ? "#34d399" : text,
                  borderRadius: 12,
                  padding: "13px 14px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  marginBottom: 20,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <Pin size={16} />

                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 650,
                    }}
                  >
                    Pin this note
                  </span>
                </div>

                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: pinned
                      ? "none"
                      : `1px solid ${border}`,
                    background: pinned
                      ? "#34d399"
                      : "transparent",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {pinned && (
                    <Check
                      size={13}
                      color="#052e20"
                      strokeWidth={3}
                    />
                  )}
                </div>
              </button>

              {/* Tags */}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: muted,
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 9,
                }}
              >
                <Hash size={14} />
                Tags
              </label>

              <input
                value={tagsInput}
                onChange={(event) =>
                  setTagsInput(event.target.value)
                }
                placeholder="work, react, ideas"
                style={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,
                  boxSizing: "border-box",
                  height: 42,
                  padding: "0 12px",
                  borderRadius: 10,
                  border: `1px solid ${border}`,
                  outline: "none",
                  background: inputBg,
                  color: text,
                  fontSize: 13,
                }}
              />

              <div
                style={{
                  marginTop: 8,
                  color: muted,
                  fontSize: 11,
                  lineHeight: 1.5,
                }}
              >
                Separate multiple tags using commas.
              </div>

              {/* Tag Preview */}
              {tags.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 7,
                    marginTop: 14,
                  }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        padding: "6px 9px",
                        borderRadius: 8,
                        background: light
                          ? "#ecfdf5"
                          : "rgba(52,211,153,.08)",
                        color: "#34d399",
                        fontSize: 11,
                        fontWeight: 650,
                      }}
                    >
                      <Hash size={11} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Information / Quick Tips */}
            <div
              className="cn-card"
              style={{
                background: `linear-gradient(180deg, ${panelSoft}, ${panel})`,
                border: `1px solid ${border}`,
                borderRadius: 20,
                padding: 22,
                boxShadow: light
                  ? "0 14px 34px rgba(16,80,58,.12)"
                  : "0 14px 38px rgba(0,0,0,.4)",
                width: "100%",
                maxWidth: "100%",
                minWidth: 0,
                boxSizing: "border-box",
              }}
              onMouseMove={spot}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 750,
                  marginBottom: 13,
                }}
              >
                Quick Tips
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 11,
                }}
              >
                <Tip text="Use a clear title so your note is easy to find." />
                <Tip text="Add relevant tags for better organization." />
                <Tip text="Pin important notes for quick access." />
                <Tip text="Your note is saved locally in NotesHub." />
              </div>
            </div>

            {/* Create Button in Sidebar */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="cn-card cn-shine-btn"
              style={{
                width: "100%",
                minHeight: 48,
                border: "none",
                borderRadius: 13,
                background:
                  "linear-gradient(135deg, #86d9b6, #5cb893)",
                color: "#effff8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 800,
                cursor: saving ? "not-allowed" : "pointer",
                opacity: saving ? 0.7 : 1,
                boxShadow: "0 8px 26px rgba(52,211,153,.32)",
                boxSizing: "border-box",
              }}
              onMouseMove={spot}
            >
              <Save size={17} />
              {saving ? "Saving Note..." : "Create Note"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Tip({ text }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 9,
        alignItems: "flex-start",
        color: "var(--mu, #84928e)",
        fontSize: 11.5,
        lineHeight: 1.5,
        minWidth: 0,
      }}
    >
      <div
        style={{
          width: 5,
          height: 5,
          minWidth: 5,
          borderRadius: "50%",
          background: "#34d399",
          marginTop: 6,
        }}
      />

      <span>{text}</span>
    </div>
  );
}