import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Music, Trash2, X } from "lucide-react";

const StorySlideshowOverlay = ({
  activeStoryGroup,
  activeStoryIndex,
  setActiveStoryIndex,
  setActiveStoryGroup,
  currentUser,
  onDeleteStory,
  stories = []
}) => {
  if (!activeStoryGroup) return null;

  const goToNextStory = () => {
    if (activeStoryIndex < activeStoryGroup.stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
    } else {
      const currentIdx = stories.findIndex(g => g._id === activeStoryGroup._id);
      if (currentIdx !== -1 && currentIdx < stories.length - 1) {
        setActiveStoryGroup(stories[currentIdx + 1]);
        setActiveStoryIndex(0);
      } else {
        setActiveStoryGroup(null);
      }
    }
  };

  const goToPrevStory = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
    } else {
      const currentIdx = stories.findIndex(g => g._id === activeStoryGroup._id);
      if (currentIdx > 0) {
        const prevGroup = stories[currentIdx - 1];
        setActiveStoryGroup(prevGroup);
        setActiveStoryIndex(prevGroup.stories.length - 1);
      }
    }
  };

  const [isPaused, setIsPaused] = React.useState(false);

  // Autoplay Story Progress Timer
  React.useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      goToNextStory();
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStoryGroup, activeStoryIndex, stories, isPaused]);

  // Keyboard navigation listeners
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") goToNextStory();
      else if (e.key === "ArrowLeft") goToPrevStory();
      else if (e.key === "Escape") setActiveStoryGroup(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeStoryGroup, activeStoryIndex, stories]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <style>{`
        @keyframes storyProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-story-progress {
          animation: storyProgress 5s linear forwards;
        }
      `}</style>
      <div className="absolute inset-0 -z-10 cursor-pointer" onClick={() => setActiveStoryGroup(null)} />
      
      <div className="relative w-full max-w-[420px] aspect-[9/16] bg-slate-950 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-4">
        
        {/* Background Story Media (Image, Video, or Text Gradient) */}
        {(() => {
          const currentStory = activeStoryGroup.stories[activeStoryIndex];
          const filters = currentStory?.bgAdjustmentFilters || {};
          const preset = filters.preset || "normal";
          const brightness = filters.brightness !== undefined ? filters.brightness : 100;
          const contrast = filters.contrast !== undefined ? filters.contrast : 100;
          const saturation = filters.saturation !== undefined ? filters.saturation : 100;
          const filterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
          const presetClass = 
            preset === "vintage" ? "sepia-[40%] contrast-[110%] brightness-[95%]" :
            preset === "warm" ? "saturate-[130%] sepia-[15%] brightness-[102%]" :
            preset === "cool" ? "saturate-[90%] brightness-[98%]" :
            preset === "noir" ? "grayscale contrast-[125%]" :
            preset === "neon" ? "saturate-[170%] contrast-[120%] hue-rotate-[-20deg]" : "";

          if (currentStory?.mediaType === "text" || currentStory?.mediaUrl?.startsWith("gradient:")) {
            return (
              <div 
                style={{ background: currentStory?.mediaUrl?.replace("gradient:", "") || "linear-gradient(135deg, #ff4e20, #ec4899)" }} 
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
            );
          } else if (currentStory?.mediaType === "video") {
            return (
              <video 
                src={currentStory?.mediaUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                style={{ filter: filterStyle }}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${presetClass}`} 
              />
            );
          } else {
            return (
              <img 
                src={currentStory?.mediaUrl} 
                alt="Story Content" 
                style={{ filter: filterStyle }}
                className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${presetClass}`} 
              />
            );
          }
        })()}

        {/* Dynamic Text Overlay on top of Media (Legacy fallback) */}
        {activeStoryGroup.stories[activeStoryIndex]?.overlayText && !activeStoryGroup.stories[activeStoryIndex]?.canvasLayers?.length && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6 text-center z-10">
            <span 
              style={{ color: activeStoryGroup.stories[activeStoryIndex]?.overlayColor || "#ffffff" }} 
              className="text-2xl font-black drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] break-words max-w-[95%] uppercase tracking-wider"
            >
              {activeStoryGroup.stories[activeStoryIndex]?.overlayText}
            </span>
          </div>
        )}

        {/* DYNAMIC STORY LAYERS OVERLAY */}
        {activeStoryGroup.stories[activeStoryIndex]?.canvasLayers && activeStoryGroup.stories[activeStoryIndex].canvasLayers.map(el => (
          <div
            key={el.id}
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              transform: `translate(-50%, -50%) rotate(${el.rotation}deg) scale(${el.scale * 0.95})`, // slight scale adjustment for viewer sizing
              zIndex: el.zIndex || 5
            }}
            className="absolute pointer-events-auto select-none"
          >
            {/* TEXT LAYER */}
            {el.type === "text" && (
              <span
                style={{
                  color: el.color || "#ffffff",
                  fontSize: `${el.fontSize || 16}px`,
                  fontFamily: el.fontFamily === "font-neon" ? "monospace" : "",
                  textShadow: el.fontFamily === "font-neon" ? `0 0 10px ${el.color}, 0 0 20px ${el.color}` : el.hasShadow ? "2px 2px 4px rgba(0,0,0,0.85)" : "none",
                  backgroundColor: el.bgHighlight || "transparent",
                  padding: el.bgHighlight !== "transparent" ? "4px 8px" : "0",
                  borderRadius: "8px"
                }}
                className={`${el.fontFamily} ${el.isBold ? "font-black" : ""} ${el.isItalic ? "italic" : ""} block break-words max-w-[190px] leading-tight text-center`}
              >
                {el.value}
              </span>
            )}

            {/* STICKER LAYER */}
            {el.type === "sticker" && (
              <>
                {el.stickerType === "emoji" && (
                  <span className="text-4xl block leading-none">{el.value}</span>
                )}

                {el.stickerType === "poll" && (
                  <div className="bg-white/95 text-slate-800 rounded-2xl p-3 shadow-md border border-white/20 w-[160px] leading-tight">
                    <h5 className="text-[9.5px] font-black uppercase text-center mb-2 tracking-wide text-slate-700">{el.question}</h5>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex-1 py-1.5 text-center bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 rounded-xl text-[8.5px] font-black uppercase tracking-wider text-indigo-600 block shadow-xs cursor-pointer border-none"
                      >
                        {el.optionA}
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="flex-1 py-1.5 text-center bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-[8.5px] font-black uppercase tracking-wider text-slate-600 block shadow-xs cursor-pointer border-none"
                      >
                        {el.optionB}
                      </button>
                    </div>
                  </div>
                )}

                {el.stickerType === "question" && (
                  <div className="bg-[#ff4e20] text-white rounded-2xl p-3 shadow-md border border-white/20 w-[160px] leading-tight">
                    <span className="text-[7.5px] font-black uppercase tracking-widest text-white/80 block text-center mb-1">Send a reply</span>
                    <h5 className="text-[9.5px] font-bold text-center mb-2 leading-snug">{el.prompt}</h5>
                    <input 
                      type="text" 
                      placeholder="Type reply..." 
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          e.target.value = "";
                        }
                      }}
                      className="w-full py-1 bg-white/25 rounded-xl text-[8px] text-white placeholder-white/70 block text-left px-2.5 outline-none border-none font-semibold"
                    />
                  </div>
                )}

                {el.stickerType === "countdown" && (
                  <div className="bg-black/85 text-white rounded-2xl p-2.5 shadow-md border border-white/10 w-[160px] leading-tight">
                    <span className="text-[8px] font-black uppercase tracking-widest block text-center text-[#ff4e20]">{el.label}</span>
                    <div className="flex justify-center gap-1.5 mt-1.5">
                      <div className="text-center"><span className="text-xs font-black block leading-none">01</span><span className="text-[6px] text-slate-400 block mt-0.5">DAYS</span></div>
                      <div className="text-center"><span className="text-xs font-black block leading-none">12</span><span className="text-[6px] text-slate-400 block mt-0.5">HRS</span></div>
                      <div className="text-center"><span className="text-xs font-black block leading-none">45</span><span className="text-[6px] text-slate-400 block mt-0.5">MINS</span></div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* PRODUCT CARD STICKER */}
            {el.type === "product" && (
              <a href={`/product/${el.productId}`} className="bg-white/95 text-slate-800 rounded-2xl p-2.5 shadow-md border border-white/20 w-[160px] leading-tight text-left flex gap-2 no-underline hover:scale-105 active:scale-95 transition cursor-pointer">
                <div className="h-8.5 w-8.5 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img src={el.image} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 leading-none">
                  <span className="text-[8.5px] font-black truncate block text-slate-700">{el.name}</span>
                  <span className="text-[8.5px] font-black text-slate-900 block mt-1">₹{el.price}</span>
                  {el.discount > 0 && (
                    <span className="text-[6.5px] font-black text-green-600 uppercase tracking-widest block mt-0.5">{el.discount}% OFF</span>
                  )}
                </div>
              </a>
            )}

            {/* DRAWING SKETCH OVERLAY */}
            {el.type === "drawing" && (
              <img src={el.value} alt="" className="w-[330px] h-[586px] object-contain" />
            )}

            {/* MUSIC AUDIO SPECTRUM WIDGET */}
            {el.type === "music" && (
              <div className="bg-black/80 text-white rounded-full pl-3 pr-2.5 py-1.5 shadow-md border border-white/10 flex items-center gap-2">
                <div className="h-5.5 w-5.5 rounded-full bg-indigo-500 flex items-center justify-center text-white animate-spin">
                  <Music size={9} />
                </div>
                <div className="leading-none text-left pr-1">
                  <span className="text-[8px] font-black block tracking-wide truncate max-w-[70px]">{el.songTitle}</span>
                  <span className="text-[6.5px] text-slate-400 block mt-0.5 truncate max-w-[70px]">{el.artist}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Story Card Top Header */}
        <div className="w-full space-y-2.5 z-10">
          {/* Slides Progress Bars */}
          <div className="flex gap-1.5 w-full">
            {activeStoryGroup.stories.map((story, idx) => (
              <div key={story._id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  style={{ 
                    width: idx < activeStoryIndex 
                      ? "100%" 
                      : idx === activeStoryIndex 
                        ? "100%" 
                        : "0%",
                    animationPlayState: isPaused && idx === activeStoryIndex ? "paused" : "running"
                  }}
                  className={`h-full bg-white rounded-full ${
                    idx === activeStoryIndex ? "animate-story-progress" : ""
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Creator details row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8.5 w-8.5 rounded-full overflow-hidden border border-white/50 bg-slate-800">
                <img 
                  src={activeStoryGroup.profilePhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"} 
                  alt="" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="text-left leading-none">
                <span className="text-[11px] font-black text-white uppercase tracking-wider block">{activeStoryGroup.name}</span>
                {activeStoryGroup.stories[activeStoryIndex]?.location && (
                  <span className="text-[8px] text-[#ff4e20] font-black block mt-1 uppercase tracking-wider">
                    📍 {activeStoryGroup.stories[activeStoryIndex]?.location}
                  </span>
                )}
                <span className="text-[7.5px] text-white/50 font-bold block mt-1">
                  {new Date(activeStoryGroup.stories[activeStoryIndex]?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {activeStoryGroup._id === currentUser?._id && (
                <button 
                  onClick={() => onDeleteStory(activeStoryGroup.stories[activeStoryIndex]?._id)}
                  className="h-7 w-7 rounded-full bg-red-600/20 hover:bg-red-600 text-white flex items-center justify-center border-none cursor-pointer transition"
                  title="Delete Story"
                >
                  <Trash2 size={12} className="stroke-[3.5]" />
                </button>
              )}
              <button 
                onClick={() => setActiveStoryGroup(null)}
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border-none cursor-pointer transition"
              >
                <X size={14} className="stroke-[3]" />
              </button>
            </div>
          </div>
        </div>

        {/* Slide Navigation Zones */}
        <div 
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          className="absolute inset-x-0 top-16 bottom-0 z-0 flex"
        >
          <div 
            onClick={goToPrevStory}
            className="w-1/3 h-full cursor-w-resize" 
          />
          <div 
            onClick={goToNextStory}
            className="w-2/3 h-full cursor-e-resize" 
          />
        </div>

        {/* Desktop Chevron Arrows */}
        <button 
          onClick={goToPrevStory}
          disabled={activeStoryIndex === 0 && stories.findIndex(g => g._id === activeStoryGroup._id) === 0}
          className="absolute left-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 hover:bg-black/60 text-white disabled:opacity-0 flex items-center justify-center border-none cursor-pointer transition z-10"
        >
          <ChevronLeft size={18} className="stroke-[3]" />
        </button>

        <button 
          onClick={goToNextStory}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/45 hover:bg-black/60 text-white flex items-center justify-center border-none cursor-pointer transition z-10"
        >
          <ChevronRight size={18} className="stroke-[3]" />
        </button>

        {/* Tagged Product Float Badge */}
        {activeStoryGroup.stories[activeStoryIndex]?.taggedProduct && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-fit max-w-[85%]">
            <Link
              to={`/product/${activeStoryGroup.stories[activeStoryIndex].taggedProduct._id}`}
              className="flex items-center gap-2.5 p-2 bg-black/55 backdrop-blur-md hover:bg-black/75 border border-white/10 rounded-2xl transition duration-200 no-underline cursor-pointer group shadow-lg"
            >
              {activeStoryGroup.stories[activeStoryIndex].taggedProduct.images?.[0] && (
                <img
                  src={activeStoryGroup.stories[activeStoryIndex].taggedProduct.images[0]}
                  alt=""
                  className="h-9 w-9 rounded-lg object-cover bg-slate-900 border border-white/10 shrink-0"
                />
              )}
              <div className="min-w-0 text-left pr-1">
                <span className="text-[9.5px] font-black text-white/95 block truncate group-hover:text-indigo-400 transition leading-snug">
                  {activeStoryGroup.stories[activeStoryIndex].taggedProduct.name}
                </span>
                <span className="text-[8.5px] font-extrabold text-[#ff4e20] block mt-0.5">
                  ₹{activeStoryGroup.stories[activeStoryIndex].taggedProduct.price?.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-6 w-6 rounded-full bg-white/15 group-hover:bg-indigo-600 flex items-center justify-center text-[10px] text-white shrink-0 transition">
                🛍️
              </div>
            </Link>
          </div>
        )}

        {/* Story Caption Bar at Bottom */}
        {activeStoryGroup.stories[activeStoryIndex]?.caption && (
          <div className="w-full bg-black/60 backdrop-blur-xs p-3 rounded-2xl border border-white/5 z-10 text-left mb-1 max-h-24 overflow-y-auto scrollbar-none select-text">
            <p className="text-[11px] font-semibold text-white leading-relaxed break-words">{activeStoryGroup.stories[activeStoryIndex]?.caption}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default StorySlideshowOverlay;
