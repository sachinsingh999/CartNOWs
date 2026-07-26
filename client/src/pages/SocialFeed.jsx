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

  // Filter tabs
  const [activeTab, setActiveTab] = useState("For You");

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
    <div className="h-[calc(100vh-var(--navbar-height,76px))] bg-[#fafafb] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased overflow-hidden">
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
      {/* NEW PREMIUM RESPONSIVE GRID LAYOUT */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4 flex gap-6 items-stretch justify-center flex-1 h-full min-h-0 overflow-hidden" data-lenis-prevent>
        
        {/* COLUMN 1: LEFT PROFILE & NAVIGATION PANEL (Desktop Only) */}
        <aside className="hidden lg:flex flex-col gap-5 w-64 shrink-0 overflow-y-auto pr-1 h-full scrollbar-thin select-none py-1">
          {/* PROFILE CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden shadow-xs text-center relative group">
            {/* Gradient Header background */}
            <div className="h-20 w-full bg-gradient-to-r from-blue-600/90 to-indigo-600/90 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/10 opacity-30" />
            </div>
            
            {/* Avatar overlapping */}
            <div className="relative -mt-10 mb-3 inline-flex">
              <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
                {currentUser?.profilePhoto ? (
                  <img src={currentUser.profilePhoto} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-2xl">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="px-4 pb-6">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-white uppercase tracking-tight flex items-center justify-center gap-1">
                <span>{currentUser?.name || "Anonymous Guest"}</span>
                {currentUser && <CheckCircle2 size={13} className="text-blue-500 fill-blue-500/10 stroke-[3]" />}
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 truncate">{currentUser?.email || "Community Member"}</p>
              
              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-left">
                <div className="pl-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">My Posts</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{posts.filter(p => p.userId?._id === currentUser?._id).length}</span>
                </div>
                <div className="border-l border-slate-150 dark:border-slate-800/80 pl-4">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-wider block">Following</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">{currentUser?.following?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QUICK LINKS PANEL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-5 shadow-xs">
            <h4 className="text-[10.5px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-500 mb-3.5 text-left pl-2">Navigation</h4>
            <div className="flex flex-col gap-1">
              {[
                { label: "Community Feed", path: "/social", icon: Compass, active: true },
                { label: "Marketplace Catalog", path: "/product", icon: ShoppingBag, active: false },
                { label: "Explore Discover", path: "/discover", icon: Sparkles, active: false },
                { label: "Personal Wishlist", path: "/wishlist", icon: Heart, active: false },
                { label: "Order Tracking", path: "/profile", icon: User, active: false }
              ].map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-md text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    link.active
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {React.createElement(link.icon, { size: 15, className: "shrink-0 stroke-[2.5]" })}
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* COLUMN 2: CENTER COLUMN (Stories & Feed) */}
        <main className={`flex-1 min-w-0 h-full overflow-y-auto pr-2 space-y-6 pb-8 scrollbar-thin ${activeCommentsPost ? "max-w-[950px]" : "max-w-[620px]"}`}>
          
          {/* Feed Title and Info Header */}
          <div className="flex items-center justify-between gap-4 select-none pb-2">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4e20]">Cartnow Social</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Community Feed</h1>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium mt-1">Share your style. Tag your purchases. Inspire others.</p>
            </div>
            
            {/* Notification Bell */}
            <div className="relative cursor-pointer hover:scale-105 active:scale-95 transition duration-150 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
              <Bell size={20} className="text-slate-800 dark:text-slate-200 stroke-[2.5]" />
              <span className="absolute top-2 right-2 flex h-1.5 w-1.5 rounded-full bg-[#f43f5e] ring-2 ring-white dark:ring-slate-900" />
            </div>
          </div>

          {/* RESTORED & BEAUTIFIED STORIES CAROUSEL */}
          {/* RESTORED & BEAUTIFIED STORIES CAROUSEL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-2.5 px-3.5 flex gap-4.5 overflow-x-auto scrollbar-hide select-none shadow-xs items-center">
            <input 
              type="file" 
              accept="image/*,video/*" 
              ref={fileInputRef} 
              onChange={handleStoryFileChange} 
              className="hidden" 
              multiple
            />

            {/* Your Story Circle */}
            {(() => {
              const myStoryGroup = stories.find(s => s._id === currentUser?._id);
              return (
                <div 
                  onClick={() => {
                    if (!token) {
                      toast.info("Please log in to add stories!");
                      return;
                    }
                    if (myStoryGroup) {
                      setActiveStoryGroup(myStoryGroup);
                      setActiveStoryIndex(0);
                    } else {
                      setStoryModalOpen(true);
                    }
                  }}
                  className="flex flex-col items-center shrink-0 cursor-pointer relative group"
                >
                  <div className={`h-11.5 w-11.5 rounded-full p-[2px] transition-all duration-300 group-hover:scale-105 ${
                    myStoryGroup 
                      ? (isGroupSeen(myStoryGroup) 
                          ? "bg-slate-200 dark:bg-slate-800" 
                          : "bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500 animate-pulse")
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}>
                    <div className="h-full w-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {currentUser?.profilePhoto ? (
                        <img src={currentUser.profilePhoto} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-indigo-55 dark:bg-indigo-950 text-indigo-500 dark:text-indigo-400 font-extrabold text-xs">
                          {currentUser?.name?.charAt(0) || "+"}
                        </div>
                      )}
                    </div>
                  </div>
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!token) {
                        toast.info("Please log in to add stories!");
                        return;
                      }
                      if (fileInputRef.current) fileInputRef.current.click();
                    }}
                    className="absolute right-0 bottom-4.5 bg-[#ff4e20] hover:bg-rose-600 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900 flex items-center justify-center transition hover:scale-110 active:scale-90 shadow-sm z-10"
                    title="Upload new story"
                  >
                    <Plus size={7} className="stroke-[4]" />
                  </div>
                  <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 mt-1 tracking-wider truncate w-16 text-center">
                    Your Story
                  </span>
                </div>
              );
            })()}

            {/* Other users' stories */}
            {stories
              .filter(s => s._id !== currentUser?._id)
              .map(group => {
                const avatar = group.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
                return (
                  <div 
                    key={group._id} 
                    onClick={() => {
                      setActiveStoryGroup(group);
                      setActiveStoryIndex(0);
                    }}
                    className="flex flex-col items-center shrink-0 cursor-pointer relative group animate-fade-in"
                  >
                    <div className={`h-11.5 w-11.5 rounded-full p-[2px] transition-all duration-300 group-hover:scale-105 ${
                      isGroupSeen(group)
                        ? "bg-slate-200 dark:bg-slate-800"
                        : "bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-500"
                    }`}>
                      <div className="h-full w-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={avatar} alt="" className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 mt-1 tracking-wider truncate w-16 text-center">
                      {group.name.split(" ")[0]}
                    </span>
                  </div>
                );
              })
            }
          </div>

          {/* WHAT'S ON YOUR MIND? POST BOX */}
          <div 
            onClick={() => {
              if (token) {
                setCreateModalOpen(true);
              } else {
                toast.info("Please log in to share your style!");
              }
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-lg p-4.5 flex items-center justify-between shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer select-none"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="relative h-11 w-11 rounded-full border border-dashed border-indigo-400 flex items-center justify-center bg-indigo-55/50 dark:bg-indigo-950/20 shrink-0">
                <Plus size={16} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
              </div>
              <div className="text-left min-w-0 flex-1 pr-4">
                <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">What’s on your mind?</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium truncate">Share your style, tagged purchases, and vibes.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                <button 
                  type="button" 
                  onClick={() => token ? setCreateModalOpen(true) : toast.info("Please log in to share your style!")}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-slate-400 dark:text-slate-500 border-none bg-transparent cursor-pointer"
                >
                  <ImageIcon size={18} className="stroke-[2.5]" />
                </button>
                <button 
                  type="button" 
                  onClick={() => token ? setCreateModalOpen(true) : toast.info("Please log in to share your style!")}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-slate-400 dark:text-slate-500 border-none bg-transparent cursor-pointer"
                >
                  <Tag size={18} className="stroke-[2.5]" />
                </button>
              </div>
              <button 
                type="button"
                onClick={() => {
                  if (token) {
                    setCreateModalOpen(true);
                  } else {
                    toast.info("Please log in to share your style!");
                  }
                }}
                className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition duration-150 shadow-sm border-none cursor-pointer active:scale-95"
              >
                Post
              </button>
            </div>
          </div>

          {/* POSTS FEED */}
          <div className="space-y-6">
            {/* Feed Filter Tab Switcher */}
            <div className="flex gap-6 border-b border-slate-100 dark:border-slate-800 pb-3 select-none justify-start px-2">
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
                  }}
                  className={`pb-1.5 text-[11px] font-black uppercase tracking-widest relative cursor-pointer border-none bg-transparent transition ${
                    activeTab === tab 
                      ? "text-indigo-600 dark:text-indigo-400" 
                      : "text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350"
                  }`}
                >
                  <span>{tab}</span>
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeFeedTabLine"
                      className="absolute bottom-0 inset-x-0 h-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full"
                    />
                  )}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-500 mb-2 stroke-1.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Loading Feed...</span>
              </div>
            ) : displayedPosts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-lg p-12 text-center select-none shadow-2xs">
                <ShoppingBag className="mx-auto text-slate-350 dark:text-slate-700 mb-3.5 stroke-1.5" size={42} />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">
                  {activeTab === "Following" ? "No posts from creators you follow" : "No community posts yet"}
                </h3>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                  {activeTab === "Following" 
                    ? "Find and follow active creators from the Suggested list on the right to build your personal feed!"
                    : "Be the first to share your recent purchases with the CartNow community and tag your setup!"}
                </p>
                {token && activeTab !== "Following" && (
                  <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="mt-4 px-4 py-2.5 bg-[#ff4e20] hover:bg-[#e03d12] text-white text-[10px] font-black uppercase tracking-wider rounded-xl border-none cursor-pointer active:scale-95 transition"
                  >
                    Share A Purchase
                  </button>
                )}
              </div>
            ) : (
              displayedPosts.map(post => (
                <div 
                  key={post._id} 
                  className={`flex flex-col md:flex-row gap-4 items-stretch justify-center w-full transition-all duration-300 mx-auto ${
                    activeCommentsPost?._id === post._id ? "max-w-[1000px]" : "max-w-[620px]"
                  }`}
                >
                  <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden shadow-2xs flex flex-col justify-between">
                    {/* Post Card Header */}
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center text-xs font-black uppercase overflow-hidden shrink-0">
                          {post.userId?.profilePhoto ? (
                            <img src={post.userId.profilePhoto} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span>{post.userId?.name?.charAt(0) || "U"}</span>
                          )}
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[12.5px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-none">
                              {post.userId?.name || "anonymous"}
                            </span>
                            <CheckCircle2 size={11} className="text-blue-500 fill-blue-500/10 stroke-[3] shrink-0 animate-pulse" />
                            
                            {/* Follow/Unfollow button */}
                            {currentUser && post.userId && post.userId._id !== currentUser._id && (
                              <button
                                onClick={() => handleToggleFollowCreator(post.userId._id)}
                                className="text-[9.5px] font-black uppercase text-[#ff4e20] hover:text-rose-600 cursor-pointer border-none bg-transparent select-none ml-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800/80 leading-none h-3"
                              >
                                {post.isFollowingCreator ? "Unfollow" : "Follow"}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 select-none">
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                              {new Date(post.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                            <span className="text-slate-300 dark:text-slate-700 font-black text-[8px]">•</span>
                            <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 leading-none bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md border border-emerald-100/30 dark:border-emerald-900/30">
                              <CheckCircle2 size={9} className="fill-emerald-500/10 stroke-[3]" />
                              <span className="text-[8.5px] font-black uppercase tracking-tight">Verified Purchase</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white border-none bg-transparent cursor-pointer p-1 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
                        <MoreHorizontal size={15} />
                      </button>
                    </div>

                    {/* Caption */}
                    <div className="px-4 pb-3.5 text-left">
                      <p className="text-[13px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200 break-words whitespace-pre-line">
                        {post.caption}
                      </p>
                    </div>

                    {/* Image container w/ Tagged Product Overlay Card */}
                    <div 
                      onDoubleClick={() => handleImageDoubleClick(post._id)}
                      className="relative w-full max-h-[580px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center cursor-pointer select-none overflow-hidden"
                    >
                      <img 
                        src={post.mediaUrl} 
                        alt="" 
                        className="w-full h-auto max-h-[580px] object-contain select-none animate-fade-in" 
                      />

                      {/* Double Click Heart Pop */}
                      {likedAnimationPostId === post._id && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <Heart size={64} className="fill-white text-white drop-shadow-[0_4px_20px_rgba(244,63,94,0.45)] animate-heart-pop" />
                        </div>
                      )}

                      {/* Tag Overlay hotspots */}
                      {post.taggedProducts?.map(tag => {
                        if (!tag.productId) return null;
                        return (
                          <div 
                            key={tag._id}
                            style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 group/tag select-none z-10"
                          >
                            <div className="relative h-5 w-5 flex items-center justify-center cursor-pointer">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-[#ff4e20]/30 animate-ping" />
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff4e20] border border-white" />
                            </div>

                            {/* Floating interactive tooltip */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-2.5 rounded-md shadow-xl w-48 text-left opacity-0 pointer-events-none group-hover/tag:opacity-100 group-hover/tag:pointer-events-auto transition duration-200 transform scale-95 origin-top group-hover/tag:scale-100 z-30">
                              <div className="flex gap-2">
                                <img src={tag.productId.images?.[0]} alt="" className="h-9 w-9 object-cover rounded-xl border border-slate-100/50 dark:border-slate-800 bg-white" />
                                <div className="min-w-0 flex-1">
                                  <h5 className="text-[10px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tight leading-tight">{tag.productId.name}</h5>
                                  <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 block mt-1">₹{tag.productId.price?.toLocaleString("en-IN")}</span>
                                </div>
                              </div>
                              <a 
                                href={`/product/${tag.productId._id}`}
                                className="w-full inline-flex items-center justify-center gap-1.5 mt-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition no-underline border-none"
                              >
                                <ShoppingBag size={10} />
                                <span>View Details</span>
                              </a>
                            </div>
                          </div>
                        );
                      })}

                      {/* Tagged Product Horizontal Banner Overlay */}
                      {post.taggedProducts?.[0] && post.taggedProducts[0].productId && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/60 p-2.5 rounded-md flex items-center justify-between gap-3 shadow-lg select-none">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img 
                              src={post.taggedProducts[0].productId.images?.[0]} 
                              alt="" 
                              className="h-10 w-10 object-cover rounded-xl bg-slate-50 border border-slate-200/50 dark:border-slate-800" 
                            />
                            <div className="min-w-0 text-left">
                              <h5 className="text-[10px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tight leading-tight">
                                {post.taggedProducts[0].productId.name}
                              </h5>
                              <span className="text-[10px] font-black text-[#ff4e20] block mt-0.5">
                                ₹{post.taggedProducts[0].productId.price?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <a 
                              href={`/product/${post.taggedProducts[0].productId._id}`}
                              className="px-3.5 py-1.5 bg-[#ff4e20] hover:bg-[#e03d12] text-white text-[9px] font-black uppercase tracking-wider rounded-xl transition duration-200 no-underline shrink-0 border-none cursor-pointer"
                            >
                              Buy Now
                            </a>
                            <button className="h-7 w-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border-none cursor-pointer transition">
                              <ShoppingCart size={11} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1.5 min-w-[42px]">
                            <motion.button 
                              whileTap={{ scale: 0.7 }}
                              whileHover={{ scale: 1.15 }}
                              onClick={() => handleLike(post._id)}
                              className="flex items-center text-slate-500 dark:text-slate-400 hover:text-rose-500 transition border-none bg-transparent cursor-pointer p-0"
                            >
                              <motion.div
                                key={post.isLiked ? "liked" : "unliked"}
                                initial={{ scale: 0.7 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 450, damping: 12 }}
                                className="flex items-center justify-center"
                              >
                                <Heart 
                                  size={19} 
                                  className={`transition-colors duration-250 ${post.isLiked ? "fill-rose-500 text-rose-500" : "text-slate-450 dark:text-slate-550 hover:text-rose-500"}`} 
                                />
                              </motion.div>
                            </motion.button>
                            <span 
                              onClick={() => fetchPostLikes(post._id)}
                              className="text-[11px] font-black text-slate-550 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer select-none"
                              title="See who liked this post"
                            >
                              {post.likesCount}
                            </span>
                          </div>

                          <button 
                            onClick={() => openComments(post)}
                            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer p-0 min-w-[42px]"
                          >
                            <MessageCircle size={19} className="text-slate-450 dark:text-slate-550 hover:text-slate-600 dark:hover:text-slate-300" />
                            <span className="text-[11px] font-black text-slate-550 dark:text-slate-400">{post.commentsCount}</span>
                          </button>

                          <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer p-0 min-w-[40px]">
                            <Send size={15} className="text-slate-450 dark:text-slate-550 hover:text-slate-600" />
                            <span className="text-[11px] font-black text-slate-550 dark:text-slate-400">{post.sharesCount || 0}</span>
                          </button>
                        </div>

                        <button 
                          onClick={() => toggleSave(post._id)}
                          className="text-slate-450 hover:text-slate-700 dark:hover:text-white transition border-none bg-transparent cursor-pointer p-0"
                        >
                          <Bookmark size={19} className={savedPosts.has(post._id) ? "fill-slate-800 dark:fill-white text-slate-800 dark:text-white" : "text-slate-450 dark:text-slate-550"} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment Section side-by-side inside Feed */}
                  {activeCommentsPost?._id === post._id && (
                    <div className="w-full md:w-[350px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg overflow-hidden shadow-2xs flex flex-col animate-slide-left h-auto min-h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                        <div className="text-left">
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white">Comments</h4>
                          <span className="text-[7.5px] text-slate-400 uppercase font-black tracking-widest mt-0.5 block">Live Q&A Discussion</span>
                        </div>
                        <button
                          onClick={() => setActiveCommentsPost(null)}
                          className="text-slate-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[480px] md:max-h-[540px]">
                        {loadingComments ? (
                          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 size={18} className="animate-spin text-indigo-500 mb-1" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Loading...</span>
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="py-12 text-center text-slate-400">
                            <MessageCircle size={16} className="mx-auto text-slate-300 mb-1" />
                            <span className="text-[8.5px] font-black uppercase tracking-wider text-slate-450">No discussions yet</span>
                            <p className="text-[7.5px] text-slate-400 mt-0.5">Start the conversation below!</p>
                          </div>
                        ) : (
                          comments.map(c => (
                            <div key={c._id} className="flex items-start gap-2.5 text-left animate-fade-in">
                              <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black uppercase overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                {c.userId?.profilePhoto ? (
                                  <img src={c.userId.profilePhoto} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{c.userId?.name?.charAt(0) || "U"}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{c.userId?.name}</span>
                                  <span className="text-[7px] text-slate-400 dark:text-slate-500 font-bold">{new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                                </div>
                                <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 break-words">{c.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Comment Form */}
                      <form onSubmit={handleAddComment} className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex gap-1.5 shrink-0 mt-auto">
                        <input
                          type="text"
                          placeholder={token ? "Add a comment..." : "Log in to comment"}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          disabled={!token}
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none focus:border-indigo-500 transition disabled:bg-slate-100 disabled:dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 placeholder-slate-500 font-medium"
                        />
                        <button
                          type="submit"
                          disabled={!newComment.trim() || !token}
                          className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 transition cursor-pointer border-none shrink-0"
                        >
                          <Send size={11} className="text-white" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        {/* COLUMN 3: RIGHT DISCOVER & TRENDS SIDEBAR (Desktop Only) */}
        <aside className="hidden xl:flex flex-col gap-5 w-80 shrink-0 overflow-y-auto pl-1 h-full scrollbar-thin select-none text-left py-1">
          
          {/* SUGGESTED CREATORS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 pl-1">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5">
                <Users size={12} className="stroke-[2.5]" />
                <span>Suggested Creators</span>
              </h4>
            </div>
            
            {suggestedCreators && suggestedCreators.length > 0 ? (
              <div className="space-y-4">
                {suggestedCreators.slice(0, 5).map(creator => (
                  <div key={creator._id} className="flex items-center justify-between gap-3 animate-fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-8.5 w-8.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/40 overflow-hidden flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                        {creator.profilePhoto ? (
                          <img src={creator.profilePhoto} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{creator.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[11.5px] font-black text-slate-850 dark:text-slate-100 uppercase tracking-tight block leading-tight truncate">
                          {creator.name}
                        </span>
                        <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 block leading-tight truncate mt-0.5">Verified Shop</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleFollowUser(creator._id)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition duration-150 active:scale-95 shrink-0 border-none cursor-pointer ${
                        creator.isFollowing
                          ? "bg-slate-100 dark:bg-slate-850 text-slate-550 dark:text-slate-400 hover:bg-slate-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      }`}
                    >
                      {creator.isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium italic pl-1">No creator recommendations right now</p>
            )}
          </div>

          {/* TRENDING HASHTAGS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-5 shadow-xs">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5 mb-4 pl-1">
              <Hash size={12} className="stroke-[2.5]" />
              <span>Trending Vibe</span>
            </h4>
            
            <div className="flex flex-col gap-3">
              {trendingHashtags && trendingHashtags.length > 0 ? (
                trendingHashtags.slice(0, 5).map((hash, idx) => (
                  <div key={idx} className="flex justify-between items-center pl-1 select-none cursor-pointer group animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-[10.5px] font-bold text-slate-450 dark:text-slate-400 group-hover:text-indigo-500 transition-colors">#{hash.name}</span>
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-400 bg-slate-55 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-800/40">
                      {hash.count} Posts
                    </span>
                  </div>
                ))
              ) : (
                // Fallback trending tags
                ["OOTD", "SummerPicks", "CartNowFit", "TechGear", "BeautyFavs"].map((tag, idx) => (
                  <div key={idx} className="flex justify-between items-center pl-1 cursor-pointer group">
                    <span className="text-[11px] font-black text-slate-650 dark:text-slate-350 group-hover:text-indigo-500 transition-colors">#{tag}</span>
                    <span className="text-[8.5px] font-black uppercase text-slate-450 bg-slate-50 dark:bg-slate-850 px-2 py-0.5 rounded-md border border-slate-150/40 dark:border-slate-800/50">
                      {24 + (5 - idx) * 7} Posts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TOP SHOPPABLE PICKS */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-lg p-5 shadow-xs">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-550 flex items-center gap-1.5 mb-4 pl-1">
              <ShoppingBag size={12} className="stroke-[2.5]" />
              <span>Shoppable Picks</span>
            </h4>
            
            {topPicks && topPicks.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5">
                {topPicks.slice(0, 4).map(prod => (
                  <div 
                    key={prod._id}
                    onClick={() => window.location.href = `/product/${prod._id}`}
                    className="group border border-slate-200/50 dark:border-slate-800 rounded-md p-2 bg-slate-50/50 dark:bg-slate-950/20 hover:border-indigo-400 hover:shadow-xs transition duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-1 border border-slate-100 dark:border-slate-850">
                      <img 
                        src={prod.images?.[0] || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100"} 
                        alt="" 
                        className="w-full h-full object-contain group-hover:scale-105 transition duration-300" 
                      />
                    </div>
                    <div className="mt-2 text-left min-w-0 pr-0.5">
                      <h5 className="text-[8.5px] font-black text-slate-800 dark:text-slate-200 truncate uppercase tracking-tight">{prod.brand || "CartNOW"}</h5>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5 font-semibold">{prod.name}</p>
                      <span className="text-[9.5px] font-black text-indigo-600 dark:text-indigo-400 mt-1 block">₹{prod.price?.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium italic pl-1">No shoppable picks loaded</p>
            )}
          </div>

        </aside>

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
