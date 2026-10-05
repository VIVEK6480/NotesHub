import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import api from "../services/api";
import { useAuth } from "./AuthContext";

const NotesContext = createContext(null);

/* =========================================================
   NORMALIZE NOTE
========================================================= */

const normalizeNote = (note = {}) => {
  return {
    ...note,

    id: note.id,

    title: note.title || "",

    content: note.content || "",

    tags: Array.isArray(note.tags)
      ? note.tags
      : [],

    /*
      Support both:
      pinned
      isPinned
    */
    pinned: Boolean(
      note.pinned ?? note.isPinned
    ),

    /*
      Main application status
    */
    status: note.trash
      ? "trash"
      : note.archived
      ? "archived"
      : "active",

    isPinned: Boolean(
      note.isPinned ?? note.pinned
    ),

    isArchived: Boolean(
      note.isArchived ?? note.archived
    ),

    isTrashed: Boolean(
      note.isTrashed ?? note.trash
    ),

    imageData: note.imageData || null,

    imageMimeType:
      note.imageMimeType || null,

    hasImage: Boolean(
      note.hasImage || note.imageData
    ),

    createdAt: note.createdAt,

    updatedAt: note.updatedAt,
  };
};

/* =========================================================
   IMAGE TO BASE64
========================================================= */

const imageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error(
          "Unable to read selected image."
        )
      );
    };

    reader.readAsDataURL(file);
  });
};

/* =========================================================
   PROVIDER
========================================================= */

