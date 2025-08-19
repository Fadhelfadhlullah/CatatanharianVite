import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

import { Select } from "./components/ui/select";
import { Moon, Sun, Download, Upload, Trash2, Plus, Pin, PinOff, Edit3, Save, X, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette, Eye, EyeOff, List, ListOrdered } from "lucide-react";
// import SimpleTextEditor from "./components/TextEditor/SimpleTextEditor";
// import SettingsPanel from "./components/Settings/SettingsPanel";

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const DEFAULT_CATEGORIES = ["Umum", "Kuliah", "Kerja", "Pribadi"];

// Function to render markdown to HTML for visual display
const renderMarkdown = (text) => {
  if (!text) return '';

  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>') // Italic (not bold)
    .replace(/__(.*?)__/g, '<u>$1</u>') // Underline
    .replace(/\n/g, '<br>'); // Line breaks first

  // Handle bullet lists
  html = html.replace(/^• (.+)$/gm, '<li class="bullet-item">$1</li>');
  html = html.replace(/(<li class="bullet-item">.*?<\/li>)/g, '<ul style="list-style-type: disc; margin-left: 1.5rem; padding-left: 0.5rem;">$1</ul>');

  // Handle numbered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="number-item">$1</li>');
  html = html.replace(/(<li class="number-item">.*?<\/li>)/g, '<ol style="list-style-type: decimal; margin-left: 1.5rem; padding-left: 0.5rem;">$1</ol>');

  return html;
};

