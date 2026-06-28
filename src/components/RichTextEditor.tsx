"use client";

import React, { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";

// Inline SVG Icons for premium aesthetics
const Icons = {
  Bold: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4v0a4 4 0 01-4 4H6z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4v0a4 4 0 01-4 4H6V12z" />
    </svg>
  ),
  Italic: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="19" y1="4" x2="10" y2="4" strokeLinecap="round" />
      <line x1="14" y1="20" x2="5" y2="20" strokeLinecap="round" />
      <line x1="15" y1="4" x2="9" y2="20" strokeLinecap="round" />
    </svg>
  ),
  Underline: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M6 3v7a6 6 0 0012 0V3" />
      <line x1="4" y1="21" x2="20" y2="21" strokeLinecap="round" />
    </svg>
  ),
  Strike: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M5 12h14" />
      <path d="M17.5 9.5a5.5 5.5 0 00-11-2c0 2 1.5 3 3.5 3.5m4 2c2.5.5 4 1.5 4 3.5a5.5 5.5 0 01-11-1.5" strokeLinecap="round" />
    </svg>
  ),
  Link: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  UnorderedList: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="9" y1="6" x2="20" y2="6" strokeLinecap="round" />
      <line x1="9" y1="12" x2="20" y2="12" strokeLinecap="round" />
      <line x1="9" y1="18" x2="20" y2="18" strokeLinecap="round" />
      <circle cx="4" cy="6" r="1.5" fill="currentColor" />
      <circle cx="4" cy="12" r="1.5" fill="currentColor" />
      <circle cx="4" cy="18" r="1.5" fill="currentColor" />
    </svg>
  ),
  OrderedList: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="10" y1="6" x2="20" y2="6" strokeLinecap="round" />
      <line x1="10" y1="12" x2="20" y2="12" strokeLinecap="round" />
      <line x1="10" y1="18" x2="20" y2="18" strokeLinecap="round" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h1v4M3 8h3M4 14a1 1 0 011-1h1a1 1 0 011 1v1a1 1 0 01-1 1H4v2h3" />
    </svg>
  ),
  AlignLeft: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="3" y1="12" x2="15" y2="12" strokeLinecap="round" />
      <line x1="3" y1="18" x2="18" y2="18" strokeLinecap="round" />
    </svg>
  ),
  AlignCenter: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="6" y1="12" x2="18" y2="12" strokeLinecap="round" />
      <line x1="4" y1="18" x2="20" y2="18" strokeLinecap="round" />
    </svg>
  ),
  AlignRight: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="9" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="6" y1="18" x2="21" y2="18" strokeLinecap="round" />
    </svg>
  ),
  AlignJustify: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
    </svg>
  ),
  Blockquote: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" d="M10 11H6a2 2 0 01-2-2V7a2 2 0 012-2h4v6zm0 0v6a3 3 0 01-3 3H6.5m11.5-9h-4a2 2 0 01-2-2V7a2 2 0 012-2h4v6zm0 0v6a3 3 0 01-3 3h-.5" />
    </svg>
  ),
  HorizontalRule: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <line x1="4" y1="12" x2="20" y2="12" strokeLinecap="round" />
    </svg>
  ),
  Image: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3}>
      <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ColorText: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M4 20l4-12h8l4 12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 14h12" strokeLinecap="round" />
      <rect x="3" y="19" width="18" height="2" rx="0.5" fill="currentColor" />
    </svg>
  ),
  Undo: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  Redo: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
    </svg>
  ),
  Trash: () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Search: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" />
    </svg>
  ),
  Globe: () => (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" strokeLinecap="round" />
      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" />
    </svg>
  )
};

// Available highlighting colors matching brand and design
const BRAND_COLORS = [
  { name: "Charcoal", hex: "#1d1d1f" },
  { name: "News Red", hex: "#d6001c" },
  { name: "Apple Blue", hex: "#003366" },
  { name: "Gold", hex: "#d97706" },
  { name: "Emerald", hex: "#059669" },
  { name: "Purple", hex: "#7c3aed" }
];

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: "image" | "video" | "pdf";
  size: string;
  date: string;
  width?: number;
  height?: number;
}

