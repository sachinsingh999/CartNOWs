import React from "react";
import { X, Loader2, MessageCircle, Send } from "lucide-react";

const CommentsDrawer = ({
  isOpen,
  onClose,
  loadingComments,
  comments,
  newComment,
  setNewComment,
  token,
  onSubmitComment
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="absolute inset-0 -z-10" onClick={onClose} />
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-xs h-full flex flex-col shadow-2xl animate-slide-left text-left">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-wider">Comments</h3>
            <span className="text-[7.5px] text-slate-400 uppercase font-black tracking-widest mt-0.5 block">Live Q&A Discussion</span>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition border-none bg-transparent cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {loadingComments ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={20} className="animate-spin text-indigo-500 mb-1 stroke-1.5" />
              <span className="text-[8px] font-black uppercase tracking-widest">Loading...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="py-20 text-center text-slate-400">
              <MessageCircle size={18} className="mx-auto text-slate-350 mb-1 stroke-1.5" />
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">No discussions yet</span>
              <p className="text-[7.5px] text-slate-400 mt-0.5">Start the conversation below!</p>
            </div>
          ) : (
            comments.map(c => (
              <div key={c._id} className="flex items-start gap-2">
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
                    <span className="text-[6.5px] text-slate-455 font-bold">{new Date(c.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-350 leading-relaxed mt-0.5 break-words">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <form onSubmit={onSubmitComment} className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 flex gap-1.5">
          <input
            type="text"
            placeholder={token ? "Add a comment..." : "Log in to comment"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={!token}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl outline-none focus:border-indigo-500 transition disabled:bg-slate-100 disabled:dark:bg-slate-950/50"
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
    </div>
  );
};

export default CommentsDrawer;
