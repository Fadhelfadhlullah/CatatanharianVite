import { useEffect, useMemo, useState } from "react";
import "./App.css";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const DEFAULT_CATEGORIES = ["Umum", "Kuliah", "Kerja", "Pribadi"];

export default function App() {
  // ======= STATE =======
  const [notes, setNotes] = useState(() => {
    const raw = localStorage.getItem("catatan");
    return raw ? JSON.parse(raw) : [];
  });
  const [text, setText] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest"); 
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved || "light";
  });

  // ======= EFFECTS =======
  useEffect(() => {
    localStorage.setItem("catatan", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ======= ACTIONS =======
  const addNote = () => {
    const t = text.trim();
    const cat =
      (customCategory.trim() || category || DEFAULT_CATEGORIES[0]).trim();

    if (!t) return;
    const newNote = {
      id: uid(),
      text: t,
      category: cat,
      createdAt: new Date().toISOString(),
      done: false,
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setText("");
    setCustomCategory("");
  };

  const toggleDone = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, done: !n.done } : n))
    );
  };

  const togglePin = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const removeNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNote = (id, newText) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: newText } : n))
    );
  };

  const clearAll = () => {
    if (confirm("Hapus semua catatan?")) setNotes([]);
  };

  // ======= EXPORT / IMPORT =======
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(notes, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const date = new Date().toISOString().slice(0, 10);
    a.download = `catatan-harian-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("Format tidak valid");
        const sanitized = data
          .filter(
            (n) =>
              n &&
              typeof n.id === "string" &&
              typeof n.text === "string" &&
              typeof n.category === "string"
          )
          .map((n) => ({
            id: n.id || uid(),
            text: n.text,
            category: n.category || DEFAULT_CATEGORIES[0],
            createdAt: n.createdAt || new Date().toISOString(),
            done: !!n.done,
            pinned: !!n.pinned,
          }));
        setNotes(sanitized);
        alert("Import berhasil!");
      } catch (e) {
        alert("Gagal import: " + e.message);
      }
    };
    reader.readAsText(file);
  };

  // ======= DERIVED LIST =======
  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = notes.filter(
      (n) =>
        n.text.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
    );

    const byNewest = (a, b) =>
      new Date(b.createdAt) - new Date(a.createdAt);
    const byOldest = (a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt);
    const byAZ = (a, b) => a.text.localeCompare(b.text, "id");
    const byZA = (a, b) => b.text.localeCompare(a.text, "id");
    const byPinnedFirst = (a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return byNewest(a, b);
    };

    switch (sortBy) {
      case "oldest":
        list.sort(byOldest);
        break;
      case "az":
        list.sort(byAZ);
        break;
      case "za":
        list.sort(byZA);
        break;
      case "pinned":
        list.sort(byPinnedFirst);
        break;
      case "newest":
      default:
        list.sort(byNewest);
    }

    return list;
  }, [notes, search, sortBy]);

  // ======= UI =======
  const isDark = theme === "dark";

  return (
    <div className={`app ${isDark ? "dark" : "light"}`}>
      <header className="bar">
        <h1>📓 Catatan Harian</h1>
        <div className="tools">
          <button
            className="btn"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title="Toggle tema"
          >
            {isDark ? "☀️ Terang" : "🌙 Gelap"}
          </button>
          <button className="btn" onClick={exportJSON} title="Export JSON">
            ⬇️ Export
          </button>
          <label className="btn file-btn" title="Import JSON">
            ⬆️ Import
            <input
              type="file"
              accept="application/json"
              onChange={(e) => importJSON(e.target.files?.[0])}
              hidden
            />
          </label>
          <button className="btn danger" onClick={clearAll}>
            🗑️ Hapus Semua
          </button>
        </div>
      </header>

      <section className="editor card">
        <div className="row">
          <input
            className="input"
            placeholder="Tulis catatan..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addNote()}
          />

          <select
            className="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={!!customCategory.trim()}
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="atau kategori kustom…"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
          />

          <button className="btn primary" onClick={addNote}>
            ➕ Tambah
          </button>
        </div>

        <div className="row">
          <input
            className="input grow"
            placeholder="Cari catatan atau kategori…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
            <option value="pinned">Pinned dulu</option>
          </select>
        </div>
      </section>

      <section className="grid">
        {filteredSorted.length === 0 ? (
          <p className="muted">Belum ada catatan yang cocok.</p>
        ) : (
          filteredSorted.map((n) => (
            <NoteCard
              key={n.id}
              note={n}
              onToggleDone={() => toggleDone(n.id)}
              onTogglePin={() => togglePin(n.id)}
              onRemove={() => removeNote(n.id)}
              onUpdate={(newText) => updateNote(n.id, newText)}
            />
          ))
        )}
      </section>
    </div>
  );
}

// ========== NOTE CARD COMPONENT ==========
function NoteCard({ note, onToggleDone, onTogglePin, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);

  const saveEdit = () => {
    if (draft.trim()) {
      onUpdate(draft.trim());
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setDraft(note.text);
    setIsEditing(false);
  };

  const dateStr = new Date(note.createdAt).toLocaleString();

  return (
    <article className={`card note ${note.pinned ? "pinned" : ""}`}>
      <div className="note-header">
        <span className="badge">{note.category}</span>
        <div className="actions">
          <button
            className="icon-btn"
            onClick={onTogglePin}
            title={note.pinned ? "Lepas pin" : "Pin catatan"}
          >
            {note.pinned ? "📌" : "📍"}
          </button>
          {isEditing ? null : (
            <button
              className="icon-btn"
              onClick={() => setIsEditing(true)}
              title="Edit"
            >
              ✏️
            </button>
          )}
          <button className="icon-btn danger" onClick={onRemove} title="Hapus">
            🗑️
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="edit-box">
          <textarea
            className="input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="row">
            <button className="btn primary" onClick={saveEdit}>
              💾 Simpan
            </button>
            <button className="btn" onClick={cancelEdit}>
              ❌ Batal
            </button>
          </div>
        </div>
      ) : (
        <label className="todo">
          <input type="checkbox" checked={note.done} onChange={onToggleDone} />
          <span className={`text ${note.done ? "done" : ""}`}>{note.text}</span>
        </label>
      )}

      <div className="note-footer">
        <small className="muted">{dateStr}</small>
      </div>
    </article>
  );
}
