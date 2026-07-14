import React from "react";
import { X, UserPlus, UserMinus, Loader2, Heart } from "lucide-react";

const LikesModal = ({
  isOpen,
  onClose,
  likes,
  loading,
  onToggleFollow,
  currentUser
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg w-full max-w-[380px] overflow-hidden shadow-2xl flex flex-col max-h-[450px] animate-scale-up text-left">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <Heart size={15} className="text-rose-500 fill-rose-500" />
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-white">Likes</h3>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-650 dark:hover:text-white transition cursor-pointer border-none bg-transparent"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-[180px] scrollbar-thin">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={20} className="animate-spin text-rose-500 mb-2 stroke-1.5" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-450">Loading Likes...</span>
            </div>
          ) : likes.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Heart size={20} className="mx-auto text-slate-350 dark:text-slate-700 mb-2 stroke-1.5" />
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">No likes yet</span>
              <p className="text-[8px] text-slate-450 mt-1">Be the first to like this post!</p>
            </div>
          ) : (
            likes.map((u) => (
              <div key={u._id} className="flex items-center justify-between gap-3 text-left">
                {/* User Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-br from-[#ff3f6c] to-rose-600 text-white font-black flex items-center justify-center text-xs shadow-xs overflow-hidden shrink-0 border border-white dark:border-slate-800 ring-1 ring-slate-200/50 dark:ring-slate-800/50">
                    {u.profilePhoto ? (
                      <img src={u.profilePhoto} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span>{u.name?.charAt(0).toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-black text-slate-850 dark:text-slate-100 truncate capitalize tracking-wide leading-none">
                      {u.name}
                    </p>
                    <span className="text-[8.5px] text-slate-450 dark:text-slate-500 font-bold tracking-wide">
                      @{u.name?.toLowerCase().replace(/\s+/g, "")}
                    </span>
                  </div>
                </div>

                {/* Follow CTA */}
                {currentUser && currentUser._id !== u._id && (
                  <button
                    onClick={() => onToggleFollow(u._id)}
                    className={`h-7 px-3.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition duration-200 cursor-pointer flex items-center gap-1 shrink-0 ${
                      u.isFollowing
                        ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-505 hover:text-rose-650 hover:bg-rose-50/10 dark:hover:bg-rose-950/10 hover:border-rose-200"
                        : "bg-indigo-600 border-none text-white hover:bg-indigo-700 shadow-xs active:scale-95"
                    }`}
                  >
                    {u.isFollowing ? (
                      <>
                        <UserMinus size={10} />
                        <span>Unfollow</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={10} />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default LikesModal;
