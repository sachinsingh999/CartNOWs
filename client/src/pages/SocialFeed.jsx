import React, { useState, useEffect, useRef } from "react";
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

const SocialFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token] = useState(localStorage.getItem("token") || "");
  const [currentUser, setCurrentUser] = useState(null);

  // Filter tabs
  const [activeTab, setActiveTab] = useState("For You");

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
  const [storyMediaFile, setStoryMediaFile] = useState(null);
  const [storyMediaPreview, setStoryMediaPreview] = useState("");
  const [storyMediaType, setStoryMediaType] = useState("image"); // "image" or "video"
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
      const response = await axios.get(`${backendUrl}/api/social/suggested-creators`);
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
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    setStoryMediaFile(file);
    setStoryMediaPreview(URL.createObjectURL(file));
    setStoryMediaType(isVideo ? "video" : "image");
    setStoryModalOpen(true);
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
    if (storyMode === "file" && !storyMediaFile) {
      toast.error("Please select an image or video first.");
      return;
    }

    let finalOverlayText = storyOverlayText;
    if (storyMode === "text") {
      const textLayers = canvasElements.filter(el => el.type === "text").map(el => el.value);
      if (textLayers.length > 0) {
        finalOverlayText = textLayers.join(" ");
      } else {
        finalOverlayText = "Story Card"; // Fallback to satisfy backend
      }
    }

    try {
      setStoryUploading(true);
      setStoryUploadProgress(15);
      
      const progressInterval = setInterval(() => {
        setStoryUploadProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85;
          }
          return prev + 10;
        });
      }, 150);

      const formData = new FormData();
      if (storyMode === "file" && storyMediaFile) {
        formData.append("media", storyMediaFile);
      } else {
        formData.append("backgroundGradient", storyBgGradient);
      }
      formData.append("caption", storyCaption);
      formData.append("location", storyLocation);
      formData.append("overlayText", finalOverlayText);
      formData.append("overlayColor", storyOverlayColor);
      formData.append("privacy", storyPrivacy);
      formData.append("canvasLayers", JSON.stringify(canvasElements));
      formData.append("bgAdjustmentFilters", JSON.stringify(bgFilters));
      formData.append("taggedProduct", storyTaggedProductId);

      const response = await axios.post(`${backendUrl}/api/social/stories`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      clearInterval(progressInterval);
      setStoryUploadProgress(100);

      if (response.data.success) {
        toast.success("Story shared to CartNow!");
        setStoryModalOpen(false);
        setStoryMediaFile(null);
        setStoryMediaPreview("");
        setStoryCaption("");
        setStoryLocation("");
        setStoryOverlayText("");
        setStoryOverlayColor("#ffffff");
        setStoryPrivacy("Public");
        setCanvasElements([]);
        setSelectedElementId(null);
        setCanvasHistory([]);
        setCanvasRedoStack([]);
        setBgFilters({ brightness: 100, contrast: 100, saturation: 100, preset: "normal" });
        setSelectedMusicTrack(null);
        setStoryTaggedProductId("");
        fetchStories();
      }
    } catch (err) {
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
              likesCount: p.likesCount + (response.data.liked ? 1 : -1)
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
    <div className="min-h-screen bg-[#fafafb] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased">
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
      {/* CENTERED MAIN FEED LAYOUT */}
      <div className={`w-full mx-auto px-4 py-6 flex-1 flex flex-col items-center transition-all duration-300 ${activeCommentsPost ? "max-w-[1050px]" : "max-w-[650px]"}`}>

        {/* CENTER COLUMN (Main Feed) */}
        <main className="w-full space-y-6">
          {/* Section Header */}
          <div className="w-full flex items-center justify-between gap-4 select-none pb-2">
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4e20]">Cartnow Social</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">Community Feed</h1>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 font-medium mt-1">Share your style. Tag your purchases. Inspire others.</p>
            </div>
            
            {/* Notification Bell */}
            <div className="relative cursor-pointer hover:scale-105 active:scale-95 transition duration-150 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <Bell size={22} className="text-slate-800 dark:text-slate-200 stroke-[2]" />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-[#f43f5e] ring-2 ring-white dark:ring-slate-900" />
            </div>
          </div>

          {/* What's on your mind? Card */}
          <div 
            onClick={() => {
              if (token) {
                setCreateModalOpen(true);
              } else {
                toast.info("Please log in to share your style!");
              }
            }}
            className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition duration-200 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              {/* Avatar with plus */}
              <div className="relative h-12 w-12 rounded-full border border-dashed border-indigo-400 flex items-center justify-center bg-indigo-50/50 dark:bg-indigo-950/20 shrink-0">
                <Plus size={18} className="text-indigo-600 dark:text-indigo-400 stroke-[3]" />
              </div>
              <div className="text-left">
                <h3 className="text-[13.5px] font-black text-slate-850 dark:text-white">What’s on your mind?</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Share your style, your picks, your vibe.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                <button 
                  type="button" 
                  onClick={() => token ? setCreateModalOpen(true) : toast.info("Please log in to share your style!")}
                  className="p-1 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-lg transition text-slate-400 dark:text-slate-500 border-none bg-transparent cursor-pointer"
                >
                  <ImageIcon size={19} className="stroke-[2]" />
                </button>
                <button 
                  type="button" 
                  onClick={() => token ? setCreateModalOpen(true) : toast.info("Please log in to share your style!")}
                  className="p-1 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-lg transition text-slate-400 dark:text-slate-500 border-none bg-transparent cursor-pointer"
                >
                  <Tag size={19} className="stroke-[2]" />
                </button>
                <button 
                  type="button" 
                  onClick={() => token ? setCreateModalOpen(true) : toast.info("Please log in to share your style!")}
                  className="p-1 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-lg transition text-slate-400 dark:text-slate-500 border-none bg-transparent cursor-pointer"
                >
                  <Smile size={19} className="stroke-[2]" />
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
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-150 shadow-sm border-none cursor-pointer active:scale-95"
              >
                Post
              </button>
            </div>
          </div>

          {/* Stories strip (Hidden to match mockup layout) */}
          {false && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-4 flex gap-4 overflow-x-auto scrollbar-none select-none">
              {/* Hidden Input for Story Upload */}
              <input 
                type="file" 
                accept="image/*,video/*" 
                ref={fileInputRef} 
                onChange={handleStoryFileChange} 
                className="hidden" 
              />

              {/* Your Story */}
              {(() => {
                const myStoryGroup = stories.find(s => s._id === currentUser?._id);
                return (
                  <div 
                    onClick={() => {
                      if (myStoryGroup) {
                        setActiveStoryGroup(myStoryGroup);
                        setActiveStoryIndex(0);
                      } else {
                        setStoryModalOpen(true);
                      }
                    }}
                    className="flex flex-col items-center shrink-0 cursor-pointer relative"
                  >
                    <div className={`h-13 w-13 rounded-full p-[2px] ${
                      myStoryGroup 
                        ? (isGroupSeen(myStoryGroup) 
                            ? "bg-slate-200 dark:bg-slate-800" 
                            : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 animate-pulse")
                        : "bg-slate-200 dark:bg-slate-800"
                    }`}>
                      <div className="h-full w-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100">
                        {currentUser?.profilePhoto ? (
                          <img src={currentUser.profilePhoto} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-slate-200 dark:bg-slate-850 text-slate-500 font-bold text-sm">
                            {currentUser?.name?.charAt(0) || "+"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setStoryModalOpen(true);
                      }}
                      className="absolute right-1 bottom-5 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-0.5 border-2 border-white dark:border-slate-900 flex items-center justify-center transition active:scale-90"
                      title="Upload new story"
                    >
                      <Plus size={8} className="stroke-[4]" />
                    </div>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate w-14 text-center">
                      Your Story
                    </span>
                  </div>
                );
              })()}

              {/* Dynamic Other Users Stories */}
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
                      className="flex flex-col items-center shrink-0 cursor-pointer relative animate-fade-in"
                    >
                      <div className={`h-13 w-13 rounded-full p-[2px] ${
                        isGroupSeen(group)
                          ? "bg-slate-200 dark:bg-slate-800"
                          : "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                      }`}>
                        <div className="h-full w-full rounded-full border-2 border-white dark:border-slate-900 overflow-hidden bg-slate-100">
                          <img src={avatar} alt="" className="h-full w-full object-cover" />
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 mt-1 truncate w-14 text-center">
                        {group.name.split(" ")[0]}
                      </span>
                    </div>
                  );
                })
              }
            </div>
          )}

          {/* Posts feed */}
          <div className="space-y-6">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 size={24} className="animate-spin text-indigo-500 mb-2 stroke-1.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Loading Feed...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-12 text-center select-none shadow-2xs">
                <ShoppingBag className="mx-auto text-slate-300 dark:text-slate-700 mb-3 stroke-1.5" size={40} />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">No community posts yet</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
                  Be the first to share your recent purchases with the CartNow community and tag your setup!
                </p>
                {token && (
                  <button 
                    onClick={() => setCreateModalOpen(true)}
                    className="mt-4 px-4 py-2 bg-[#ff4e20] hover:bg-[#e03d12] text-white text-[10px] font-black uppercase tracking-wider rounded-xl border-none cursor-pointer active:scale-95 transition"
                  >
                    Share A Purchase
                  </button>
                )}
              </div>
            ) : (
              posts.map(post => (
                <div 
                  key={post._id} 
                  className={`flex flex-col md:flex-row gap-4 items-stretch justify-center w-full transition-all duration-300 mx-auto ${
                    activeCommentsPost?._id === post._id ? "max-w-[1000px]" : "max-w-[650px]"
                  }`}
                >
                  <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col justify-between">
                  {/* Profile Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-[13.5px] font-black uppercase overflow-hidden shrink-0">
                        {post.userId?.profilePhoto ? (
                          <img src={post.userId.profilePhoto} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span>{post.userId?.name?.charAt(0) || "U"}</span>
                        )}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide leading-none">
                            {post.userId?.name || "anonymous"}
                          </span>
                          <CheckCircle2 size={12} className="text-blue-600 fill-blue-500/10 stroke-[3.5] shrink-0" />
                          
                          {/* Follow/Unfollow toggle in post header */}
                          {currentUser && post.userId && post.userId._id !== currentUser._id && (
                            <button
                              onClick={() => handleToggleFollowCreator(post.userId._id)}
                              className="text-[9.5px] font-black uppercase text-[#ff4e20] hover:text-[#e03d12] cursor-pointer border-none bg-transparent select-none ml-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800 leading-none h-3.5"
                            >
                              {post.isFollowingCreator ? "Unfollow" : "Follow"}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 select-none">
                          <span className="text-[10px] text-slate-450 dark:text-slate-400 font-medium">
                            {new Date(post.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                          <span className="text-slate-350 dark:text-slate-700 font-bold text-[9px]">•</span>
                          <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-450 leading-none">
                            <CheckCircle2 size={10} className="fill-emerald-500/10 stroke-[2.5]" />
                            <span className="text-[9.5px] font-bold tracking-tight">Verified Purchase</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white border-none bg-transparent cursor-pointer">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Caption & Hashtags */}
                  <div className="px-4 pb-3 text-left">
                    <p className="text-[13.5px] font-semibold leading-relaxed text-slate-800 dark:text-slate-200 break-words whitespace-pre-line">
                      {post.caption}
                    </p>
                  </div>

                  {/* Image container w/ Tagged Product Overlay Card */}
                  <div 
                    onDoubleClick={() => handleImageDoubleClick(post._id)}
                    className="relative w-full max-h-[580px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center cursor-pointer select-none"
                  >
                    <img 
                      src={post.mediaUrl} 
                      alt="" 
                      className="w-full h-auto max-h-[580px] object-contain select-none animate-fade-in" 
                    />

                    {/* Double Click Heart Pop */}
                    {likedAnimationPostId === post._id && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <Heart size={64} className="fill-white text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)] animate-heart-pop" />
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
                          {/* Pin indicator */}
                          <div className="relative h-5 w-5 flex items-center justify-center cursor-pointer">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-500/40 animate-ping" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600 border border-white" />
                          </div>

                          {/* Floating interactive tooltip */}
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-xl w-44 text-left opacity-0 pointer-events-none group-hover/tag:opacity-100 group-hover/tag:pointer-events-auto transition duration-200 transform scale-95 origin-top group-hover/tag:scale-100">
                            <div className="flex gap-2">
                              <img src={tag.productId.images?.[0]} alt="" className="h-8 w-8 object-cover rounded-lg" />
                              <div className="min-w-0 flex-1">
                                <h5 className="text-[9px] font-black text-slate-800 dark:text-white truncate uppercase tracking-tight leading-none">{tag.productId.name}</h5>
                                <span className="text-[8.5px] font-black text-indigo-600 dark:text-indigo-400 block mt-1">₹{tag.productId.price?.toLocaleString("en-IN")}</span>
                              </div>
                            </div>
                            <a 
                              href={`/product/${tag.productId._id}`}
                              className="w-full inline-flex items-center justify-center gap-1 mt-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[8px] font-black uppercase tracking-wider transition-colors border-none"
                            >
                              <ShoppingBag size={8} />
                              <span>View Product</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}

                    {/* Tagged Product Horizontal Banner Overlay */}
                    {post.taggedProducts?.[0] && post.taggedProducts[0].productId && (
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/40 dark:border-slate-800/60 p-2.5 rounded-2xl flex items-center justify-between gap-3 shadow-lg select-none">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img 
                            src={post.taggedProducts[0].productId.images?.[0]} 
                            alt="" 
                            className="h-10 w-10 object-cover rounded-xl bg-slate-100 border border-slate-200/50 dark:border-slate-800" 
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
                          <button className="h-7 w-7 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border-none cursor-pointer transition">
                            <ShoppingCart size={12} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <button 
                          onClick={() => handleLike(post._id)}
                          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-rose-500 transition border-none bg-transparent cursor-pointer p-0"
                        >
                          <Heart 
                            size={19} 
                            className={`transition-colors duration-250 ${post.isLiked ? "fill-rose-500 text-rose-500" : "text-rose-500 hover:fill-rose-500/10"}`} 
                          />
                          <span className="text-[11.5px] font-extrabold text-slate-500 dark:text-slate-400">{post.likesCount}</span>
                        </button>

                        <button 
                          onClick={() => openComments(post)}
                          className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer p-0"
                        >
                          <MessageCircle size={19} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300" />
                          <span className="text-[11.5px] font-extrabold text-slate-500 dark:text-slate-400">{post.commentsCount}</span>
                        </button>

                        <button className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer p-0">
                          <Send size={16} className="text-slate-400 dark:text-slate-500 hover:text-slate-650" />
                          <span className="text-[11.5px] font-extrabold text-slate-500 dark:text-slate-400">{post.sharesCount || 0}</span>
                        </button>
                      </div>

                      <button 
                        onClick={() => toggleSave(post._id)}
                        className="text-slate-450 hover:text-slate-750 dark:hover:text-white transition border-none bg-transparent cursor-pointer p-0"
                      >
                        <Bookmark size={19} className={savedPosts.has(post._id) ? "fill-slate-800 dark:fill-white text-slate-800 dark:text-white" : ""} />
                      </button>
                    </div>
                  </div>
                  </div>
                  {/* Right: The Comment Section next to the post at same height */}
                  {activeCommentsPost?._id === post._id && (
                    <div className="w-full md:w-[350px] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-2xs flex flex-col animate-slide-left h-auto min-h-full">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-800 dark:text-white">Comments</h4>
                          <span className="text-[7.5px] text-slate-400 uppercase font-black tracking-widest mt-0.5 block">Live Q&A Discussion</span>
                        </div>
                        <button
                          onClick={() => setActiveCommentsPost(null)}
                          className="text-slate-400 hover:text-indigo-500 transition border-none bg-transparent cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[480px] md:max-h-[540px]">
                        {loadingComments ? (
                          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 size={18} className="animate-spin text-indigo-500 mb-1 stroke-1.5" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Loading...</span>
                          </div>
                        ) : comments.length === 0 ? (
                          <div className="py-12 text-center text-slate-400">
                            <MessageCircle size={16} className="mx-auto text-slate-350 mb-1 stroke-1.5" />
                            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">No discussions yet</span>
                            <p className="text-[7.5px] text-slate-400 mt-0.5">Start the conversation below!</p>
                          </div>
                        ) : (
                          comments.map(c => (
                            <div key={c._id} className="flex items-start gap-2 text-left">
                              <div className="h-6.5 w-6.5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black uppercase overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                {c.userId?.profilePhoto ? (
                                  <img src={c.userId.profilePhoto} alt="" className="h-full w-full object-cover" />
                                ) : (
                                  <span>{c.userId?.name?.charAt(0) || "U"}</span>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{c.userId?.name}</span>
                                  <span className="text-[6.5px] text-slate-400 font-bold">{new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                                </div>
                                <p className="text-[10.5px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5 break-words">{c.text}</p>
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

    </div>
{/* STORY CREATOR MODAL */}
      <StoryCreatorModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        storyMediaFile={storyMediaFile}
        setStoryMediaFile={setStoryMediaFile}
        storyMediaPreview={storyMediaPreview}
        setStoryMediaPreview={setStoryMediaPreview}
        storyMediaType={storyMediaType}
        setStoryMediaType={setStoryMediaType}
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
        fileInputRef={fileInputRef}
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
    </div>
  );
};

export default SocialFeed;
