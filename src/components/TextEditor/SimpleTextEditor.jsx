import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { 
  Bold, 
  Italic, 
  Underline,
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Type,
  Palette,
  Settings
} from 'lucide-react';

const SimpleTextEditor = ({ value, onChange, placeholder = "Tulis catatan..." }) => {
  const textareaRef = useRef(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [fontSize, setFontSize] = useState(14);
  const [textColor, setTextColor] = useState('#000000');
  const [showColorPicker, setShowColorPicker] = useState(false);

  const applyFormatting = (command, value = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (selectedText) {
      let formattedText = selectedText;
      
      switch (command) {
        case 'bold':
          formattedText = isBold ? selectedText.replace(/\*\*(.*?)\*\*/g, '$1') : `**${selectedText}**`;
          setIsBold(!isBold);
          break;
        case 'italic':
          formattedText = isItalic ? selectedText.replace(/\*(.*?)\*/g, '$1') : `*${selectedText}*`;
          setIsItalic(!isItalic);
          break;
        case 'underline':
          formattedText = isUnderline ? selectedText.replace(/__(.*?)__/g, '$1') : `__${selectedText}__`;
          setIsUnderline(!isUnderline);
          break;
      }

      const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
      onChange(newValue);
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
      }, 0);
    }
  };

  const insertText = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = textarea.value.substring(0, start) + text + textarea.value.substring(end);
    onChange(newValue);
    
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
      }
    }
  };

  const textareaStyle = {
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderline ? 'underline' : 'none',
    textAlign: textAlign,
    fontSize: `${fontSize}px`,
    color: textColor,
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-800">
        {/* Text Formatting */}
        <Button
          variant={isBold ? 'default' : 'ghost'}
          size="sm"
          onClick={() => applyFormatting('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant={isItalic ? 'default' : 'ghost'}
          size="sm"
          onClick={() => applyFormatting('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant={isUnderline ? 'default' : 'ghost'}
          size="sm"
          onClick={() => applyFormatting('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Text Alignment */}
        <Button
          variant={textAlign === 'left' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTextAlign('left')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant={textAlign === 'center' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTextAlign('center')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant={textAlign === 'right' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTextAlign('right')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Font Size */}
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          <select
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
            <option value={28}>28px</option>
            <option value={32}>32px</option>
          </select>
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        {/* Color Picker */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <Palette className="h-4 w-4" />
          </Button>
          {showColorPicker && (
            <div className="absolute top-full left-0 z-50 mt-1 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
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
                    className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform"
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

        {/* Quick Insert Buttons */}
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertText('📅 ' + new Date().toLocaleDateString('id-ID'))}
          title="Insert Date"
          className="text-xs"
        >
          📅
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertText('⏰ ' + new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))}
          title="Insert Time"
          className="text-xs"
        >
          ⏰
        </Button>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className="w-full min-h-[200px] p-4 bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none resize-none"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        style={textareaStyle}
      />
      
      {/* Status Bar */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400 flex justify-between">
        <span>Karakter: {value.length}</span>
        <span>Kata: {value.trim() ? value.trim().split(/\s+/).length : 0}</span>
      </div>
    </div>
  );
};

export default SimpleTextEditor;
