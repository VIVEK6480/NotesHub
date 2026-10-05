import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  Check,
  FileImage,
  FileText,
  Hash,
  ImagePlus,
  Pin,
  Save,
  Trash2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useNotes } from "../../context/NotesContext";

import { useTheme } from "../../context/ThemeContext";

export default function NewNote() {
  const navigate = useNavigate();

  const { createNote } = useNotes();

  const { light } = useTheme();

  const fileInputRef = useRef(null);

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [tagsInput, setTagsInput] =
    useState("");

  const [pinned, setPinned] =
    useState(false);

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const tags = useMemo(() => {
    return [
      ...new Set(
        tagsInput
          .split(",")
          .map((tag) =>
            tag.trim().toLowerCase()
          )
          .filter(Boolean)
      ),
    ];
  }, [tagsInput]);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }

    const url =
      URL.createObjectURL(imageFile);

    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  const handleImageSelect = (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith("image/")
    ) {
      toast.error(
        "Please select a valid image."
      );

      event.target.value = "";

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      toast.error(
        "Image size must be 10 MB or less."
      );

      event.target.value = "";

      return;
    }

    setImageFile(file);

    setError("");
  };

  const removeImage = () => {
    setImageFile(null);

    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    const cleanTitle =
      title.trim();

    const cleanContent =
      content.trim();

    if (!cleanTitle) {
      setError(
        "Please enter a title for your note."
      );

      return;
    }

    setSaving(true);

    setError("");

    try {
      await createNote({
        title: cleanTitle,

        content: cleanContent,

        tags,

        pinned,

        status: "active",

        imageFile,
      });

      toast.success(
        "Note created successfully."
      );

      navigate("/notes");
    } catch (err) {
      console.error(
        "Failed to create note:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to create note."
      );

      toast.error(
        err?.response?.data?.message ||
          "Unable to create note."
      );
    } finally {
      setSaving(false);
    }
  };

  const background =
    light ? "#f5f7f8" : "#080b0d";

  const panel =
    light ? "#ffffff" : "#101517";

  const panelSoft =
    light ? "#f8faf9" : "#0c1113";

  const border =
    light ? "#e2e8e5" : "#1f2a2a";

  const text =
    light ? "#14201d" : "#edf7f3";

  const muted =
    light ? "#71807b" : "#84928e";

  const inputBg =
    light ? "#ffffff" : "#0b1012";

  return (
    <div
      style={{
        minHeight:
          "calc(100vh - 68px)",

        width: "100%",

        maxWidth: "100%",

        boxSizing: "border-box",

        background,

        color: text,

        padding:
          "28px clamp(12px, 2.2vw, 34px) 50px",

        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

        overflowX: "hidden",
      }}
    >
      <style>
        {`
          .new-note-container {
            width: 100%;
            max-width: 100%;
            margin: 0;
            box-sizing: border-box;
          }

          .new-note-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 28px;
            width: 100%;
            box-sizing: border-box;
          }

          .new-note-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 290px;
            gap: 20px;
            align-items: start;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }

          .new-note-editor,
          .new-note-sidebar {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }

          .new-note-editor-content {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            box-sizing: border-box;
          }

          .new-note-editor-content input,
          .new-note-editor-content textarea,
          .new-note-sidebar input,
          .new-note-sidebar button {
            max-width: 100%;
            box-sizing: border-box;
          }

          @media (max-width: 1000px) {
            .new-note-layout {
              grid-template-columns: minmax(0, 1fr) 250px;
              gap: 16px;
            }
          }

          @media (max-width: 850px) {
            .new-note-layout {
              grid-template-columns: 1fr;
              gap: 18px;
            }

            .new-note-sidebar {
              width: 100%;
            }
          }

          @media (max-width: 640px) {
            .new-note-root {
              padding-left: 10px !important;
              padding-right: 10px !important;
            }

            .new-note-header {
              align-items: flex-start;
              flex-direction: column;
              gap: 16px;
            }

            .new-note-header-actions {
              width: 100%;
              justify-content: flex-end;
            }

            .new-note-editor-content {
              padding: 22px 18px 26px !important;
            }

            .new-note-title {
              font-size: 24px !important;
            }

            .new-note-content-area {
              min-height: 320px !important;
            }
          }

          @media (max-width: 480px) {
            .new-note-header-actions {
              width: 100%;
            }

            .new-note-header-actions button {
              flex: 1;
            }

            .new-note-layout {
              gap: 14px;
            }
          }
        `}
      </style>

      <div
        className="new-note-root"
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          className="new-note-container"
        >
          <div
            className="new-note-header"
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
                onClick={() =>
                  navigate("/notes")
                }
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  border:
                    `1px solid ${border}`,
                  background: panel,
                  color: text,
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <ArrowLeft
                  size={19}
                />
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
                      flexShrink: 0,
                    }}
                  >
                    <FileText
                      size={17}
                    />
                  </div>

                  <h1
                    className="new-note-title"
                    style={{
                      margin: 0,
                      fontSize: 25,
                      fontWeight: 750,
                      letterSpacing:
                        "-0.5px",
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
                  Capture your thoughts,
                  ideas and important
                  information.
                </p>
              </div>
            </div>

            <div
              className="new-note-header-actions"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  navigate("/notes")
                }
                style={{
                  height: 42,
                  padding: "0 17px",
                  borderRadius: 11,
                  border:
                    `1px solid ${border}`,
                  background: panel,
                  color: text,
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  height: 42,
                  padding: "0 18px",
                  borderRadius: 11,
                  border: "none",
                  background:
                    "linear-gradient(135deg, #8ff0c9, #34d399)",
                  color: "#052e20",
                  fontWeight: 750,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: saving
                    ? "not-allowed"
                    : "pointer",
                  opacity:
                    saving ? 0.7 : 1,
                }}
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save Note"}
              </button>
            </div>
          </div>

          <div
            className="new-note-layout"
          >
            <section
              className="new-note-editor"
              style={{
                background: panel,

                border:
                  `1px solid ${border}`,

                borderRadius: 18,

                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: 54,

                  padding: "0 18px",

                  display: "flex",

                  alignItems: "center",

                  justifyContent:
                    "space-between",

                  borderBottom:
                    `1px solid ${border}`,

                  background: panelSoft,
                }}
              >
                <div
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

                    gap: 8,

                    color: muted,

                    fontSize: 12,

                    fontWeight: 600,
                  }}
                >
                  <FileText
                    size={15}
                  />

                  Note Editor
                </div>

                <div
                  style={{
                    fontSize: 12,

                    color: muted,
                  }}
                >
                  {content.length}{" "}
                  characters
                </div>
              </div>

              <div
                className="new-note-editor-content"
                style={{
                  padding:
                    "28px 30px 32px",
                }}
              >
                <label
                  style={{
                    display: "block",

                    marginBottom: 9,

                    fontSize: 12,

                    fontWeight: 700,

                    color: muted,

                    textTransform:
                      "uppercase",

                    letterSpacing: ".7px",
                  }}
                >
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => {
                    setTitle(
                      event.target.value
                    );

                    setError("");
                  }}
                  placeholder="Give your note a meaningful title..."
                  maxLength={120}
                  autoFocus
                  style={{
                    width: "100%",

                    boxSizing:
                      "border-box",

                    border: "none",

                    outline: "none",

                    background:
                      "transparent",

                    color: text,

                    fontSize: 30,

                    fontWeight: 750,

                    letterSpacing:
                      "-0.7px",

                    padding:
                      "5px 0 13px",
                  }}
                />

                <div
                  style={{
                    height: 1,

                    background:
                      error
                        ? "#ef4444"
                        : border,

                    marginBottom: 24,
                  }}
                />

                {error && (
                  <div
                    style={{
                      marginTop: -17,

                      marginBottom: 19,

                      color: "#ef4444",

                      fontSize: 12,

                      fontWeight: 600,
                    }}
                  >
                    {error}
                  </div>
                )}

                <label
                  style={{
                    display: "block",

                    marginBottom: 9,

                    fontSize: 12,

                    fontWeight: 700,

                    color: muted,

                    textTransform:
                      "uppercase",

                    letterSpacing: ".7px",
                  }}
                >
                  Content
                </label>

                <textarea
                  className="new-note-content-area"
                  value={content}
                  onChange={(event) =>
                    setContent(
                      event.target.value
                    )
                  }
                  placeholder="Start writing your note here..."
                  style={{
                    width: "100%",

                    minHeight: 400,

                    boxSizing:
                      "border-box",

                    resize: "vertical",

                    border: "none",

                    outline: "none",

                    background:
                      "transparent",

                    color: text,

                    fontSize: 15,

                    lineHeight: 1.8,

                    fontFamily:
                      "inherit",
                  }}
                />

                {imagePreview && (
                  <div
                    style={{
                      marginTop: 25,

                      borderTop:
                        `1px solid ${border}`,

                      paddingTop: 22,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "space-between",

                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",

                          alignItems:
                            "center",

                          gap: 7,

                          fontSize: 13,

                          fontWeight: 700,
                        }}
                      >
                        <FileImage
                          size={16}
                        />

                        Attached Image
                      </div>

                      <button
                        type="button"
                        onClick={
                          removeImage
                        }
                        style={{
                          border: "none",

                          background:
                            "transparent",

                          color:
                            "#fb7185",

                          cursor:
                            "pointer",

                          display: "flex",

                          alignItems:
                            "center",

                          gap: 5,

                          fontSize: 12,

                          fontWeight: 700,
                        }}
                      >
                        <Trash2
                          size={14}
                        />

                        Remove
                      </button>
                    </div>

                    <img
                      src={imagePreview}
                      alt="Selected note"
                      style={{
                        display: "block",

                        width: "100%",

                        maxHeight: 430,

                        objectFit: "contain",

                        borderRadius: 14,

                        border:
                          `1px solid ${border}`,

                        background:
                          inputBg,
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            <aside
              className="new-note-sidebar"
              style={{
                display: "flex",

                flexDirection:
                  "column",

                gap: 16,
              }}
            >
              <div
                style={{
                  background: panel,

                  border:
                    `1px solid ${border}`,

                  borderRadius: 16,

                  padding: 20,
                }}
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

                <button
                  type="button"
                  onClick={() =>
                    setPinned(!pinned)
                  }
                  style={{
                    width: "100%",

                    border:
                      `1px solid ${
                        pinned
                          ? "rgba(52,211,153,.35)"
                          : border
                      }`,

                    background:
                      pinned
                        ? light
                          ? "#ecfdf5"
                          : "rgba(52,211,153,.08)"
                        : inputBg,

                    color: pinned
                      ? "#34d399"
                      : text,

                    borderRadius: 12,

                    padding:
                      "13px 14px",

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    cursor: "pointer",

                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      display: "flex",

                      alignItems:
                        "center",

                      gap: 10,
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

                <label
                  style={{
                    display: "flex",

                    alignItems:
                      "center",

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
                    setTagsInput(
                      event.target.value
                    )
                  }
                  placeholder="work, react, ideas"
                  style={{
                    width: "100%",

                    boxSizing:
                      "border-box",

                    height: 42,

                    padding: "0 12px",

                    borderRadius: 10,

                    border:
                      `1px solid ${border}`,

                    outline: "none",

                    background: inputBg,

                    color: text,

                    fontSize: 13,
                  }}
                />

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
                          display:
                            "inline-flex",

                          alignItems:
                            "center",

                          gap: 5,

                          padding:
                            "6px 9px",

                          borderRadius: 8,

                          background:
                            light
                              ? "#ecfdf5"
                              : "rgba(52,211,153,.08)",

                          color:
                            "#34d399",

                          fontSize: 11,

                          fontWeight: 650,
                        }}
                      >
                        <Hash
                          size={11}
                        />

                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  background: panel,

                  border:
                    `1px solid ${border}`,

                  borderRadius: 16,

                  padding: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 13,

                    fontWeight: 750,

                    marginBottom: 13,
                  }}
                >
                  Attach Image
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageSelect
                  }
                  style={{
                    display: "none",
                  }}
                />

                {!imageFile ? (
                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    style={{
                      width: "100%",

                      minHeight: 120,

                      border:
                        `1px dashed ${border}`,

                      borderRadius: 12,

                      background:
                        inputBg,

                      color: muted,

                      cursor: "pointer",

                      display: "flex",

                      flexDirection:
                        "column",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      gap: 9,
                    }}
                  >
                    <div
                      style={{
                        width: 38,

                        height: 38,

                        borderRadius: 11,

                        display: "grid",

                        placeItems:
                          "center",

                        background:
                          "rgba(52,211,153,.1)",

                        color:
                          "#34d399",
                      }}
                    >
                      <ImagePlus
                        size={19}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: 12,

                        fontWeight: 700,

                        color: text,
                      }}
                    >
                      Choose an image
                    </span>

                    <span
                      style={{
                        fontSize: 10.5,

                        color: muted,
                      }}
                    >
                      PNG, JPG, WEBP ·
                      Max 10 MB
                    </span>
                  </button>
                ) : (
                  <div>
                    <div
                      style={{
                        display: "flex",

                        alignItems:
                          "center",

                        gap: 9,

                        padding:
                          "10px 11px",

                        borderRadius: 10,

                        background:
                          light
                            ? "#ecfdf5"
                            : "rgba(52,211,153,.08)",

                        color:
                          "#34d399",

                        fontSize: 12,

                        fontWeight: 650,
                      }}
                    >
                      <Check size={15} />

                      Image selected
                    </div>

                    <button
                      type="button"
                      onClick={
                        removeImage
                      }
                      style={{
                        width: "100%",

                        marginTop: 9,

                        height: 38,

                        border:
                          `1px solid ${border}`,

                        borderRadius: 10,

                        background:
                          inputBg,

                        color:
                          "#fb7185",

                        cursor:
                          "pointer",

                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        gap: 7,

                        fontSize: 12,

                        fontWeight: 700,
                      }}
                    >
                      <X size={14} />

                      Remove image
                    </button>
                  </div>
                )}
              </div>

              <div
                style={{
                  background: panel,

                  border:
                    `1px solid ${border}`,

                  borderRadius: 16,

                  padding: 20,
                }}
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

                    flexDirection:
                      "column",

                    gap: 11,
                  }}
                >
                  <Tip text="Use a clear title so your note is easy to find." />

                  <Tip text="Add relevant tags for better organization." />

                  <Tip text="Attach an image directly to the note." />

                  <Tip text="Images are stored securely in PostgreSQL." />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  width: "100%",

                  minHeight: 48,

                  border: "none",

                  borderRadius: 12,

                  background:
                    "linear-gradient(135deg, #8ff0c9, #34d399)",

                  color: "#052e20",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "center",

                  gap: 8,

                  fontSize: 13,

                  fontWeight: 800,

                  cursor: saving
                    ? "not-allowed"
                    : "pointer",

                  opacity:
                    saving ? 0.7 : 1,
                }}
              >
                <Save size={17} />

                {saving
                  ? "Saving Note..."
                  : "Create Note"}
              </button>
            </aside>
          </div>
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

        alignItems:
          "flex-start",

        color: "#84928e",

        fontSize: 11.5,

        lineHeight: 1.5,
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