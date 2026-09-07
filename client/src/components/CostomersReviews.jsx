import React, { useState, useEffect, useRef } from "react";
import {
  Star,
  ShieldCheck,
  ThumbsUp,
  Heart,
  Flag,
  MessageSquare,
  Send,
  Check,
  Package,
  Store,
  CornerDownRight,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Helper to parse metadata from the comment string
const parseReviewComment = (fullComment) => {
  let comment = fullComment || "";
  let pros = [];
  let cons = [];
  let anonymous = false;

  if (comment.includes("[PROS]:")) {
    const parts = comment.split("[PROS]:");
    const prosPart = parts[1].split("[CONS]:")[0].split("[ANONYMOUS]:")[0].trim();
    pros = prosPart.split(",").map((p) => p.trim()).filter(Boolean);
  }
  if (comment.includes("[CONS]:")) {
    const parts = comment.split("[CONS]:");
    const consPart = parts[1].split("[ANONYMOUS]:")[0].trim();
    cons = consPart.split(",").map((c) => c.trim()).filter(Boolean);
  }
  if (comment.includes("[ANONYMOUS]: true")) {
    anonymous = true;
  }

  // Clean comment by removing all metadata tags
  comment = comment
    .split("[PROS]:")[0]
    .split("[CONS]:")[0]
    .split("[ANONYMOUS]:")[0]
    .trim();

  return { comment, pros, cons, anonymous };
};

// Individual Review Card component
const ReviewCard = ({ review, getAvatarStyle }) => {
  const {
    comment: cleanComment,
    pros,
    cons,
    anonymous: isAnonymous
  } = parseReviewComment(review.comment);
  const displayName = isAnonymous ? "CartNow Shopper" : review.name;

  const [helpfulCount, setHelpfulCount] = useState(
    review.helpful || Math.floor(Math.random() * 25) + 3
  );
  const [hasVotedHelpful, setHasVotedHelpful] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [newReplyText, setNewReplyText] = useState("");
  const [localReplies, setLocalReplies] = useState(
    review.reply ? [review.reply] : []
  );

  const handleHelpfulClick = () => {
    if (hasVotedHelpful) {
      setHelpfulCount((prev) => prev - 1);
      setHasVotedHelpful(false);
    } else {
      setHelpfulCount((prev) => prev + 1);
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

  // Mock variants for social proof display
  const mockVariants = [
    "Midnight • 256GB • Delivered 12 days ago",
    "Sierra Blue • 128GB • Delivered 5 days ago",
    "Space Gray • 512GB • Delivered 3 weeks ago",
    "Silver • 256GB • Delivered 2 days ago",
    "Standard • One Size • Delivered 8 days ago"
  ];
  const variantText =
    review.variant ||
    mockVariants[
      Math.abs((review.name || "C").charCodeAt(0) || 0) % mockVariants.length
    ];

  // Helper to draw rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={11}
            className={`${
              star <= rating
                ? "fill-amber-400 stroke-amber-400"
                : "stroke-slate-200 dark:stroke-slate-700 fill-slate-100 dark:fill-slate-800"
            }`}
          />
        ))}
      </div>
    );
  };

  // Mock reviewer photos/videos if none supplied
  const mockPhotos = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=160&auto=format&fit=crop&q=60"
  ];

  const hasMedia =
    review.rating >= 4 && (review.name || "C").charCodeAt(0) % 2 === 0;
  const mediaUrl = hasMedia
    ? mockPhotos[(review.name || "C").charCodeAt(0) % mockPhotos.length]
    : null;

  return (
    <div className="w-full rounded-md border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-3.5 shadow-2xs transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 text-left space-y-2.5">
      {/* Top Header: Reviewer Info + Star Rating */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-8 h-8 rounded-md shrink-0 flex items-center justify-center font-black text-xs shadow-xs ${getAvatarStyle(
              displayName
            )}`}
          >
            {isAnonymous ? (
              <User size={14} />
            ) : (
              displayName.charAt(0)?.toUpperCase() || "C"
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                {displayName}
              </span>
              {!isAnonymous && (
                <span className="inline-flex items-center gap-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 text-[8px] font-black uppercase text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-900/50">
                  <ShieldCheck size={9} className="stroke-[2.5]" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
              {new Date(review.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric"
              })}
            </p>
          </div>
        </div>

        {/* Rating Score Badge */}
        <div className="flex items-center gap-1 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 px-1.5 py-0.5 rounded-md shrink-0">
          <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">
            {review.rating}.0
          </span>
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Purchased Variant info */}
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 dark:text-slate-400">
        <Package size={11} className="text-slate-400 shrink-0" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold truncate">
          {variantText}
        </span>
      </div>

      {/* Review Content */}
      <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
        {cleanComment}
      </p>

      {/* Pros & Cons Highlights */}
      {(pros.length > 0 || cons.length > 0) && (
        <div className="rounded-md bg-slate-50/70 dark:bg-slate-950/30 border border-slate-200/70 dark:border-slate-800/70 p-2 space-y-1 text-xs">
          {pros.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 shrink-0">
                Pros:
              </span>
              <div className="flex flex-wrap gap-1">
                {pros.map((pro, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 rounded bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    <Check size={9} className="stroke-[3]" />
                    {pro}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cons.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9.5px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 shrink-0">
                Cons:
              </span>
              <div className="flex flex-wrap gap-1">
                {cons.map((con, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-0.5 rounded bg-rose-100/70 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.5 text-[10px] font-semibold"
                  >
                    <span className="font-black text-[9px]">✕</span>
                    {con}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Media Attachment */}
      {mediaUrl && (
        <div className="flex gap-2 pt-0.5">
          <div className="relative group/thumb w-12 h-12 rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 cursor-zoom-in">
            <img
              src={mediaUrl}
              alt="customer upload"
              className="w-full h-full object-cover transition-transform duration-200 group-hover/thumb:scale-105"
            />
          </div>
        </div>
      )}

      {/* Official Staff / Seller Replies */}
      {localReplies.filter((r) => r && r.trim().length > 0).length > 0 && (
        <div className="space-y-1 pt-0.5">
          {localReplies
            .filter((r) => r && r.trim().length > 0)
            .map((rep, idx) => (
              <div
                key={idx}
                className="rounded-md border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/20 p-2 text-left space-y-1"
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <Store size={11} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                      Seller Response
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-1 pl-0.5">
                  <CornerDownRight
                    size={11}
                    className="text-indigo-400 mt-0.5 shrink-0"
                  />
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {rep}
                  </p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Bottom Actions Toolbar */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleHelpfulClick}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              hasVotedHelpful
                ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <ThumbsUp
              size={11}
              className={hasVotedHelpful ? "fill-indigo-600 dark:fill-indigo-400" : ""}
            />
            <span>Helpful ({helpfulCount})</span>
          </button>

          <button
            type="button"
            onClick={handleLikeClick}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
              isLiked
                ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-bold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <Heart
              size={11}
              className={isLiked ? "fill-rose-500 stroke-rose-500" : ""}
            />
            <span>{isLiked ? "Liked" : "Like"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 transition-colors cursor-pointer"
          >
            <MessageSquare size={11} />
            <span>Reply</span>
          </button>
        </div>

        <button
          type="button"
          onClick={handleReportClick}
          disabled={isReported}
          className={`inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10.5px] transition-colors cursor-pointer ${
            isReported
              ? "text-rose-600 font-bold"
              : "text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
          }`}
        >
          <Flag size={10} />
          <span>{isReported ? "Reported" : "Report"}</span>
        </button>
      </div>

      {/* Reply Input Form */}
      {showReplyForm && (
        <form
          onSubmit={handleSendReply}
          className="flex gap-2 items-center bg-slate-50 dark:bg-slate-950 p-1.5 rounded-md border border-slate-200 dark:border-slate-800 animate-in fade-in duration-150 mt-1.5"
        >
          <input
            type="text"
            value={newReplyText}
            onChange={(e) => setNewReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 bg-transparent text-[11px] outline-none text-slate-800 dark:text-slate-100 px-1"
          />
          <button
            type="submit"
            disabled={!newReplyText.trim()}
            className="h-6 px-2.5 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Send size={10} />
            <span>Send</span>
          </button>
        </form>
      )}
    </div>
  );
};

const CostomersReviews = ({
  reviews = [],
  filter = "All Reviews",
  sortBy = "Most Recent"
}) => {
  const scrollRef = useRef(null);

  // Parsing reviews metadata
  let parsedReviews = reviews.map((r) => ({
    ...r,
    parsed: parseReviewComment(r.comment)
  }));

  // Apply filters
  if (filter === "5 Star") {
    parsedReviews = parsedReviews.filter((r) => r.rating === 5);
  } else if (filter === "4 Star") {
    parsedReviews = parsedReviews.filter((r) => r.rating === 4);
  } else if (filter === "Verified Purchase") {
    parsedReviews = parsedReviews.filter((r) => !r.parsed.anonymous);
  }

  // Apply sorting
  if (sortBy === "Most Recent") {
    parsedReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  } else if (sortBy === "Highest Rated") {
    parsedReviews.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "Lowest Rated") {
    parsedReviews.sort((a, b) => a.rating - b.rating);
  } else if (sortBy === "Most Helpful") {
    parsedReviews.sort(
      (a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date)
    );
  }

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -330 : 330;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (parsedReviews.length === 0) {
    return (
      <div className="rounded-md border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 px-5 py-8 text-center">
        <p className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          No matching reviews
        </p>
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
          Try relaxing your filters to see more product reviews.
        </p>
      </div>
    );
  }

  // Harmonious modern avatar palettes
  const avatarColors = [
    "bg-indigo-600 text-white",
    "bg-emerald-600 text-white",
    "bg-sky-600 text-white",
    "bg-violet-600 text-white",
    "bg-amber-600 text-white"
  ];

  const getAvatarStyle = (name) => {
    const code = name ? name.charCodeAt(0) : 0;
    return avatarColors[code % avatarColors.length];
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-2">
      {/* Horizontal Carousel Header: Hint + Slide Arrows */}
      {parsedReviews.length > 1 && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-0.5">
          <span>Scroll horizontally to browse reviews</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-95"
              aria-label="Previous review"
            >
              <ChevronLeft size={13} />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer active:scale-95"
              aria-label="Next review"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Horizontal Reviews Track (Side-by-Side Horizontal Cards) */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2.5 pt-0.5 scrollbar-thin snap-x snap-mandatory scroll-smooth w-full min-w-0 max-w-full"
      >
        {parsedReviews.map((review) => (
          <div
            key={review._id || `${review.userId}-${review.date}`}
            className="w-[300px] sm:w-[330px] shrink-0 snap-start"
          >
            <ReviewCard
              review={review}
              getAvatarStyle={getAvatarStyle}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CostomersReviews;
