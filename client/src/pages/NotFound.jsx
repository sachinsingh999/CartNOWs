import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Compass, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Headset, 
  Home, 
  Gamepad2, 
  Trophy, 
  RefreshCw, 
  Flame,
  ArrowRight,
  Volume2,
  VolumeX
} from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  
  // Search suggestion state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const suggestions = [
    "denim jackets...",
    "cozy hoodies...",
    "retro sneakers...",
    "designer dresses...",
    "activewear..."
  ];

  // Game states
  const [gameState, setGameState] = useState({
    score: 0,
    lives: 3,
    items: [],
    isPlaying: false,
    isGameOver: false,
    unlockedDiscount: false,
    showDiscountOverlay: false
  });
  
  const [cartX, setCartX] = useState(50); // percentage (0 to 100)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("cartnow_404_highscore");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isCopied, setIsCopied] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [confetti, setConfetti] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [combo, setCombo] = useState(0);
  const [scorePopups, setScorePopups] = useState([]);

  // Glow and 3D Parallax Tilt state
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const cartXRef = useRef(50);
  const isPlayingRef = useRef(false);
  const spawnTimerRef = useRef(0);
  const cardRef = useRef(null);

  // Sync refs for loop access
  useEffect(() => {
    cartXRef.current = cartX;
  }, [cartX]);

  useEffect(() => {
    isPlayingRef.current = gameState.isPlaying && !gameState.isGameOver && !gameState.showDiscountOverlay;
  }, [gameState.isPlaying, gameState.isGameOver, gameState.showDiscountOverlay]);

  // Rotate search placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setSuggestionIdx((prev) => (prev + 1) % suggestions.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Synthesizer (Zero-dependency retro sounds)
  const playRetroSound = (type) => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "catch") {
        // High pitch coin blip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "bomb") {
        // Low frequency noise drop explosion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.45);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === "win") {
        // Fast ascending retro fanfare
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
        notes.forEach((f, index) => {
          const oscNode = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscNode.type = "triangle";
          oscNode.frequency.setValueAtTime(f, ctx.currentTime + index * 0.06);
          oscNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          gainNode.gain.setValueAtTime(0.06, ctx.currentTime + index * 0.06);
          gainNode.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + index * 0.06 + 0.25);
          oscNode.start(ctx.currentTime + index * 0.06);
          oscNode.stop(ctx.currentTime + index * 0.06 + 0.28);
        });
      }
    } catch (e) {
      // Silent catch (browser blocker safety)
    }
  };

  // Score popups (+1, +3, Combo tags)
  const spawnScorePopup = (x, text, colorClass) => {
    const id = Math.random() + "-" + Date.now();
    setScorePopups((prev) => [...prev, { id, x, text, color: colorClass }]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== id));
    }, 800);
  };

  // Cursor tracker and 3D Card tilt calculation
  const handleCardMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlowPos({ x, y });

    // Rotate scale computations
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rx = ((y - centerY) / centerY) * -4; // Max 4 deg rotation X
    const ry = ((x - centerX) / centerX) * 4;  // Max 4 deg rotation Y
    setTilt({ rx, ry });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  // Keyboard left/right controls for cart
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlayingRef.current) return;
      if (e.key === "ArrowLeft") {
        setCartX((prev) => {
          const next = Math.max(7, prev - 8);
          cartXRef.current = next;
          return next;
        });
      } else if (e.key === "ArrowRight") {
        setCartX((prev) => {
          const next = Math.min(93, prev + 8);
          cartXRef.current = next;
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.isPlaying, gameState.isGameOver]);

  // Touch and mouse drag controls on game container
  const handleGameMouseMove = (e) => {
    if (!isPlayingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(7, Math.min(93, x));
    setCartX(clampedX);
    cartXRef.current = clampedX;
  };

  const handleGameTouchMove = (e) => {
    if (!isPlayingRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(7, Math.min(93, x));
    setCartX(clampedX);
    cartXRef.current = clampedX;
  };

  // Confetti trigger
  const triggerConfetti = () => {
    const newConfetti = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 15,
      size: Math.random() * 6 + 6,
      color: ["#F97316", "#6366F1", "#EC4899", "#10B981", "#3B82F6", "#F59E0B"][
        Math.floor(Math.random() * 6)
      ],
      angle: Math.random() * 360
    }));
    setConfetti(newConfetti);
    playRetroSound("win");
    setTimeout(() => setConfetti([]), 2500);
  };

  // Game Loop
  useEffect(() => {
    if (!gameState.isPlaying || gameState.isGameOver || gameState.showDiscountOverlay) return;

    let animationId;
    let lastTime = Date.now();

    const tick = () => {
      if (!isPlayingRef.current) return;

      const now = Date.now();
      const delta = now - lastTime;
      lastTime = now;

      setGameState((prev) => {
        if (!prev.isPlaying || prev.isGameOver || prev.showDiscountOverlay) return prev;

        // Spawn items
        spawnTimerRef.current += delta;
        let currentItems = [...prev.items];
        
        if (spawnTimerRef.current >= 800) {
          spawnTimerRef.current = 0;
          const choices = [
            { emoji: "👕", points: 1, type: "clothes" },
            { emoji: "👗", points: 1, type: "clothes" },
            { emoji: "👟", points: 1, type: "clothes" },
            { emoji: "👜", points: 1, type: "clothes" },
            { emoji: "✨", points: 3, type: "star" },
            { emoji: "💣", points: -2, type: "bomb" }
          ];
          const selected = choices[Math.floor(Math.random() * choices.length)];
          const newItem = {
            id: Math.random() + "-" + now,
            x: Math.random() * 85 + 7,
            y: 0,
            emoji: selected.emoji,
            type: selected.type,
            points: selected.points,
            speed: Math.random() * 0.08 + 0.13 // percentage per ms
          };
          currentItems.push(newItem);
        }

        const nextItems = [];
        let newScore = prev.score;
        let newLives = prev.lives;
        let newGameOver = false;
        let newUnlocked = prev.unlockedDiscount;
        let newShowOverlay = prev.showDiscountOverlay;
        let playShake = false;

        for (const item of currentItems) {
          const nextY = item.y + item.speed * delta;

          // Collision check
          if (nextY >= 82 && nextY <= 92 && Math.abs(item.x - cartXRef.current) < 14) {
            let pts = item.points;
            let popupColor = "text-indigo-400";
            let popupText = `+${pts}`;

            if (item.type === "bomb") {
              newLives = Math.max(0, newLives - 1);
              playShake = true;
              setCombo(0);
              playRetroSound("bomb");
              popupColor = "text-rose-500";
              popupText = `${pts}`;
              if (newLives <= 0) {
                newGameOver = true;
              }
            } else {
              playRetroSound("catch");
              
              // Handle score and combos
              setCombo((c) => {
                const nextCombo = c + 1;
                if (nextCombo >= 3) {
                  pts += 1; // Bonus points for streak
                  spawnScorePopup(item.x, `STREAK x${nextCombo}!`, "text-yellow-400 font-extrabold scale-110");
                }
                return nextCombo;
              });

              if (item.type === "star") {
                popupColor = "text-orange-400";
              }
              popupText = `+${pts}`;
            }

            newScore = Math.max(0, newScore + pts);
            spawnScorePopup(item.x, popupText, popupColor);
            continue; // Caught item, remove from lists
          }

          if (nextY < 100) {
            nextItems.push({ ...item, y: nextY });
          }
        }

        // Unlocking coupon validation
        if (newScore >= 10 && !newUnlocked) {
          newUnlocked = true;
          newShowOverlay = true;
          setTimeout(() => triggerConfetti(), 10);
        }

        if (playShake) {
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 200);
        }

        if (newGameOver && newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem("cartnow_404_highscore", newScore.toString());
        }

        return {
          ...prev,
          score: newScore,
          lives: newLives,
          items: nextItems,
          isGameOver: newGameOver,
          unlockedDiscount: newUnlocked,
          showDiscountOverlay: newShowOverlay,
          isPlaying: (newGameOver || newShowOverlay) ? false : prev.isPlaying
        };
      });

      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationId);
  }, [gameState.isPlaying, gameState.isGameOver, gameState.showDiscountOverlay, highScore, isMuted]);

  const startGame = () => {
    setGameState({
      score: 0,
      lives: 3,
      items: [],
      isPlaying: true,
      isGameOver: false,
      unlockedDiscount: false,
      showDiscountOverlay: false
    });
    setCartX(50);
    cartXRef.current = 50;
    spawnTimerRef.current = 0;
    setCombo(0);
    setScorePopups([]);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const copyCoupon = () => {
    navigator.clipboard.writeText("CART404");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-8 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-hidden select-none">
      
      {/* Inline customized styles for CRT overlays, float animations, and grids */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti-fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(240px) rotate(360deg); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%, 75% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
        }
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.9); opacity: 1; }
          100% { transform: translateY(-45px) scale(1.15); opacity: 0; }
        }
        .animate-shake {
          animation: shake 0.15s ease-in-out;
        }
        .animate-popup {
          animation: float-up 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .confetti-particle {
          position: absolute;
          animation: confetti-fall 2s linear forwards;
        }
        .retro-grid {
          background-size: 20px 20px;
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px);
        }
        .dark .retro-grid {
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
        }
        .scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.25) 50%
          ), linear-gradient(
            90deg, 
            rgba(255, 0, 0, 0.06), 
            rgba(0, 255, 0, 0.02), 
            rgba(0, 0, 255, 0.06)
          );
          background-size: 100% 4px, 6px 100%;
        }
      `}} />

      {/* Background radial soft lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-orange-500/10 dark:bg-orange-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 blur-3xl pointer-events-none" />

      {/* Outer 3D Parallax Tilt container card */}
      <div 
        ref={cardRef}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
          transition: "transform 0.1s ease-out, box-shadow 0.3s ease"
        }}
        className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 bg-white/75 dark:bg-slate-900/40 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-800/80 rounded-[32px] p-6 sm:p-10 shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 overflow-hidden"
      >
        {/* Dynamic radial gradient glow follows cursor inside card */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 380px at ${glowPos.x}px ${glowPos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`
          }}
        />

        {/* Left Side: Store metadata + search console */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-8 relative z-10">
          
          {/* Header block */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 dark:text-rose-400 text-[10px] font-black tracking-widest uppercase">
                Error Code 404
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Lost in Style
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Fashion{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500">
                Out of Bounds
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
              The page you are looking for has strolled off the runway. We couldn't find the requested path, but you can search our catalog or play our retro mini-game on the right to win a coupon!
            </p>
          </div>

          {/* Search bar command with cycling suggestions list */}
          <form onSubmit={handleSearchSubmit} className="space-y-3 max-w-lg">
            <div className="relative group">
              <input
                type="text"
                placeholder={`Search ${suggestions[suggestionIdx]}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-20 py-3.5 text-xs bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 dark: transition shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <Search size={15} />
              </div>
              <button
                type="submit"
                className="absolute right-2 top-2 px-3.5 py-1.5 rounded-xl bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-100 dark:text-white text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                Search
              </button>
            </div>
            
            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[10px] text-slate-400 font-bold mr-1">Trending:</span>
              {["Sneakers", "Summer Sale", "AI Try-On", "Winter Jackets"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    if (tag === "AI Try-On") {
                      navigate("/tryon");
                    } else {
                      navigate(`/product?search=${encodeURIComponent(tag)}`);
                    }
                  }}
                  className="px-2.5 py-1 text-[10px] font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:border-indigo-500/30 dark:hover:border-indigo-400/30 transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>

          {/* Quick Portals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div 
              onClick={() => navigate("/tryon")}
              className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/20 p-4 flex flex-col justify-between items-start gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl flex items-center justify-center border text-indigo-500 bg-indigo-500/10 border-indigo-500/10">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white leading-none flex items-center gap-1.5">
                  AI Try-On Room <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1.5 leading-normal">
                  Try-on outfits virtually before you buy.
                </p>
              </div>
            </div>

            <div 
              onClick={() => navigate("/product")}
              className="group rounded-2xl border border-slate-200/60 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/20 p-4 flex flex-col justify-between items-start gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl flex items-center justify-center border text-orange-500 bg-orange-500/10 border-orange-500/10">
                <ShoppingBag size={16} />
              </div>
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 dark:text-white leading-none flex items-center gap-1.5">
                  Browse Store Catalog <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </h4>
                <p className="text-[10px] font-medium text-slate-400 mt-1.5 leading-normal">
                  Check out our new collections and drops.
                </p>
              </div>
            </div>
          </div>

          {/* Core Action CTAs */}
          <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-900">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-500 hover:brightness-105 text-slate-100 dark:text-white text-[11px] font-black uppercase tracking-widest shadow-md transition active:scale-95 cursor-pointer"
            >
              <Home size={12} />
              <span>Back to Homepage</span>
            </button>
            <button
              onClick={() => navigate("/help")}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition active:scale-95 cursor-pointer"
            >
              <Headset size={12} />
              <span>Support Desk</span>
            </button>
          </div>

        </div>

        {/* Right Side: Retro "Cart Catcher" Mini-game console */}
        <div className="md:col-span-5 flex items-center justify-center relative z-10">
          
          <div className="w-full max-w-[320px] flex flex-col bg-slate-900 dark:bg-slate-950 border-4 border-slate-800 dark:border-slate-900 rounded-[28px] overflow-hidden shadow-2xl relative">
            
            {/* Console topbar status layout */}
            <div className="bg-slate-950 px-4 py-2.5 flex justify-between items-center border-b border-slate-800 dark:border-slate-900 text-slate-100 dark:text-white font-mono text-[9px] font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1.5">
                <Gamepad2 size={12} className="text-indigo-400" />
                <span>Cart Catcher</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="hover:text-indigo-400 transition text-[11px] pr-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX size={12} className="text-slate-500" /> : <Volume2 size={12} className="text-indigo-400" />}
                </button>
                {Array.from({ length: 3 }).map((_, i) => (
                  <span key={i} className={`text-xs leading-none ${i < gameState.lives ? "text-rose-500" : "text-slate-800"}`}>
                    ♥
                  </span>
                ))}
              </div>
            </div>

            {/* Simulated CRT Game Screen */}
            <div 
              className={`relative w-full h-[220px] bg-slate-950 retro-grid overflow-hidden cursor-crosshair transition-all duration-75 ${screenShake ? "animate-shake" : ""}`}
              onMouseMove={handleGameMouseMove}
              onTouchMove={handleGameTouchMove}
            >
              {/* CRT Scanline Overlay effects */}
              <div className="absolute inset-0 pointer-events-none scanlines opacity-35 z-20" />
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.4))] opacity-40 z-20" />

              {/* Confetti particles */}
              {confetti.map((c) => (
                <div
                  key={c.id}
                  className="confetti-particle pointer-events-none"
                  style={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    width: `${c.size}px`,
                    height: `${c.size}px`,
                    backgroundColor: c.color,
                    borderRadius: c.id % 2 === 0 ? "50%" : "2px",
                    transform: `rotate(${c.angle}deg)`,
                    animationDelay: `${c.id * 10}ms`
                  }}
                />
              ))}

              {/* Floating score indicator popups */}
              {scorePopups.map((p) => (
                <div
                  key={p.id}
                  className="absolute font-mono font-black text-[10px] animate-popup pointer-events-none z-20"
                  style={{
                    left: `${p.x}%`,
                    bottom: "35px"
                  }}
                >
                  <span className={`${p.color} bg-slate-950/70 px-1 py-0.5 rounded border border-slate-900/40 backdrop-blur-xs`}>
                    {p.text}
                  </span>
                </div>
              ))}
              {/* Active Gameplay Viewport (Shown when active or when frozen behind discount overlay) */}
              {(gameState.isPlaying || gameState.showDiscountOverlay) && !gameState.isGameOver && (
                <>
                  {/* Real-time score details */}
                  <div className="absolute top-2 left-3 font-mono text-[9px] text-slate-400 z-20 flex gap-3">
                    <div>SCORE: <span className="text-indigo-400 font-bold">{gameState.score}</span></div>
                    {highScore > 0 && <div>HIGH: <span className="text-orange-400 font-bold">{highScore}</span></div>}
                  </div>

                  {/* Falling items */}
                  {gameState.items.map((item) => (
                    <div
                      key={item.id}
                      className="absolute text-xl pointer-events-none select-none transition-all duration-75 ease-out"
                      style={{
                        left: `${item.x}%`,
                        top: `${item.y}%`,
                        transform: "translate(-50%, -50%)"
                      }}
                    >
                      {item.emoji}
                    </div>
                  ))}

                  {/* Cart catcher */}
                  <div
                    className="absolute bottom-2.5 flex items-center justify-center h-8 w-12 bg-indigo-500 rounded-lg text-slate-100 dark:text-white border-b-4 border-indigo-600 shadow-md shadow-indigo-500/10 transition-all duration-75 ease-out"
                    style={{
                      left: `${cartX}%`,
                      transform: "translateX(-50%)"
                    }}
                  >
                    <span className="text-base select-none">🛒</span>
                  </div>
                </>
              )}

              {/* Start Screen */}
              {!gameState.isPlaying && !gameState.isGameOver && !gameState.showDiscountOverlay && (
                <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-5 text-center space-y-4 z-30">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-bounce">
                    <Gamepad2 size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-slate-100 dark:text-white uppercase tracking-widest font-mono">
                      Play Catcher Game
                    </h3>
                    <p className="text-[9.5px] text-slate-500 font-mono leading-relaxed max-w-[200px] mx-auto">
                      Catch clothing 👕 (+1 pt) & stars ✨ (+3 pt). Avoid bombs 💣. Reach 10 pts to unlock a special coupon!
                    </p>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-slate-100 dark:text-white text-[10px] font-black uppercase tracking-wider transition active:scale-95 shadow-md shadow-indigo-500/20 cursor-pointer"
                  >
                    Play Now
                  </button>
                  {highScore > 0 && (
                    <div className="flex items-center gap-1 text-[9px] text-orange-400 font-mono">
                      <Trophy size={10} />
                      <span>HIGH SCORE: {highScore}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Game Over Screen */}
              {gameState.isGameOver && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-5 text-center space-y-3 z-30">
                  <h3 className="text-base font-black text-rose-500 uppercase tracking-widest font-mono">
                    Game Over
                  </h3>
                  <div className="text-slate-400 text-xs font-mono">
                    Final Score: <span className="text-slate-100 dark:text-white font-bold">{gameState.score}</span>
                  </div>
                  {gameState.score >= 10 && (
                    <div className="text-[10px] text-green-400 font-bold uppercase tracking-wider font-mono">
                      Voucher Unlocked!
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={startGame}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 dark:text-white text-[10px] font-bold uppercase transition active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={10} />
                      Play Again
                    </button>
                    {gameState.score >= 10 && (
                      <button
                        onClick={() => setGameState(prev => ({ ...prev, showDiscountOverlay: true, isGameOver: false }))}
                        className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-slate-100 dark:text-white text-[10px] font-bold uppercase transition active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        Claim Coupon
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Discount Unlocked Screen */}
              {gameState.showDiscountOverlay && (
                <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-5 text-center space-y-3.5 z-30">
                  <div className="h-10 w-10 rounded-full bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400">
                    <Flame size={18} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-indigo-400 uppercase tracking-widest font-mono">
                      10% Off Coupon Unlocked!
                    </h3>
                    <p className="text-[9px] text-slate-400 font-mono leading-relaxed max-w-[200px] mx-auto">
                      Use code at checkout to claim your secret error-room reward:
                    </p>
                  </div>
                  
                  {/* Voucher card copy panel */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1.5 w-full max-w-[210px] justify-between">
                    <span className="font-mono text-xs font-black text-slate-100 dark:text-white pl-2 tracking-wider animate-pulse">CART404</span>
                    <button
                      onClick={copyCoupon}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-slate-100 dark:text-white text-[9px] font-black transition active:scale-95 cursor-pointer"
                    >
                      {isCopied ? "Copied!" : "Copy"}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, isPlaying: true, showDiscountOverlay: false }))}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[9px] font-bold text-slate-400 transition active:scale-95 cursor-pointer"
                    >
                      Keep Playing
                    </button>
                    <button
                      onClick={() => navigate("/product")}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-indigo-500 text-[9px] font-black text-slate-100 dark:text-white transition active:scale-95 cursor-pointer"
                    >
                      Apply & Shop
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Console instructions */}
            <div className="bg-slate-950 p-3 border-t border-slate-800 dark:border-slate-900 flex flex-col items-center justify-center text-center space-y-1 font-mono text-[9px] text-slate-500">
              <div className="flex items-center gap-2">
                <span>◀ Keys ▶</span>
                <span>•</span>
                <span>Mouse Slide</span>
                <span>•</span>
                <span>Touch Drag</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default NotFound;
