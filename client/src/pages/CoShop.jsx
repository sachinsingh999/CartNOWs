import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useCoShop } from "../context/CoShopContext";
import { backendUrl } from "../config";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Users, 
  MessageSquare, 
  Plus, 
  ThumbsUp, 
  ThumbsDown, 
  ShoppingCart, 
  Copy, 
  Send, 
  LogOut,
  PackageOpen,
  ArrowRight
} from "lucide-react";

const CoShop = () => {
  const { roomId } = useParams();
  const {
    activeRoomId,
    shopperId,
    shopperName,
    setShopperName,
    roomProducts,
    members,
    chatMessages,
    joinRoomById,
    toggleVote,
    sendChatMessage,
    leaveRoom,
  } = useCoShop();

  const [messageText, setMessageText] = useState("");
  const chatContainerRef = useRef(null);
  const token = localStorage.getItem("token") || "";

  // Make sure to join room on load if not already set or mismatch
  useEffect(() => {
    if (roomId && activeRoomId !== roomId) {
      joinRoomById(roomId);
    }
  }, [roomId, activeRoomId]);

  // Scroll chat to bottom inside container only (prevents page jump/scroll)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    sendChatMessage(messageText);
    setMessageText("");
  };

  const handleCopyInviteLink = () => {
    const inviteLink = `${window.location.origin}/coshop/${roomId}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Invite link copied to clipboard!");
  };

  const handleMergeToCart = async (product) => {
    const cartItem = {
      productId: product._id,
      size: "M", // fallback size
      qty: 1
    };

    if (token) {
      try {
        const response = await axios.post(
          `${backendUrl}/api/cart/add`,
          cartItem,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success(`Merged ${product.name.split(" ")[0]} to your checkout cart!`);
          window.dispatchEvent(new Event("storage"));
        }
      } catch (error) {
        toast.error("Failed to merge to cart");
      }
    } else {
      let guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      const key = `${product._id}_M`;
      guestCart[key] = (guestCart[key] || 0) + 1;
      localStorage.setItem("cart", JSON.stringify(guestCart));
      toast.success(`Merged ${product.name.split(" ")[0]} to guest checkout cart!`);
      window.dispatchEvent(new Event("storage"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl shadow-black/40">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Co-Shop Room Active
              </span>
              <span className="text-slate-400 text-sm font-medium">Room Code: <strong className="text-white tracking-widest">{roomId}</strong></span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">Group Shopping Space</h1>
            <p className="text-sm text-slate-400 font-medium">Invite your friends to shop together, vote on products, and chat in real-time!</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCopyInviteLink}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all duration-300 shadow-lg shadow-indigo-600/30 border border-indigo-400/20 hover:scale-[1.02] cursor-pointer"
            >
              <Copy size={16} />
              Copy Invite Link
            </button>
            <button
              onClick={leaveRoom}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-slate-200 hover:border-rose-500/30 border border-white/5 font-bold text-sm transition-all duration-300 cursor-pointer"
            >
              <LogOut size={16} />
              Leave Room
            </button>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Board / Suggested Products List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Suggested Products Header */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl shadow-black/20">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                    Suggested Products
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                      {roomProducts.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-1">Products recommended by members. Vote on items to decide what to buy!</p>
                </div>
                <Link
                  to="/product"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-indigo-300 transition-all border border-white/5"
                >
                  <Plus size={14} />
                  Explore Products
                </Link>
              </div>

              {roomProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-white/10 rounded-2xl bg-slate-950/20 text-center">
                  <div className="h-16 w-16 bg-slate-800/80 rounded-2xl flex items-center justify-center text-slate-400 mb-4 border border-white/5 shadow-inner">
                    <PackageOpen size={28} />
                  </div>
                  <h3 className="text-base font-extrabold text-white">No suggestions yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6 font-semibold leading-relaxed">
                    Suggest products to this room by clicking the "Suggest to Group" button on any product detail or list page.
                  </p>
                  <Link
                    to="/product"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                  >
                    Go to Products Catalog
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomProducts.map((item) => {
                    const totalVotes = Object.values(item.votes).reduce((acc, v) => acc + v, 0);
                    const hasMyUpvote = item.votes[shopperId] === 1;
                    const hasMyDownvote = item.votes[shopperId] === -1;
                    
                    return (
                      <div 
                        key={item.product._id} 
                        className="group flex flex-col rounded-2xl border border-white/5 hover:border-white/15 bg-slate-950/40 hover:bg-slate-950/60 p-4 transition-all duration-300 shadow-md hover:shadow-xl hover:translate-y-[-2px] overflow-hidden"
                      >
                        <div className="flex gap-4">
                          <Link 
                            to={`/product/${item.product._id}`} 
                            className="relative h-24 w-20 rounded-xl overflow-hidden bg-slate-800 border border-white/10 shrink-0 shadow-inner"
                          >
                            <img 
                              src={item.product.images && item.product.images[0]} 
                              alt={item.product.name} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>

                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            <div>
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
                                {item.product.brand || item.product.category}
                              </span>
                              <h3 className="font-extrabold text-white text-sm truncate mt-1">
                                {item.product.name}
                              </h3>
                              <p className="text-indigo-300 font-black text-sm mt-1">
                                ₹{item.product.price.toLocaleString("en-IN")}
                              </p>
                            </div>

                            <div className="text-[11px] text-slate-400 font-semibold mt-2">
                              Suggested by <span className="text-slate-200 font-bold">{item.suggestedBy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Votes & Actions Tray */}
                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-4">
                          
                          {/* Voting System */}
                          <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/5">
                            <button
                              onClick={() => toggleVote(item.product._id, 1)}
                              className={`p-1.5 rounded-lg transition cursor-pointer hover:scale-105 ${hasMyUpvote ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:text-slate-200"}`}
                              title="Upvote item"
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <span className={`text-[12px] font-black px-2 ${totalVotes > 0 ? "text-indigo-400" : totalVotes < 0 ? "text-rose-400" : "text-slate-400"}`}>
                              {totalVotes > 0 ? `+${totalVotes}` : totalVotes}
                            </span>
                            <button
                              onClick={() => toggleVote(item.product._id, -1)}
                              className={`p-1.5 rounded-lg transition cursor-pointer hover:scale-105 ${hasMyDownvote ? "bg-rose-600 text-white shadow-md shadow-rose-600/20" : "text-slate-400 hover:text-rose-400"}`}
                              title="Downvote item"
                            >
                              <ThumbsDown size={14} />
                            </button>
                          </div>

                          {/* Cart Merge Option */}
                          <button
                            onClick={() => handleMergeToCart(item.product)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
                          >
                            <ShoppingCart size={12} />
                            Merge to Cart
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Shopper Settings */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl shadow-black/20">
              <h2 className="text-lg font-bold text-white tracking-tight">Your Shopper Details</h2>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <div className="w-full sm:flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Display Name</label>
                  <input
                    type="text"
                    value={shopperName}
                    onChange={(e) => setShopperName(e.target.value)}
                    maxLength={20}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/40 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-indigo-500 transition"
                    placeholder="Enter nickname"
                  />
                </div>
                <div className="w-full sm:w-auto shrink-0 flex flex-col justify-end self-stretch mt-6 sm:mt-0">
                  <div className="bg-slate-900 border border-white/5 p-3 rounded-xl flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shadow-lg"
                      style={{ 
                        backgroundColor: members.find(m => m.id === shopperId)?.color || "#6366f1"
                      }}
                    >
                      {shopperName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold leading-none">IDENTIFIER</p>
                      <p className="text-xs text-white font-bold mt-1">{shopperId}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Members & Realtime Chat Sidebar (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Shoppers List */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 shadow-xl shadow-black/20">
              <h2 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 mb-4">
                <Users size={18} className="text-indigo-400" />
                Active Shoppers
                <span className="ml-auto px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full border border-white/5">
                  {members.length}
                </span>
              </h2>
              
              <div className="flex flex-col gap-3">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/30 border border-white/5 shadow-sm">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-black shadow"
                      style={{ backgroundColor: member.color || "#3b82f6" }}
                    >
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                        {member.name}
                        {member.id === shopperId && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-md border border-indigo-500/20">You</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">
                        {member.id === shopperId ? "Owner of tab" : "Guest shopper"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl shadow-black/20 flex flex-col h-[400px] overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-slate-950/20 flex items-center gap-2">
                <MessageSquare size={16} className="text-indigo-400" />
                <h3 className="font-extrabold text-sm text-white">Live Discussion</h3>
              </div>

              {/* Chat Messages Container with localized scroll ref */}
              <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      No messages yet. Send a message to coordinate with the group!
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => {
                    const isMe = msg.senderId === shopperId || msg.sender === shopperName;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex flex-col max-w-[85%] ${isMe ? "self-end items-end" : "self-start items-start"}`}
                      >
                        <span className="text-[10px] text-slate-400 font-bold mb-1 px-1">
                          {msg.sender}
                        </span>
                        <div 
                          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-md ${
                            isMe 
                              ? "bg-indigo-600 text-white rounded-tr-none" 
                              : "bg-slate-800 text-slate-100 border border-white/5 rounded-tl-none"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[8px] text-slate-500 font-semibold mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Tray */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-slate-950/20 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/10 text-white text-xs font-bold focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10 hover:scale-105 transition cursor-pointer"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default CoShop;
