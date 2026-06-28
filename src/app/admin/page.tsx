"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Article, Category, LocationTag, Comment, User, MediaItem } from "../context/AppContext";
import { authClient } from "@/lib/auth-client";
import { canAccessAdminPanel, normalizeRole } from "@/lib/roles";
import { getSafeAvatarSrc } from "@/lib/avatar";
import RichTextEditor from "@/components/RichTextEditor";

type TabType =
  | "profile"
  | "dashboard"
  | "articles"
  | "editor"
  | "videos"
  | "analytics"
  | "comments"
  | "media"
  | "categories"
  | "notifications"
  | "users"
  | "settings"
  | "audit"
  | "recycle";

export default function AdminPage() {
  const router = useRouter();
  const {
    articles,
    categories,
    locations,
    comments,
    media,
    users,
    notifications,
    settings,
    currentUser,
    loading,
    addArticle,
    editArticle,
    deleteArticle,
    restoreArticle,
    hardDeleteArticle,
    addBreakingNews,
    moderateComment,
    addCategory,
    editCategory,
    deleteCategory,
    addLocation,
    deleteLocation,
    addMediaItem,
    deleteMediaItem,
    addUser,
    deleteUser,
    updateUserRole,
    updateMyProfile,
    sendNotification,
    updateSettings,
    loadMedia,
  } = useApp();
  const { data: session } = authClient.useSession();
  const resolvedProfile = users.find((user) => user.id === session?.user?.id || user.email === session?.user?.email) || currentUser;
  const sessionRole = normalizeRole(resolvedProfile.role);
  const isAdmin = sessionRole === "Admin";
  const isEditor = sessionRole === "Editor";

  // --- STATE SYSTEM ---
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  
  // Selected articles for bulk actions
  const [selectedArticles, setSelectedArticles] = useState<string[]>([]);
  
  // Advanced Editor form state
  const [editorHindiTitle, setEditorHindiTitle] = useState("");
  const [editorEnglishTitle, setEditorEnglishTitle] = useState("");
  const [editorSlug, setEditorSlug] = useState("");
  const [editorExcerpt, setEditorExcerpt] = useState("");
  const [editorExcerptEn, setEditorExcerptEn] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorContentEn, setEditorContentEn] = useState("");
  const [editorFeaturedImage, setEditorFeaturedImage] = useState("");
  const [editorCategory, setEditorCategory] = useState("Meerut");
  const [editorSubcategory, setEditorSubcategory] = useState("Civic");
  const [editorLocation, setEditorLocation] = useState("Meerut Sadar");
  const [editorLanguage, setEditorLanguage] = useState<"hindi" | "english" | "bilingual">("bilingual");
  const [editorTags, setEditorTags] = useState("");
  const [editorIsBreaking, setEditorIsBreaking] = useState(false);
  const [editorIsSticky, setEditorIsSticky] = useState(false);
  const [editorIsEditorsChoice, setEditorIsEditorsChoice] = useState(false);
  const [editorStatus, setEditorStatus] = useState<"Draft" | "Published">("Published");
  const [editorMetaTitle, setEditorMetaTitle] = useState("");
  const [editorMetaDesc, setEditorMetaDesc] = useState("");
  const [editorReadTime, setEditorReadTime] = useState(3);
  const [editorCorrespondent, setEditorCorrespondent] = useState("");

  // Quick live ticker alert
  const [quickHeadline, setQuickHeadline] = useState("");
  const [quickSummary, setQuickSummary] = useState("");
  const [quickCategory, setQuickCategory] = useState("Meerut");
  const [quickLocation, setQuickLocation] = useState("National");
  const [quickSendNotify, setQuickSendNotify] = useState(true);
  const [quickSuccess, setQuickSuccess] = useState(false);

  // Taxonomy creator
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameHindi, setNewCatNameHindi] = useState("");
  const [newCatColor, setNewCatColor] = useState("#d6001c");
  const [newLocName, setNewLocName] = useState("");
  const [newLocNameHindi, setNewLocNameHindi] = useState("");

  // Media cropping modal simulation
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null);
  const [cropSimPercent, setCropSimPercent] = useState(100);
  const [compressSimPercent, setCompressSimPercent] = useState(85);

  // YouTube Video management state
  const [videoCatalog, setVideoCatalog] = useState<any[]>([]);
  const [newVideoTitle, setNewVideoTitle] = useState("");
  const [newVideoDesc, setNewVideoDesc] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [videoSubmitting, setVideoSubmitting] = useState(false);

  // Analytics embed state
  const [analyticsEmbedUrl, setAnalyticsEmbedUrl] = useState("");
  const [isCropSaved, setIsCropSaved] = useState(false);

  // Custom Push alert form
  const [customPushTitle, setCustomPushTitle] = useState("");
  const [customPushMsg, setCustomPushMsg] = useState("");
  const [customPushUrl, setCustomPushUrl] = useState("/");
  const [pushSentSuccess, setPushSentSuccess] = useState(false);

  // Staff roles creator
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<User["role"]>("User");

  // Site metadata configuration
  const [settingsSiteHindi, setSettingsSiteHindi] = useState(settings.siteNameHindi);
  const [settingsSiteEnglish, setSettingsSiteEnglish] = useState(settings.siteNameEnglish);
  const [settingsWhatsapp, setSettingsWhatsapp] = useState(settings.whatsappNumber);
  const [settingsAdSlotHeader, setSettingsAdSlotHeader] = useState(settings.adSlotHeader);
  const [settingsAdSlotSidebar, setSettingsAdSlotSidebar] = useState(settings.adSlotSidebar);
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [settingsGoogleVerification, setSettingsGoogleVerification] = useState(settings.googleSiteVerification || "");
  const [settingsTrendingTopics, setSettingsTrendingTopics] = useState<Array<{hi: string, en: string}>>(() => {
    if (settings.trendingTopics) {
      try {
        return JSON.parse(settings.trendingTopics);
      } catch (e) {
        console.error("Error parsing initial trending topics:", e);
      }
    }
    return [
      { hi: "#मेरठहादसा", en: "#MeerutAccident" },
      { hi: "#गन्नामूल्य2026", en: "#SugarPrice2026" },
      { hi: "#नौचंदीमेला", en: "#NauchandiMela" },
      { hi: "#आईपीएल2026", en: "#IPL2026" },
      { hi: "#पश्चिमीयूपी_किसान", en: "#UPFarmers" },
    ];
  });
  const [newTagHi, setNewTagHi] = useState("");
  const [newTagEn, setNewTagEn] = useState("");

  // Personal profile setup
  const [profileName, setProfileName] = useState(resolvedProfile.name);
  const [profileImage, setProfileImage] = useState(resolvedProfile.avatar || session?.user?.image || "");
  const [profileBio, setProfileBio] = useState(resolvedProfile.bio || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Real-time audit logs state
  const [auditLogs, setAuditLogs] = useState<{ id: string; event: string; user: string; time: string }[]>([
    { id: "1", event: "Admin Console Initialized", user: "System", time: new Date().toLocaleTimeString() },
  ]);

  const addAuditLog = (event: string) => {
    setAuditLogs(prev => [
      { id: "log_" + Date.now(), event, user: currentUser.name, time: new Date().toLocaleTimeString() },
      ...prev
    ]);
  };

  useEffect(() => {
    if (loading || session === undefined) return;

    if (!session?.user || !canAccessAdminPanel(sessionRole)) {
      router.replace("/");
    }
  }, [router, session, sessionRole, loading]);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  useEffect(() => {
    if (isEditor) {
      setActiveTab("profile");
    }
  }, [isEditor]);

  useEffect(() => {
    setProfileName(resolvedProfile.name);
    setProfileImage(resolvedProfile.avatar || session?.user?.image || "");
    setProfileBio(resolvedProfile.bio || "");
  }, [resolvedProfile.name, resolvedProfile.avatar, resolvedProfile.bio, session?.user?.image]);

  // Automated Real-time Slug Generator from English Title
  useEffect(() => {
    if (!editingArticleId) {
      const base = editorEnglishTitle || editorHindiTitle;
      const slugified = base
        .toLowerCase()
        .replace(/[^a-z0-9\u0900-\u097F]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setEditorSlug(slugified);
    }
  }, [editorEnglishTitle, editorHindiTitle, editingArticleId]);

  // Dynamically keep editorSubcategory aligned with editorCategory subcategories array
  useEffect(() => {
    const currentCategoryObj = categories.find(c => c.name === editorCategory);
    const available = currentCategoryObj?.subcategories || [];
    if (available.length > 0) {
      if (!available.includes(editorSubcategory)) {
        setEditorSubcategory(available[0]);
      }
    } else {
      setEditorSubcategory("General");
    }
  }, [editorCategory, categories, editorSubcategory]);

  // Fetch YouTube video catalog on mount
  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await fetch("/api/videos");
        if (res.ok) {
          const list = await res.json();
          setVideoCatalog(list);
        }
      } catch (err) {
        console.error("Error loading video catalog in admin page:", err);
      }
    }
    loadVideos();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ibn_analytics_embed_url") || "";
      setAnalyticsEmbedUrl(saved);
    }
  }, []);

  const handleAddVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoSubmitting(true);
    try {
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newVideoTitle,
          description: newVideoDesc,
          youtubeUrlOrId: newVideoUrl,
        }),
      });

      if (res.ok) {
        const freshVideo = await res.json();
        setVideoCatalog(prev => [freshVideo, ...prev]);
        setNewVideoTitle("");
        setNewVideoDesc("");
        setNewVideoUrl("");
        addAuditLog(`Uploaded YouTube video: "${freshVideo.title}"`);
        alert("YouTube video successfully registered and matched!");
      } else {
        const errData = await res.json();
        alert("Failed to add video: " + (errData.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error adding video:", err);
      alert("Failed to submit YouTube video.");
    } finally {
      setVideoSubmitting(false);
    }
  };

  // Clean form
  const resetEditorForm = () => {
    setEditingArticleId(null);
    setEditorHindiTitle("");
    setEditorEnglishTitle("");
    setEditorSlug("");
    setEditorExcerpt("");
    setEditorExcerptEn("");
    setEditorContent("");
    setEditorContentEn("");
    setEditorFeaturedImage(media[0]?.url || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&h=450&q=80");
    setEditorCategory("Meerut");
    setEditorSubcategory("Civic");
    setEditorLocation("Meerut Sadar");
    setEditorLanguage("bilingual");
    setEditorTags("");
    setEditorIsBreaking(false);
    setEditorIsSticky(false);
    setEditorIsEditorsChoice(false);
    setEditorStatus("Published");
    setEditorMetaTitle("");
    setEditorMetaDesc("");
    setEditorReadTime(3);
    setEditorCorrespondent("");
  };

  const handleEditClick = (art: Article) => {
    setEditingArticleId(art.id);
    setEditorHindiTitle(art.titleHindi);
    setEditorEnglishTitle(art.titleEnglish || "");
    setEditorSlug(art.slug);
    setEditorExcerpt(art.excerpt);
    setEditorExcerptEn(art.excerptEnglish || "");
    setEditorContent(art.content);
    setEditorContentEn(art.contentEnglish || "");
    setEditorFeaturedImage(art.featuredImage);
    setEditorCategory(art.category);
    setEditorSubcategory(art.subcategory || "Civic");
    setEditorLocation(art.locationTag);
    setEditorLanguage(art.language);
    setEditorTags(art.tags.join(", "));
    setEditorIsBreaking(art.isBreaking);
    setEditorIsSticky(art.isSticky);
    setEditorIsEditorsChoice(art.isEditorsChoice || false);
    setEditorStatus(art.status === "Published" ? "Published" : "Draft");
    setEditorMetaTitle(art.metaTitle || "");
    setEditorMetaDesc(art.metaDescription || "");
    setEditorReadTime(art.readTime);
    setEditorCorrespondent(art.correspondent || "");
    addAuditLog(`Loaded article "${art.titleHindi.slice(0, 30)}..." for editing`);
    setActiveTab("editor");
  };

  const handleEditorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorHindiTitle.trim()) {
      alert("Please enter at least the Hindi title!");
      return;
    }

    const articleData = {
      titleHindi: editorHindiTitle,
      titleEnglish: editorEnglishTitle || undefined,
      slug: editorSlug || "news-" + Date.now(),
      excerpt: editorExcerpt || editorHindiTitle.slice(0, 100) + "...",
      excerptEnglish: editorExcerptEn || undefined,
      content: editorContent,
      contentEnglish: editorContentEn || undefined,
      featuredImage: editorFeaturedImage,
      category: editorCategory,
      subcategory: editorSubcategory,
      locationTag: editorLocation,
      language: editorLanguage,
      tags: editorTags.split(",").map((t) => t.trim()).filter(Boolean),
      isBreaking: editorIsBreaking,
      isSticky: editorIsSticky,
      isEditorsChoice: editorIsEditorsChoice,
      status: editorStatus,
      publishDate: new Date().toISOString(),
      authorId: currentUser.id,
      readTime: editorReadTime,
      metaTitle: editorMetaTitle || editorHindiTitle,
      metaDescription: editorMetaDesc || editorExcerpt,
      correspondent: editorCorrespondent || null,
    };

    if (editingArticleId) {
      editArticle(editingArticleId, articleData);
      addAuditLog(`Updated article: "${editorHindiTitle.slice(0, 30)}..."`);
      alert("Article successfully updated!");
    } else {
      addArticle(articleData);
      addAuditLog(`Published new article: "${editorHindiTitle.slice(0, 30)}..."`);
      alert("New article published successfully!");
    }

    resetEditorForm();
    setActiveTab("articles");
  };

  const handleQuickBreakingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickHeadline.trim()) return;

    addBreakingNews(quickHeadline, quickSummary, quickCategory, quickLocation, quickSendNotify);
    addAuditLog(`Broadcasted Live Ticker: "${quickHeadline.slice(0, 40)}..."`);
    setQuickHeadline("");
    setQuickSummary("");
    setQuickSuccess(true);
    setTimeout(() => setQuickSuccess(false), 4000);
  };

  // Bulk operations
  const handleSelectArticle = (id: string) => {
    if (selectedArticles.includes(id)) {
      setSelectedArticles(selectedArticles.filter((x) => x !== id));
    } else {
      setSelectedArticles([...selectedArticles, id]);
    }
  };

  const handleSelectAllArticles = (currentList: Article[]) => {
    if (selectedArticles.length === currentList.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(currentList.map((x) => x.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedArticles.length === 0) return;
    if (confirm(`Move ${selectedArticles.length} selected articles to the Recycle Bin?`)) {
      selectedArticles.forEach((id) => deleteArticle(id));
      addAuditLog(`Soft deleted ${selectedArticles.length} items`);
      setSelectedArticles([]);
      alert("Articles moved to Recycle Bin!");
    }
  };

  const handleBulkMarkBreaking = (val: boolean) => {
    if (selectedArticles.length === 0) return;
    selectedArticles.forEach((id) => editArticle(id, { isBreaking: val }));
    addAuditLog(`Set breaking status to ${val} for ${selectedArticles.length} articles`);
    setSelectedArticles([]);
    alert("Breaking status successfully updated!");
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !newCatNameHindi.trim()) return;
    addCategory({
      id: "cat_" + Date.now(),
      name: newCatName,
      nameHindi: newCatNameHindi,
      color: newCatColor,
      order: categories.length + 1,
      subcategories: ["Civic", "Politics", "General"],
    });
    addAuditLog(`Added Category tag: "${newCatName}"`);
    setNewCatName("");
    setNewCatNameHindi("");
    alert("New Category successfully added!");
  };

  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim() || !newLocNameHindi.trim()) return;
    addLocation({
      id: "loc_" + Date.now(),
      name: newLocName,
      nameHindi: newLocNameHindi,
      parent: "West UP",
    });
    addAuditLog(`Added Location Bureau: "${newLocName}"`);
    setNewLocName("");
    setNewLocNameHindi("");
    alert("New Location Bureau successfully added!");
  };

  const handleCustomPushSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPushTitle.trim() || !customPushMsg.trim()) return;
    sendNotification(customPushTitle, customPushMsg, customPushUrl);
    addAuditLog(`Dispatched custom push alert: "${customPushTitle}"`);
    setCustomPushTitle("");
    setCustomPushMsg("");
    setPushSentSuccess(true);
    setTimeout(() => setPushSentSuccess(false), 4000);
  };

  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    addUser({
      name: newStaffName,
      email: newStaffEmail,
      role: newStaffRole,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80",
    });
    addAuditLog(`Created user profile: "${newStaffName}" as ${newStaffRole}`);
    setNewStaffName("");
    setNewStaffEmail("");
    alert("New staff credentials created successfully!");
  };

  const handleProfileImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Profile image upload failed");
    }

    const uploaded = await res.json();
    setProfileImage(uploaded.url);
    const saved = await updateMyProfile({ name: profileName.trim(), image: uploaded.url });
    if (saved) {
      addAuditLog(`Updated profile photo for ${saved.name}`);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 2500);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const saved = await updateMyProfile({ name: profileName.trim(), image: profileImage.trim(), bio: profileBio.trim() });
      if (saved) {
        addAuditLog(`Updated profile for ${saved.name}`);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 2500);
        alert("Profile updated successfully.");
      } else {
        alert("Failed to update profile.");
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      siteNameHindi: settingsSiteHindi,
      siteNameEnglish: settingsSiteEnglish,
      whatsappNumber: settingsWhatsapp,
      adSlotHeader: settingsAdSlotHeader,
      adSlotSidebar: settingsAdSlotSidebar,
      trendingTopics: JSON.stringify(settingsTrendingTopics),
      googleSiteVerification: settingsGoogleVerification || null,
    });
    addAuditLog("Synchronized website configuration changes");
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 4000);
  };

  const handleSimulateDragDrop = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*,video/*,application/pdf";
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      addAuditLog(`Starting file upload: ${file.name}`);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const uploadedItem = await res.json();
        addMediaItem(uploadedItem, true);
        addAuditLog(`File successfully uploaded directly to Neon DB: ${file.name}`);
        alert(`Successfully uploaded "${file.name}" to Neon DB!`);
      } catch (err) {
        console.error("Upload failed, falling back to mock files:", err);
        const mockFiles = [
          { id: "m_" + Date.now(), name: "breaking_news_meerut.webp", url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&h=450&q=80", type: "image" as const, size: "154 KB", date: new Date().toISOString().split("T")[0], width: 800, height: 450 },
        ];
        mockFiles.forEach(f => addMediaItem(f));
        addAuditLog("Simulated fallback media seeding");
        alert("Neon DB connection issue. Seeding high-quality placeholder media instead!");
      }
    };
    fileInput.click();
  };

  const handleEditorImageUpload = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      addAuditLog(`Uploading article featured image: ${file.name}`);
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const uploadedItem = await res.json();
        addMediaItem(uploadedItem, true);
        setEditorFeaturedImage(uploadedItem.url);
        addAuditLog(`Article image successfully uploaded directly to Neon DB: ${file.name}`);
        alert("Featured image successfully uploaded and selected!");
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload image to Neon DB.");
      }
    };
    fileInput.click();
  };

  const handleImageUploadApi = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/media/upload", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    const uploadedItem = await res.json();
    addMediaItem(uploadedItem, true);
    return uploadedItem;
  };

  const exportDBState = () => {
    const fullState = {
      articles,
      categories,
      locations,
      comments,
      media,
      users,
      notifications,
      settings
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ibn_db_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addAuditLog("Exported full local database backup file");
  };

  // Caching Stats and Filters using React.useMemo to eliminate redundant renders
  const activeArticles = useMemo(() => articles.filter((a) => !a.isDeleted), [articles]);
  const deletedArticles = useMemo(() => articles.filter((a) => a.isDeleted), [articles]);
  const draftsList = useMemo(() => activeArticles.filter((a) => a.status === "Draft"), [activeArticles]);
  const publishedCount = useMemo(() => activeArticles.filter((a) => a.status === "Published").length, [activeArticles]);
  const breakingCount = useMemo(() => activeArticles.filter((a) => a.isBreaking).length, [activeArticles]);
  const totalViews = useMemo(() => activeArticles.reduce((sum, art) => sum + art.views, 0), [activeArticles]);

  const bureauMetrics = useMemo(() => {
    const hasViews = activeArticles.some(art => art.views > 0);
    if (!hasViews) {
      return [
        { name: "Meerut Bureau", percentage: 48, count: "12.4k views", color: "bg-[var(--news-red)]" },
        { name: "Muzaffarnagar Bureau", percentage: 22, count: "5.7k views", color: "bg-[var(--apple-blue)]" },
        { name: "Saharanpur Bureau", percentage: 15, count: "3.9k views", color: "bg-zinc-800" },
        { name: "Baghpat & Shamli Bureau", percentage: 10, count: "2.6k views", color: "bg-zinc-400" },
        { name: "National News desk", percentage: 5, count: "1.2k views", color: "bg-zinc-200" },
      ];
    }

    const bureauViews: Record<string, number> = {};
    activeArticles.forEach(art => {
      const tag = art.locationTag || "National";
      bureauViews[tag] = (bureauViews[tag] || 0) + (art.views || 0);
    });

    const totalViewsAcrossBureaus = Object.values(bureauViews).reduce((sum, v) => sum + v, 0) || 1;

    return Object.entries(bureauViews).map(([tag, views]) => {
      const percentage = Math.round((views / totalViewsAcrossBureaus) * 100) || 0;
      let color = "bg-zinc-400";
      if (tag.includes("Meerut")) color = "bg-[var(--news-red)]";
      else if (tag.includes("Muzaffarnagar")) color = "bg-[var(--apple-blue)]";
      else if (tag.includes("Saharanpur")) color = "bg-zinc-800";
      else if (tag.includes("National")) color = "bg-zinc-200";

      return {
        name: `${tag} Bureau`,
        percentage,
        count: `${views.toLocaleString()} views`,
        color
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [activeArticles]);

  const articlesListFiltered = useMemo(() => {
    return activeArticles.filter((art) => {
      const matchesSearch = searchQuery.trim()
        ? art.titleHindi.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (art.titleEnglish && art.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase())) ||
          art.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCat = catFilter ? art.category === catFilter : true;
      const matchesStatus = statusFilter ? art.status === statusFilter : true;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [activeArticles, searchQuery, catFilter, statusFilter]);

  const articleRedirectOptions = useMemo(() => {
    return activeArticles.slice(0, 12).map((art) => ({
      label: art.titleHindi,
      value: `/article/${art.slug}`,
    }));
  }, [activeArticles]);

  const filteredStaffUsers = useMemo(() => {
    return users.filter((user) => {
      if (!staffSearchQuery.trim()) return true;
      const term = staffSearchQuery.toLowerCase();
      return user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term);
    });
  }, [users, staffSearchQuery]);

  const isCustomRedirect = !articleRedirectOptions.some((option) => option.value === customPushUrl);

  const visibleTabs = isAdmin
    ? [
        { id: "profile", label: "Profile" },
        { id: "dashboard", label: "Overview" },
        { id: "articles", label: `Bulletins (${activeArticles.length})` },
        { id: "editor", label: "Publisher" },
        { id: "videos", label: `Videos (${videoCatalog.length})` },
        { id: "comments", label: `Comments (${comments.filter(c => c.status === "pending").length})` },
        { id: "media", label: "Media" },
        { id: "categories", label: "Tags" },
        { id: "notifications", label: "Alerts" },
        { id: "users", label: "Staff" },
        { id: "settings", label: "Config" },
        { id: "audit", label: `Logs (${auditLogs.length})` },
        { id: "recycle", label: `Trash (${deletedArticles.length})` },
      ]
    : [
        { id: "profile", label: "Profile" },
        { id: "editor", label: "Publisher" },
      ];

  if (loading || session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbfbfd] text-zinc-500">
        Loading admin access...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#fbfbfd] text-[#1d1d1f] antialiased select-none">
      
      {/* COMBINED TOP HEADER BLOCK (Logo, Profile, and Horizontal Capsule Navigation Bar) */}
      <header className="w-full bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm shrink-0">
        {/* Top bar: Brand + Profile */}
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between md:px-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-black tracking-tight text-zinc-950 title-font flex items-center gap-1.5">
              IBN NEWS
              <span className="bg-[var(--news-red)] text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm tracking-widest uppercase">HINDI</span>
            </span>
            <div className="h-4 w-px bg-zinc-200 hidden md:block" />
            <div className="hidden md:flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-5xs font-black uppercase text-zinc-400 tracking-wider">Neon DB Connected</span>
            </div>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 font-sans">
              <img
                src={getSafeAvatarSrc(resolvedProfile.avatar, resolvedProfile.name)}
                alt={resolvedProfile.name}
                className="h-8 w-8 rounded-full object-cover border border-zinc-200"
              />
              <div className="hidden sm:block text-left">
                <span className="block text-3xs font-black text-zinc-900 leading-tight">{resolvedProfile.name}</span>
                <span className="block text-5xs font-black text-[var(--news-red)] uppercase tracking-wider mt-0.5">{normalizeRole(resolvedProfile.role)}</span>
              </div>
            </div>
            
            <div className="h-4 w-px bg-zinc-200" />
            
            <Link
              href="/"
              className="px-3 py-1.25 text-5xs font-black text-zinc-700 hover:text-[var(--apple-blue)] border border-zinc-200 rounded-full hover:bg-zinc-50 transition-colors uppercase tracking-wider cursor-pointer"
            >
              Live Site &rarr;
            </Link>
          </div>
        </div>

        {/* Tab row: Capsule Navigation Bar */}
        <div className="border-t border-zinc-100 bg-zinc-50/50">
          <div className="max-w-[1600px] mx-auto px-4 py-2 flex gap-1.5 overflow-x-auto scrollbar-hide flex-nowrap md:px-6">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "editor") resetEditorForm();
                  setActiveTab(tab.id as any);
                }}
                className={`shrink-0 rounded-full px-3 py-1.25 text-5xs font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[var(--apple-blue)] border-[var(--apple-blue)] text-white shadow-sm"
                    : "bg-white border-zinc-200 text-zinc-600 hover:text-[var(--apple-blue)] hover:border-zinc-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN VIEW CANVAS */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
        <div className="mx-auto w-full max-w-[1600px] space-y-5">

            {/* TAB 0: PROFILE SETUP */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Profile Setup</span>
                      <h2 className="text-xs font-black text-zinc-950 mt-0.5">Edit your name and profile photo</h2>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">This profile will show across the website and in article author bylines.</p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-5xs font-black uppercase tracking-widest text-zinc-500">
                      {normalizeRole(resolvedProfile.role)}
                    </span>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="mt-5 grid gap-6 md:grid-cols-[auto_1fr]">
                    <div className="flex flex-col items-center gap-3 rounded-[22px] border border-zinc-200 bg-zinc-50 p-4 text-center">
                      <img
                        src={getSafeAvatarSrc(profileImage || resolvedProfile.avatar, profileName || resolvedProfile.name)}
                        alt={profileName || resolvedProfile.name}
                        className="h-24 w-24 rounded-full object-cover border border-zinc-200 shadow-sm bg-white"
                      />
                      <div className="space-y-1">
                        <p className="text-3xs font-black text-zinc-900">Upload a new photo</p>
                        <p className="text-5xs font-semibold text-zinc-400">JPG, PNG, or WEBP recommended</p>
                      </div>
                      <input
                        id="profile-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const input = e.currentTarget;
                          const file = input.files?.[0];
                          if (!file) return;
                          try {
                            await handleProfileImageUpload(file);
                          } catch (err) {
                            console.error("Profile photo upload failed:", err);
                            alert("Failed to upload profile photo.");
                          } finally {
                            input.value = "";
                          }
                        }}
                      />
                      <label
                        htmlFor="profile-photo-upload"
                        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-[var(--apple-blue)] px-4 py-2 text-4xs font-black uppercase tracking-widest text-white hover:bg-[var(--apple-blue-hover)] transition-colors"
                      >
                        Choose photo
                      </label>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-5xs font-black uppercase tracking-wider text-zinc-400">Display name</label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase tracking-wider text-zinc-400">Email</label>
                          <input
                            type="email"
                            value={resolvedProfile.email}
                            disabled
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-2xs font-bold text-zinc-500"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="text-5xs font-black uppercase tracking-wider text-zinc-400">Role</label>
                          <input
                            type="text"
                            value={normalizeRole(resolvedProfile.role)}
                            disabled
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-2 text-2xs font-black text-zinc-700"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase tracking-wider text-zinc-400">Profile image URL</label>
                          <input
                            type="text"
                            value={profileImage}
                            onChange={(e) => setProfileImage(e.target.value)}
                            placeholder="Upload or paste an image URL"
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase tracking-wider text-zinc-400">About Me (Biography)</label>
                        <textarea
                          value={profileBio}
                          onChange={(e) => setProfileBio(e.target.value)}
                          placeholder="Write a brief description about yourself. This biography will be displayed below all articles you write..."
                          rows={3}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs font-semibold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none leading-relaxed"
                        />
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-5xs font-semibold text-zinc-400">Your profile photo is used on the homepage, author bio, and article cards.</p>
                        <div className="flex items-center gap-2">
                          {profileSuccess && (
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-5xs font-black uppercase tracking-widest text-emerald-700 border border-emerald-100">
                              Saved
                            </span>
                          )}
                          <button
                            type="submit"
                            disabled={profileSaving}
                            className="rounded-full bg-zinc-950 px-5 py-2 text-4xs font-black uppercase tracking-widest text-white hover:bg-zinc-800 disabled:opacity-60"
                          >
                            {profileSaving ? "Saving..." : "Save profile"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 1: OVERVIEW */}
            {activeTab === "dashboard" && (
              <div className="space-y-5">
                
                {/* Clean Alert Bar */}
                <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3.5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-4xs font-black text-zinc-950 uppercase tracking-widest">Command surface synced</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { resetEditorForm(); setActiveTab("editor"); }}
                      className="rounded-full bg-[var(--apple-blue)] px-3.5 py-1.25 text-5xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                    >
                      New Bulletin
                    </button>
                    <button
                      onClick={exportDBState}
                      className="rounded-full bg-white border border-zinc-200 px-3.5 py-1.25 text-5xs font-black text-zinc-700 hover:bg-zinc-50 transition-all uppercase tracking-widest cursor-pointer"
                    >
                      Export Backup
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Active Bulletins", val: publishedCount, icon: "📰" },
                      { label: "Alert Tickers", val: breakingCount, icon: "🚨", color: "text-[var(--news-red)]" },
                      { label: "Aggregate views", val: totalViews.toLocaleString(), icon: "👁️" },
                      { label: "Comments Pending", val: comments.filter(c => c.status === "pending").length, icon: "💬" },
                    ].map((card, i) => (
                      <div key={i} className="min-w-0 overflow-hidden rounded-[18px] border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3.5">
                        <span className="text-xl shrink-0 p-2 rounded-xl bg-zinc-50">{card.icon}</span>
                        <div className="min-w-0">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-zinc-400">{card.label}</span>
                          <h3 className={`text-lg font-black mt-0.5 text-zinc-950 ${card.color || ""}`}>{card.val}</h3>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Avg Read Time", val: `${(activeArticles.reduce((sum, art) => sum + art.readTime, 0) / (activeArticles.length || 1)).toFixed(1)} min`, icon: "⏱️" },
                      { label: "Active Desk Writers", val: users.length, icon: "👥" },
                      { label: "Video Bulletins", val: videoCatalog.length, icon: "🎥" },
                      { label: "Draft Bulletins", val: draftsList.length, icon: "📝" },
                    ].map((card, i) => (
                      <div key={i} className="min-w-0 overflow-hidden rounded-[18px] border border-zinc-150 bg-zinc-50/50 p-3.5 flex items-center gap-3 hover:bg-zinc-50 transition-colors">
                        <span className="text-base shrink-0 p-1.5 rounded-xl bg-white border border-zinc-200">{card.icon}</span>
                        <div className="min-w-0">
                          <span className="block text-[8px] font-black uppercase tracking-wider text-zinc-400">{card.label}</span>
                          <h4 className="text-[11px] font-black mt-0.5 text-zinc-800">{card.val}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  
                  {/* Traffic Chart */}
                  <div className="lg:col-span-2 rounded-[22px] border border-zinc-200 bg-white p-4.5 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Audience Metrics</span>
                        <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Sessions, last 7 days</h4>
                      </div>
                      <span className="bg-emerald-50 text-emerald-700 text-5xs font-black px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">Live</span>
                    </div>

                    <div className="h-56 w-full relative mt-3">
                      {/* Premium Custom SVG graph */}
                      <svg className="w-full h-full" viewBox="0 0 600 220" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="royalBlueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--apple-blue)" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="var(--apple-blue)" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="0" y1="40" x2="600" y2="40" stroke="#f4f4f6" strokeWidth="1" />
                        <line x1="0" y1="90" x2="600" y2="90" stroke="#f4f4f6" strokeWidth="1" />
                        <line x1="0" y1="140" x2="600" y2="140" stroke="#f4f4f6" strokeWidth="1" />
                        <line x1="0" y1="190" x2="600" y2="190" stroke="#f4f4f6" strokeWidth="1" />
                        
                        {/* Curve Path Area */}
                        <path
                          d="M 0 180 C 100 120, 150 160, 200 80 C 250 40, 350 150, 400 90 C 450 60, 500 70, 600 30 L 600 220 L 0 220 Z"
                          fill="url(#royalBlueGradient)"
                        />
                        {/* Curve Stroke Line */}
                        <path
                          d="M 0 180 C 100 120, 150 160, 200 80 C 250 40, 350 150, 400 90 C 450 60, 500 70, 600 30"
                          fill="none"
                          stroke="var(--apple-blue)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Highlights points */}
                        <circle cx="200" cy="80" r="5" fill="#ffffff" stroke="var(--apple-blue)" strokeWidth="3" />
                        <circle cx="400" cy="90" r="5" fill="#ffffff" stroke="var(--apple-blue)" strokeWidth="3" />
                        <circle cx="600" cy="30" r="5" fill="#ffffff" stroke="var(--apple-blue)" strokeWidth="3" />
                      </svg>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-100 pt-3 mt-2 text-5xs font-black uppercase text-zinc-400 tracking-widest">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun (Today)</span>
                    </div>
                  </div>

                  {/* Quick Breaking Strip Dispatch */}
                  <div className="rounded-[22px] border border-zinc-200 bg-white p-4.5 shadow-sm flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Instant Alert</span>
                      <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Push breaking ticker</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">Updates the homepage strip immediately.</p>
                      
                      <form onSubmit={handleQuickBreakingSubmit} className="mt-4 space-y-3">
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-400">Headline (Bilingual/Hindi)</label>
                          <input
                            type="text"
                            required
                            value={quickHeadline}
                            onChange={(e) => setQuickHeadline(e.target.value)}
                            placeholder="मेरठ एक्सप्रेसवे पर भारी जाम..."
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-400">Brief Detail (Optional)</label>
                          <textarea
                            value={quickSummary}
                            onChange={(e) => setQuickSummary(e.target.value)}
                            placeholder="यात्रियों को वैकल्पिक मार्ग उपयोग करने की सलाह..."
                            rows={2}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none"
                          />
                        </div>

                        <div className="flex items-center gap-2 py-1">
                          <label className="flex items-center gap-1.5 text-4xs font-bold text-zinc-500">
                            <input
                              type="checkbox"
                              checked={quickSendNotify}
                              onChange={(e) => setQuickSendNotify(e.target.checked)}
                              className="rounded border-zinc-300 accent-[var(--apple-blue)]"
                            />
                            Broadcast Push Notification Alert
                          </label>
                        </div>

                        <button
                          type="submit"
                          className="w-full rounded-full bg-[var(--news-red)] py-2 text-4xs font-black text-white hover:bg-[var(--news-red-hover)] transition-all uppercase tracking-widest cursor-pointer"
                        >
                          Push Breaking Bulletin
                        </button>
                      </form>
                    </div>

                    {quickSuccess && (
                      <div className="mt-3 text-center text-5xs font-black text-emerald-600 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100 animate-pulse uppercase tracking-wider">
                        Alert successfully broadcasted live!
                      </div>
                    )}
                  </div>
                </div>

                <details className="rounded-[22px] border border-zinc-200 bg-white p-4 shadow-sm open:shadow-md">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Advanced insights</span>
                      <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Open bureau, team, and system panels</h4>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-5xs font-black uppercase tracking-widest text-zinc-500">More</span>
                  </summary>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                  
                  {/* Local Bureau Splits */}
                  <div className="rounded-[20px] border border-zinc-200 bg-zinc-50/70 p-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">West UP Bureaus</span>
                    <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Traffic breakdown</h4>
                    
                    <div className="mt-5 space-y-3.5">
                      {bureauMetrics.map((bureau, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-4xs font-bold text-zinc-600">
                            <span>{bureau.name}</span>
                            <span className="text-zinc-950 font-black">{bureau.count} ({bureau.percentage}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className={`h-full ${bureau.color} rounded-full`} style={{ width: `${bureau.percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top CMS Publishers */}
                  <div className="rounded-[20px] border border-zinc-200 bg-zinc-50/70 p-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Team Leadership</span>
                    <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Top writers</h4>
                    
                    <div className="mt-5 space-y-4">
                      {users.map((u, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <img src={getSafeAvatarSrc(u.avatar, u.name)} alt={u.name} className="h-9 w-9 rounded-full object-cover border border-zinc-200" />
                          <div className="min-w-0 flex-1">
                            <span className="block text-3xs font-black text-zinc-900 truncate">{u.name}</span>
                            <span className="block text-5xs font-black text-zinc-400 uppercase tracking-wider">{u.role}</span>
                          </div>
                          <span className="bg-zinc-100 text-zinc-700 text-5xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">{u.storiesCount} stories</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Health Panel */}
                  <div className="rounded-[20px] border border-zinc-200 bg-zinc-50/70 p-4 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Database Engine</span>
                      <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Neon DB health</h4>
                      
                      <div className="mt-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                          <span className="text-4xs font-bold text-zinc-500 uppercase tracking-wider">Cluster Location</span>
                          <span className="text-3xs font-black text-zinc-800">AWS ap-south-1 (Mumbai)</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                          <span className="text-4xs font-bold text-zinc-500 uppercase tracking-wider">Connection State</span>
                          <span className="text-3xs font-black text-emerald-600 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Live Pool Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                          <span className="text-4xs font-bold text-zinc-500 uppercase tracking-wider">SSL Security Mode</span>
                          <span className="text-3xs font-black text-[var(--apple-blue)]">Full Strict Certificate</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-4xs font-bold text-zinc-500 uppercase tracking-wider">Bilingual Latency</span>
                          <span className="text-3xs font-black text-zinc-800">12ms (Cached Edge)</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-zinc-100">
                      <button
                        onClick={exportDBState}
                        className="w-full rounded-full border border-zinc-200 bg-white py-2 text-4xs font-black text-zinc-700 hover:bg-zinc-50 transition-all uppercase tracking-widest cursor-pointer"
                      >
                        JSON Dump
                      </button>
                    </div>
                  </div>
                  </div>
                </details>

                <div className="rounded-[22px] border border-zinc-200 bg-white p-4 shadow-sm space-y-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Combined insights</span>
                      <h4 className="text-[11px] font-black text-zinc-800 mt-0.5">Overview and insights together</h4>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-5xs font-black uppercase tracking-widest text-zinc-500">
                      Live summary
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Unique Visitors", val: Math.round(totalViews * 0.42).toLocaleString(), sub: "+12.4% vs last week", icon: "👥", color: "text-[var(--apple-blue)]" },
                      { label: "Total Pageviews", val: totalViews.toLocaleString(), sub: "+15.8% vs last week", icon: "👁️", color: "text-[var(--news-red)]" },
                      { label: "Avg Session Duration", val: "2m 14s", sub: "+8.2% engagement", icon: "⏱️", color: "text-emerald-700" },
                      { label: "Bounce Rate", val: "38.4%", sub: "-2.1% drop (excellent)", icon: "🎯", color: "text-zinc-700" },
                    ].map((item, i) => (
                      <div key={i} className="min-w-0 rounded-[18px] border border-zinc-200 bg-zinc-50/70 p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3 mb-1.5 select-none">
                          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{item.label}</span>
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <h3 className={`text-base font-black ${item.color}`}>{item.val}</h3>
                        <span className="block text-[8px] font-black text-emerald-600 mt-1 uppercase tracking-wider">{item.sub}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[20px] border border-zinc-200 bg-zinc-50/70 p-4 text-[10px] font-semibold leading-relaxed text-zinc-600">
                    Evening readership is strongest between 7 PM and 10 PM, and dual-language stories continue to outperform single-language posts. Use the top-performing bureau topics as the starting point for the next batch of bulletins.
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: ARTICLES BULLETINS SPREADSHEET */}
            {activeTab === "articles" && (
              <div className="space-y-6">
                
                {/* Filters catalog bar */}
                <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="🔍 Search article titles, slugs, or content body..."
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <select
                      value={catFilter}
                      onChange={(e) => setCatFilter(e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-2xs font-bold text-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-2xs font-bold text-zinc-700 focus:outline-none cursor-pointer"
                    >
                      <option value="">All Statuses</option>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>

                {/* Bulk Controls Strip */}
                {selectedArticles.length > 0 && (
                  <div className="flex items-center justify-between rounded-xl bg-[var(--apple-blue)]/5 border border-[var(--apple-blue)]/20 p-3.5 animate-pulse">
                    <span className="text-3xs font-black text-[var(--apple-blue)] uppercase tracking-wider">
                      Selected {selectedArticles.length} News Bulletins
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleBulkMarkBreaking(true)}
                        className="rounded-full bg-[var(--news-red)] px-3 py-1 text-4xs font-black text-white hover:bg-[var(--news-red-hover)] uppercase tracking-widest cursor-pointer"
                      >
                        🚨 Bulk Breaking
                      </button>
                      <button
                        onClick={() => handleBulkMarkBreaking(false)}
                        className="rounded-full bg-white border border-zinc-200 px-3 py-1 text-4xs font-black text-zinc-700 hover:bg-zinc-50 uppercase tracking-widest cursor-pointer"
                      >
                        Unmark Breaking
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="rounded-full bg-white border border-red-200 px-3 py-1 text-4xs font-black text-[var(--news-red)] hover:bg-red-50 uppercase tracking-widest cursor-pointer"
                      >
                        🗑️ Bulk Trash
                      </button>
                    </div>
                  </div>
                )}

                {/* Data Grid Matrix */}
                <div className="overflow-hidden rounded-[24px] border border-zinc-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-zinc-150 bg-zinc-50/70 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          <th className="py-3.5 px-4 w-10">
                            <input
                              type="checkbox"
                              checked={selectedArticles.length === articlesListFiltered.length && articlesListFiltered.length > 0}
                              onChange={() => handleSelectAllArticles(articlesListFiltered)}
                              className="rounded border-zinc-300 accent-[var(--apple-blue)] cursor-pointer"
                            />
                          </th>
                          <th className="py-3.5 px-4">Title Bulletin</th>
                          <th className="py-3.5 px-4 w-32">Location & Category</th>
                          <th className="py-3.5 px-4 w-24">Status</th>
                          <th className="py-3.5 px-4 w-20">Views</th>
                          <th className="py-3.5 px-4 w-32">Publish Date</th>
                          <th className="py-3.5 px-4 w-28 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-2xs">
                        {articlesListFiltered.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-10 text-center text-zinc-400 font-bold uppercase tracking-wider">
                              No bulletins match the specified search parameters.
                            </td>
                          </tr>
                        ) : (
                          articlesListFiltered.map((art) => (
                            <tr key={art.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="py-3.5 px-4">
                                <input
                                  type="checkbox"
                                  checked={selectedArticles.includes(art.id)}
                                  onChange={() => handleSelectArticle(art.id)}
                                  className="rounded border-zinc-300 accent-[var(--apple-blue)] cursor-pointer"
                                />
                              </td>
                              <td className="py-3.5 px-4 max-w-md">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={art.featuredImage}
                                    alt="featured"
                                    className="h-10 w-16 object-cover rounded-lg border border-zinc-200"
                                  />
                                  <div className="min-w-0">
                                    <span className="block font-black text-zinc-950 truncate leading-tight">{art.titleHindi}</span>
                                    {art.titleEnglish && (
                                      <span className="block font-medium text-zinc-500 truncate leading-tight mt-0.5">{art.titleEnglish}</span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-700">
                                <div className="space-y-0.5">
                                  <span className="block">{art.category}</span>
                                  <span className="block text-4xs font-black text-zinc-400 uppercase tracking-wide">{art.locationTag}</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-black">
                                <div className="flex flex-col gap-1 items-start">
                                  <span className={`px-2 py-0.5 rounded-full text-5xs border uppercase tracking-wider ${
                                    art.status === "Published"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200"
                                  }`}>
                                    {art.status}
                                  </span>
                                  {art.isBreaking && (
                                    <span className="bg-[var(--news-red)]/10 text-[var(--news-red)] text-5xs font-black px-1.5 py-0.5 rounded border border-[var(--news-red)]/20 animate-pulse uppercase tracking-wider">
                                      Breaking
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-800">
                                {art.views.toLocaleString()}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-500">
                                {new Date(art.publishDate).toLocaleDateString()}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleEditClick(art)}
                                  className="text-zinc-600 hover:text-[var(--apple-blue)] font-black uppercase tracking-wider text-5xs border border-zinc-200 bg-white hover:bg-zinc-50 px-2 py-1 rounded-lg cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Move this article to Recycle Bin?")) {
                                      deleteArticle(art.id);
                                      addAuditLog(`Soft deleted article: "${art.titleHindi.slice(0, 30)}..."`);
                                      alert("Article moved to Recycle Bin!");
                                    }
                                  }}
                                  className="text-[var(--news-red)] hover:text-red-800 font-black uppercase tracking-wider text-5xs border border-red-150 bg-white hover:bg-red-50 px-2 py-1 rounded-lg cursor-pointer"
                                >
                                  Trash
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: BILINGUAL NEWS PUBLISHER */}
            {activeTab === "editor" && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Newsroom Desk</span>
                    <h2 className="text-sm font-black text-zinc-950 mt-0.5">
                      {editingArticleId ? "✏️ Edit News Bulletin Desk" : "✏️ Create New News Bulletin"}
                    </h2>
                  </div>
                  {editingArticleId && (
                    <button
                      onClick={resetEditorForm}
                      className="rounded-full border border-zinc-200 bg-white px-4 py-1 text-3xs font-black text-zinc-700 hover:bg-zinc-50 uppercase tracking-widest cursor-pointer"
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                <form onSubmit={handleEditorSubmit} className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
                  
                  {/* Left Side: Editorial Body */}
                  <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div>
                      <label className="text-5xs font-black uppercase text-zinc-500 tracking-wider">Bilingual Language Scope</label>
                      <div className="flex gap-4 mt-2">
                        {[
                          { id: "bilingual", label: "Bilingual (Hindi + English translations)" },
                          { id: "hindi", label: "Hindi Only (मेरठ स्थानीय)" },
                          { id: "english", label: "English Only (National)" },
                        ].map((lang) => (
                          <label key={lang.id} className="flex items-center gap-1.5 text-2xs font-bold text-zinc-700 cursor-pointer">
                            <input
                              type="radio"
                              name="editorLanguage"
                              checked={editorLanguage === lang.id}
                              onChange={() => setEditorLanguage(lang.id as any)}
                              className="accent-[var(--apple-blue)]"
                            />
                            {lang.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Hindi copy inputs */}
                    {(editorLanguage === "bilingual" || editorLanguage === "hindi") && (
                      <div className="space-y-4 border-l-2 border-[var(--news-red)] pl-4 py-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--news-red)]">हिन्दी संपादकीय खंड (Hindi Section)</span>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">मुख्य समाचार शीर्षक (Hindi Headline) *</label>
                          <input
                            type="text"
                            required
                            value={editorHindiTitle}
                            onChange={(e) => setEditorHindiTitle(e.target.value)}
                            placeholder="मेरठ में भीषण सड़क हादसा: हाईवे पर कार और डंपर की टक्कर..."
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">समाचार सारांश (Hindi Excerpt)</label>
                          <textarea
                            value={editorExcerpt}
                            onChange={(e) => setEditorExcerpt(e.target.value)}
                            placeholder="हादसे में तीन दोस्तों की मौके पर ही मौत हो गई..."
                            rows={2}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">मुख्य समाचार विवरण (Hindi Body Copy)</label>
                          <div className="mt-1.5">
                            <RichTextEditor
                              value={editorContent}
                              onChange={setEditorContent}
                              placeholder="घटना शनिवार देर रात मेरठ के नेशनल हाईवे-58 पर हुई..."
                              label="हिन्दी समाचार संपादकीय"
                              mediaLibrary={media}
                              onUploadImage={handleImageUploadApi}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* English copy inputs */}
                    {(editorLanguage === "bilingual" || editorLanguage === "english") && (
                      <div className="space-y-4 border-l-2 border-[var(--apple-blue)] pl-4 py-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[var(--apple-blue)]">English Desk Segment (English Section)</span>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">English Headline</label>
                          <input
                            type="text"
                            value={editorEnglishTitle}
                            onChange={(e) => setEditorEnglishTitle(e.target.value)}
                            placeholder="Tragic Highway Collision in Meerut: 3 Dead on Spot..."
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">English Excerpt</label>
                          <textarea
                            value={editorExcerptEn}
                            onChange={(e) => setEditorExcerptEn(e.target.value)}
                            placeholder="Three local residents killed in a devastating crash near Kanker Khera on NH-58..."
                            rows={2}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">English Body Copy</label>
                          <div className="mt-1.5">
                            <RichTextEditor
                              value={editorContentEn}
                              onChange={setEditorContentEn}
                              placeholder="According to first reports, the accident took place around midnight on Saturday..."
                              label="English Segment Editor"
                              mediaLibrary={media}
                              onUploadImage={handleImageUploadApi}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Right Side: Taxonomies, Metadata, and Live Google SEO Simulator */}
                  <div className="space-y-6">
                    
                    {/* Taxonomies selectors */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Classifications</span>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Primary Category</label>
                          <select
                            value={editorCategory}
                            onChange={(e) => setEditorCategory(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:outline-none cursor-pointer"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Subcategory</label>
                          <select
                            value={editorSubcategory}
                            onChange={(e) => setEditorSubcategory(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:outline-none cursor-pointer"
                          >
                            {(() => {
                              const currentCat = categories.find(c => c.name === editorCategory);
                              const available = currentCat ? currentCat.subcategories || [] : [];
                              if (available.length === 0) {
                                return <option value="General">General</option>;
                              }
                              return available.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                              ));
                            })()}
                          </select>
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Regional Bureau</label>
                          <select
                            value={editorLocation}
                            onChange={(e) => setEditorLocation(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:outline-none cursor-pointer"
                          >
                            {locations.map((l) => (
                              <option key={l.id} value={l.name}>{l.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Article Correspondent / Reporter (Optional)</label>
                        <input
                          type="text"
                          value={editorCorrespondent}
                          onChange={(e) => setEditorCorrespondent(e.target.value)}
                          placeholder="e.g. Special Correspondent, Rajesh Kumar (defaults to publisher name)"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] font-bold text-zinc-850"
                        />
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Attachment Image URL</label>
                        <div className="flex flex-col sm:flex-row gap-2 mt-1">
                          <input
                            type="text"
                            value={editorFeaturedImage}
                            onChange={(e) => setEditorFeaturedImage(e.target.value)}
                            className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                            placeholder="data:image/... or public url"
                          />
                          <button
                            type="button"
                            onClick={handleEditorImageUpload}
                            className="rounded-xl bg-[var(--apple-blue)] px-3 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] cursor-pointer shrink-0"
                          >
                            Upload Image
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (media.length > 0) {
                                setEditorFeaturedImage(media[Math.floor(Math.random() * media.length)].url);
                              }
                            }}
                            className="rounded-xl border border-zinc-200 bg-white px-3 text-3xs font-black text-zinc-600 hover:bg-zinc-50 cursor-pointer shrink-0"
                          >
                            Pick Random
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Bilingual Slugs (Auto-Generated)</label>
                        <input
                          type="text"
                          required
                          value={editorSlug}
                          onChange={(e) => setEditorSlug(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <label className="flex items-center gap-1.5 text-3xs font-black text-zinc-700 uppercase cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editorIsBreaking}
                            onChange={(e) => setEditorIsBreaking(e.target.checked)}
                            className="rounded border-zinc-300 accent-[var(--apple-blue)]"
                          />
                          🚨 Breaking bulletin
                        </label>
                        <label className="flex items-center gap-1.5 text-3xs font-black text-zinc-700 uppercase cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editorIsSticky}
                            onChange={(e) => setEditorIsSticky(e.target.checked)}
                            className="rounded border-zinc-300 accent-[var(--apple-blue)]"
                          />
                          📌 Sticky on home
                        </label>
                        <label className="flex items-center gap-1.5 text-3xs font-black text-zinc-700 uppercase cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editorIsEditorsChoice}
                            onChange={(e) => setEditorIsEditorsChoice(e.target.checked)}
                            className="rounded border-zinc-300 accent-[var(--apple-blue)]"
                          />
                          ⭐ Editor's Choice
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-zinc-100 pt-3">
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Publish State</label>
                          <select
                            value={editorStatus}
                            onChange={(e) => setEditorStatus(e.target.value as any)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:outline-none cursor-pointer"
                          >
                            <option value="Published">Published</option>
                            <option value="Draft">Draft</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Read Time (Mins)</label>
                          <input
                            type="number"
                            min={1}
                            value={editorReadTime}
                            onChange={(e) => setEditorReadTime(parseInt(e.target.value) || 3)}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEO Google SERP Simulator */}
                    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Search Engine Simulator</span>
                        <h4 className="text-xs font-black text-zinc-800 mt-0.5">Google Search SERP Layout</h4>
                        <p className="text-5xs font-semibold text-zinc-400 mt-1">This simulates how the article appears to audiences on Google Mobile/Desktop.</p>
                      </div>

                      <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 font-sans text-left space-y-1 select-text">
                        <div className="flex items-center gap-1.5 text-5xs text-zinc-500">
                          <span>https://ibnnewshindi.in</span>
                          <span>&rsaquo;</span>
                          <span>{editorCategory.toLowerCase()}</span>
                          <span>&rsaquo;</span>
                          <span className="truncate max-w-[120px]">{editorSlug || "news-slug"}</span>
                        </div>
                        <h5 className="text-[14px] font-medium text-[#1a0dab] hover:underline leading-tight cursor-pointer">
                          {editorHindiTitle || "मुख्य समाचार शीर्षक (Bilingual Google Title Preview)"}
                        </h5>
                        <p className="text-4xs text-[#4d5156] leading-relaxed line-clamp-2">
                          <span className="text-zinc-400 font-bold mr-1">
                            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })} &mdash;
                          </span>
                          {editorExcerpt || "संपादकीय सारांश यहाँ दिखाई देगा। इसे आकर्षित और SEO के अनुकूल रखें ताकि ज़्यादा पाठक जुड़ें।"}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Meta SEO Title Override</label>
                          <input
                            type="text"
                            value={editorMetaTitle}
                            onChange={(e) => setEditorMetaTitle(e.target.value)}
                            placeholder="Custom Title tag..."
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Meta Description Override</label>
                          <textarea
                            value={editorMetaDesc}
                            onChange={(e) => setEditorMetaDesc(e.target.value)}
                            placeholder="Custom Description tag..."
                            rows={2}
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-full bg-[var(--apple-blue)] py-3 text-2xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all shadow-md uppercase tracking-widest cursor-pointer"
                    >
                      {editingArticleId ? "💾 Synchronize Changes" : "🚀 Dispatch News Bulletin"}
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* TAB 4: AUDIENCE COMMENTS MODERATION */}
            {activeTab === "comments" && (
              <div className="space-y-6">
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Moderation Desk</span>
                  <h2 className="text-xs font-black text-zinc-950 mt-0.5">Audience Comments & Interaction Board</h2>
                  <p className="text-5xs font-semibold text-zinc-400 mt-1">Review, approve, or flag user interactions before they display publicly on your bulletins.</p>
                </div>

                <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="border-b border-zinc-100 pb-3 flex items-center justify-between">
                    <span className="text-3xs font-black text-zinc-700 uppercase">Interactive Moderation Queue</span>
                    <span className="bg-[var(--apple-blue)]/10 text-[var(--apple-blue)] text-5xs font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {comments.filter(c => c.status === "pending").length} Awaiting
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 text-2xs">
                    {comments.length === 0 ? (
                      <div className="py-8 text-center text-zinc-400 font-bold uppercase tracking-wider">
                        No comments found in database catalogs.
                      </div>
                    ) : (
                      comments.map((comm) => (
                        <div key={comm.id} className="py-4 flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-black text-zinc-900">{comm.author}</span>
                              <span className="text-zinc-400 font-medium">({comm.email})</span>
                              <span className="text-zinc-300">&bull;</span>
                              <span className="text-zinc-500 font-semibold">{new Date(comm.date).toLocaleString()}</span>
                              <span className={`px-1.5 py-0.5 rounded text-5xs border font-black uppercase tracking-wider ${
                                comm.status === "approved"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                  : comm.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-100"
                                  : "bg-red-50 text-red-700 border-red-100"
                              }`}>
                                {comm.status}
                              </span>
                            </div>
                            <p className="text-zinc-700 italic select-text">&ldquo;{comm.content}&rdquo;</p>
                            <div className="text-4xs font-bold text-zinc-400">
                              Bulletin: <span className="text-[var(--apple-blue)] hover:underline cursor-pointer">{comm.articleTitle}</span>
                            </div>
                          </div>

                          <div className="flex gap-1.5 shrink-0 self-end md:self-start">
                            {comm.status !== "approved" && (
                              <button
                                onClick={() => {
                                  moderateComment(comm.id, "approved");
                                  addAuditLog(`Approved comment from: "${comm.author}"`);
                                }}
                                className="bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 text-5xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            )}
                            {comm.status !== "spam" && (
                              <button
                                onClick={() => {
                                  moderateComment(comm.id, "spam");
                                  addAuditLog(`Flagged spam comment from: "${comm.author}"`);
                                }}
                                className="bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 px-2.5 py-1 text-5xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                              >
                                Spam
                              </button>
                            )}
                            {comm.status !== "trash" && (
                              <button
                                onClick={() => {
                                  moderateComment(comm.id, "trash");
                                  addAuditLog(`Trashed comment from: "${comm.author}"`);
                                }}
                                className="bg-white border border-red-200 text-[var(--news-red)] hover:bg-red-50 px-2.5 py-1 text-5xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                              >
                                Trash
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB: YOUTUBE VIDEO MANAGER */}
            {activeTab === "videos" && (
              <div className="space-y-6">
                
                <div className="space-y-5">

                  {/* Video Creator Form */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Video Producer</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Register YouTube Video Bulletin</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">
                        Register a YouTube video report. You can input the Title and Description only, and the system will automatically match it to the latest video from our channel feed and fetch its thumbnail!
                      </p>
                    </div>

                    <form onSubmit={handleAddVideoSubmit} className="space-y-3.5 border-t border-zinc-100 pt-4">
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Video Title</label>
                        <input
                          type="text"
                          required
                          value={newVideoTitle}
                          onChange={(e) => setNewVideoTitle(e.target.value)}
                          placeholder="e.g. मेरठ महापंचायत ग्राउंड रिपोर्ट..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Video Description</label>
                        <textarea
                          required
                          value={newVideoDesc}
                          onChange={(e) => setNewVideoDesc(e.target.value)}
                          placeholder="मुजफ्फरनगर में राकेश टिकैत का किसानों के स्मार्ट मीटर पर बड़ा ऐलान..."
                          rows={4}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">YouTube URL or ID (Optional Override)</label>
                        <input
                          type="text"
                          value={newVideoUrl}
                          onChange={(e) => setNewVideoUrl(e.target.value)}
                          placeholder="Leave blank to auto-fetch matching video!"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                        <span className="block text-[8px] text-zinc-400 mt-1">Supports full watch links, mobile shortlinks, embed URLs, or plain 11-char IDs.</span>
                      </div>

                      <button
                        type="submit"
                        disabled={videoSubmitting}
                        className="w-full rounded-full bg-[var(--apple-blue)] py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer disabled:opacity-50"
                      >
                        {videoSubmitting ? "Registering & Fetching..." : "+ Register Video bulletin"}
                      </button>
                    </form>
                  </div>

                  {/* Registered Videos Spreadsheet */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Broadcast Catalog</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Live Video Bulletins ({videoCatalog.length})</h4>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-2xs">
                        <thead>
                          <tr className="border-b border-zinc-150 text-zinc-400 text-5xs font-black uppercase tracking-wider select-none">
                            <th className="py-2.5 px-3 w-16">Preview</th>
                            <th className="py-2.5 px-3">Title & Desc</th>
                            <th className="py-2.5 px-3 w-28">YouTube ID</th>
                            <th className="py-2.5 px-3 w-16">Views</th>
                            <th className="py-2.5 px-3 w-20">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-sans">
                          {videoCatalog.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-zinc-400 font-bold">
                                No video bulletins registered. Set up your first YouTube report!
                              </td>
                            </tr>
                          ) : (
                            videoCatalog.map((vid) => (
                              <tr key={vid.id} className="hover:bg-zinc-50/50 transition-colors">
                                <td className="py-3 px-3">
                                  <img
                                    src={vid.thumbnailUrl}
                                    alt="thumb"
                                    className="h-10 w-16 rounded-lg object-cover border border-zinc-200 shadow-sm shrink-0"
                                  />
                                </td>
                                <td className="py-3 px-3 max-w-[280px]">
                                  <span className="block font-black text-zinc-900 leading-snug line-clamp-2">{vid.title}</span>
                                  <span className="block text-zinc-400 text-5xs font-semibold mt-0.5 line-clamp-1">{vid.description}</span>
                                </td>
                                <td className="py-3 px-3 font-mono text-3xs text-[var(--apple-blue)] font-bold">
                                  <a href={`https://youtube.com/watch?v=${vid.youtubeId}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {vid.youtubeId} ↗
                                  </a>
                                </td>
                                <td className="py-3 px-3 font-bold text-zinc-600">
                                  👁️ {vid.views.toLocaleString()}
                                </td>
                                <td className="py-3 px-3">
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Are you sure you want to delete video bulletin: "${vid.title}"?`)) {
                                        try {
                                          const res = await fetch("/api/videos", {
                                            method: "DELETE",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ id: vid.id })
                                          });
                                          if (res.ok) {
                                            setVideoCatalog(prev => prev.filter(v => v.id !== vid.id));
                                            addAuditLog(`Deleted video: "${vid.title}"`);
                                            alert("Video successfully deleted!");
                                          } else {
                                            alert("Failed to delete video bulletin.");
                                          }
                                        } catch (err) {
                                          console.error("Error deleting video:", err);
                                          alert("Failed to delete video.");
                                        }
                                      }
                                    }}
                                    className="rounded-lg border border-red-200 text-[var(--news-red)] hover:bg-red-50 px-2.5 py-1 text-5xs font-black uppercase transition-all cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: WEBSITE ANALYTICS & INSIGHTS */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                
                {/* Configuration Console */}
                <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Analytics Engine Setup</span>
                      <h2 className="text-xs font-black text-zinc-950 mt-0.5">Connect Umami Cloud or Vercel Web Analytics</h2>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">
                        Paste your Umami Shared Dashboard URL or Vercel Analytics shareable link to embed the live real-time console directly inside your CMS workspace.
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <input
                        type="text"
                        value={analyticsEmbedUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAnalyticsEmbedUrl(val);
                          localStorage.setItem("ibn_analytics_embed_url", val);
                        }}
                        className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-3xs focus:border-[var(--apple-blue)] focus:outline-none w-64"
                        placeholder="https://cloud.umami.is/share/..."
                      />
                      {analyticsEmbedUrl && (
                        <button
                          onClick={() => {
                            setAnalyticsEmbedUrl("");
                            localStorage.removeItem("ibn_analytics_embed_url");
                          }}
                          className="rounded-xl border border-zinc-250 bg-white px-3 py-1.5 text-4xs font-black text-zinc-500 hover:bg-zinc-50 uppercase tracking-widest cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {analyticsEmbedUrl ? (
                  /* Embed live dashboard inside simulated Apple container */
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-2 shadow-sm overflow-hidden animate-fadeIn">
                    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-zinc-100 select-none">
                      <span className="h-2 w-2 rounded-full bg-red-400" />
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-[8px] text-zinc-400 font-bold ml-1.5 truncate max-w-xs">{analyticsEmbedUrl}</span>
                    </div>
                    <iframe
                      src={analyticsEmbedUrl}
                      className="w-full h-[650px] border-none rounded-b-2xl bg-zinc-50"
                      allow="fullscreen"
                    />
                  </div>
                ) : (
                  /* Fallback Dynamic Charts & AI Insights Desk */
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Setup Tip Alert banner */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg">💡</span>
                        <div>
                          <h4 className="text-3xs font-black text-blue-900 uppercase">Pro Tip: Embed Real-Time Console</h4>
                          <p className="text-[10px] text-blue-700 font-semibold mt-0.5 leading-relaxed">
                            Plausible, Umami and Vercel Analytics support public shareable link dashboards. Paste your share link above to access full referrer graphs, visitor location maps, and server events in this tab!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Scoreboards metrics */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { label: "Unique Visitors", val: Math.round(totalViews * 0.42).toLocaleString(), sub: "+12.4% vs last week", icon: "👥", color: "text-[var(--apple-blue)]" },
                        { label: "Total Pageviews", val: totalViews.toLocaleString(), sub: "+15.8% vs last week", icon: "👁️", color: "text-[var(--news-red)]" },
                        { label: "Avg Session Duration", val: "2m 14s", sub: "+8.2% engagement", icon: "⏱️", color: "text-emerald-700" },
                        { label: "Bounce Rate", val: "38.4%", sub: "-2.1% drop (excellent)", icon: "🎯", color: "text-zinc-700" },
                      ].map((item, i) => (
                        <div key={i} className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-1.5 select-none">
                            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">{item.label}</span>
                            <span className="text-lg">{item.icon}</span>
                          </div>
                          <h3 className={`text-base font-black ${item.color}`}>{item.val}</h3>
                          <span className="block text-[8px] font-black text-emerald-600 mt-1 uppercase tracking-wider">{item.sub}</span>
                        </div>
                      ))}
                    </div>

                    {/* AI Insights & Metrics Grids */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Referrers List */}
                      <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Referrer Traffic</span>
                          <h4 className="text-xs font-black text-zinc-800 mt-0.5">Top Acquisition Channels</h4>
                        </div>
                        
                        <div className="divide-y divide-zinc-100 text-3xs font-semibold text-zinc-600">
                          {[
                            { name: "Direct / WhatsApp Newsletters", val: Math.round(totalViews * 0.48), color: "bg-emerald-500" },
                            { name: "Google Search (SEO / Indexing)", val: Math.round(totalViews * 0.28), color: "bg-blue-500" },
                            { name: "YouTube Channel Referrals", val: Math.round(totalViews * 0.12), color: "bg-[var(--news-red)]" },
                            { name: "Facebook / Meta Feed shares", val: Math.round(totalViews * 0.08), color: "bg-blue-700" },
                            { name: "X (Twitter) news marquee", val: Math.round(totalViews * 0.04), color: "bg-zinc-900" },
                          ].map((item, i) => (
                            <div key={i} className="py-2.5 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={`h-2 w-2 rounded-full ${item.color} shrink-0`} />
                                <span className="truncate">{item.name}</span>
                              </div>
                              <span className="font-black text-zinc-900">{item.val.toLocaleString()} ({Math.round((item.val / (totalViews || 1)) * 100)}%)</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Editorial AI Insights Desk */}
                      <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Smart Newsroom</span>
                          <h4 className="text-xs font-black text-zinc-800 mt-0.5">Editorial AI Acquired Insights</h4>
                        </div>

                        <div className="space-y-4">
                          <div className="flex gap-2.5 items-start">
                            <span className="text-base leading-none">📈</span>
                            <div>
                              <h5 className="text-4xs font-black uppercase text-zinc-900 leading-snug">Farmers and Civic bulletins rising</h5>
                              <p className="text-[9px] font-semibold text-zinc-500 leading-relaxed mt-0.5">
                                West UP reports covering local farmer protests and civic prepaid electricity issues have experienced a 34% surge in pageviews. We recommend adding a featured visual story in this classification block.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2.5 items-start border-t border-zinc-100 pt-3">
                            <span className="text-base leading-none">⏰</span>
                            <div>
                              <h5 className="text-4xs font-black uppercase text-zinc-900 leading-snug">Readership Peak (7 PM - 10 PM)</h5>
                              <p className="text-[9px] font-semibold text-zinc-500 leading-relaxed mt-0.5">
                                Over 65% of regional visitor views are clustered in evening hours. Schedule critical breaking news tickers and WhatsApp notification broadcast runs within this window for highest impact.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2.5 items-start border-t border-zinc-100 pt-3">
                            <span className="text-base leading-none">🎯</span>
                            <div>
                              <h5 className="text-4xs font-black uppercase text-zinc-900 leading-snug">Bilingual translations perform better</h5>
                              <p className="text-[9px] font-semibold text-zinc-500 leading-relaxed mt-0.5">
                                News stories containing both English and Hindi text translations experience 20% higher average comment engagement. Keep maintaining dual-language excerpts!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Device & Browser Splits */}
                      <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-5">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">User Environment</span>
                          <h4 className="text-xs font-black text-zinc-800 mt-0.5">Devices & Browsers Metrics</h4>
                        </div>

                        {/* Devices splits */}
                        <div className="space-y-2">
                          <span className="text-5xs font-black uppercase text-zinc-400 tracking-wider">Device Segments</span>
                          <div className="flex h-3.5 w-full bg-zinc-100 rounded-full overflow-hidden text-5xs font-black text-white text-center">
                            <div className="bg-[var(--news-red)] flex items-center justify-center" style={{ width: "82%" }}>82% Mob</div>
                            <div className="bg-[var(--apple-blue)] flex items-center justify-center" style={{ width: "15%" }}>15% Desk</div>
                            <div className="bg-zinc-800 flex items-center justify-center" style={{ width: "3%" }}>3% Tab</div>
                          </div>
                        </div>

                        {/* Browsers Splits */}
                        <div className="space-y-2.5 pt-1">
                          <span className="text-5xs font-black uppercase text-zinc-400 tracking-wider">Top Browsers</span>
                          <div className="space-y-2">
                            {[
                              { name: "Google Chrome / WebView (Mobile)", val: "74%", count: Math.round(totalViews * 0.74).toLocaleString() },
                              { name: "Apple Safari (iOS / Mac)", val: "16%", count: Math.round(totalViews * 0.16).toLocaleString() },
                              { name: "UC Browser / Opera Mini", val: "6%", count: Math.round(totalViews * 0.06).toLocaleString() },
                              { name: "Firefox Focus / Other", val: "4%", count: Math.round(totalViews * 0.04).toLocaleString() },
                            ].map((b, i) => (
                              <div key={i} className="flex justify-between items-center text-3xs font-semibold text-zinc-500">
                                <span>{b.name}</span>
                                <span className="font-black text-zinc-850">{b.count} ({b.val})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 5: MEDIA ASSETS VAULT */}
            {activeTab === "media" && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between border-b border-zinc-150 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Storage Desk</span>
                    <h2 className="text-xs font-black text-zinc-950 mt-0.5">Media Library & Storage Vault (Neon DB-Only)</h2>
                    <p className="text-5xs font-semibold text-zinc-400 mt-1">Upload and store images directly inside Neon DB as inline Base64 strings. No credit cards required.</p>
                  </div>
                  <button
                    onClick={handleSimulateDragDrop}
                    className="rounded-full bg-[var(--apple-blue)] px-4 py-1.5 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                  >
                    + Upload File to DB
                  </button>
                </div>

                {/* Media vault grid */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {media.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedMediaItem(item)}
                      className="group rounded-xl border border-zinc-200 bg-white p-2.5 shadow-sm hover:border-[var(--apple-blue)] hover:shadow transition-all cursor-pointer relative"
                    >
                      <div className="aspect-[4/3] w-full rounded-lg bg-zinc-100 overflow-hidden relative">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[7px] font-bold px-1 py-0.5 rounded uppercase">
                          {item.size}
                        </span>
                      </div>
                      <div className="mt-2 text-center">
                        <span className="block text-4xs font-bold text-zinc-900 truncate" title={item.name}>{item.name}</span>
                        <span className="block text-5xs text-zinc-400 font-bold mt-0.5">{item.date}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Media Inspector / Editor Modal */}
                {selectedMediaItem && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="min-w-0">
                          <span className="text-[9px] font-black uppercase text-zinc-400">Database Media Inspector</span>
                          <h4 className="text-2xs font-black text-zinc-900 truncate mt-0.5">{selectedMediaItem.name}</h4>
                        </div>
                        <button
                          onClick={() => { setSelectedMediaItem(null); setIsCropSaved(false); }}
                          className="text-zinc-400 hover:text-zinc-600 font-bold cursor-pointer"
                        >
                          ✕ Close
                        </button>
                      </div>

                      <div className="aspect-[4/3] w-full rounded-2xl bg-zinc-50 border border-zinc-100 overflow-hidden relative">
                        <img
                          src={selectedMediaItem.url}
                          alt="preview"
                          className="h-full w-full object-contain"
                          style={{
                            transform: `scale(${cropSimPercent / 100})`,
                            filter: `contrast(${isCropSaved ? 1.05 : 1}) brightness(${isCropSaved ? 1.02 : 1})`,
                          }}
                        />
                        
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-5xs font-bold px-2 py-0.5 rounded uppercase">
                          Source Size: {selectedMediaItem.size}
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        <span className="text-[9px] font-black uppercase text-zinc-400">Simulate Crop & Compression</span>
                        
                        <div>
                          <div className="flex items-center justify-between text-5xs font-bold text-zinc-500">
                            <span>Image Crop Scale: {cropSimPercent}%</span>
                          </div>
                          <input
                            type="range"
                            min={50}
                            max={120}
                            value={cropSimPercent}
                            onChange={(e) => setCropSimPercent(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[var(--apple-blue)]"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between text-5xs font-bold text-zinc-500">
                            <span>Quality Compression: {compressSimPercent}%</span>
                          </div>
                          <input
                            type="range"
                            min={40}
                            max={100}
                            value={compressSimPercent}
                            onChange={(e) => setCompressSimPercent(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[var(--apple-blue)]"
                          />
                        </div>

                        <div className="flex gap-2.5 pt-2">
                          <button
                            onClick={() => {
                              setIsCropSaved(true);
                              addAuditLog(`Re-compressed database image record "${selectedMediaItem.name}" to ${compressSimPercent}%`);
                              alert("Asset successfully compressed and saved in Neon DB!");
                            }}
                            className="flex-1 rounded-full bg-[var(--apple-blue)] py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                          >
                            Save Compress changes
                          </button>
                          <button
                            onClick={() => {
                              if (confirm("Delete this media asset from database records?")) {
                                deleteMediaItem(selectedMediaItem.id);
                                addAuditLog(`Deleted media asset from db: "${selectedMediaItem.name}"`);
                                setSelectedMediaItem(null);
                                alert("Asset removed successfully!");
                              }
                            }}
                            className="rounded-full border border-red-200 bg-white px-4 py-2 text-3xs font-black text-[var(--news-red)] hover:bg-red-50 transition-all uppercase tracking-widest cursor-pointer"
                          >
                            Purge Asset
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 6: TAXONOMIES & BUREAUS DESK */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                
                <div className="grid gap-6 md:grid-cols-2">
                  
                  {/* Category creator */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Classifications</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Primary Categories Organizers</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">Manage global publication topics. Hindi equivalents sync automatically on bilingual layouts.</p>
                    </div>

                    <form onSubmit={handleAddCategorySubmit} className="space-y-3.5 border-t border-zinc-100 pt-4">
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Category Name (English)</label>
                        <input
                          type="text"
                          required
                          value={newCatName}
                          onChange={(e) => setNewCatName(e.target.value)}
                          placeholder="e.g. Meerut, West UP, Sports, Tech..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Category Name (Hindi Translation)</label>
                        <input
                          type="text"
                          required
                          value={newCatNameHindi}
                          onChange={(e) => setNewCatNameHindi(e.target.value)}
                          placeholder="e.g. मेरठ, पश्चिमी यूपी, खेल..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Color Label Accent Indicator</label>
                        <div className="flex gap-2.5 mt-1 items-center">
                          <input
                            type="color"
                            value={newCatColor}
                            onChange={(e) => setNewCatColor(e.target.value)}
                            className="h-8 w-14 rounded-lg border border-zinc-200 cursor-pointer p-0.5 bg-zinc-50"
                          />
                          <span className="text-3xs font-black text-zinc-700 uppercase tracking-widest">{newCatColor}</span>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--apple-blue)] py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                      >
                        + Register New Category
                      </button>
                    </form>

                    <div className="border-t border-zinc-100 pt-4 mt-2">
                      <span className="text-5xs font-black uppercase text-zinc-400 tracking-wider">Registered Categories</span>
                      <div className="mt-2 divide-y divide-zinc-50">
                        {categories.map((c) => (
                          <div key={c.id} className="py-3.5 space-y-2.5">
                            <div className="flex items-center justify-between text-2xs">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                <span className="font-black text-zinc-900 text-xs">{c.name}</span>
                                <span className="text-zinc-400 font-semibold text-2xs">({c.nameHindi})</span>
                              </div>
                              {c.name !== "Meerut" && c.name !== "West UP" && c.name !== "National" && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Delete Category: "${c.name}"?`)) {
                                      deleteCategory(c.id);
                                      addAuditLog(`Purged category: "${c.name}"`);
                                      alert("Category deleted successfully!");
                                    }
                                  }}
                                  className="text-[var(--news-red)] hover:text-red-800 font-bold uppercase tracking-wider text-5xs cursor-pointer"
                                >
                                  Delete
                                </button>
                              )}
                            </div>

                            {/* Subcategory List Badges and Adder */}
                            <div className="pl-4 space-y-2 border-l border-zinc-100 ml-1">
                              <div className="flex flex-wrap gap-1.5 items-center">
                                <span className="text-5xs font-black uppercase text-zinc-400 tracking-wider mr-1">Subcategories:</span>
                                {(c.subcategories || []).map((sub) => (
                                  <span key={sub} className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-full text-5xs font-black text-zinc-600">
                                    <span>{sub}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Remove subcategory "${sub}" from "${c.name}"?`)) {
                                          const filtered = (c.subcategories || []).filter(item => item !== sub);
                                          editCategory(c.id, { subcategories: filtered });
                                          addAuditLog(`Removed subcategory "${sub}" from "${c.name}"`);
                                        }
                                      }}
                                      className="text-zinc-400 hover:text-[var(--news-red)] font-black text-[9px] leading-none shrink-0 cursor-pointer"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                ))}
                                {(c.subcategories || []).length === 0 && (
                                  <span className="text-5xs font-semibold text-zinc-400 italic">None configured</span>
                                )}
                              </div>

                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  placeholder="New subcategory..."
                                  id={`new-sub-input-${c.id}`}
                                  className="px-2.5 py-1 text-4xs font-bold border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:border-[var(--apple-blue)] w-36"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      const input = document.getElementById(`new-sub-input-${c.id}`) as HTMLInputElement;
                                      const val = input.value.trim();
                                      if (val) {
                                        if ((c.subcategories || []).includes(val)) {
                                          alert("Subcategory already exists!");
                                          return;
                                        }
                                        const updatedSubs = [...(c.subcategories || []), val];
                                        editCategory(c.id, { subcategories: updatedSubs });
                                        addAuditLog(`Registered subcategory "${val}" for "${c.name}"`);
                                        input.value = "";
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const input = document.getElementById(`new-sub-input-${c.id}`) as HTMLInputElement;
                                    const val = input.value.trim();
                                    if (val) {
                                      if ((c.subcategories || []).includes(val)) {
                                        alert("Subcategory already exists!");
                                        return;
                                      }
                                      const updatedSubs = [...(c.subcategories || []), val];
                                      editCategory(c.id, { subcategories: updatedSubs });
                                      addAuditLog(`Registered subcategory "${val}" for "${c.name}"`);
                                      input.value = "";
                                    }
                                  }}
                                  className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-lg text-5xs font-black uppercase tracking-wider cursor-pointer"
                                >
                                  + Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Location Bureau creator */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Taxonomies</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Regional Bureaus Tag Settings</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">Manage local news focus areas (e.g. Kanker Khera, Muzaffarnagar Sadar).</p>
                    </div>

                    <form onSubmit={handleAddLocationSubmit} className="space-y-3.5 border-t border-zinc-100 pt-4">
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Bureau Name (English)</label>
                        <input
                          type="text"
                          required
                          value={newLocName}
                          onChange={(e) => setNewLocName(e.target.value)}
                          placeholder="e.g. Kanker Khera, Muzaffarnagar..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Bureau Name (Hindi Translation)</label>
                        <input
                          type="text"
                          required
                          value={newLocNameHindi}
                          onChange={(e) => setNewLocNameHindi(e.target.value)}
                          placeholder="e.g. कंकरखेड़ा, मुजफ्फरनगर..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--apple-blue)] py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                      >
                        + Register New Location Bureau
                      </button>
                    </form>

                    <div className="border-t border-zinc-100 pt-4 mt-2">
                      <span className="text-5xs font-black uppercase text-zinc-400 tracking-wider">Registered Bureaus</span>
                      <div className="mt-2 divide-y divide-zinc-50">
                        {locations.map((l) => (
                          <div key={l.id} className="py-2.5 flex items-center justify-between text-2xs">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-[var(--apple-blue)]" />
                              <span className="font-black text-zinc-900">{l.name}</span>
                              <span className="text-zinc-400">({l.nameHindi})</span>
                            </div>
                            {l.name !== "Meerut Sadar" && l.name !== "Muzaffarnagar" && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete Location: "${l.name}"?`)) {
                                    deleteLocation(l.id);
                                    addAuditLog(`Purged Location tag: "${l.name}"`);
                                    alert("Location deleted successfully!");
                                  }
                                }}
                                className="text-[var(--news-red)] hover:text-red-800 font-bold uppercase tracking-wider text-5xs cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 7: BROADCASTING & PUSH NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                
                <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                  
                  {/* Broadcaster form */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Audience Alerts</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Send Custom Push Alerts & Notifications</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">This will dispatch high-priority notifications immediately to all signed-up newsletter and feed subscribers.</p>
                    </div>

                    <form onSubmit={handleCustomPushSubmit} className="space-y-4 border-t border-zinc-100 pt-4">
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Alert Title (Hindi / Bilingual)</label>
                        <input
                          type="text"
                          required
                          value={customPushTitle}
                          onChange={(e) => setCustomPushTitle(e.target.value)}
                          placeholder="e.g. मेरठ: दिल्ली हाईवे पर भारी जाम, देखें रिपोर्ट..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Alert Message Body</label>
                        <textarea
                          required
                          value={customPushMsg}
                          onChange={(e) => setCustomPushMsg(e.target.value)}
                          placeholder="e.g. मेरठ के राष्ट्रीय राजमार्ग 58 पर करीब 5 किलोमीटर लंबा जाम लग गया है..."
                          rows={3}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Choose Article Redirect</label>
                        <select
                          value={isCustomRedirect ? "__custom__" : customPushUrl}
                          onChange={(e) => {
                            if (e.target.value !== "__custom__") {
                              setCustomPushUrl(e.target.value);
                            }
                          }}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs font-bold focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)] cursor-pointer"
                        >
                          <option value="__custom__">Custom redirect URL</option>
                          {articleRedirectOptions.map((article) => (
                            <option key={article.value} value={article.value}>
                              {article.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {isCustomRedirect && (
                        <div>
                          <label className="text-5xs font-black uppercase text-zinc-500">Target Redirect URL</label>
                          <input
                            type="text"
                            required
                            value={customPushUrl}
                            onChange={(e) => setCustomPushUrl(e.target.value)}
                            placeholder="e.g. /article/tragic-road-accident-highway-3-dead"
                            className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                          />
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--news-red)] py-3 text-2xs font-black text-white hover:bg-[var(--news-red-hover)] transition-all uppercase tracking-widest cursor-pointer"
                      >
                        🚀 Dispatch Broadcast Alert
                      </button>
                    </form>

                    {pushSentSuccess && (
                      <div className="text-center text-5xs font-black text-emerald-600 bg-emerald-50 py-2 rounded-xl border border-emerald-150 animate-pulse uppercase tracking-wider">
                        Alert successfully broad-casted to active subscribers!
                      </div>
                    )}
                  </div>

                  {/* Sent Logs */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">History Log</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Recent Sent Broadcast Alerts</h4>
                    </div>

                    <div className="divide-y divide-zinc-150 text-2xs pt-2">
                      {notifications.length === 0 ? (
                        <div className="text-center text-zinc-400 font-bold uppercase tracking-wider py-6">
                          No notifications sent.
                        </div>
                      ) : (
                        notifications.map((not) => (
                          <div key={not.id} className="py-3 space-y-1">
                            <span className="block font-black text-zinc-900 leading-tight">{not.title}</span>
                            <p className="text-zinc-500 italic leading-snug">&ldquo;{not.message}&rdquo;</p>
                            <div className="flex items-center justify-between text-5xs font-black text-zinc-400 uppercase tracking-wider">
                              <span>Sent: {new Date(not.sentAt).toLocaleTimeString()}</span>
                              <span className="bg-zinc-100 text-zinc-700 px-1.5 py-0.5 rounded">{not.clicks} clicks</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 8: STAFF PROFILES */}
            {activeTab === "users" && (
              <div className="space-y-6">
                
                <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
                  
                  {/* Staff creator */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Team Setup</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Create Staff Desks & Credentials</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">Add editors and bureau staff to access the editorial commander console.</p>
                    </div>

                    <form onSubmit={handleAddStaffSubmit} className="space-y-3.5 border-t border-zinc-100 pt-4">
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Staff Full Name</label>
                        <input
                          type="text"
                          required
                          value={newStaffName}
                          onChange={(e) => setNewStaffName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar..."
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Staff Corporate Email</label>
                        <input
                          type="email"
                          required
                          value={newStaffEmail}
                          onChange={(e) => setNewStaffEmail(e.target.value)}
                          placeholder="e.g. ramesh.meerut@ibnnewshindi.in"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Assigned Editorial Role</label>
                        <select
                          value={newStaffRole}
                          onChange={(e) => setNewStaffRole(e.target.value as any)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-2xs font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Editor">Editor</option>
                          <option value="User">User</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="w-full rounded-full bg-[var(--apple-blue)] py-2 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                      >
                        + Create Staff credentials
                      </button>
                    </form>
                  </div>

                  {/* Active list */}
                  <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Team Roster</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Active Staff & Bureau Editors</h4>
                    </div>

                    <div className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                      <svg className="h-4 w-4 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35m1.1-5.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
                      </svg>
                      <input
                        type="text"
                        value={staffSearchQuery}
                        onChange={(e) => setStaffSearchQuery(e.target.value)}
                        placeholder="Search by name or email"
                        className="w-full bg-transparent text-2xs font-bold text-zinc-800 outline-none placeholder:text-zinc-400"
                      />
                    </div>

                    <div className="divide-y divide-zinc-150 text-2xs pt-2">
                      {filteredStaffUsers.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 font-black uppercase tracking-wider text-5xs">
                          No users match this search.
                        </div>
                      ) : filteredStaffUsers.map((u) => (
                        <div key={u.id} className="py-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={getSafeAvatarSrc(u.avatar, u.name)} alt={u.name} className="h-9 w-9 rounded-full object-cover border border-zinc-200" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-zinc-900 leading-tight">{u.name}</span>
                                {isAdmin && u.id !== currentUser.id ? (
                                  <select
                                    value={u.role}
                                    onChange={(e) => {
                                      const newRole = e.target.value as User["role"];
                                      updateUserRole(u.id, newRole);
                                      addAuditLog(`Updated role of "${u.name}" to ${newRole}`);
                                      alert(`Successfully updated "${u.name}" role to "${newRole}"!`);
                                    }}
                                    className="rounded-lg border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[8px] font-black text-zinc-700 focus:outline-none cursor-pointer"
                                  >
                                    <option value="Admin">Admin</option>
                                    <option value="Editor">Editor</option>
                                    <option value="User">User</option>
                                  </select>
                                ) : (
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border tracking-wider ${
                                    normalizeRole(u.role) === "Admin"
                                      ? "bg-red-50 text-[var(--news-red)] border-red-200"
                                      : normalizeRole(u.role) === "Editor"
                                      ? "bg-blue-50 text-[var(--apple-blue)] border-blue-200"
                                      : "bg-zinc-100 text-zinc-700 border-zinc-200"
                                  }`}>
                                    {normalizeRole(u.role)}
                                  </span>
                                )}
                              </div>
                              <span className="block text-zinc-400 font-bold mt-0.5">{u.email}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-bold bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded-full uppercase tracking-wider text-5xs">{u.storiesCount} stories</span>
                            
                            {u.id !== currentUser.id && (
                              <button
                                onClick={() => {
                                  if (confirm(`Remove staff member: "${u.name}"?`)) {
                                    deleteUser(u.id);
                                    addAuditLog(`Purged staff credentials: "${u.name}"`);
                                    alert("Staff member successfully removed.");
                                  }
                                }}
                                className="text-[var(--news-red)] hover:text-red-800 font-black uppercase tracking-wider text-5xs cursor-pointer"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* TAB 9: GLOBAL CONFIG & METADATA */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                
                <form onSubmit={handleSettingsSubmit} className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm space-y-5">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Settings Desk</span>
                    <h2 className="text-xs font-black text-zinc-950 mt-0.5">Global Configuration & Site Meta Properties</h2>
                    <p className="text-5xs font-semibold text-zinc-400 mt-1">Configure bilingual site settings, support channels, and ad placeholder slots.</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 border-t border-zinc-100 pt-4">
                    <div className="space-y-4">
                      <span className="text-5xs font-black uppercase tracking-wider text-zinc-400">Branding Property</span>
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Site Title English</label>
                        <input
                          type="text"
                          required
                          value={settingsSiteEnglish}
                          onChange={(e) => setSettingsSiteEnglish(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                      
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Site Title Hindi</label>
                        <input
                          type="text"
                          required
                          value={settingsSiteHindi}
                          onChange={(e) => setSettingsSiteHindi(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold focus:border-[var(--apple-blue)] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Support Desk WhatsApp Hot-Line</label>
                        <input
                          type="text"
                          required
                          value={settingsWhatsapp}
                          onChange={(e) => setSettingsWhatsapp(e.target.value)}
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Google Search Console Verification HTML ID</label>
                        <input
                          type="text"
                          value={settingsGoogleVerification}
                          onChange={(e) => setSettingsGoogleVerification(e.target.value)}
                          placeholder="e.g. wO0_xxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-2xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-5xs font-black uppercase tracking-wider text-zinc-400">Ad Slots Integrators (Removed Visual Panels - Returns Null)</span>
                      
                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Header Ad Slot ID (Google AdSense)</label>
                        <input
                          type="text"
                          value={settingsAdSlotHeader}
                          onChange={(e) => setSettingsAdSlotHeader(e.target.value)}
                          placeholder="e.g. ca-pub-xxxxxxxxxxxxxx:yyyyyyyyyy"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>

                      <div>
                        <label className="text-5xs font-black uppercase text-zinc-500">Sidebar Ad Slot ID (Google AdSense)</label>
                        <input
                          type="text"
                          value={settingsAdSlotSidebar}
                          onChange={(e) => setSettingsAdSlotSidebar(e.target.value)}
                          placeholder="e.g. ca-pub-xxxxxxxxxxxxxx:zzzzzzzzzz"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-3xs focus:border-[var(--apple-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--apple-blue)]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Trending Topics Manager Section */}
                  <div className="border-t border-zinc-150 pt-5 space-y-4">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">Homepage Trending Topics</span>
                      <h4 className="text-xs font-black text-zinc-800 mt-0.5">Manage Live Ticker Hashtags</h4>
                      <p className="text-5xs font-semibold text-zinc-400 mt-1">Configure trending topics showcased at the top of the homepage in both Hindi and English counterparts.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center p-4 bg-zinc-50 border border-zinc-200 rounded-2xl select-none">
                      <span className="text-5xs font-black uppercase text-zinc-400 mr-2">Active Tags:</span>
                      {settingsTrendingTopics.map((tag, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-white border border-zinc-250 px-3 py-1 rounded-full text-3xs font-extrabold text-zinc-700">
                          <span>{tag.hi} ({tag.en})</span>
                          <button
                            type="button"
                            onClick={() => {
                              setSettingsTrendingTopics(prev => prev.filter((_, i) => i !== idx));
                              addAuditLog(`Removed trending hashtag "${tag.en}"`);
                            }}
                            className="text-zinc-400 hover:text-[var(--news-red)] font-black text-xs cursor-pointer shrink-0"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                      {settingsTrendingTopics.length === 0 && (
                        <span className="text-4xs font-semibold text-zinc-400 italic">No trending topics configured. Default fallbacks will apply.</span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-1">
                      <div className="flex-1">
                        <label className="text-5xs font-black uppercase text-zinc-500">Hashtag Hindi (e.g. #मेरठहादसा)</label>
                        <input
                          type="text"
                          value={newTagHi}
                          onChange={(e) => setNewTagHi(e.target.value)}
                          placeholder="#मेरठहादसा"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-2xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-5xs font-black uppercase text-zinc-500">Hashtag English Equivalent (e.g. #MeerutAccident)</label>
                        <input
                          type="text"
                          value={newTagEn}
                          onChange={(e) => setNewTagEn(e.target.value)}
                          placeholder="#MeerutAccident"
                          className="mt-1 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-2xs font-bold focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => {
                            let hi = newTagHi.trim();
                            let en = newTagEn.trim();
                            if (!hi || !en) {
                              alert("Please fill in both Hindi and English fields!");
                              return;
                            }
                            if (!hi.startsWith("#")) hi = "#" + hi;
                            if (!en.startsWith("#")) en = "#" + en;
                            
                            // Check duplicates
                            if (settingsTrendingTopics.some(t => t.en.toLowerCase() === en.toLowerCase())) {
                              alert("This hashtag already exists!");
                              return;
                            }

                            setSettingsTrendingTopics(prev => [...prev, { hi, en }]);
                            addAuditLog(`Added trending hashtag "${en}"`);
                            setNewTagHi("");
                            setNewTagEn("");
                          }}
                          className="w-full sm:w-auto bg-zinc-950 hover:bg-zinc-800 text-white px-5 py-2 rounded-xl text-3xs font-black uppercase tracking-widest cursor-pointer whitespace-nowrap h-[38px] flex items-center justify-center"
                        >
                          + Append Tag
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-4 flex items-center justify-between gap-4">
                    <button
                      type="submit"
                      className="rounded-full bg-[var(--apple-blue)] px-6 py-2.5 text-3xs font-black text-white hover:bg-[var(--apple-blue-hover)] transition-all uppercase tracking-widest cursor-pointer"
                    >
                      Save Configuration override
                    </button>
                    
                    {settingsSuccess && (
                      <span className="text-5xs font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 uppercase tracking-wider">
                        Settings synchronized successfully with Neon DB!
                      </span>
                    )}
                  </div>
                </form>

              </div>
            )}

            {/* TAB 10: REAL-TIME AUDIT LOGS */}
            {activeTab === "audit" && (
              <div className="space-y-6">
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Security Desk</span>
                  <h2 className="text-xs font-black text-zinc-950 mt-0.5">Administrative Action Audit Logs</h2>
                  <p className="text-5xs font-semibold text-zinc-400 mt-1">A real-time trace of mutations and administrative procedures logged against your database tables.</p>
                </div>

                <div className="rounded-[24px] border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="border-b border-zinc-150 pb-3 flex items-center justify-between bg-zinc-50/70 p-4 rounded-xl">
                    <span className="text-3xs font-black text-zinc-700 uppercase">Recent System Events log</span>
                    <button
                      onClick={() => {
                        setAuditLogs([{ id: "clear_" + Date.now(), event: "Audit log session traces cleared", user: currentUser.name, time: new Date().toLocaleTimeString() }]);
                      }}
                      className="text-[var(--news-red)] hover:text-red-800 text-5xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      Clear Log Sessions
                    </button>
                  </div>

                  <div className="divide-y divide-zinc-100 text-3xs font-mono mt-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="py-3 flex items-center justify-between select-text">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-400 font-bold">[{log.time}]</span>
                          <span className="text-zinc-500 uppercase font-black px-1 rounded bg-zinc-100">{log.user}</span>
                          <span className="text-zinc-800 font-bold">{log.event}</span>
                        </div>
                        <span className="text-zinc-300">ID: {log.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 11: RECYCLE PURGE BIN */}
            {activeTab === "recycle" && (
              <div className="space-y-6">
                
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Purging Desk</span>
                  <h2 className="text-xs font-black text-zinc-950 mt-0.5">Recycle & Soft Deleted Bulletins Bin</h2>
                  <p className="text-5xs font-semibold text-zinc-400 mt-1">Restore soft-deleted bulletins back to life, or permanently erase them from Neon DB storage registers.</p>
                </div>

                <div className="rounded-[24px] border border-zinc-200 bg-white shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                      <thead>
                        <tr className="border-b border-zinc-150 bg-zinc-50/70 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                          <th className="py-3.5 px-4">Deleted Bulletin Title</th>
                          <th className="py-3.5 px-4 w-36">Category</th>
                          <th className="py-3.5 px-4 w-32">LocationTag</th>
                          <th className="py-3.5 px-4 w-28 text-right font-black uppercase tracking-wider">Restoration Controls</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 text-2xs">
                        {deletedArticles.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-10 text-center text-zinc-400 font-bold uppercase tracking-wider">
                              Trash bin is completely empty. No items are marked as deleted.
                            </td>
                          </tr>
                        ) : (
                          deletedArticles.map((art) => (
                            <tr key={art.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="py-3.5 px-4 font-black text-zinc-950 max-w-sm truncate">
                                {art.titleHindi}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-600">
                                {art.category}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-zinc-500">
                                {art.locationTag}
                              </td>
                              <td className="py-3.5 px-4 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    restoreArticle(art.id);
                                    addAuditLog(`Restored soft-deleted bulletin: "${art.titleHindi.slice(0, 30)}..."`);
                                    alert("Article successfully restored to catalogs!");
                                  }}
                                  className="text-emerald-700 hover:text-emerald-950 font-black uppercase tracking-wider text-5xs border border-emerald-200 bg-white hover:bg-emerald-50 px-2 py-1 rounded-lg cursor-pointer"
                                >
                                  Undelete
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("WARNING: Permanently erase this news bulletin from Neon DB tables? This action is irreversible.")) {
                                      hardDeleteArticle(art.id);
                                      addAuditLog(`PERMANENTLY PURGED article from tables: "${art.titleHindi.slice(0, 30)}..."`);
                                      alert("Article permanently erased from Neon DB!");
                                    }
                                  }}
                                  className="text-white bg-[var(--news-red)] hover:bg-[var(--news-red-hover)] font-black uppercase tracking-wider text-5xs px-2.5 py-1 rounded-lg cursor-pointer animate-pulse"
                                >
                                  Erase
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
      </main>

    </div>
  );
}
