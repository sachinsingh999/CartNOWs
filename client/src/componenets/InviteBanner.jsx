import React, { useState } from "react";
import { useCoShop } from "../context/CoShopContext";
import { Users, Plus, ArrowRight, Sparkles } from "lucide-react";

const InviteBanner = () => {
  const { createRoom, joinRoomById } = useCoShop();
  const [roomCode, setRoomCode] = useState("");

  const handleJoin = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    joinRoomById(roomCode.trim().toUpperCase());
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900 text-slate-100 p-6 sm:p-10 shadow-2xl shadow-black/40 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/50 my-10">
      
      {/* Decorative glows */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
        
        {/* Banner Details */}
        <div className="flex flex-col gap-3 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-extrabold border border-indigo-500/30">
            <Sparkles size={12} />
            Co-Shop Beta
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            Shop Together in Real-Time
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
            Create a live group room, invite your friends, suggest products, vote on items together, and chat. Make group shopping interactive and merge selected items into a single checkout cart!
          </p>
        </div>

        {/* Action Widgets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto shrink-0">
          
          {/* Create Button */}
          <button
            onClick={createRoom}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-all duration-300 shadow-lg shadow-indigo-600/30 border border-indigo-400/20 hover:scale-[1.02] cursor-pointer"
          >
            <Plus size={16} />
            Create Room
          </button>

          <div className="hidden sm:block text-slate-500 font-bold text-xs">OR</div>

          {/* Join Form */}
          <form onSubmit={handleJoin} className="flex-1 sm:flex-none flex items-stretch gap-2 bg-slate-950/40 p-1.5 rounded-2xl border border-white/10">
            <input
              type="text"
              placeholder="ENTER ROOM CODE"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              className="bg-transparent border-none text-white placeholder-slate-500 px-4 py-2 text-xs font-extrabold tracking-wider focus:outline-none w-full sm:w-36 text-center uppercase"
            />
            <button
              type="submit"
              className="flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-300 hover:text-white transition cursor-pointer"
            >
              <ArrowRight size={16} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

export default InviteBanner;