export function NotesProvider({ children }) {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [notes, setNotes] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  // Keep a synchronous mirror of notes so optimistic actions
  // never wait for a React render before calculating the next state.
  const notesRef = useRef([]);

  // One operation token per note prevents an older API response
  // from overwriting a newer optimistic action.
  const operationRef = useRef(new Map());

  const commitNotes = useCallback((next) => {
    notesRef.current = next;
    setNotes(next);
  }, []);

  const beginOperation = useCallback((id) => {
    const key = String(id);
    const token = Symbol(key);
    operationRef.current.set(key, token);
    return token;
  }, []);

  const isCurrentOperation = useCallback((id, token) => {
    return operationRef.current.get(String(id)) === token;
  }, []);

  /* =======================================================
     FETCH NOTES
  ======================================================= */

  const fetchNotes = useCallback(async () => {
    if (!user) {
      commitNotes([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const response =
        await api.get("/notes");

      const receivedNotes =
        response.data?.notes || [];

      const normalized =
        receivedNotes.map(
          normalizeNote
        );

      commitNotes(normalized);

      return normalized;
    } catch (err) {
      console.error(
        "Failed to fetch notes:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Unable to load notes."
      );

      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, commitNotes]);

  /* =======================================================
     LOAD NOTES WHEN USER IS READY
  ======================================================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      commitNotes([]);
      return;
    }

    fetchNotes().catch(() => {});
  }, [
    user,
    authLoading,
    fetchNotes,
  ]);

  /* =======================================================
     CREATE NOTE
  ======================================================= */

  const createNote = useCallback(
    async ({
      title,
      content,
      tags = [],
      pinned = false,
      status = "active",
      imageFile = null,
    }) => {
      let imageData = null;
      let imageMimeType = null;

      if (imageFile) {
        imageData =
          await imageToBase64(
            imageFile
          );

        imageMimeType =
          imageFile.type || null;
      }

      const response =
        await api.post(
          "/notes",
          {
            title,
            content,
            tags,

            pinned,

            archived:
              status === "archived",

            trash:
              status === "trash",

            imageData,

            imageMimeType,
          }
        );

      const createdNote =
        normalizeNote(
          response.data.note
        );

      const next = [createdNote, ...notesRef.current];
      commitNotes(next);

      return createdNote;
    },
    [commitNotes]
  );

  /* =======================================================
     UPDATE NOTE
     
     Used for normal note edits.
     
     IMPORTANT:
     If caller sends status:
       archived -> convert to archived:true
       trash    -> convert to trash:true
  ======================================================= */

  const updateNote = useCallback(
    async (id, updates = {}) => {
      const payload = {
        ...updates,
      };

      /*
        Convert frontend status into
        backend fields.
      */

      if (
        updates.status === "archived"
      ) {
        payload.archived = true;
        payload.trash = false;

        delete payload.status;
      }

      if (
        updates.status === "trash"
      ) {
        payload.trash = true;
        payload.archived = false;

        delete payload.status;
      }

      if (
        updates.status === "active"
      ) {
        payload.archived = false;
        payload.trash = false;

        delete payload.status;
      }

      /*
        Image handling
      */

      if (updates.imageFile) {
        payload.imageData =
          await imageToBase64(
            updates.imageFile
          );

        payload.imageMimeType =
          updates.imageFile.type ||
          null;

        delete payload.imageFile;
      }

      const response =
        await api.put(
          `/notes/${id}`,
          payload
        );

      const updatedNote =
        normalizeNote(
          response.data.note
        );

      commitNotes(
        notesRef.current.map((note) =>
          String(note.id) === String(id)
            ? updatedNote
            : note
        )
      );

      return updatedNote;
    },
    [commitNotes]
  );

  /* =======================================================
     OPTIMISTIC NOTE ACTIONS

     IMPORTANT:
     These actions update React state synchronously from notesRef.
     The card therefore moves between tabs immediately; the API
     request happens in the background. If the API fails, the exact
     previous note is restored.
  ======================================================= */

  const togglePin = useCallback(
    async (id) => {
      const key = String(id);
      const token = beginOperation(id);
      const current = notesRef.current;
      const target = current.find(
        (note) => String(note.id) === key
      );

      if (!target) return null;

      const previousNote = { ...target };
      const nextPinned = !Boolean(target.pinned);

      commitNotes(
        current.map((note) =>
          String(note.id) === key
            ? {
                ...note,
                pinned: nextPinned,
                isPinned: nextPinned,
              }
            : note
        )
      );

      try {
        const response = await api.patch(`/notes/${id}/pin`);
        const updatedNote = normalizeNote(response.data.note);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? updatedNote : note
            )
          );
        }

        return updatedNote;
      } catch (err) {
        console.error("Failed to toggle pin:", err);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? previousNote : note
            )
          );
        }

        throw err;
      }
    },
    [beginOperation, commitNotes, isCurrentOperation]
  );

  const toggleArchive = useCallback(
    async (id) => {
      const key = String(id);
      const token = beginOperation(id);
      const current = notesRef.current;
      const target = current.find(
        (note) => String(note.id) === key
      );

      if (!target) return null;

      const previousNote = { ...target };

      commitNotes(
        current.map((note) =>
          String(note.id) === key
            ? {
                ...note,
                status: "archived",
                pinned: false,
                isPinned: false,
                isArchived: true,
                isTrashed: false,
                archived: true,
                trash: false,
              }
            : note
        )
      );

      try {
        const response = await api.patch(`/notes/${id}/archive`);
        const updatedNote = normalizeNote(response.data.note);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? updatedNote : note
            )
          );
        }

        return updatedNote;
      } catch (err) {
        console.error("Failed to archive note:", err);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? previousNote : note
            )
          );
        }

        throw err;
      }
    },
    [beginOperation, commitNotes, isCurrentOperation]
  );

  const toggleTrash = useCallback(
    async (id) => {
      const key = String(id);
      const token = beginOperation(id);
      const current = notesRef.current;
      const target = current.find(
        (note) => String(note.id) === key
      );

      if (!target) return null;

      const previousNote = { ...target };

      commitNotes(
        current.map((note) =>
          String(note.id) === key
            ? {
                ...note,
                status: "trash",
                pinned: false,
                isPinned: false,
                isArchived: false,
                isTrashed: true,
                archived: false,
                trash: true,
              }
            : note
        )
      );

      try {
        const response = await api.patch(`/notes/${id}/trash`);
        const updatedNote = normalizeNote(response.data.note);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? updatedNote : note
            )
          );
        }

        return updatedNote;
      } catch (err) {
        console.error("Failed to move note to trash:", err);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? previousNote : note
            )
          );
        }

        throw err;
      }
    },
    [beginOperation, commitNotes, isCurrentOperation]
  );

  const restoreNote = useCallback(
    async (id) => {
      const key = String(id);
      const token = beginOperation(id);
      const current = notesRef.current;
      const target = current.find(
        (note) => String(note.id) === key
      );

      if (!target) return null;

      const previousNote = { ...target };

      // THIS is the important fix: restore is committed locally
      // before the network request starts.
      commitNotes(
        current.map((note) =>
          String(note.id) === key
            ? {
                ...note,
                status: "active",
                pinned: false,
                isPinned: false,
                isArchived: false,
                isTrashed: false,
                archived: false,
                trash: false,
              }
            : note
        )
      );

      try {
        const response = await api.patch(`/notes/${id}/restore`);
        const updatedNote = normalizeNote(response.data.note);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? updatedNote : note
            )
          );
        }

        return updatedNote;
      } catch (err) {
        console.error("Failed to restore note:", err);

        if (isCurrentOperation(id, token)) {
          commitNotes(
            notesRef.current.map((note) =>
              String(note.id) === key ? previousNote : note
            )
          );
        }

        throw err;
      }
    },
    [beginOperation, commitNotes, isCurrentOperation]
  );

  /* =======================================================
     DELETE NOTE
  ======================================================= */

  const deleteNote = useCallback(
    async (id) => {
      const key = String(id);
      const token = beginOperation(id);
      const current = notesRef.current;
      const index = current.findIndex(
        (note) => String(note.id) === key
      );

      if (index === -1) return null;

      const previousNote = current[index];

      // Remove immediately from the UI.
      commitNotes(
        current.filter((note) => String(note.id) !== key)
      );

      try {
        await api.delete(`/notes/${id}`);
        return true;
      } catch (err) {
        console.error("Failed to delete note:", err);

        if (isCurrentOperation(id, token)) {
          const next = [...notesRef.current];
          next.splice(Math.min(index, next.length), 0, previousNote);
          commitNotes(next);
        }

        throw err;
      }
    },
    [beginOperation, commitNotes, isCurrentOperation]
  );

  /* =======================================================
     COMPATIBLE SET NOTES
  ======================================================= */

  const setNotesCompatible =
    useCallback(
      (value) => {
        setNotes((current) => {
          const next =
            typeof value === "function"
              ? value(current)
              : value;

          const normalized = Array.isArray(next)
            ? next.map(normalizeNote)
            : current;

          notesRef.current = normalized;
          return normalized;
        });
      },
      []
    );

  /* =======================================================
     DERIVED NOTES
  ======================================================= */

  const pinnedNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          note.pinned &&
          note.status === "active"
      ),
    [notes]
  );

  const activeNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          note.status === "active"
      ),
    [notes]
  );

  const archivedNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          note.status === "archived"
      ),
    [notes]
  );

  const trashNotes = useMemo(
    () =>
      notes.filter(
        (note) =>
          note.status === "trash"
      ),
    [notes]
  );

  /* =======================================================
     CONTEXT VALUE
  ======================================================= */

  const value = useMemo(
    () => ({
      notes,

      setNotes:
        setNotesCompatible,

      loading,

      error,

      fetchNotes,

      createNote,

      updateNote,

      togglePin,

      toggleArchive,

      toggleTrash,

      restoreNote,

      deleteNote,

      pinnedNotes,

      activeNotes,

      archivedNotes,

      trashNotes,
    }),
    [
      notes,
      setNotesCompatible,
      loading,
      error,
      fetchNotes,
      createNote,
      updateNote,
      togglePin,
      toggleArchive,
      toggleTrash,
      restoreNote,
      deleteNote,
      pinnedNotes,
      activeNotes,
      archivedNotes,
      trashNotes,
    ]
  );

  return (
    <NotesContext.Provider
      value={value}
    >
      {children}
    </NotesContext.Provider>
  );
}

/* =========================================================
   HOOK
========================================================= */

export function useNotes() {
  const context =
    useContext(NotesContext);

  if (!context) {
    throw new Error(
      "useNotes must be used inside NotesProvider."
    );
  }

  return context;
}

export default NotesContext;