export default function App() {
  // ======= STATE =======
  const [notes, setNotes] = useState(() => {
    const raw = localStorage.getItem("catatan");
    return raw ? JSON.parse(raw) : [];
  });
  const [text, setText] = useState("");
  const [richContent, setRichContent] = useState("");

  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  // ======= FORCE LTR DIRECTION =======
  useEffect(() => {
    // Simple force LTR
    document.documentElement.dir = 'ltr';
    document.body.dir = 'ltr';

    const editor = document.querySelector('#rich-editor');
    if (editor) {
      editor.dir = 'ltr';
      editor.style.direction = 'ltr';
      editor.style.textAlign = 'left';
    }
  }, [richContent]);

  const isDark = theme === "dark";

  // ======= TEXT FORMATTING FUNCTIONS =======
  const applyFormatting = (command) => {
    const editor = document.querySelector('#rich-editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const beforeText = editor.value.substring(0, start);
    const afterText = editor.value.substring(end);

    let newText = '';
    let newCursorPos = start;

    switch (command) {
      case 'bold':
        if (selectedText) {
          // Check if already bold
          if (selectedText.startsWith('**') && selectedText.endsWith('**')) {
            newText = beforeText + selectedText.slice(2, -2) + afterText;
            newCursorPos = start + selectedText.length - 4;
          } else {
            newText = beforeText + `**${selectedText}**` + afterText;
            newCursorPos = start + selectedText.length + 4;
          }
        } else {
          newText = beforeText + '****' + afterText;
          newCursorPos = start + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          // Check if already italic
          if (selectedText.startsWith('*') && selectedText.endsWith('*') && !selectedText.startsWith('**')) {
            newText = beforeText + selectedText.slice(1, -1) + afterText;
            newCursorPos = start + selectedText.length - 2;
          } else {
            newText = beforeText + `*${selectedText}*` + afterText;
            newCursorPos = start + selectedText.length + 2;
          }
        } else {
          newText = beforeText + '**' + afterText;
          newCursorPos = start + 1;
        }
        break;
      case 'underline':
        if (selectedText) {
          // Check if already underlined
          if (selectedText.startsWith('__') && selectedText.endsWith('__')) {
            newText = beforeText + selectedText.slice(2, -2) + afterText;
            newCursorPos = start + selectedText.length - 4;
          } else {
            newText = beforeText + `__${selectedText}__` + afterText;
            newCursorPos = start + selectedText.length + 4;
          }
        } else {
          newText = beforeText + '____' + afterText;
          newCursorPos = start + 2;
        }
        break;
      case 'insertUnorderedList': {
        const lines = selectedText ? selectedText.split('\n') : [''];
        const bulletLines = lines.map(line => line.startsWith('• ') ? line : `• ${line}`).join('\n');
        newText = beforeText + bulletLines + afterText;
        newCursorPos = start + bulletLines.length;
        break;
      }
      case 'insertOrderedList': {
        const numberedLines = selectedText ? selectedText.split('\n') : [''];
        const orderedLines = numberedLines.map((line, index) =>
          line.match(/^\d+\. /) ? line : `${index + 1}. ${line}`
        ).join('\n');
        newText = beforeText + orderedLines + afterText;
        newCursorPos = start + orderedLines.length;
        break;
      }
      case 'justifyLeft':
        setTextAlign('left');
        return;
      case 'justifyCenter':
        setTextAlign('center');
        return;
      case 'justifyRight':
        setTextAlign('right');
        return;
      default:
        return;
    }

    setRichContent(newText);

    // Restore cursor position
    setTimeout(() => {
      editor.focus();
      editor.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Function to detect current formatting at cursor position
  const updateFormattingState = () => {
    const editor = document.querySelector('#rich-editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);

    // Check if selection contains formatting
    setIsBold(selectedText.includes('**') || selectedText.startsWith('**'));
    setIsItalic(selectedText.includes('*') && !selectedText.includes('**'));
    setIsUnderline(selectedText.includes('__'));
  };



  const insertText = (text) => {
    const textarea = document.querySelector('#rich-editor');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    setRichContent(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const handleKeyDown = (e) => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          applyFormatting('bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting('italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting('underline');
          break;
        case 's':
          e.preventDefault();
          if (text.trim() || richContent.trim()) {
            addNote();
          }
          break;
      }
    }
  };

  // ======= ACTIONS =======
  const addNote = useCallback(() => {
    const t = text.trim();
    const richText = richContent.trim();
    const cat =
      (customCategory.trim() || category || DEFAULT_CATEGORIES[0]).trim();

    if (!t && !richText) return;
    const newNote = {
      id: uid(),
      text: t,
      richContent: richText,
      category: cat,
      createdAt: new Date().toISOString(),
      done: false,
      pinned: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setText("");
    setRichContent("");
    setCustomCategory("");
  }, [text, richContent, customCategory, category]);

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

  const updateNote = (id, newText, newRichContent) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, text: newText, richContent: newRichContent } : n))
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
            text: n.text || "",
            richContent: n.richContent || "",
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
        (n.text && n.text.toLowerCase().includes(q)) ||
        (n.richContent && n.richContent.toLowerCase().includes(q)) ||
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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 transition-all duration-500 ${isDark ? "dark from-gray-900 to-gray-800 text-gray-100" : ""}`}>
      <div className="container mx-auto max-w-full px-6 py-4 space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
          <div className="group">
            <h1 className="text-5xl font-bold flex items-center gap-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-500 bg-clip-text text-transparent hover:from-purple-600 hover:via-blue-600 hover:to-purple-500 transition-all duration-500 cursor-default">
              📓 Catatan Harian
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1">
                📊 <span className="font-medium text-blue-600 dark:text-blue-400">{notes.length}</span> catatan
              </span>
              <span className="text-gray-400">•</span>
              <span className="flex items-center gap-1">
                👁️ <span className="font-medium text-green-600 dark:text-green-400">{filteredSorted.length}</span> ditampilkan
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="gap-2 hover:bg-gradient-to-r hover:from-yellow-100 hover:to-blue-100 dark:hover:from-yellow-900 dark:hover:to-blue-900 transition-all duration-300 transform hover:scale-105"
            >
              {isDark ? <Sun className="h-4 w-4 animate-pulse" /> : <Moon className="h-4 w-4" />}
              {isDark ? "Terang" : "Gelap"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportJSON}
              className="gap-2 hover:bg-gradient-to-r hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900 dark:hover:to-emerald-900 hover:text-green-700 dark:hover:text-green-300 transition-all duration-300 transform hover:scale-105"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 relative overflow-hidden hover:bg-gradient-to-r hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-900 dark:hover:to-cyan-900 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300 transform hover:scale-105"
            >
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept="application/json"
                onChange={(e) => importJSON(e.target.files?.[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </Button>
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button> */}
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAll}
              className="gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Semua
            </Button>
          </div>
        </header>

        <Card className="backdrop-blur-sm bg-white/95 border-gray-200/50 shadow-lg dark:bg-gray-800/95 dark:border-gray-700/50">
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Judul catatan (opsional)..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 h-11"
                />

                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={!!customCategory.trim()}
                  className="w-full sm:w-auto"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>

                <Input
                  placeholder="atau kategori kustom…"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full sm:w-auto"
                />

                <Button
                  onClick={addNote}
                  className="gap-2 whitespace-nowrap bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  title="Tambah catatan (Ctrl+S)"
                >
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </div>

              <div className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.01]">
                {/* Interactive Toolbar */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex flex-wrap gap-2 bg-gray-50 dark:bg-gray-800">
                  <Button
                    variant={isBold ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => applyFormatting('bold')}
                    title="Bold (Ctrl+B)"
                    className={`h-10 w-10 transition-all duration-200 ${isBold ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <Bold className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={isItalic ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => applyFormatting('italic')}
                    title="Italic (Ctrl+I)"
                    className={`h-10 w-10 transition-all duration-200 ${isItalic ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <Italic className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={isUnderline ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => applyFormatting('underline')}
                    title="Underline (Ctrl+U)"
                    className={`h-10 w-10 transition-all duration-200 ${isUnderline ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <Underline className="h-5 w-5" />
                  </Button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                  <Button
                    variant={textAlign === 'left' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => applyFormatting('justifyLeft')}
                    title="Align Left"
                    className={`h-10 w-10 transition-all duration-200 ${textAlign === 'left' ? 'bg-green-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <AlignLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={textAlign === 'center' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => applyFormatting('justifyCenter')}
                    title="Align Center"
                    className={`h-10 w-10 transition-all duration-200 ${textAlign === 'center' ? 'bg-green-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <AlignCenter className="h-5 w-5" />
                  </Button>
                  <Button
                    variant={textAlign === 'right' ? 'default' : 'ghost'}
                    size="default"
                    onClick={() => applyFormatting('justifyRight')}
                    title="Align Right"
                    className={`h-10 w-10 transition-all duration-200 ${textAlign === 'right' ? 'bg-green-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    <AlignRight className="h-5 w-5" />
                  </Button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <select
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200 hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    >
                      <option value={10}>10px</option>
                      <option value={12}>12px</option>
                      <option value={14}>14px</option>
                      <option value={16}>16px</option>
                      <option value={18}>18px</option>
                      <option value={20}>20px</option>
                      <option value={24}>24px</option>
                      <option value={28}>28px</option>
                    </select>
                  </div>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      title="Text Color"
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                    >
                      <Palette className="h-4 w-4" style={{ color: textColor }} />
                    </Button>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 z-50 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg animate-in fade-in-0 slide-in-from-top-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'].map((color) => (
                            <button
                              key={color}
                              className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform duration-200"
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                setTextColor(color);
                                setShowColorPicker(false);
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                  {/* List Buttons */}
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => applyFormatting('insertUnorderedList')}
                    title="Bullet List"
                    className="h-10 w-10 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <List className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => applyFormatting('insertOrderedList')}
                    title="Numbered List"
                    className="h-10 w-10 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    <ListOrdered className="h-5 w-5" />
                  </Button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                  {/* Preview Toggle */}
                  <Button
                    variant={showPreview ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    title="Toggle Preview"
                    className={`transition-all duration-200 ${showPreview ? 'bg-purple-500 text-white shadow-md' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

                  {/* Quick Insert Buttons */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('📅 ' + new Date().toLocaleDateString('id-ID'))}
                    title="Insert Date"
                    className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    📅
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => insertText('⏰ ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))}
                    title="Insert Time"
                    className="text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    ⏰
                  </Button>
                </div>

                {showPreview ? (
                  <div
                    className="w-full min-h-[400px] p-6 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                    style={{
                      direction: 'ltr',
                      textAlign: textAlign || 'left',
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      lineHeight: '1.8'
                    }}
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(richContent) || '<span style="color: #9ca3af;">Preview akan muncul di sini...</span>'
                    }}
                  />
                ) : (
                  <textarea
                    id="rich-editor"
                    dir="ltr"
                    className="w-full min-h-[400px] p-6 bg-transparent text-gray-900 dark:text-gray-100 focus:outline-none transition-all duration-200 resize-none"
                    style={{
                      direction: 'ltr',
                      textAlign: textAlign || 'left',
                      fontSize: `${fontSize}px`,
                      color: textColor,
                      lineHeight: '1.8',
                      unicodeBidi: 'normal'
                    }}
                    placeholder="Tulis catatan dengan text editor yang interaktif..."
                    value={richContent}
                    onChange={(e) => {
                      setRichContent(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    onMouseUp={updateFormattingState}
                    onKeyUp={updateFormattingState}
                  />
                )}

                {/* Enhanced Status Bar */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-xs text-gray-600 dark:text-gray-400 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      📝 <span className="font-medium">{richContent.length}</span> karakter
                    </span>
                    <span className="flex items-center gap-1">
                      📊 <span className="font-medium">{richContent.trim() ? richContent.trim().split(/\s+/).length : 0}</span> kata
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      {fontSize}px
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600"
                      style={{ backgroundColor: textColor }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Interactive Tips */}
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-3 rounded-lg">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="flex items-center gap-1">
                    💡 <strong>Tips:</strong>
                  </span>
                  <span className="flex items-center gap-1 hover:bg-white dark:hover:bg-gray-600 px-2 py-1 rounded transition-all duration-200">
                    <kbd className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded text-xs font-mono shadow-sm">Ctrl+S</kbd>
                    untuk simpan
                  </span>
                  <span className="flex items-center gap-1 hover:bg-white dark:hover:bg-gray-600 px-2 py-1 rounded transition-all duration-200">
                    <kbd className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded text-xs font-mono shadow-sm">Ctrl+B/I/U</kbd>
                    untuk format
                  </span>
                  <span className="flex items-center gap-1 hover:bg-white dark:hover:bg-gray-600 px-2 py-1 rounded transition-all duration-200">
                    📅⏰ untuk tanggal/waktu
                  </span>
                </div>
                <div className="mt-2 text-xs opacity-75">
                  Pilih text lalu klik tombol formatting, atau gunakan keyboard shortcuts untuk editing yang lebih cepat!
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Cari catatan atau kategori…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1"
              />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="pinned">Pinned dulu</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-8">
          {filteredSorted.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl opacity-50">📝</div>
                <p className="text-gray-600 dark:text-gray-400 text-lg">Belum ada catatan yang cocok.</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">Mulai menulis catatan pertama Anda!</p>
              </div>
            </div>
          ) : (
            filteredSorted.map((n, index) => (
              <div
                key={n.id}
                className="animate-in fade-in-0 slide-in-from-bottom-4 transform transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <NoteCard
                  note={n}
                  onToggleDone={() => toggleDone(n.id)}
                  onTogglePin={() => togglePin(n.id)}
                  onRemove={() => removeNote(n.id)}
                  onUpdate={(newText, newRichContent) => updateNote(n.id, newText, newRichContent)}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {/* <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      /> */}
    </div>
  );
}

// ========== NOTE CARD COMPONENT ==========
function NoteCard({ note, onToggleDone, onTogglePin, onRemove, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.text || "");
  const [richDraft, setRichDraft] = useState(note.richContent || "");

  const saveEdit = () => {
    if (draft.trim() || richDraft.trim()) {
      onUpdate(draft.trim(), richDraft.trim());
      setIsEditing(false);
    }
  };

  const cancelEdit = () => {
    setDraft(note.text || "");
    setRichDraft(note.richContent || "");
    setIsEditing(false);
  };

  const dateStr = new Date(note.createdAt).toLocaleString();

  return (
    <Card className={`group transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm bg-white/95 border-gray-200/50 dark:bg-gray-800/95 dark:border-gray-700/50 cursor-pointer rounded-xl ${note.pinned ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 shadow-lg" : ""} ${note.done ? "opacity-75 grayscale" : ""}`}>
      <CardHeader className="pb-4 p-6">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="text-xs font-medium px-3 py-1 bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700">
            {note.category}
          </Badge>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePin}
              className="h-8 w-8"
              title={note.pinned ? "Lepas pin" : "Pin catatan"}
            >
              {note.pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
            </Button>
            {!isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
                title="Edit"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              title="Hapus"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 px-6">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              placeholder="Judul catatan..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="text-sm"
            />
            <textarea
              className="w-full min-h-[150px] p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Edit konten catatan..."
              value={richDraft}
              onChange={(e) => setRichDraft(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={saveEdit} size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Simpan
              </Button>
              <Button onClick={cancelEdit} variant="outline" size="sm" className="gap-2">
                <X className="h-4 w-4" />
                Batal
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 -m-2 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={note.done}
                onChange={onToggleDone}
                className="mt-1 h-5 w-5 rounded border-2 border-blue-500 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all"
              />
              <div className="flex-1">
                {note.text && (
                  <div className={`text-sm font-medium mb-2 transition-all duration-200 ${note.done ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100 group-hover:text-gray-700 dark:group-hover:text-gray-200"}`}>
                    {note.text}
                  </div>
                )}
                {note.richContent && (
                  <div
                    className={`prose prose-sm max-w-none transition-all duration-200 ${note.done ? "opacity-60" : ""}`}
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(note.richContent) }}
                  />
                )}
              </div>
            </label>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 px-6 pb-4">
        <small className="text-gray-500 dark:text-gray-400 text-sm">{dateStr}</small>
      </CardFooter>
    </Card>
  );
}
