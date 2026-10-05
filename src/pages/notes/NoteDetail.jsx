import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  FileImage,
  FileText,
  Hash,
  ImagePlus,
  Pin,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useNotes } from "../../context/NotesContext";

import { useTheme } from "../../context/ThemeContext";

export default function NoteDetail() {
  const navigate = useNavigate();

  const { id } = useParams();

  const {
    notes,
    updateNote,
    togglePin,
    toggleArchive,
    toggleTrash,
    restoreNote,
    deleteNote,
  } = useNotes();

  const { light } = useTheme();

  const fileInputRef = useRef(null);

  const note = useMemo(
    () =>
      notes.find(
        (item) =>
          String(item.id) ===
          String(id)
      ),
    [notes, id]
  );

  const [title, setTitle] =
    useState("");

  const [content, setContent] =
    useState("");

  const [tagsInput, setTagsInput] =
    useState("");

  const [imageFile, setImageFile] =
    useState(null);

  const [imagePreview, setImagePreview] =
    useState(null);

  const [removeStoredImage, setRemoveStoredImage] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  useEffect(() => {
    if (!note) {
      return;
    }

    setTitle(note.title || "");

    setContent(note.content || "");

    setTagsInput(
      Array.isArray(note.tags)
        ? note.tags.join(", ")
        : ""
    );

    setImageFile(null);

    setRemoveStoredImage(false);

    if (
      note.imageData &&
      note.imageMimeType
    ) {
      setImagePreview(
        `data:${note.imageMimeType};base64,${note.imageData}`
      );
    } else {
      setImagePreview(null);
    }
  }, [note]);

  useEffect(() => {
    if (!imageFile) {
      return;
    }

    const url =
      URL.createObjectURL(imageFile);

    setImagePreview(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

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

  if (!note) {
    return (
      <div
        style={{
          minHeight:
            "calc(100vh - 68px)",

          display: "grid",

          placeItems: "center",

          background:
            light
              ? "#f5f7f8"
              : "#080b0d",

          color:
            light
              ? "#14201d"
              : "#edf7f3",

          padding: 30,

          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <FileText
            size={45}
            style={{
              marginBottom: 15,

              color: "#34d399",
            }}
          />

          <h2
            style={{
              margin:
                "0 0 8px",
            }}
          >
            Note not found
          </h2>

          <p
            style={{
              margin:
                "0 0 20px",

              color:
                light
                  ? "#71807b"
                  : "#84928e",
            }}
          >
            This note may have been
            deleted or is no longer
            available.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/notes")
            }
            style={{
              border: "none",

              borderRadius: 11,

              padding:
                "11px 17px",

              background:
                "linear-gradient(135deg, #8ff0c9, #34d399)",

              color: "#052e20",

              fontWeight: 750,

              cursor: "pointer",
            }}
          >
            Back to Notes
          </button>
        </div>
      </div>
    );
  }

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

  const isTrash =
    note.status === "trash";

  const isArchived =
    note.status === "archived";

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

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      toast.error(
        "Image size must be 10 MB or less."
      );

      event.target.value = "";

      return;
    }

    setImageFile(file);

    setRemoveStoredImage(false);
  };

  const removeImage = () => {
    setImageFile(null);

    setRemoveStoredImage(true);

    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveNote = async () => {
    const cleanTitle =
      title.trim();

    if (!cleanTitle) {
      toast.error(
        "Note title is required."
      );

      return;
    }

    setSaving(true);

    try {
      const updates = {
        title: cleanTitle,

        content: content.trim(),

        tags,
      };

      if (imageFile) {
        updates.imageFile =
          imageFile;
      }

      if (
        removeStoredImage &&
        !imageFile
      ) {
        updates.removeImage = true;
      }

      await updateNote(
        note.id,
        updates
      );

      toast.success(
        "Note updated successfully."
      );

      setRemoveStoredImage(false);

      setImageFile(null);
    } catch (error) {
      console.error(
        "Failed to update note:",
        error
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to update note."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePin = async () => {
    try {
      await togglePin(note.id);

      toast.success(
        note.pinned
          ? "Note unpinned"
          : "Note pinned"
      );
    } catch (error) {
      toast.error(
        "Unable to update pin."
      );
    }
  };

  const handleArchive = async () => {
    try {
      await toggleArchive(note.id);

      toast.success(
        isArchived
          ? "Note restored from archive"
          : "Note archived"
      );
    } catch (error) {
      toast.error(
        "Unable to update archive."
      );
    }
  };

  const handleTrash = async () => {
    try {
      await toggleTrash(note.id);

      toast.success(
        "Note moved to trash"
      );
    } catch (error) {
      toast.error(
        "Unable to move note to trash."
      );
    }
  };

  const handleRestore = async () => {
    try {
      await restoreNote(note.id);

      toast.success(
        "Note restored"
      );
    } catch (error) {
      toast.error(
        "Unable to restore note."
      );
    }
  };

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        "Permanently delete this note? This cannot be undone."
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteNote(note.id);

      toast.success(
        "Note permanently deleted."
      );

      navigate("/notes");
    } catch (error) {
      toast.error(
        "Unable to delete note."
      );
    }
  };

  return (
    <div
      style={{
        minHeight:
          "calc(100vh - 68px)",

        background,

        color: text,

        padding:
          "28px 34px 50px",

        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1180,

          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",

            alignItems: "center",

            justifyContent:
              "space-between",

            gap: 20,

            marginBottom: 25,
          }}
        >
          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 14,
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
              }}
            >
              <ArrowLeft
                size={19}
              />
            </button>

            <div>
              <div
                style={{
                  display: "flex",

                  alignItems: "center",

                  gap: 9,
                }}
              >
                <FileText
                  size={19}
                  color="#34d399"
                />

                <span
                  style={{
                    fontSize: 12,

                    color: muted,

                    fontWeight: 700,

                    textTransform:
                      "uppercase",

                    letterSpacing:
                      ".7px",
                  }}
                >
                  Note Details
                </span>
              </div>

              <div
                style={{
                  marginTop: 4,

                  color: muted,

                  fontSize: 12,
                }}
              >
                Last updated{" "}
                {new Date(
                  note.updatedAt
                ).toLocaleString(
                  "en-IN"
                )}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",

              alignItems: "center",

              gap: 8,

              flexWrap: "wrap",

              justifyContent:
                "flex-end",
            }}
          >
            {!isTrash && (
              <button
                type="button"
                onClick={
                  handlePin
                }
                title={
                  note.pinned
                    ? "Unpin"
                    : "Pin"
                }
                style={actionStyle(
                  border,
                  panel,
                  text,
                  note.pinned
                )}
              >
                <Pin
                  size={16}
                  fill={
                    note.pinned
                      ? "currentColor"
                      : "none"
                  }
                />

                {note.pinned
                  ? "Unpin"
                  : "Pin"}
              </button>
            )}

            {isTrash ? (
              <button
                type="button"
                onClick={
                  handleRestore
                }
                style={actionStyle(
                  border,
                  panel,
                  text,
                  false
                )}
              >
                <RotateCcw
                  size={16}
                />

                Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  handleArchive
                }
                style={actionStyle(
                  border,
                  panel,
                  text,
                  false
                )}
              >
                {isArchived ? (
                  <ArchiveRestore
                    size={16}
                  />
                ) : (
                  <Archive
                    size={16}
                  />
                )}

                {isArchived
                  ? "Unarchive"
                  : "Archive"}
              </button>
            )}

            {isTrash ? (
              <button
                type="button"
                onClick={
                  handleDelete
                }
                style={actionStyle(
                  border,
                  panel,
                  "#fb7185",
                  false
                )}
              >
                <Trash2
                  size={16}
                />

                Delete Forever
              </button>
            ) : (
              <button
                type="button"
                onClick={
                  handleTrash
                }
                style={actionStyle(
                  border,
                  panel,
                  "#fb7185",
                  false
                )}
              >
                <Trash2
                  size={16}
                />

                Trash
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",

            gridTemplateColumns:
              "minmax(0, 1fr) 290px",

            gap: 20,

            alignItems: "start",
          }}
        >
          <section
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

                  alignItems: "center",

                  gap: 8,

                  color: muted,

                  fontSize: 12,

                  fontWeight: 650,
                }}
              >
                <FileText
                  size={15}
                />

                Editor
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
              style={{
                padding:
                  "28px 30px 32px",
              }}
            >
              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value
                  )
                }
                maxLength={120}
                disabled={isTrash}
                style={{
                  width: "100%",

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
                    "5px 0 15px",

                  borderBottom:
                    `1px solid ${border}`,

                  opacity:
                    isTrash ? 0.65 : 1,
                }}
              />

              <textarea
                value={content}
                onChange={(event) =>
                  setContent(
                    event.target.value
                  )
                }
                disabled={isTrash}
                placeholder="Write your note..."
                style={{
                  width: "100%",

                  minHeight: 420,

                  marginTop: 25,

                  border: "none",

                  outline: "none",

                  resize: "vertical",

                  background:
                    "transparent",

                  color: text,

                  fontSize: 15,

                  lineHeight: 1.8,

                  fontFamily:
                    "inherit",

                  opacity:
                    isTrash ? 0.65 : 1,
                }}
              />

              {imagePreview && (
                <div
                  style={{
                    marginTop: 25,

                    paddingTop: 22,

                    borderTop:
                      `1px solid ${border}`,
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
                        color="#34d399"
                      />

                      Attached Image
                    </div>

                    {!isTrash && (
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

                          display:
                            "flex",

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
                    )}
                  </div>

                  <img
                    src={imagePreview}
                    alt={
                      note.title
                    }
                    style={{
                      display: "block",

                      width: "100%",

                      maxHeight: 520,

                      objectFit:
                        "contain",

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

                  marginBottom: 16,
                }}
              >
                Note Settings
              </div>

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
                  setTagsInput(
                    event.target.value
                  )
                }
                disabled={isTrash}
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

                  background:
                    inputBg,

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

                    marginTop: 13,
                  }}
                >
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
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
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {!isTrash && (
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
                  Change Image
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

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  style={{
                    width: "100%",

                    minHeight: 90,

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

                    gap: 8,
                  }}
                >
                  <ImagePlus
                    size={21}
                    color="#34d399"
                  />

                  <span
                    style={{
                      fontSize: 12,

                      fontWeight: 700,

                      color: text,
                    }}
                  >
                    {note.hasImage
                      ? "Replace image"
                      : "Attach image"}
                  </span>

                  <span
                    style={{
                      fontSize: 10,

                      color: muted,
                    }}
                  >
                    Maximum 10 MB
                  </span>
                </button>
              </div>
            )}

            {!isTrash && (
              <button
                type="button"
                onClick={saveNote}
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
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function actionStyle(
  border,
  background,
  color,
  active
) {
  return {
    height: 38,

    padding: "0 12px",

    borderRadius: 10,

    border:
      `1px solid ${
        active
          ? "rgba(52,211,153,.35)"
          : border
      }`,

    background,

    color: active
      ? "#34d399"
      : color,

    display: "flex",

    alignItems: "center",

    gap: 7,

    cursor: "pointer",

    fontSize: 12,

    fontWeight: 700,
  };
}