interface RichTextEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label: string;
  mediaLibrary: MediaItem[];
  onUploadImage: (file: File) => Promise<any>;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your article story content here...",
  label,
  mediaLibrary,
  onUploadImage
}: RichTextEditorProps) {
  const [editorMode, setEditorMode] = useState<"visual" | "text">("visual");
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Media Modal state
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaModalTab, setMediaModalTab] = useState<"library" | "upload">("library");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);

  // Inserted Image parameters
  const [imgCaption, setImgCaption] = useState("");
  const [imgAlign, setImgAlign] = useState<"center" | "left" | "right" | "full">("center");

  // Word and character counters
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editorRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const linkPromptRef = useRef<HTMLDivElement>(null);

  // Local typing buffer state to eliminate heavy rendering of parent AdminPage
  const [localValue, setLocalValue] = useState(value || "");
  const localValueRef = useRef(value || "");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep local value ref in sync with state
  useEffect(() => {
    localValueRef.current = localValue;
  }, [localValue]);

  // Sync value from props to editor HTML if it changes externally (like clicking Edit)
  useEffect(() => {
    if (editorMode === "visual" && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = DOMPurify.sanitize(value || "");
    }
    setLocalValue(value || "");
    updateCounts(value || "");
  }, [value, editorMode]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Handle closing popups when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
        setShowColorMenu(false);
      }
      if (linkPromptRef.current && !linkPromptRef.current.contains(event.target as Node)) {
        // Don't close if they clicked the main link trigger button itself
        const target = event.target as HTMLElement;
        if (!target.closest("[data-link-trigger]")) {
          setShowLinkPrompt(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateCounts = (html: string) => {
    // Strip HTML to count words correctly
    const text = html.replace(/<[^>]*>/g, " ");
    const cleanText = text.trim();
    const words = cleanText ? cleanText.split(/\s+/).filter(Boolean) : [];
    setWordCount(words.length);
    setCharCount(cleanText.length);
  };

  const handleVisualChange = (forceImmediateSync = false) => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setLocalValue(html);
      updateCounts(html);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      if (forceImmediateSync) {
        onChange(html);
      } else {
        debounceTimeoutRef.current = setTimeout(() => {
          onChange(html);
        }, 800);
      }
    }
  };

  const handleTextChange = (val: string) => {
    setLocalValue(val);
    updateCounts(val);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      onChange(val);
    }, 800);
  };

  const flushChanges = () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    onChange(localValueRef.current);
  };

  // Helper to save selection range
  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      setSavedRange(selection.getRangeAt(0));
    }
  };

  // Helper to restore selection range
  const restoreSelection = (rangeToRestore = savedRange) => {
    if (rangeToRestore) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(rangeToRestore);
      }
    }
  };

  // Run visual editor command
  const executeCommand = (command: string, arg: string = "") => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();
      document.execCommand(command, false, arg);
      handleVisualChange(true);
    }
  };

  // Format custom block elements
  const formatBlock = (tag: string) => {
    executeCommand("formatBlock", `<${tag}>`);
  };

  // Toggle link insertion
  const triggerLinkPrompt = () => {
    const selection = window.getSelection();
    let text = "";
    if (selection) {
      text = selection.toString();
    }
    
    // Save current range before opening dialog
    saveSelection();
    setLinkText(text);
    setLinkUrl("");
    setShowLinkPrompt(!showLinkPrompt);
  };

  // Insert a custom Hyperlink
  const insertLink = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!linkUrl.trim()) return;

    if (editorRef.current && savedRange) {
      editorRef.current.focus();
      restoreSelection();
      
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // If no text was selected, use URL as text
        const textToInsert = linkText.trim() || linkUrl.trim();
        
        range.deleteContents();
        const a = document.createElement("a");
        a.href = linkUrl;
        a.textContent = textToInsert;
        a.target = "_blank";
        a.className = "text-[var(--apple-blue)] font-bold underline hover:text-[var(--apple-blue-hover)] transition-colors";
        
        range.insertNode(a);
        
        // Collapse range to end of link
        range.setStartAfter(a);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        
        handleVisualChange(true);
      }
    }

    setShowLinkPrompt(false);
    setLinkUrl("");
    setLinkText("");
    setSavedRange(null);
  };

  // Apply custom highlight/text color
  const selectTextColor = (hexColor: string) => {
    executeCommand("foreColor", hexColor);
    setShowColorMenu(false);
  };

  // Selection change tracking to save range dynamically
  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && editorRef.current) {
      const range = selection.getRangeAt(0);
      // Ensure selection is inside the editor
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        setSavedRange(range);
      }
    }
  };

  // Trigger add media modal
  const openMediaModal = () => {
    saveSelection();
    setShowMediaModal(true);
    setSelectedMediaItem(null);
    setImgCaption("");
    setImgAlign("center");
  };

  // Handle direct file upload in modal
  const handleModalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploaded = await onUploadImage(file);
      setSelectedMediaItem(uploaded);
      setMediaModalTab("library");
      setMediaSearchQuery("");
      alert(`"${file.name}" uploaded successfully directly to Neon DB!`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Neon DB link might be offline.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Insert HTML block dynamically at selection
  const insertHTMLAtCursor = (html: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      restoreSelection();

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();

        // Create container to parse HTML
        const container = document.createElement("div");
        container.innerHTML = DOMPurify.sanitize(html);
        
        const fragment = document.createDocumentFragment();
        let childNode;
        while ((childNode = container.firstChild)) {
          fragment.appendChild(childNode);
        }
        
        range.insertNode(fragment);
        handleVisualChange(true);
      } else {
        // Append if no range is active
        editorRef.current.innerHTML += DOMPurify.sanitize(html);
        handleVisualChange(true);
      }
    }
  };

  // Final insertion of selected media image
  const insertSelectedImage = () => {
    if (!selectedMediaItem) return;

    let alignClass = "mx-auto block text-center";
    let imgClass = "rounded-2xl max-w-full shadow-md border border-zinc-200 block mx-auto my-3";

    if (imgAlign === "left") {
      alignClass = "float-left mr-5 my-2 max-w-[50%]";
      imgClass = "rounded-xl w-full shadow-sm border border-zinc-200";
    } else if (imgAlign === "right") {
      alignClass = "float-right ml-5 my-2 max-w-[50%]";
      imgClass = "rounded-xl w-full shadow-sm border border-zinc-200";
    } else if (imgAlign === "full") {
      alignClass = "w-full my-4 text-center";
      imgClass = "rounded-3xl w-full shadow-lg border border-zinc-250 block mx-auto";
    }

    const figureHTML = `
      <figure class="${alignClass} clear-both">
        <img src="${selectedMediaItem.url}" alt="${selectedMediaItem.name}" class="${imgClass}" />
        ${imgCaption.trim() ? `<figcaption class="text-zinc-500 text-[10px] text-center font-bold mt-1.5 italic">${imgCaption.trim()}</figcaption>` : ""}
      </figure>
      <p><br></p>
    `;

    insertHTMLAtCursor(figureHTML);
    setShowMediaModal(false);
    setSelectedMediaItem(null);
  };

  // Media filter logic
  const filteredMedia = mediaLibrary.filter(item => 
    item.type === "image" && 
    (item.name.toLowerCase().includes(mediaSearchQuery.toLowerCase()) || 
     item.size.toLowerCase().includes(mediaSearchQuery.toLowerCase()))
  );

  return (
    <div className="w-full flex flex-col rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm transition-all focus-within:border-[var(--apple-blue)] focus-within:ring-1 focus-within:ring-[var(--apple-blue)]">
      
      {/* Editor Header: Title & Visual/Code View Selectors */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-150 bg-zinc-50/50 px-4 py-3 select-none">
        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">
          {label}
        </span>
        
        {/* Toggle tabs sliding buttons */}
        <div className="flex rounded-full border border-zinc-200 bg-white p-0.5 self-start sm:self-auto shadow-2xs">
          <button
            type="button"
            onClick={() => setEditorMode("visual")}
            className={`rounded-full px-4 py-1 text-4xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              editorMode === "visual"
                ? "bg-[var(--apple-blue)] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            Visual Edit
          </button>
          <button
            type="button"
            onClick={() => setEditorMode("text")}
            className={`rounded-full px-4 py-1 text-4xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              editorMode === "text"
                ? "bg-[var(--apple-blue)] text-white shadow-xs"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            HTML Source
          </button>
        </div>
      </div>

      {/* Visual Editor Toolbar Controls */}
      {editorMode === "visual" && (
        <div className="flex flex-wrap items-center gap-1 border-b border-zinc-150 bg-zinc-50/40 p-2.5 select-none divide-x divide-zinc-200">
          
          {/* Group 1: Typography Block dropdown */}
          <div className="flex items-center pr-1.5">
            <select
              onChange={(e) => formatBlock(e.target.value)}
              defaultValue="p"
              className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-4xs font-black text-zinc-700 focus:outline-none cursor-pointer hover:border-zinc-300 transition-colors uppercase tracking-wider"
            >
              <option value="p">Paragraph</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="pre">Preformatted</option>
            </select>
          </div>

          {/* Group 2: Inline Styles */}
          <div className="flex items-center gap-0.5 px-1.5">
            {[
              { cmd: "bold", icon: Icons.Bold, label: "Bold" },
              { cmd: "italic", icon: Icons.Italic, label: "Italic" },
              { cmd: "underline", icon: Icons.Underline, label: "Underline" },
              { cmd: "strikeThrough", icon: Icons.Strike, label: "Strikethrough" },
            ].map((btn) => (
              <button
                key={btn.cmd}
                type="button"
                onClick={() => executeCommand(btn.cmd)}
                title={btn.label}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer"
              >
                <btn.icon />
              </button>
            ))}

            {/* Custom highlighting colors picker */}
            <div className="relative" ref={colorMenuRef}>
              <button
                type="button"
                onClick={() => setShowColorMenu(!showColorMenu)}
                title="Highlight Text Color"
                className={`flex h-7 w-7 items-center justify-center rounded-lg border border-transparent hover:border-zinc-200 hover:bg-white transition-all cursor-pointer ${
                  showColorMenu ? "bg-white border-zinc-200 text-zinc-950" : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                <Icons.ColorText />
              </button>

              {showColorMenu && (
                <div className="absolute left-0 mt-1.5 z-10 grid grid-cols-3 gap-1 rounded-xl border border-zinc-150 bg-white p-2.5 shadow-md w-32 animate-in fade-in slide-in-from-top-1 duration-150">
                  {BRAND_COLORS.map((col) => (
                    <button
                      key={col.name}
                      type="button"
                      onClick={() => selectTextColor(col.hex)}
                      title={col.name}
                      style={{ backgroundColor: col.hex }}
                      className="h-6 w-6 rounded-lg border border-black/10 shadow-3xs cursor-pointer hover:scale-110 active:scale-95 transition-transform"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => selectTextColor("#1d1d1f")}
                    className="col-span-3 mt-1.5 py-0.5 rounded-lg border border-zinc-200 bg-zinc-50 text-[8px] font-black uppercase text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                  >
                    Clear Color
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Group 3: Text Alignments */}
          <div className="flex items-center gap-0.5 px-1.5">
            {[
              { cmd: "justifyLeft", icon: Icons.AlignLeft, label: "Align Left" },
              { cmd: "justifyCenter", icon: Icons.AlignCenter, label: "Align Center" },
              { cmd: "justifyRight", icon: Icons.AlignRight, label: "Align Right" },
              { cmd: "justifyFull", icon: Icons.AlignJustify, label: "Justify" },
            ].map((btn) => (
              <button
                key={btn.cmd}
                type="button"
                onClick={() => executeCommand(btn.cmd)}
                title={btn.label}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer"
              >
                <btn.icon />
              </button>
            ))}
          </div>

          {/* Group 4: Structurals Lists & Blocks */}
          <div className="flex items-center gap-0.5 px-1.5">
            {[
              { cmd: "insertUnorderedList", icon: Icons.UnorderedList, label: "Bulleted List" },
              { cmd: "insertOrderedList", icon: Icons.OrderedList, label: "Numbered List" },
              { cmd: "formatBlock", arg: "blockquote", icon: Icons.Blockquote, label: "Blockquote" },
              { cmd: "insertHorizontalRule", icon: Icons.HorizontalRule, label: "Horizontal Line" },
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                onClick={() => executeCommand(btn.cmd, btn.arg)}
                title={btn.label}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer"
              >
                <btn.icon />
              </button>
            ))}
          </div>

          {/* Group 5: Insert Links & Premium media */}
          <div className="flex items-center gap-1.5 px-1.5">
            {/* Hyperlink builder */}
            <div className="relative" ref={linkPromptRef}>
              <button
                type="button"
                data-link-trigger
                onClick={triggerLinkPrompt}
                title="Insert link"
                className={`flex h-7 px-2 items-center gap-1.5 rounded-lg border border-transparent transition-all cursor-pointer ${
                  showLinkPrompt ? "bg-white border-zinc-200 text-zinc-950 font-bold" : "text-zinc-600 hover:border-zinc-200 hover:bg-white hover:text-zinc-950"
                }`}
              >
                <Icons.Link />
                <span className="text-[9px] font-black uppercase tracking-wider">Link</span>
              </button>

              {showLinkPrompt && (
                <div
                  className="absolute left-0 mt-1.5 z-10 flex flex-col gap-2 rounded-xl border border-zinc-150 bg-white p-3.5 shadow-md w-56 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Construct Hyperlink</span>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        insertLink(e);
                      }
                    }}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                  />
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        insertLink(e);
                      }
                    }}
                    placeholder="Clickable Text (Optional)"
                    className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                  />
                  <div className="flex justify-end gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => setShowLinkPrompt(false)}
                      className="rounded-lg bg-zinc-100 hover:bg-zinc-200 text-[8px] font-bold px-2 py-1 text-zinc-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => insertLink()}
                      className="rounded-lg bg-[var(--apple-blue)] text-white hover:bg-[var(--apple-blue-hover)] text-[8px] font-black px-2.5 py-1 uppercase tracking-wider cursor-pointer"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* WordPress Add Media button */}
            <button
              type="button"
              onClick={openMediaModal}
              title="Add Image / Media to Article"
              className="flex h-7 px-2.5 items-center gap-1.5 rounded-lg border border-[var(--apple-blue)]/20 bg-[var(--apple-blue)]/[0.03] text-[var(--apple-blue)] hover:bg-[var(--apple-blue)] hover:text-white transition-all cursor-pointer font-bold"
            >
              <Icons.Image />
              <span className="text-[9px] font-black uppercase tracking-widest">Add Media</span>
            </button>
          </div>

          {/* Group 6: History Undo/Redo */}
          <div className="flex items-center gap-0.5 px-1.5 ml-auto">
            <button
              type="button"
              onClick={() => executeCommand("undo")}
              title="Undo"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer"
            >
              <Icons.Undo />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("redo")}
              title="Redo"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-zinc-500 hover:border-zinc-200 hover:bg-white hover:text-zinc-950 transition-all cursor-pointer"
            >
              <Icons.Redo />
            </button>
          </div>

        </div>
      )}

      {/* Editor Body Textarea / ContentEditable Sheet */}
      <div className="relative flex-1 min-h-[300px]">
        {editorMode === "visual" ? (
          <div
            ref={editorRef}
            contentEditable
            onInput={() => handleVisualChange(false)}
            onBlur={() => {
              saveSelection();
              flushChanges();
            }}
            onKeyUp={handleSelectionChange}
            onMouseUp={handleSelectionChange}
            data-placeholder={placeholder}
            className="w-full min-h-[300px] max-h-[500px] overflow-y-auto px-5 py-4 text-xs font-semibold leading-relaxed focus:outline-none select-text prose max-w-none prose-zinc"
            style={{ 
              WebkitUserSelect: "text", 
              userSelect: "text"
            }}
          />
        ) : (
          <textarea
            value={localValue}
            onChange={(e) => handleTextChange(e.target.value)}
            onBlur={flushChanges}
            placeholder="Write HTML source script..."
            className="w-full min-h-[300px] max-h-[500px] overflow-y-auto font-mono text-3xs text-zinc-800 bg-zinc-50/50 p-4 border-0 focus:outline-none focus:ring-0 resize-none leading-relaxed"
          />
        )}
      </div>

      {/* Floating Words and Characters count indicator bar */}
      <div className="border-t border-zinc-150 bg-zinc-50/80 px-4 py-2 flex items-center justify-between text-[9px] font-black uppercase text-zinc-400 tracking-wider select-none">
        <div className="flex gap-4">
          <span>Words: <strong className="text-zinc-600 font-black">{wordCount}</strong></span>
          <span>Chars: <strong className="text-zinc-600 font-black">{charCount}</strong></span>
        </div>
        <div className="flex items-center gap-1 font-bold text-zinc-400">
          <span>Format:</span>
          <span className={`px-1.5 py-0.5 rounded border leading-none text-[8px] font-black uppercase ${
            editorMode === "visual" 
              ? "bg-zinc-150 text-zinc-600 border-zinc-250" 
              : "bg-amber-50 text-amber-600 border-amber-250"
          }`}>
            {editorMode === "visual" ? "Visual WYSIWYG" : "HTML Source"}
          </span>
        </div>
      </div>

      {/* GORGEOUS WORDPRESS MEDIA LIBRARY INSERTION MODAL */}
      {showMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs select-none p-4">
          <div 
            className="relative flex flex-col w-full max-w-4xl h-[620px] rounded-3xl border border-zinc-200 bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-150 bg-zinc-50/80 px-6 py-4.5">
              <div>
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">IBN Newsroom Assets</span>
                <h3 className="text-xs font-black text-zinc-900 mt-0.5">📚 Add Media / Insert DB Image</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaModal(false)}
                className="rounded-full bg-zinc-100 p-1.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 cursor-pointer transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Tabs Grid Layout */}
            <div className="flex border-b border-zinc-150 bg-zinc-50/20 px-6 select-none shrink-0">
              <button
                type="button"
                onClick={() => setMediaModalTab("library")}
                className={`border-b-2 py-3.5 text-3xs font-black uppercase tracking-widest cursor-pointer mr-6 transition-all ${
                  mediaModalTab === "library"
                    ? "border-[var(--apple-blue)] text-[var(--apple-blue)] font-extrabold"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setMediaModalTab("upload")}
                className={`border-b-2 py-3.5 text-3xs font-black uppercase tracking-widest cursor-pointer transition-all ${
                  mediaModalTab === "upload"
                    ? "border-[var(--apple-blue)] text-[var(--apple-blue)] font-extrabold"
                    : "border-transparent text-zinc-400 hover:text-zinc-600"
                }`}
              >
                Upload File directly to DB
              </button>
            </div>

            {/* Modal Central content Area */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_280px]">
              
              {/* Left Segment: File lists / Media Grid */}
              <div className="p-6 overflow-y-auto flex flex-col min-h-0 border-r border-zinc-150">
                {mediaModalTab === "library" ? (
                  <>
                    {/* Media Search filter */}
                    <div className="relative mb-5 shrink-0">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                        <Icons.Search />
                      </span>
                      <input
                        type="text"
                        value={mediaSearchQuery}
                        onChange={(e) => setMediaSearchQuery(e.target.value)}
                        placeholder="Search image title, size, or metadata..."
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 py-2 pl-9 pr-4 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                      />
                    </div>

                    {/* Media Grid Cards */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                      {filteredMedia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-400">
                          <span className="text-3xl mb-2">📸</span>
                          <span className="text-3xs font-black uppercase tracking-wider">No matching images found</span>
                          <p className="text-[10px] text-zinc-400 mt-1">Upload a new image in the next tab to save it directly to Neon DB!</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 p-0.5">
                          {filteredMedia.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedMediaItem(item)}
                              className={`group relative aspect-video rounded-2xl border overflow-hidden bg-zinc-50 cursor-pointer shadow-2xs hover:shadow-md transition-all ${
                                selectedMediaItem?.id === item.id
                                  ? "border-[var(--apple-blue)] ring-2 ring-[var(--apple-blue)]/10 scale-98"
                                  : "border-zinc-200 hover:border-zinc-300"
                              }`}
                            >
                              <img
                                src={item.url}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent p-2.5 flex flex-col justify-end opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity select-none">
                                <span className="text-[9px] font-black text-white truncate">{item.name}</span>
                                <span className="text-[7px] font-semibold text-zinc-300 mt-0.5 uppercase tracking-wide">{item.size}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  /* Drag & Drop direct Neon DB file upload center */
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50 p-8 text-center select-none">
                    {uploadingImage ? (
                      <div className="space-y-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-[var(--apple-blue)] mx-auto" />
                        <span className="block text-3xs font-black text-zinc-500 uppercase tracking-widest">Uploading and converting directly to Base64 DB Record...</span>
                      </div>
                    ) : (
                      <div className="space-y-4 max-w-sm">
                        <span className="text-4xl block">☁️</span>
                        <div>
                          <h4 className="text-xs font-black text-zinc-800">Neon DB Image Uploader Desk</h4>
                          <p className="text-[10px] text-zinc-400 font-semibold mt-1">
                            Your image file will be fully optimized, translated directly to a Base64 string, and written inside your secure Neon DB database. 100% cloudless storage!
                          </p>
                        </div>
                        
                        <label className="inline-block rounded-full bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white px-5 py-2 text-3xs font-black uppercase tracking-widest cursor-pointer transition-colors shadow">
                          Select Local Image File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleModalUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="block text-[8px] text-zinc-400 font-bold uppercase tracking-wider">Supports JPEG, PNG, WEBP, and GIF formats.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Segment: Media Attributes Properties */}
              <div className="p-6 bg-zinc-50/40 overflow-y-auto flex flex-col min-h-0 select-none">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-150 pb-2 mb-4">
                  Asset Attributes
                </span>

                {selectedMediaItem ? (
                  <div className="flex-1 flex flex-col justify-between min-h-0">
                    <div className="space-y-4">
                      
                      {/* File preview thumbnails details */}
                      <div className="rounded-xl border border-zinc-200 overflow-hidden bg-white aspect-video relative shadow-3xs shrink-0 select-none">
                        <img
                          src={selectedMediaItem.url}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div className="text-[9px] font-semibold text-zinc-500 leading-normal space-y-0.5 truncate select-none">
                        <span className="block font-black text-zinc-800 truncate">Name: {selectedMediaItem.name}</span>
                        <span className="block">Dimensions: {selectedMediaItem.width || 800} x {selectedMediaItem.height || 450}</span>
                        <span className="block">Size: {selectedMediaItem.size}</span>
                        <span className="block">Type: {selectedMediaItem.type.toUpperCase()}</span>
                      </div>

                      {/* Caption text */}
                      <div>
                        <label className="block text-[8px] font-black uppercase text-zinc-400 mb-1 select-none">Image Caption</label>
                        <input
                          type="text"
                          value={imgCaption}
                          onChange={(e) => setImgCaption(e.target.value)}
                          placeholder="e.g. मेरठ में हुई दुर्घटना का प्रतीकात्मक चित्र..."
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>

                      {/* Alignment tags */}
                      <div>
                        <label className="block text-[8px] font-black uppercase text-zinc-400 mb-1 select-none">Image Alignment</label>
                        <select
                          value={imgAlign}
                          onChange={(e) => setImgAlign(e.target.value as any)}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-3xs font-bold text-zinc-700 focus:outline-none cursor-pointer hover:border-zinc-300"
                        >
                          <option value="center">Center Paragraphs</option>
                          <option value="full">Full Article Width</option>
                          <option value="left">Left Wrap Text</option>
                          <option value="right">Right Wrap Text</option>
                        </select>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={insertSelectedImage}
                      className="w-full mt-6 rounded-full bg-[var(--apple-blue)] hover:bg-[var(--apple-blue-hover)] text-white py-2.5 text-3xs font-black uppercase tracking-widest cursor-pointer transition-colors shadow-md"
                    >
                      Insert Image Into Desk
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-zinc-400 italic text-[10px] font-semibold py-8">
                    <span>👈 Select an image file from your library or upload a new one to unlock attributes configuration!</span>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
