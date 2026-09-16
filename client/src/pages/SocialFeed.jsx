import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
  Heart, MessageCircle, Plus, X, ShoppingBag, CheckCircle2, 
  Image as ImageIcon, Loader2, Sparkles, Send, Globe,
  Bookmark, MoreHorizontal, Smile, Paperclip, Home as HomeIcon,
  Search, Bell, User, MessageSquare, Compass, Play, Users, 
  FolderHeart, ShoppingCart, HelpCircle, Eye, Star, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Share2, Music2, Volume2, VolumeX, Flame, Tag, Upload,
  Undo, Redo, Sliders, Music, BarChart2, Calendar, Trash2, Layers,
  Type, Copy, RotateCw, Maximize2, Sun, Moon, MapPin, Hash, Sparkle, ArrowRight
} from "lucide-react";
import { backendUrl } from "../config";
import Logo from "../components/Logo";
import StoryCreatorModal from "../components/StoryCreatorModal";
import StorySlideshowOverlay from "../components/StorySlideshowOverlay";
import CreatePostModal from "../components/CreatePostModal";
import LikesModal from "../components/LikesModal";
import { motion, AnimatePresence } from "framer-motion";

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);

  // Single post navigation state
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("For You");
  const [slideDirection, setSlideDirection] = useState("next");
  const isScrollingRef = useRef(false);

  // Mobile drawer states
  const [commentsDrawerOpen, setCommentsDrawerOpen] = useState(false);
  const [productDrawerOpen, setProductDrawerOpen] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [showStoriesRow, setShowStoriesRow] = useState(true);
  const touchStartY = useRef(0);

  const displayedPosts = useMemo(() => {
    if (activeTab === "Following") {
      return posts.filter(post => 
        post.isFollowingCreator === true || 
        (currentUser?.following && (
          currentUser.following.includes(post.userId?._id) ||
          currentUser.following.includes(post.userId)
        ))
      );
    }
    return posts;
  }, [posts, activeTab, currentUser]);

  const activePost = useMemo(() => {
    if (!displayedPosts || displayedPosts.length === 0) return null;
    const safeIdx = Math.min(Math.max(0, currentPostIndex), displayedPosts.length - 1);
    return displayedPosts[safeIdx];
  }, [displayedPosts, currentPostIndex]);

  const handleNextPost = () => {
    if (!displayedPosts || displayedPosts.length === 0) return;
    if (currentPostIndex < displayedPosts.length - 1) {
      setSlideDirection("next");
      setCurrentPostIndex(prev => prev + 1);
    }
  };

  const handlePrevPost = () => {
    if (!displayedPosts || displayedPosts.length === 0) return;
    if (currentPostIndex > 0) {
      setSlideDirection("prev");
      setCurrentPostIndex(prev => prev - 1);
    }
  };

  const handleWheel = (e) => {
    if (isScrollingRef.current) return;
    if (Math.abs(e.deltaY) < 25) return;

    isScrollingRef.current = true;
    if (e.deltaY > 0) {
      handleNextPost();
    } else {
      handlePrevPost();
    }

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 550);
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 45) {
      if (diff > 0) handleNextPost();
      else handlePrevPost();
    }
  };

  const handleShare = (post) => {
    const shareUrl = `${window.location.origin}/social`;
    if (navigator.share) {
      navigator.share({
        title: post?.caption || "CartNow Social Feed",
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard! 📋");
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["input", "textarea"].includes(document.activeElement?.tagName?.toLowerCase())) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        handleNextPost();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        handlePrevPost();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayedPosts, currentPostIndex]);

  useEffect(() => {
    if (activePost) {
      setActiveCommentsPost(activePost);
      setNewComment("");
      setComments([]);
      setLoadingComments(true);
      axios.get(`${backendUrl}/api/social/${activePost._id}/comments`)
        .then(res => {
          if (res.data.success) setComments(res.data.comments);
        })
        .catch(err => console.error("Comments fetch error:", err))
        .finally(() => setLoadingComments(false));
    } else {
      setActiveCommentsPost(null);
      setComments([]);
    }
  }, [activePost?._id]);

  // Create post state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState("");
  const [purchasedProducts, setPurchasedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Active comments drawer
  const [activeCommentsPost, setActiveCommentsPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  // Likes modal state
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [likesUsers, setLikesUsers] = useState([]);
  const [likesLoading, setLikesLoading] = useState(false);

  const [savedPosts, setSavedPosts] = useState(new Set());
  const imagePreviewRef = useRef(null);
  const fileInputRef = useRef(null);

  // Dynamic Sidebar Stats State
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [suggestedCreators, setSuggestedCreators] = useState([]);
  const [topPicks, setTopPicks] = useState([]);
  const [likedAnimationPostId, setLikedAnimationPostId] = useState(null);

  // Dynamic Stories State
  const [stories, setStories] = useState([]);
  const [activeStoryGroup, setActiveStoryGroup] = useState(null);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const [seenStories, setSeenStories] = useState(() => {
    try {
      const stored = localStorage.getItem("seen_stories");
      return new Set(stored ? JSON.parse(stored) : []);
    } catch (e) {
      return new Set();
    }
  });

  const markStoryAsSeen = (storyId) => {
    if (!storyId || seenStories.has(storyId)) return;
    setSeenStories(prev => {
      const next = new Set(prev);
      next.add(storyId);
      localStorage.setItem("seen_stories", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const isGroupSeen = (group) => {
    if (!group || !group.stories || group.stories.length === 0) return true;
    return group.stories.every(s => seenStories.has(s._id));
  };

  useEffect(() => {
    if (activeStoryGroup) {
      const currentStory = activeStoryGroup.stories[activeStoryIndex];
      if (currentStory) {
        markStoryAsSeen(currentStory._id);
      }
    }
  }, [activeStoryGroup, activeStoryIndex]);

  // Story Modal states
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [storyMediaFiles, setStoryMediaFiles] = useState([]);
  const [storyMediaPreviews, setStoryMediaPreviews] = useState([]);
  const [storyActiveIndex, setStoryActiveIndex] = useState(0);
  const [storyCaption, setStoryCaption] = useState("");
  const [storyLocation, setStoryLocation] = useState("");
  const [storyOverlayText, setStoryOverlayText] = useState("");
  const [storyOverlayColor, setStoryOverlayColor] = useState("#ffffff");
  const [storyPrivacy, setStoryPrivacy] = useState("Public");
  const [storyUploading, setStoryUploading] = useState(false);
  const [storyUploadProgress, setStoryUploadProgress] = useState(0);
  const [storyMode, setStoryMode] = useState("file"); // "file" or "text"
  const [storyBgGradient, setStoryBgGradient] = useState("linear-gradient(135deg, #ff4e20 0%, #ec4899 100%)");
  const [storyTaggedProductId, setStoryTaggedProductId] = useState("");

  // Advanced Story Editor States
  const [canvasElements, setCanvasElements] = useState([]);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [canvasHistory, setCanvasHistory] = useState([]);
  const [canvasRedoStack, setCanvasRedoStack] = useState([]);
  const [storyActiveTab, setStoryActiveTab] = useState("text"); // "text" | "stickers" | "drawing" | "filters" | "products" | "music"
  const [bgFilters, setBgFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    preset: "normal"
  });
  const [brushColor, setBrushColor] = useState("#ff4e20");
  const [brushSize, setBrushSize] = useState(5);
  const [brushType, setBrushType] = useState("pencil"); // "pencil" | "marker" | "neon" | "highlighter" | "eraser"
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingActive, setIsDrawingActive] = useState(false);
  const drawingCanvasRef = useRef(null);
  const [productQuery, setProductQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [selectedMusicTrack, setSelectedMusicTrack] = useState(null);

  // Load products list on open
  useEffect(() => {
    if (storyModalOpen) {
      fetchAllProducts();
    }
  }, [storyModalOpen]);

  useEffect(() => {
    fetchFeed();
    fetchTrendingHashtags();
    fetchSuggestedCreators();
    fetchTopPicks();
    fetchStories();
    if (token) {
      fetchCurrentUser();
      fetchPurchasedProducts();
    }
  }, [token]);

  // Story slides timer progression hook
  useEffect(() => {
    if (!activeStoryGroup) return;

    const timer = setTimeout(() => {
      if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
        setActiveStoryIndex(activeStoryIndex + 1);
      } else {
        setActiveStoryGroup(null);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStoryGroup, activeStoryIndex]);

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setCurrentUser(response.data.user);
      }
    } catch (err) {
      console.error("Error profile fetch:", err);
    }
  };

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendUrl}/api/social`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setPosts(response.data.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Feed API failed:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasedProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/social/purchased`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPurchasedProducts(response.data.products);
      }
    } catch (err) {
      console.error("Error loading purchased items:", err);
    }
  };

  const fetchTrendingHashtags = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/social/trending-hashtags`);
      if (response.data.success) {
        setTrendingHashtags(response.data.hashtags);
      } else {
        setTrendingHashtags([]);
      }
    } catch (err) {
      console.error(err);
      setTrendingHashtags([]);
    }
  };

  const fetchSuggestedCreators = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/social/suggested-creators`, token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {});
      if (response.data.success) {
        setSuggestedCreators(response.data.creators);
      } else {
        setSuggestedCreators([]);
      }
    } catch (err) {
      console.error(err);
      setSuggestedCreators([]);
    }
  };

  const fetchTopPicks = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/social/top-picks`);
      if (response.data.success) {
        setTopPicks(response.data.products);
      } else {
        setTopPicks([]);
      }
    } catch (err) {
      console.error(err);
      setTopPicks([]);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/social/stories`);
      if (response.data.success) {
        setStories(response.data.stories);
      }
    } catch (err) {
      console.error("Error fetching stories:", err);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setAllProducts(response.data.products);
      }
    } catch (e) {
      console.error("Failed to load products list:", e);
    }
  };

  const pushHistory = () => {
    setCanvasHistory(prev => [...prev.slice(-19), JSON.stringify(canvasElements)]);
    setCanvasRedoStack([]);
  };

  const handleUndo = () => {
    if (canvasHistory.length === 0) return;
    const previous = canvasHistory[canvasHistory.length - 1];
    setCanvasRedoStack(prev => [...prev, JSON.stringify(canvasElements)]);
    setCanvasElements(JSON.parse(previous));
    setCanvasHistory(prev => prev.slice(0, -1));
  };

  const handleRedo = () => {
    if (canvasRedoStack.length === 0) return;
    const next = canvasRedoStack[canvasRedoStack.length - 1];
    setCanvasHistory(prev => [...prev, JSON.stringify(canvasElements)]);
    setCanvasElements(JSON.parse(next));
    setCanvasRedoStack(prev => prev.slice(0, -1));
  };

  const updateElement = (elementId, updates) => {
    setCanvasElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return { ...el, ...updates };
      }
      return el;
    }));
  };

  const deleteElement = (elementId) => {
    pushHistory();
    setCanvasElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElementId === elementId) setSelectedElementId(null);
    toast.info("Layer deleted");
  };

  const duplicateElement = (elementId) => {
    const el = canvasElements.find(item => item.id === elementId);
    if (!el) return;
    pushHistory();
    const newId = el.type + "_" + Date.now();
    setCanvasElements(prev => [...prev, {
      ...el,
      id: newId,
      x: Math.min(el.x + 8, 90),
      y: Math.min(el.y + 8, 90),
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(newId);
    toast.success("Layer duplicated!");
  };

  const rotateElement = (elementId) => {
    pushHistory();
    setCanvasElements(prev => prev.map(el => {
      if (el.id === elementId) {
        return { ...el, rotation: (el.rotation + 15) % 360 };
      }
      return el;
    }));
  };

  const scaleElement = (elementId, direction = "up") => {
    pushHistory();
    setCanvasElements(prev => prev.map(el => {
      if (el.id === elementId) {
        const factor = direction === "up" ? 0.1 : -0.1;
        return { ...el, scale: Math.max(0.3, Math.min(el.scale + factor, 3.0)) };
      }
      return el;
    }));
  };

  const adjustZIndex = (elementId, direction) => {
    pushHistory();
    setCanvasElements(prev => {
      const idx = prev.findIndex(el => el.id === elementId);
      if (idx === -1) return prev;
      const newElements = [...prev];
      const target = newElements[idx];

      if (direction === "forward" && idx < newElements.length - 1) {
        newElements[idx] = newElements[idx + 1];
        newElements[idx + 1] = target;
      } else if (direction === "backward" && idx > 0) {
        newElements[idx] = newElements[idx - 1];
        newElements[idx - 1] = target;
      }
      return newElements;
    });
  };

  const handleElementMouseDown = (e, elementId, action = "drag") => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    pushHistory();

    const element = canvasElements.find(el => el.id === elementId);
    if (!element) return;

    const startX = e.clientX || e.touches?.[0]?.clientX;
    const startY = e.clientY || e.touches?.[0]?.clientY;

    const startLeft = element.x;
    const startTop = element.y;
    const startScale = element.scale || 1.0;
    const startRotation = element.rotation || 0;

    const elementNode = document.getElementById(`canvas-element-${elementId}`);
    let centerX = 0;
    let centerY = 0;
    if (elementNode) {
      const rect = elementNode.getBoundingClientRect();
      centerX = rect.left + rect.width / 2;
      centerY = rect.top + rect.height / 2;
    }

    const handleMouseMove = (moveEvent) => {
      const currentX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX;
      const currentY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY;

      if (action === "drag") {
        const deltaX = ((currentX - startX) / 320) * 100;
        const deltaY = ((currentY - startY) / 568) * 100;
        
        let newX = startLeft + deltaX;
        let newY = startTop + deltaY;

        let snapX = false;
        let snapY = false;
        if (Math.abs(newX - 50) < 3.5) {
          newX = 50;
          snapX = true;
        }
        if (Math.abs(newY - 50) < 3.5) {
          newY = 50;
          snapY = true;
        }

        updateElement(elementId, { x: newX, y: newY, isSnappingX: snapX, isSnappingY: snapY });
      } else if (action === "rotate-resize") {
        const rad = Math.atan2(currentY - centerY, currentX - centerX);
        let deg = rad * (180 / Math.PI) - 45; // adjustment offset
        
        const startDist = Math.sqrt(Math.pow(startX - centerX, 2) + Math.pow(startY - centerY, 2));
        const currentDist = Math.sqrt(Math.pow(currentX - centerX, 2) + Math.pow(currentY - centerY, 2));
        const newScale = Math.max(0.4, Math.min(3.5, startScale * (currentDist / startDist)));

        updateElement(elementId, { rotation: deg, scale: newScale });
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
      setCanvasElements(prev => prev.map(el => ({ ...el, isSnappingX: false, isSnappingY: false })));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleMouseMove, { passive: false });
    document.addEventListener("touchend", handleMouseUp);
  };

  const handleStoryFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const newPreviews = files.map(file => URL.createObjectURL(file));
    
    setStoryMediaFiles(prev => [...prev, ...files]);
    setStoryMediaPreviews(prev => [...prev, ...newPreviews]);
    setStoryActiveIndex(prev => (storyMediaFiles.length === 0 ? 0 : prev));
    setStoryModalOpen(true);
  };

  const removeStoryFile = (index) => {
    URL.revokeObjectURL(storyMediaPreviews[index]);
    setStoryMediaFiles(prev => prev.filter((_, i) => i !== index));
    setStoryMediaPreviews(prev => prev.filter((_, i) => i !== index));
    setStoryActiveIndex(prev => {
      const nextLength = storyMediaFiles.length - 1;
      if (nextLength === 0) return 0;
      if (prev >= nextLength) return nextLength - 1;
      return prev;
    });
  };

  const handleStoryModalClose = () => {
    setStoryModalOpen(false);
    storyMediaPreviews.forEach(url => URL.revokeObjectURL(url));
    setStoryMediaFiles([]);
    setStoryMediaPreviews([]);
    setStoryActiveIndex(0);
    setStoryCaption("");
    setStoryLocation("");
    setStoryTaggedProductId("");
  };

  const addTextBox = () => {
    pushHistory();
    const id = "text_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "text",
      value: "Double tap to edit",
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1.0,
      fontSize: 16,
      fontFamily: "font-sans",
      color: "#ffffff",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      hasShadow: false,
      curvedText: false,
      bgHighlight: "transparent",
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const addPollWidget = (question, optA = "YES", optB = "NO") => {
    pushHistory();
    const id = "poll_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "sticker",
      stickerType: "poll",
      question: question || "Choose one:",
      optionA: optA,
      optionB: optB,
      x: 50,
      y: 40,
      rotation: 0,
      scale: 1.0,
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const addQuestionWidget = (promptText) => {
    pushHistory();
    const id = "question_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "sticker",
      stickerType: "question",
      prompt: promptText || "Ask me anything!",
      x: 50,
      y: 40,
      rotation: 0,
      scale: 1.0,
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const addCountdownWidget = (label, targetDate) => {
    pushHistory();
    const id = "countdown_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "sticker",
      stickerType: "countdown",
      label: label || "Countdown",
      targetDate: targetDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      x: 50,
      y: 45,
      rotation: 0,
      scale: 1.0,
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const addEmojiSticker = (emoji) => {
    pushHistory();
    const id = "emoji_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "sticker",
      stickerType: "emoji",
      value: emoji,
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1.5,
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const addProductTagElement = (prod) => {
    pushHistory();
    const id = "product_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "product",
      productId: prod._id,
      name: prod.name,
      price: prod.price,
      discount: prod.discount || 0,
      image: prod.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120",
      x: 50,
      y: 50,
      rotation: 0,
      scale: 1.0,
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const addMusicSticker = (track) => {
    pushHistory();
    const id = "music_" + Date.now();
    setCanvasElements(prev => [...prev, {
      id,
      type: "music",
      songTitle: track.title,
      artist: track.artist,
      x: 50,
      y: 75,
      rotation: 0,
      scale: 1.0,
      zIndex: prev.length + 1
    }]);
    setSelectedElementId(id);
  };

  const startDrawing = (e) => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawingActive(true);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;

    if (brushType === "neon") {
      ctx.shadowBlur = brushSize * 1.5;
      ctx.shadowColor = brushColor;
    } else if (brushType === "highlighter") {
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = brushColor;
    } else if (brushType === "eraser") {
      ctx.strokeStyle = "#000000";
      ctx.globalCompositeOperation = "destination-out";
    } else {
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;
      ctx.globalCompositeOperation = "source-over";
    }
  };

  const draw = (e) => {
    if (!isDrawingActive) return;
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawingActive(false);
  };

  const saveDrawingLayer = () => {
    const canvas = drawingCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pushHistory();
    setCanvasElements(prev => [...prev, {
      id: "draw_" + Date.now(),
      type: "drawing",
      value: dataUrl,
      x: 50,
      y: 50,
      scale: 1.0,
      rotation: 0,
      zIndex: prev.length + 1
    }]);
    setStoryActiveTab("text");
  };

  const handleCreateStorySubmit = async (e) => {
    if (e) e.preventDefault();
    if (storyMediaFiles.length === 0) {
      toast.error("Please select at least one image or video first.");
      return;
    }

    try {
      setStoryUploading(true);
      const total = storyMediaFiles.length;
      
      for (let i = 0; i < total; i++) {
        setStoryUploadProgress(Math.round((i / total) * 100));
        
        const file = storyMediaFiles[i];
        
        const formData = new FormData();
        formData.append("media", file);
        formData.append("caption", storyCaption);
        formData.append("location", storyLocation);
        formData.append("overlayText", "");
        formData.append("overlayColor", "#ffffff");
        formData.append("privacy", storyPrivacy);
        formData.append("taggedProduct", storyTaggedProductId);
        
        await axios.post(`${backendUrl}/api/social/stories`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        });
      }
      
      setStoryUploadProgress(100);
      toast.success(`Successfully shared ${total} stories!`);
      handleStoryModalClose();
      fetchStories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to share story.");
    } finally {
      setStoryUploading(false);
      setStoryUploadProgress(0);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm("Are you sure you want to delete this story?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${backendUrl}/api/social/stories/${storyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success("Story deleted successfully!");
        
        // Update local stories state
        setStories(prevStories => {
          return prevStories.map(group => {
            if (group._id === currentUser?._id) {
              const updatedStories = group.stories.filter(s => s._id !== storyId);
              return { ...group, stories: updatedStories };
            }
            return group;
          }).filter(group => group.stories.length > 0);
        });

        // Close slideshow or advance story
        if (activeStoryGroup.stories.length <= 1) {
          setActiveStoryGroup(null);
        } else {
          const nextStories = activeStoryGroup.stories.filter(s => s._id !== storyId);
          if (activeStoryIndex >= nextStories.length) {
            setActiveStoryIndex(nextStories.length - 1);
          }
          setActiveStoryGroup(prev => ({
            ...prev,
            stories: nextStories
          }));
        }
      } else {
        toast.error(res.data.message || "Failed to delete story.");
      }
    } catch (err) {
      console.error("Error deleting story:", err);
      toast.error("Failed to delete story.");
    }
  };

  const toggleSave = (postId) => {
    const updated = new Set(savedPosts);
    if (updated.has(postId)) {
      updated.delete(postId);
      toast.success("Removed from saved posts.");
    } else {
      updated.add(postId);
      toast.success("Saved to bookmarks!");
    }
    setSavedPosts(updated);
  };

  const removeTag = (productId) => {
    setTaggedProducts(taggedProducts.filter(t => t.productId !== productId));
    toast.info("Tag removed.");
  };

  const handleFollowUser = async (targetUserId) => {
    if (!token) {
      toast.error("Please log in to follow creators.");
      return;
    }
    try {
      const response = await axios.post(`${backendUrl}/api/social/user/${targetUserId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setSuggestedCreators(suggestedCreators.map(creator => {
          if (creator._id === targetUserId) {
            return { ...creator, isFollowing: response.data.isFollowing };
          }
          return creator;
        }));
        setPosts(posts.map(post => {
          if (post.userId && post.userId._id === targetUserId) {
            return { ...post, isFollowingCreator: response.data.isFollowing };
          }
          return post;
        }));
        setCurrentUser(prev => {
          if (!prev) return null;
          const following = prev.following || [];
          const nextFollowing = response.data.isFollowing
            ? [...new Set([...following, targetUserId])]
            : following.filter(id => id !== targetUserId);
          return { ...prev, following: nextFollowing };
        });
      }
    } catch (err) {
      toast.error("Follow request failed.");
    }
  };

  const handleToggleFollowCreator = async (targetUserId) => {
    if (!token) {
      toast.error("Please log in to follow creators.");
      return;
    }
    try {
      const response = await axios.post(`${backendUrl}/api/social/user/${targetUserId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        toast.success(response.data.message);
        // Update all posts in feed by this creator
        setPosts(posts.map(post => {
          if (post.userId && post.userId._id === targetUserId) {
            return { ...post, isFollowingCreator: response.data.isFollowing };
          }
          return post;
        }));
        // Update suggested list as well
        setSuggestedCreators(suggestedCreators.map(creator => {
          if (creator._id === targetUserId) {
            return { ...creator, isFollowing: response.data.isFollowing };
          }
          return creator;
        }));
        // Update likes list if open
        setLikesUsers(prev => prev.map(user => {
          if (user._id === targetUserId) {
            return { ...user, isFollowing: response.data.isFollowing };
          }
          return user;
        }));
        setCurrentUser(prev => {
          if (!prev) return null;
          const following = prev.following || [];
          const nextFollowing = response.data.isFollowing
            ? [...new Set([...following, targetUserId])]
            : following.filter(id => id !== targetUserId);
          return { ...prev, following: nextFollowing };
        });
      }
    } catch (err) {
      toast.error("Follow request failed.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
      setTaggedProducts([]);
    }
  };

  const handleImageClick = (e) => {
    if (!selectedProduct) {
      toast.info("Please select a product first to tag.");
      return;
    }
    if (!imagePreviewRef.current) return;

    const rect = imagePreviewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const prod = purchasedProducts.find(p => p._id === selectedProduct);
    if (!prod) return;

    setTaggedProducts([...taggedProducts, {
      productId: selectedProduct,
      name: prod.name,
      x: parseFloat(x.toFixed(2)),
      y: parseFloat(y.toFixed(2))
    }]);
    setSelectedProduct("");
    toast.success(`Tagged: ${prod.name}`);
  };

  const handleCreatePostSubmit = async (e) => {
    e.preventDefault();
    if (!mediaFile) {
      toast.error("Please select a post image.");
      return;
    }
    if (!caption.trim()) {
      toast.error("Caption description is required.");
      return;
    }
    if (taggedProducts.length === 0) {
      toast.error("You must tag at least one product on the image.");
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("media", mediaFile);
      formData.append("caption", caption);
      const tagPayload = taggedProducts.map(t => ({
        productId: t.productId,
        x: t.x,
        y: t.y
      }));
      formData.append("taggedProducts", JSON.stringify(tagPayload));

      const response = await axios.post(`${backendUrl}/api/social`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.success) {
        toast.success("Post published!");
        setCreateModalOpen(false);
        setCaption("");
        setMediaFile(null);
        setMediaPreview("");
        setTaggedProducts([]);
        fetchFeed();
      }
    } catch (err) {
      toast.error("Failed to share post.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchPostLikes = async (postId) => {
    setLikesModalOpen(true);
    setLikesLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/social/${postId}/likes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.data.success) {
        setLikesUsers(response.data.likes);
      } else {
        setLikesUsers([]);
      }
    } catch (err) {
      console.error("Error fetching likes:", err);
      toast.error("Failed to load likes list.");
      setLikesUsers([]);
    } finally {
      setLikesLoading(false);
    }
  };

  const handleLike = async (postId) => {
    if (!token) {
      toast.error("Please log in to like posts.");
      return;
    }
    try {
      const response = await axios.post(`${backendUrl}/api/social/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPosts(posts.map(p => {
          if (p._id === postId) {
            return {
              ...p,
              isLiked: response.data.liked,
              likesCount: response.data.likesCount !== undefined 
                ? response.data.likesCount 
                : Math.max(0, p.likesCount + (response.data.liked ? 1 : -1))
            };
          }
          return p;
        }));
      }
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleImageDoubleClick = (postId) => {
    const post = posts.find(p => p._id === postId);
    if (post && !post.isLiked) {
      handleLike(postId);
    }
    setLikedAnimationPostId(postId);
    setTimeout(() => {
      setLikedAnimationPostId(null);
    }, 800);
  };

  const openComments = async (post) => {
    if (activeCommentsPost?._id === post._id) {
      setActiveCommentsPost(null);
      return;
    }
    setActiveCommentsPost(post);
    setNewComment("");
    setComments([]);
    setLoadingComments(true);
    try {
      const response = await axios.get(`${backendUrl}/api/social/${post._id}/comments`);
      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (err) {
      toast.error("Comments fetch failed.");
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !activeCommentsPost) return;
    if (!token) {
      toast.error("Please log in to comment.");
      return;
    }
    try {
      const response = await axios.post(
        `${backendUrl}/api/social/${activeCommentsPost._id}/comment`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setComments([response.data.comment, ...comments]);
        setNewComment("");
        setPosts(posts.map(p => {
          if (p._id === activeCommentsPost._id) {
            return { ...p, commentsCount: p.commentsCount + 1 };
          }
          return p;
        }));
      }
    } catch (err) {
      toast.error("Failed to add comment.");
    }
  };

  return (
    <div 
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full h-[calc(100vh-var(--navbar-height,76px))] bg-slate-950 sm:bg-[#0b0f19] text-white flex items-center justify-center relative overflow-hidden select-none font-sans antialiased"
    >
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          15% { transform: scale(1.3) rotate(6deg); opacity: 1; }
          30% { transform: scale(0.95) rotate(-3deg); opacity: 1; }
          85% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.5) rotate(6deg); opacity: 0; }
        }
        .animate-heart-pop {
          animation: heartPop 0.75s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes discSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-disc-spin {
          animation: discSpin 4s linear infinite;
        }
      `}</style>

      {/* Desktop Floating Navigation Chevrons (Previous / Next Reel) */}
      <div className="hidden lg:flex flex-col gap-3 absolute right-[calc(50%-270px)] top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={handlePrevPost}
          disabled={currentPostIndex === 0}
          className="h-11 w-11 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          title="Previous Reel (Up Arrow)"
        >
          <ChevronUp size={22} className="stroke-[2.5]" />
        </button>
        <button
          onClick={handleNextPost}
          disabled={currentPostIndex >= displayedPosts.length - 1}
          className="h-11 w-11 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 shadow-2xl flex items-center justify-center transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          title="Next Reel (Down Arrow)"
        >
          <ChevronDown size={22} className="stroke-[2.5]" />
        </button>
      </div>

      {/* ═══════════ SMARTPHONE MOBILE VIEWPORT SHELL ═══════════ */}
      <div className="relative w-full max-w-[430px] h-full sm:h-[calc(100vh-96px)] sm:max-h-[860px] bg-black sm:rounded-[36px] sm:border sm:border-slate-800/90 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between">

        {/* ── Top Header Bar (Overlaid on Reel Media) ── */}
        <div className="absolute top-0 inset-x-0 z-30 bg-gradient-to-b from-black/85 via-black/40 to-transparent p-3 sm:p-4 flex flex-col gap-2">
          
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between">
            {/* Feed Tab Switcher */}
            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10 shadow-xs">
              {["For You", "Following"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    if (tab === "Following" && !token) {
                      toast.info("Please log in to see posts from creators you follow.");
                      return;
                    }
                    setActiveTab(tab);
                    setCurrentPostIndex(0);
                  }}
                  className={`text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full transition cursor-pointer border-none ${
                    activeTab === tab
                      ? "bg-white text-black shadow-xs font-black"
                      : "text-white/70 hover:text-white bg-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Right Action Icons: Stories Toggle & Create Post */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowStoriesRow((p) => !p)}
                className={`h-8 px-2.5 rounded-full backdrop-blur-md border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                  showStoriesRow
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-black/40 text-white/80 border-white/10 hover:bg-black/60"
                }`}
                title="Toggle Stories"
              >
                <Sparkles size={12} className="text-rose-400" />
                <span>Stories</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (token) setCreateModalOpen(true);
                  else toast.info("Please log in to share your style!");
                }}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#FF6A00] to-rose-500 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-lg transition cursor-pointer border-none shrink-0"
                title="Create New Post"
              >
                <Plus size={16} className="stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Collapsible Top Stories Strip */}
          <AnimatePresence>
            {showStoriesRow && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide py-1 pt-0.5 select-none"
              >
                {/* Add Story Button */}
                <div 
                  onClick={() => {
                    if (token) setStoryModalOpen(true);
                    else toast.info("Please log in to add a story.");
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                >
                  <div className="relative h-12 w-12 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-500">
                    <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border-2 border-black">
                      {currentUser?.profilePhoto ? (
                        <img src={currentUser.profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-black">{currentUser?.name?.charAt(0) || "+"}</span>
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center border-2 border-black">
                      <Plus size={10} className="stroke-[3]" />
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-white/80 max-w-[50px] truncate">Your Story</span>
                </div>

                {/* Other User Stories */}
                {stories.map((group) => {
                  const seen = isGroupSeen(group);
                  return (
                    <div
                      key={group._id}
                      onClick={() => {
                        setActiveStoryGroup(group);
                        setActiveStoryIndex(0);
                      }}
                      className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
                    >
                      <div className={`h-12 w-12 rounded-full p-[2px] ${
                        seen
                          ? "bg-slate-700"
                          : "bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 animate-pulse"
                      }`}>
                        <div className="h-full w-full rounded-full bg-black overflow-hidden border-2 border-black">
                          {group.user?.profilePhoto ? (
                            <img src={group.user.profilePhoto} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold uppercase">
                              {group.user?.name?.charAt(0) || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-white/90 max-w-[50px] truncate">{group.user?.name || "Story"}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Main Reel Media Stage ── */}
        <div 
          onDoubleClick={() => activePost && handleImageDoubleClick(activePost._id)}
          className="relative flex-1 w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin text-[#FF6A00] mb-2.5" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-300">Loading Reel...</span>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              <ShoppingBag className="mx-auto text-slate-500 mb-3" size={44} />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-200">No posts in feed</h3>
              <p className="text-xs text-slate-400 mt-1">Be the first creator to share your look!</p>
            </div>
          ) : activePost ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={activePost._id}
                initial={{ y: slideDirection === "next" ? 180 : -180, opacity: 0.2 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: slideDirection === "next" ? -180 : 180, opacity: 0.2 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full h-full relative flex items-center justify-center"
              >
                {/* Full-bleed Reel Background Media */}
                <img
                  src={activePost.mediaUrl}
                  alt={activePost.caption || "Reel"}
                  className="w-full h-full object-cover object-center select-none"
                />

                {/* Double Tap Heart Pop Effect */}
                {likedAnimationPostId === activePost._id && (
                  <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    <Heart size={96} className="fill-rose-500 text-rose-500 drop-shadow-[0_4px_30px_rgba(244,63,94,0.9)] animate-heart-pop" />
                  </div>
                )}

                {/* Tag Overlay hotspots */}
                {activePost.taggedProducts?.map((tag) => {
                  if (!tag.productId) return null;
                  return (
                    <div
                      key={tag._id}
                      style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/tag select-none z-30"
                    >
                      <div className="relative h-6 w-6 flex items-center justify-center cursor-pointer">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500/40 animate-ping" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 border-2 border-white shadow-md" />
                      </div>
                      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 bg-slate-950/95 backdrop-blur-md border border-white/15 p-2.5 rounded-xl shadow-2xl w-44 text-left opacity-0 pointer-events-none group-hover/tag:opacity-100 group-hover/tag:pointer-events-auto transition duration-200 z-40">
                        <div className="flex gap-2 items-center">
                          <img
                            src={tag.productId.images?.[0]}
                            alt=""
                            className="h-8 w-8 object-cover rounded-md bg-slate-800 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[10px] font-black text-white truncate uppercase tracking-tight">
                              {tag.productId.name}
                            </h5>
                            <span className="text-[10px] font-black text-[#FF6A00] block">
                              ₹{tag.productId.price?.toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          ) : null}

          {/* ── Right-Side Vertical Action Column (Reels Style) ── */}
          {activePost && (
            <div className="absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 select-none">
              
              {/* Creator Avatar with Follow Badge */}
              <div className="relative mb-1">
                <div className="h-10 w-10 rounded-full border-2 border-white overflow-hidden bg-slate-800 shadow-md">
                  {activePost.userId?.profilePhoto ? (
                    <img src={activePost.userId.profilePhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center text-xs font-bold uppercase">
                      {activePost.userId?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                {currentUser && activePost.userId && activePost.userId._id !== currentUser._id && !activePost.isFollowingCreator && (
                  <button
                    onClick={() => handleToggleFollowCreator(activePost.userId._id)}
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-4 w-4 rounded-full bg-rose-500 text-white flex items-center justify-center border-2 border-black cursor-pointer hover:scale-110 active:scale-95 transition"
                    title="Follow Creator"
                  >
                    <Plus size={10} className="stroke-[3]" />
                  </button>
                )}
              </div>

              {/* Like Button */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => handleLike(activePost._id)}
                  className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center cursor-pointer border-none active:scale-90 transition shadow-md"
                  title="Like Post"
                >
                  <Heart
                    size={22}
                    className={`transition-all duration-200 ${
                      activePost.isLiked
                        ? "fill-rose-500 text-rose-500 scale-110"
                        : "text-white stroke-[2.2]"
                    }`}
                  />
                </button>
                <span className="text-[10px] font-black text-white drop-shadow-md">
                  {activePost.likesCount || 0}
                </span>
              </div>

              {/* Comments Button */}
              <div className="flex flex-col items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => setCommentsDrawerOpen(true)}
                  className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center cursor-pointer border-none active:scale-90 transition shadow-md"
                  title="View Comments"
                >
                  <MessageCircle size={22} className="stroke-[2.2] text-white" />
                </button>
                <span className="text-[10px] font-black text-white drop-shadow-md">
                  {activePost.commentsCount || comments.length || 0}
                </span>
              </div>

              {/* Bookmark / Save Button */}
              <button
                type="button"
                onClick={() => toggleSave(activePost._id)}
                className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center cursor-pointer border-none active:scale-90 transition shadow-md"
                title="Save Post"
              >
                <Bookmark
                  size={20}
                  className={savedPosts.has(activePost._id) ? "fill-amber-400 text-amber-400" : "text-white stroke-[2.2]"}
                />
              </button>

              {/* Tagged Products Icon (If tagged) */}
              {activePost.taggedProducts && activePost.taggedProducts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setProductDrawerOpen(true)}
                  className="h-10 w-10 rounded-full bg-[#FF6A00]/90 backdrop-blur-md text-white flex items-center justify-center cursor-pointer border-none hover:scale-105 active:scale-90 transition shadow-lg animate-bounce"
                  title="View Tagged Products"
                >
                  <ShoppingBag size={19} className="stroke-[2.5]" />
                </button>
              )}

              {/* Share Button */}
              <button
                type="button"
                onClick={() => handleShare(activePost)}
                className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 flex items-center justify-center cursor-pointer border-none active:scale-90 transition shadow-md"
                title="Share Reel"
              >
                <Share2 size={19} className="stroke-[2.2] text-white" />
              </button>
            </div>
          )}

          {/* ── Bottom Creator Info & Tagged Product Banner (Overlaid) ── */}
          {activePost && (
            <div className="absolute bottom-0 inset-x-0 z-30 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 sm:p-4 pt-10 text-left">
              
              {/* Creator Username + Follow */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-black text-white tracking-wide drop-shadow-md">
                  @{activePost.userId?.name?.replace(/\s+/g, "").toLowerCase() || "creator"}
                </span>
                <CheckCircle2 size={14} className="fill-blue-500 text-white" />
                {currentUser && activePost.userId && activePost.userId._id !== currentUser._id && (
                  <button
                    onClick={() => handleToggleFollowCreator(activePost.userId._id)}
                    className="text-[11px] font-black uppercase text-rose-400 hover:text-rose-300 ml-1 cursor-pointer border-none bg-transparent"
                  >
                    {activePost.isFollowingCreator ? "Following" : "• Follow"}
                  </button>
                )}
              </div>

              {/* Caption */}
              <div className="mb-2">
                <p className={`text-xs text-white/90 font-medium leading-relaxed drop-shadow ${captionExpanded ? "" : "line-clamp-2"}`}>
                  {activePost.caption}
                </p>
                {activePost.caption && activePost.caption.length > 70 && (
                  <button
                    type="button"
                    onClick={() => setCaptionExpanded((p) => !p)}
                    className="text-[10px] font-black text-white/60 hover:text-white uppercase mt-0.5 cursor-pointer border-none bg-transparent"
                  >
                    {captionExpanded ? "less" : "more"}
                  </button>
                )}
              </div>

              {/* Tagged Product Shop Pill (Direct Tap to Buy) */}
              {activePost.taggedProducts?.[0]?.productId && (
                <div 
                  onClick={() => {
                    const prod = activePost.taggedProducts[0].productId;
                    if (prod?._id) window.location.href = `/product/${prod._id}`;
                  }}
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-xs font-bold text-white transition cursor-pointer mb-2 max-w-[85%] truncate"
                >
                  <ShoppingBag size={12} className="text-[#FF6A00] shrink-0" />
                  <span className="truncate">{activePost.taggedProducts[0].productId.name}</span>
                  <span className="text-emerald-400 font-black shrink-0">
                    ₹{activePost.taggedProducts[0].productId.price?.toLocaleString("en-IN")}
                  </span>
                  <ArrowRight size={11} className="text-white/70 shrink-0" />
                </div>
              )}

              {/* Audio Sound Wave Ticker */}
              <div className="flex items-center justify-between text-[11px] text-white/70 font-semibold">
                <div className="flex items-center gap-1.5 truncate">
                  <Music2 size={12} className="text-rose-400 shrink-0 animate-pulse" />
                  <span className="truncate">Original Sound • {activePost.userId?.name || "CartNow"}</span>
                </div>
                {/* Spinning Disc */}
                <div className="h-6 w-6 rounded-full bg-slate-900 border-2 border-white/40 flex items-center justify-center shrink-0 animate-disc-spin">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
            </div>
          )}

          {/* ── Slide-up Comments Drawer (Bottom Sheet) ── */}
          <AnimatePresence>
            {commentsDrawerOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setCommentsDrawerOpen(false)}
                  className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-0 max-h-[72%] h-[72%] bg-slate-900 border-t border-slate-700/80 rounded-t-[28px] z-50 flex flex-col shadow-2xl text-left overflow-hidden"
                >
                  {/* Drawer Handle & Header */}
                  <div className="p-3.5 pb-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto absolute top-2 left-1/2 -translate-x-1/2" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        Comments ({comments.length})
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCommentsDrawerOpen(false)}
                      className="h-7 w-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer border-none"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Comments List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
                    {loadingComments ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                        <Loader2 size={22} className="animate-spin text-[#FF6A00] mb-2" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Loading...</span>
                      </div>
                    ) : comments.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <MessageCircle size={24} className="mx-auto text-slate-600 mb-2" />
                        <p className="text-xs font-bold text-slate-300">No comments yet</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Be the first to comment on this reel!</p>
                      </div>
                    ) : (
                      comments.map((c) => (
                        <div key={c._id} className="flex items-start gap-2.5 text-left">
                          <div className="h-7 w-7 rounded-full bg-slate-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-700">
                            {c.userId?.profilePhoto ? (
                              <img src={c.userId.profilePhoto} alt="" className="h-full w-full object-cover rounded-full" />
                            ) : (
                              <span>{c.userId?.name?.charAt(0) || "U"}</span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white uppercase">{c.userId?.name}</span>
                              <span className="text-[9px] text-slate-500">• {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                            </div>
                            <p className="text-xs text-slate-200 mt-0.5 leading-snug break-words">{c.text}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Comment Input Form */}
                  <form onSubmit={handleAddComment} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={token ? "Add a comment..." : "Log in to comment"}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={!token}
                      className="flex-1 px-3.5 py-2 text-xs border border-slate-700 bg-slate-900 text-white rounded-full outline-none focus:border-[#FF6A00] transition placeholder-slate-500"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim() || !token}
                      className="h-8 w-8 rounded-full bg-[#FF6A00] text-white flex items-center justify-center transition cursor-pointer border-none shrink-0 disabled:opacity-40"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── Tagged Products Quick Drawer ── */}
          <AnimatePresence>
            {productDrawerOpen && activePost?.taggedProducts && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setProductDrawerOpen(false)}
                  className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs"
                />
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="absolute inset-x-0 bottom-0 bg-slate-900 border-t border-slate-700/80 rounded-t-[28px] z-50 p-4 text-left shadow-2xl"
                >
                  <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-3" />
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                      <ShoppingBag size={14} className="text-[#FF6A00]" />
                      <span>Tagged Products ({activePost.taggedProducts.length})</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setProductDrawerOpen(false)}
                      className="h-6 w-6 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center cursor-pointer border-none"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto">
                    {activePost.taggedProducts.map((tag) => {
                      const prod = tag.productId;
                      if (!prod) return null;
                      return (
                        <div
                          key={tag._id}
                          onClick={() => {
                            if (prod._id) window.location.href = `/product/${prod._id}`;
                          }}
                          className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition"
                        >
                          <img
                            src={prod.images?.[0]}
                            alt={prod.name}
                            className="h-12 w-12 rounded-lg object-cover bg-slate-900 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-white truncate">{prod.name}</h5>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-xs font-black text-emerald-400">
                                ₹{prod.price?.toLocaleString("en-IN")}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-[10px] text-slate-500 line-through">
                                  ₹{prod.originalPrice?.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-[#FF6A00] text-white text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer border-none"
                          >
                            Buy Now
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* STORY CREATOR MODAL */}
      <StoryCreatorModal
        isOpen={storyModalOpen}
        onClose={handleStoryModalClose}
        storyMediaFiles={storyMediaFiles}
        storyMediaPreviews={storyMediaPreviews}
        storyActiveIndex={storyActiveIndex}
        setStoryActiveIndex={setStoryActiveIndex}
        removeStoryFile={removeStoryFile}
        onAddMoreFiles={() => fileInputRef.current?.click()}
        storyTaggedProductId={storyTaggedProductId}
        setStoryTaggedProductId={setStoryTaggedProductId}
        storyCaption={storyCaption}
        setStoryCaption={setStoryCaption}
        storyLocation={storyLocation}
        setStoryLocation={setStoryLocation}
        storyPrivacy={storyPrivacy}
        setStoryPrivacy={setStoryPrivacy}
        storyUploading={storyUploading}
        storyUploadProgress={storyUploadProgress}
        allProducts={allProducts}
        onSubmit={handleCreateStorySubmit}
      />

      {/* CREATE POST MODAL */}
      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mediaPreview={mediaPreview}
        setMediaPreview={setMediaPreview}
        setMediaFile={setMediaFile}
        taggedProducts={taggedProducts}
        setTaggedProducts={setTaggedProducts}
        caption={caption}
        setCaption={setCaption}
        submitting={submitting}
        onSubmit={handleCreatePostSubmit}
        handleFileChange={handleFileChange}
        handleImageClick={handleImageClick}
        removeTag={removeTag}
        imagePreviewRef={imagePreviewRef}
        purchasedProducts={purchasedProducts}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        currentUser={currentUser}
        allProducts={allProducts}
      />


      {/* INSTAGRAM STYLE STORY SLIDESHOW VIEWER OVERLAY */}
      <StorySlideshowOverlay
        activeStoryGroup={activeStoryGroup}
        activeStoryIndex={activeStoryIndex}
        setActiveStoryIndex={setActiveStoryIndex}
        setActiveStoryGroup={setActiveStoryGroup}
        currentUser={currentUser}
        onDeleteStory={handleDeleteStory}
        stories={stories}
      />

      {/* LIKES VIEWER MODAL */}
      <LikesModal
        isOpen={likesModalOpen}
        onClose={() => setLikesModalOpen(false)}
        likes={likesUsers}
        loading={likesLoading}
        onToggleFollow={handleToggleFollowCreator}
        currentUser={currentUser}
      />
    </div>
  );
};

export default SocialFeed;
