import React, { useState, useEffect } from "react";
import { Star, ShieldCheck, ThumbsUp, Heart, Flag, MessageSquare, Send, Check, AlertTriangle } from "lucide-react";

// Helper to parse metadata from the comment string
const parseReviewComment = (fullComment) => {
  let comment = fullComment || "";
  let pros = [];
  let cons = [];
  let anonymous = false;

  if (comment.includes("[PROS]:")) {
    const parts = comment.split("[PROS]:");
    const prosPart = parts[1].split("[CONS]:")[0].split("[ANONYMOUS]:")[0].trim();
    pros = prosPart.split(",").map(p => p.trim()).filter(Boolean);
  }
  if (comment.includes("[CONS]:")) {
    const parts = comment.split("[CONS]:");
    const consPart = parts[1].split("[ANONYMOUS]:")[0].trim();
    cons = consPart.split(",").map(c => c.trim()).filter(Boolean);
  }
  if (comment.includes("[ANONYMOUS]: true")) {
    anonymous = true;
  }
  
  // Clean comment by removing all metadata tags
  comment = comment.split("[PROS]:")[0].split("[CONS]:")[0].split("[ANONYMOUS]:")[0].trim();

  return { comment, pros, cons, anonymous };
};

// Individual Review Card component to manage its own interactive states
const ReviewCard = ({ review, getAvatarStyle }) => {
  const { comment: cleanComment, pros, cons, anonymous: isAnonymous } = parseReviewComment(review.comment);
  const displayName = isAnonymous ? "Anonymous Customer" : review.name;

  const [helpfulCount, setHelpfulCount] = useState(review.helpful || Math.floor(Math.random() * 25) + 3);
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReplyText, setNewReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState(review.reply ? [review.reply] : []);

  const handleHelpfulClick = () => {
    if (hasVotedHelpful) {
      setHelpfulCount(helpfulCount - 1);
      setHasVotedHelpful(false);
    } else {
      setHelpfulCount(helpfulCount + 1);
      setHasVotedHelpful(true);
    }
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
  };

  const handleReportClick = () => {
    setIsReported(true);
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (newReplyText.trim()) {
      setLocalReplies([...localReplies, newReplyText.trim()]);
      setNewReplyText("");
      setShowReplyForm(false);
    }
  };

  // Mock variants for high-density social proof display
  const mockVariants = [
    "Midnight • 256GB • Delivered 12 days ago",
    "Sierra Blue • 128GB • Delivered 5 days ago",
    "Space Gray • 512GB • Delivered 3 weeks ago",
    "Silver • 256GB • Delivered 2 days ago",
    "Standard • One Size • Delivered 8 days ago",
  ];
  const variantText = review.variant || mockVariants[Math.abs((review.name || "C").charCodeAt(0) || 0) % mockVariants.length];

  // Helper to draw rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={11}
            className={`${ star <= rating ? "fill-amber-400 stroke-amber-400" : "stroke-slate-200 dark:stroke-slate-700 fill-slate-100 dark:fill-slate-800" }`}
          />
        ))}
      </div>
    );
  };

  // Mock reviewer photos/videos if none are supplied, to make the feed look rich and visual
  const mockPhotos = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=120&auto=format&fit=crop&q=60",
  ];

  // We assign a photo to reviews that have a 5-star or 4-star rating, to demonstrate file preview attachments.
  const hasMedia = review.rating >= 4 && ((review.name || "C").charCodeAt(0) % 2 === 0);
  const mediaUrl = hasMedia ? mockPhotos[(review.name || "C").charCodeAt(0) % mockPhotos.length] : null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-3.5 shadow-xs transition-all duration-200 hover:shadow-sm text-left space-y-3">
      {/* Top row: Profile & Stars */}
      <div className="flex justify-between items-start gap-4">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-xs ${getAvatarStyle(displayName)}`}>
            {displayName.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100 leading-none">{displayName}</p>
              {!isAnonymous && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 text-[8px] font-black uppercase text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/35">
                  <ShieldCheck size={9} />
                  <span>Verified Buyer</span>
                </span>
              )}
            </div>
            <p className="text-[9.5px] font-bold text-slate-400 dark:text-slate-500 mt-1">
              {new Date(review.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 px-1.5 py-0.5 rounded-lg">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Product Variant purchased */}
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 leading-none">
        Variant: <span className="text-slate-600 dark:text-slate-300">{variantText}</span>
      </p>

      {/* Review content */}
      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
        {cleanComment}
      </p>

      {/* Pros & Cons block if present */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="space-y-1.5 bg-slate-50/50 dark:bg-slate-950/20 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] leading-relaxed">
          {pros.length > 0 && (
            <div className="flex items-start gap-1">
              <span className="text-emerald-600 dark:text-emerald-400 font-black shrink-0">✓</span>
              <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0">Pros:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{pros.join(", ")}</span>
            </div>
          )}
          {cons.length > 0 && (
            <div className="flex items-start gap-1">
              <span className="text-rose-600 dark:text-rose-400 font-black shrink-0">✗</span>
              <span className="text-slate-500 dark:text-slate-400 font-bold shrink-0">Cons:</span>
              <span className="text-slate-700 dark:text-slate-300 font-medium">{cons.join(", ")}</span>
            </div>
          )}
        </div>
      )}

      {/* Media Thumbnails if any */}
      {mediaUrl && (
        <div className="flex gap-2 pt-0.5">
          <div className="relative group/thumb w-14 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-zoom-in">
            <img src={mediaUrl} alt="review media" className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
          </div>
        </div>
      )}

      {/* Actions toolbar */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 flex-wrap gap-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleHelpfulClick}
            className={`flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer ${ hasVotedHelpful ? "text-indigo-600 dark:text-indigo-400" : "" }`}
          >
            <ThumbsUp size={11} className={hasVotedHelpful ? "fill-indigo-600/10" : ""} />
            <span>Helpful ({helpfulCount})</span>
          </button>
          
          <button
            onClick={handleLikeClick}
            className={`flex items-center gap-1 hover:text-rose-500 dark:hover:text-rose-400 transition-colors cursor-pointer ${ isLiked ? "text-rose-500 dark:text-rose-400" : "" }`}
          >
            <Heart size={11} className={isLiked ? "fill-rose-500 stroke-rose-500" : ""} />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <MessageSquare size={11} />
            <span>Reply</span>
          </button>
        </div>

        <button
          onClick={handleReportClick}
          disabled={isReported}
          className={`flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer ${ isReported ? "text-rose-600 dark:text-rose-500 font-bold" : "" }`}
        >
          <Flag size={10} />
          <span>{isReported ? "Reported" : "Report"}</span>
        </button>
      </div>

      {/* Reply input field (interactive!) */}
      {showReplyForm && (
        <form onSubmit={handleSendReply} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-100 dark:border-slate-800 animate-[fade-in_0.2s_ease-out]">
          <input
            type="text"
            value={newReplyText}
            onChange={(e) => setNewReplyText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 bg-transparent text-[11px] outline-none text-slate-800 dark:text-slate-100"
          />
          <button type="submit" className="text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition shrink-0 cursor-pointer">
            <Send size={12} />
          </button>
        </form>
      )}

      {/* Nest Replies */}
      {localReplies.length > 0 && (
        <div className="space-y-2.5 mt-2">
          {localReplies.map((rep, idx) => (
            <div key={idx} className="ml-4 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 bg-indigo-50/20 dark:bg-indigo-950/5 text-left transition-all duration-200 hover:bg-indigo-50/30">
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
                <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">
                  {idx === 0 && review.reply ? "Seller Response" : "Staff Reply"}
                </span>
                <span className="text-[8.5px] font-bold text-slate-400">Verified Employee</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-2.5 border-l-2 border-indigo-200 dark:border-indigo-800">
                {rep}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CostomersReviews = ({ reviews = [], filter = "All Reviews", sortBy = "Most Recent" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 3;

  // Reset page to 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortBy]);

  // Parsing and Filtering
  let parsedReviews = reviews.map(r => ({
    ...r,
    parsed: parseReviewComment(r.comment)
  }));

  // Apply filters
  if (filter === "Photos" || filter === "Videos") {
    // Media filter: in our mock, media is generated based on name hash/rating
    parsedReviews = parsedReviews.filter(r => r.rating >= 4 && ((r.name || "C").charCodeAt(0) % 2 === 0));
  } else if (filter === "5 Star") {
    parsedReviews = parsedReviews.filter(r => r.rating === 5);
  } else if (filter === "4 Star") {
    parsedReviews = parsedReviews.filter(r => r.rating === 4);
  } else if (filter === "Verified Purchase") {
    // In our component, non-anonymous are verified buyers
    parsedReviews = parsedReviews.filter(r => !r.parsed.anonymous);
  }

  // Apply sorting
  if (sortBy === "Most Recent") {
    parsedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "Highest Rated") {
    parsedReviews.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "Lowest Rated") {
    parsedReviews.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === "Most Helpful") {
    // Just sorting alphabetically or by date as a fallback, but using rating as proxy for helpfulness
    parsedReviews.sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
  }

  if (parsedReviews.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-5 py-10 text-center">
        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">No matching reviews</p>
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
          Try relaxing your filters to see more product reviews.
        </p>
      </div>
    );
  }

  // Calculate pagination parameters
  const totalPages = Math.ceil(parsedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = parsedReviews.slice(startIndex, startIndex + reviewsPerPage);

  // Color options for avatars to make it colorful and modern
  const avatarColors = [
    "bg-indigo-600 text-indigo-50",
    "bg-emerald-600 text-emerald-50",
    "bg-sky-600 text-sky-50",
    "bg-rose-600 text-rose-50",
    "bg-amber-600 text-amber-50",
  ];

  const getAvatarStyle = (name) => {
    const code = name ? name.charCodeAt(0) : 0;
    return avatarColors[code % avatarColors.length];
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3.5">
        {paginatedReviews.map((review) => (
          <ReviewCard
            key={review._id || `${review.userId}-${review.date}`}
            review={review}
            getAvatarStyle={getAvatarStyle}
          />
        ))}
      </div>

      {/* Pagination controls deck */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 text-xs font-bold text-slate-500 dark:text-slate-400">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer select-none"
          >
            Previous
          </button>
          <span className="select-none text-slate-600 dark:text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer select-none"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CostomersReviews;
