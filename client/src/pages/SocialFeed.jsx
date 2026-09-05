import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { 
  Heart, MessageCircle, Plus, X, ShoppingBag, CheckCircle2, 
  Image as ImageIcon, Loader2, Sparkles, Send, Globe,
  Bookmark, MoreHorizontal, Smile, Paperclip, Home as HomeIcon,
  Search, Bell, User, MessageSquare, Compass, Play, Users, 
  FolderHeart, ShoppingCart, HelpCircle, Eye, Star, ChevronLeft, ChevronRight, Tag, Upload,
  Undo, Redo, Sliders, Music, BarChart2, Calendar, Trash2, Layers,
  Type, Copy, RotateCw, Maximize2, Sun, Moon, MapPin, Hash
} from "lucide-react";
import { backendUrl } from "../config";
import Logo from "../components/Logo";
import StoryCreatorModal from "../components/StoryCreatorModal";
import StorySlideshowOverlay from "../components/StorySlideshowOverlay";
import CreatePostModal from "../components/CreatePostModal";
import LikesModal from "../components/LikesModal";
import { motion } from "framer-motion";

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
      className="w-full h-[calc(100vh-var(--navbar-height,76px))] bg-[#f4f6fb] text-slate-900 flex flex-col md:flex-row overflow-hidden relative select-none font-sans antialiased"
    >
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          15% { transform: scale(1.2) rotate(5deg); opacity: 0.9; }
          30% { transform: scale(0.95) rotate(-3deg); opacity: 1; }
          85% { transform: scale(1) rotate(0deg); opacity: 1; }
          100% { transform: scale(1.4) rotate(5deg); opacity: 0; }
        }
        .animate-heart-pop {
          animation: heartPop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>

      {/* LEFT FULL-PAGE POST STAGE */}
      <div className="flex-1 flex flex-col justify-between h-full bg-[#f4f6fb] relative overflow-hidden border-r border-slate-200/80">
        
        {/* Top Floating Control Header */}
        <div className="p-4 sm:p-6 flex items-center justify-between z-30">
          {/* Tab Filter Switcher + (+) Button */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-full border border-slate-200/80 shadow-xs">
            {["For You", "Following"].map(tab => (
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
                className={`text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full transition cursor-pointer border-none ${
                  activeTab === tab 
                    ? "bg-[#5842f6] text-white shadow-xs" 
                    : "text-[#475569] hover:text-slate-900 bg-transparent"
                }`}
              >
                {tab}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                if (token) {
                  setCreateModalOpen(true);
                } else {
                  toast.info("Please log in to share your style!");
                }
              }}
              className="h-7 w-7 rounded-full bg-[#d946ef] hover:bg-[#c026d3] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer border-none shadow-xs ml-0.5 shrink-0"
              title="Create New Post"
            >
              <Plus size={16} className="stroke-[3]" />
            </button>
          </div>

          {/* Post Counter Badge */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-800 bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-xs">
              Post {displayedPosts.length > 0 ? currentPostIndex + 1 : 0} of {displayedPosts.length}
            </span>
          </div>
        </div>

        {/* Post Media Stage with Smooth Framer Motion Slide Transition */}
        <div className="flex-1 flex items-center justify-center relative p-4 sm:p-8 overflow-hidden">
          
          {/* Left Arrow Nav */}
          {currentPostIndex > 0 && (
            <button
              onClick={handlePrevPost}
              className="absolute left-6 sm:left-10 top-1/2 -translate-y-1/2 z-40 h-10 w-10 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 shadow-md flex items-center justify-center transition cursor-pointer active:scale-90"
              title="Previous Post"
            >
              <ChevronLeft size={20} className="stroke-[2.5]" />
            </button>
          )}

          {/* Right Arrow Nav */}
          {currentPostIndex < displayedPosts.length - 1 && (
            <button
              onClick={handleNextPost}
              className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 z-40 h-10 w-10 rounded-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 shadow-md flex items-center justify-center transition cursor-pointer active:scale-90"
              title="Next Post"
            >
              <ChevronRight size={20} className="stroke-[2.5]" />
            </button>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Loader2 size={28} className="animate-spin text-[#5842f6] mb-2" />
              <span className="text-xs font-black uppercase tracking-widest">Loading Feed...</span>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="text-center p-8">
              <ShoppingBag className="mx-auto text-slate-400 mb-3" size={48} />
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">No posts found</h3>
              <p className="text-xs text-slate-500 mt-1">Be the first to share your purchase!</p>
            </div>
          ) : activePost ? (
            <motion.div
              key={activePost._id}
              initial={{ x: slideDirection === "next" ? 350 : -350, opacity: 0.1, scale: 0.95 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: slideDirection === "next" ? -350 : 350, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full flex flex-col items-center justify-center relative"
            >
              {/* Media Image Container */}
              <div 
                onDoubleClick={() => handleImageDoubleClick(activePost._id)}
                className="relative max-h-[calc(100vh-220px)] max-w-full rounded-lg overflow-hidden shadow-md flex items-center justify-center bg-white border border-slate-200/80"
              >
                <img
                  src={activePost.mediaUrl}
                  alt=""
                  className="max-h-[calc(100vh-220px)] max-w-full object-contain select-none"
                />

                {/* Double Tap Heart Animation */}
                {likedAnimationPostId === activePost._id && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <Heart size={80} className="fill-rose-500 text-rose-500 drop-shadow-[0_4px_30px_rgba(244,63,94,0.7)] animate-heart-pop" />
                  </div>
                )}

                {/* Tag Overlay hotspots */}
                {activePost.taggedProducts?.map(tag => {
                  if (!tag.productId) return null;
                  return (
                    <div 
                      key={tag._id}
                      style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/tag select-none z-10"
                    >
                      <div className="relative h-5 w-5 flex items-center justify-center cursor-pointer">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500/30 animate-ping" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border border-white" />
                      </div>
                      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-xl shadow-xl w-48 text-left opacity-0 pointer-events-none group-hover/tag:opacity-100 group-hover/tag:pointer-events-auto transition duration-200 z-30">
                        <div className="flex gap-2">
                          <img src={tag.productId.images?.[0]} alt="" className="h-9 w-9 object-cover rounded-lg bg-slate-50 border border-slate-100" />
                          <div className="min-w-0 flex-1">
                            <h5 className="text-[10px] font-black text-slate-900 truncate uppercase tracking-tight">{tag.productId.name}</h5>
                            <span className="text-[10px] font-black text-[#5842f6] block mt-0.5">₹{tag.productId.price?.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* Bottom Creator Info & Actions Overlay */}
        {activePost && (
          <div className="p-4 sm:p-6 z-30">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                <div className="h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-xs font-black uppercase overflow-hidden shrink-0 shadow-2xs">
                  {activePost.userId?.profilePhoto ? (
                    <img src={activePost.userId.profilePhoto} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span>{activePost.userId?.name?.charAt(0) || "U"}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black uppercase tracking-wide text-slate-900 truncate">{activePost.userId?.name || "Anonymous"}</span>
                    {currentUser && activePost.userId && activePost.userId._id !== currentUser._id && (
                      <button
                        onClick={() => handleToggleFollowCreator(activePost.userId._id)}
                        className="text-xs font-black uppercase text-rose-500 hover:text-rose-600 cursor-pointer border-none bg-transparent"
                      >
                        {activePost.isFollowingCreator ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium truncate mt-0.5">{activePost.caption}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => handleLike(activePost._id)}
                  className="flex items-center gap-1.5 text-slate-700 hover:text-rose-500 transition border-none bg-transparent cursor-pointer"
                >
                  <Heart size={20} className={activePost.isLiked ? "fill-rose-500 text-rose-500" : ""} />
                  <span className="text-xs font-black">{activePost.likesCount}</span>
                </button>

                <button
                  onClick={() => toggleSave(activePost._id)}
                  className="text-slate-700 hover:text-slate-900 transition border-none bg-transparent cursor-pointer"
                >
                  <Bookmark size={20} className={savedPosts.has(activePost._id) ? "fill-slate-900 text-slate-900" : ""} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT FULL-HEIGHT COMMENTS PANEL */}
      <div className="w-full md:w-[380px] lg:w-[400px] bg-white border-l border-slate-200/80 flex flex-col h-full shrink-0 z-30">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Comments</h3>
            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block mt-0.5">Live Discussion</span>
          </div>
          <span className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center border border-indigo-100/50">
            {comments.length}
          </span>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {loadingComments ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={24} className="animate-spin text-[#5842f6] mb-2" />
              <span className="text-[9px] font-black uppercase tracking-widest">Loading Comments...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <MessageCircle size={24} className="mx-auto text-slate-300 mb-2" />
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">No discussions yet</span>
              <p className="text-[9px] text-slate-400 mt-1">Be the first to comment on this fit!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c._id} className="border-b border-slate-100/80 pb-3 mb-3 last:border-none">
                <div className="flex items-start gap-3 text-left">
                  <div className="h-8 w-8 rounded-full bg-indigo-50 text-indigo-600 font-black text-[10px] flex items-center justify-center shrink-0 border border-indigo-100/40">
                    {c.userId?.profilePhoto ? (
                      <img src={c.userId.profilePhoto} alt="" className="h-full w-full object-cover rounded-full" />
                    ) : (
                      <span>{c.userId?.name?.charAt(0) || "U"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 uppercase">{c.userId?.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium">• {new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 leading-relaxed mt-0.5 break-words">{c.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={handleAddComment} className="p-4 bg-white border-t border-slate-100 flex items-center gap-3 shrink-0">
          <input
            type="text"
            placeholder={token ? "Write a comment..." : "Log in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!token}
            className="flex-1 px-4 py-2.5 text-xs border border-slate-200/80 bg-white text-slate-800 rounded-full outline-none focus:border-[#5842f6] transition placeholder-slate-400 font-medium"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || !token}
            className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 hover:bg-[#5842f6] hover:text-white flex items-center justify-center transition cursor-pointer border-none shrink-0 shadow-2xs disabled:bg-slate-100 disabled:text-slate-300"
          >
            <Send size={14} />
          </button>
        </form>
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
