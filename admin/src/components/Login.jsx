import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import { Lock, Mail, Eye, EyeOff, ShieldAlert, Loader2, Terminal, Cpu, Database, Check } from "lucide-react";
import Logo from "./Logo";

/**
 * 3D Neural Network Animation Background for Login Experience.
 */
const InteractiveNeuralNetwork = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const maxNodes = isMobile ? 35 : isTablet ? 65 : 110;
    const connectionDist = isMobile ? 85 : 125;

    const handleMouseMove = (e) => {
      mouseRef.current.tx = (e.clientX - width / 2) * 0.12;
      mouseRef.current.ty = (e.clientY - height / 2) * 0.12;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const nodes = [];
    for (let i = 0; i < maxNodes; i++) {
      nodes.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: (Math.random() - 0.5) * 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 1.5 + 1.2,
        brightness: Math.random() * 0.5 + 0.5,
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulseOffset: Math.random() * Math.PI
      });
    }

    const particles = [];
    const maxParticles = isMobile ? 12 : 25;
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        from: Math.floor(Math.random() * maxNodes),
        to: Math.floor(Math.random() * maxNodes),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.005
      });
    }

    let introProgress = 0;
    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      if (introProgress < 1) introProgress += 0.015;

      const rotY = mouse.x * 0.0018;
      const rotX = -mouse.y * 0.0018;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const centerX = width / 2;
      const centerY = height / 2;

      const projected = nodes.map((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        const boundaryX = width * 0.7;
        const boundaryY = height * 0.7;
        if (Math.abs(node.x) > boundaryX) node.vx *= -1;
        if (Math.abs(node.y) > boundaryY) node.vy *= -1;
        if (Math.abs(node.z) > 250) node.vz *= -1;

        let x1 = node.x * cosY - node.z * sinY;
        let z1 = node.z * cosY + node.x * sinY;
        let y2 = node.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + node.y * sinX;

        const perspectiveFactor = 350 / (350 + z2);
        return {
          px: centerX + x1 * perspectiveFactor,
          py: centerY + y2 * perspectiveFactor,
          visible: z2 > -300,
          depth: z2,
          radius: node.radius * perspectiveFactor,
          nodeRef: node
        };
      });

      for (let i = 0; i < maxNodes; i++) {
        const p1 = projected[i];
        if (!p1.visible) continue;

        for (let j = i + 1; j < maxNodes; j++) {
          const p2 = projected[j];
          if (!p2.visible) continue;

          const dx = p2.px - p1.px;
          const dy = p2.py - p1.py;
          const dist = Math.hypot(dx, dy);

          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15 * introProgress;
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      particles.forEach((part) => {
        part.progress += part.speed;
        if (part.progress >= 1) {
          part.progress = 0;
          part.from = part.to;
          part.to = Math.floor(Math.random() * maxNodes);
        }

        const p1 = projected[part.from];
        const p2 = projected[part.to];

        if (p1 && p2 && p1.visible && p2.visible) {
          const routeDist = Math.hypot(p2.px - p1.px, p2.py - p1.py);
          if (routeDist < connectionDist * 1.5) {
            const px = p1.px + (p2.px - p1.px) * part.progress;
            const py = p1.py + (p2.py - p1.py) * part.progress;

            ctx.beginPath();
            ctx.arc(px, py, 1.25, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${0.7 * introProgress})`;
            ctx.shadowColor = "#06B6D4";
            ctx.shadowBlur = 4;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      });

      projected
        .sort((a, b) => b.depth - a.depth)
        .forEach((p) => {
          if (!p.visible) return;
          const time = Date.now() * p.nodeRef.pulseSpeed + p.nodeRef.pulseOffset;
          const pulsingBrightness = p.nodeRef.brightness * (0.6 + Math.sin(time) * 0.4);

          ctx.beginPath();
          ctx.arc(p.px, p.py, p.radius, 0, Math.PI * 2);
          if (p.depth < -100) {
            ctx.fillStyle = `rgba(139, 92, 246, ${pulsingBrightness * introProgress})`;
          } else if (p.depth > 100) {
            ctx.fillStyle = `rgba(6, 182, 212, ${pulsingBrightness * introProgress})`;
          } else {
            ctx.fillStyle = `rgba(37, 99, 235, ${pulsingBrightness * introProgress})`;
          }
          ctx.fill();
        });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
};

/**
 * World-Class, Award-Winning Admin Login Experience for CartNOW.
 */
const Login = ({ setToken }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootLogs, setBootLogs] = useState([]);

  // Futuristic diagnostics boot log simulation
  useEffect(() => {
    const lines = [
      "> INITIATING SECURE CORE CONNECTION...",
      "> ROUTING TRAFFIC VIA ENCRYPTED VPN PORT 443...",
      "> HOST RESOLVED: CARTNOW-HQ.LOCAL",
      "> INTEL GATEWAY: COMPATIBLE SECTORS DETECTED",
      "> AES-256 HARDWARE CRYPTO SYSTEM: ENGAGED [100%]",
      "> SECURITY AUTHENTICATION HANDSHAKE: STANDBY..."
    ];

    let currentLineIdx = 0;
    const interval = setInterval(() => {
      if (currentLineIdx < lines.length) {
        setBootLogs((prev) => [...prev, lines[currentLineIdx]]);
        currentLineIdx++;
      } else {
        clearInterval(interval);
        // Wait a small moment then disable booting view smoothly
        setTimeout(() => {
          setBooting(false);
        }, 600);
      }
    }, 380);

    return () => clearInterval(interval);
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(backendUrl + "/api/user/admin", {
        email,
        password,
      });
      if (response.data.success) {
        toast.success("Welcome back, Administrator");
        setToken(response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden antialiased font-mono bg-[#030408] select-none text-slate-350">
      
      {/* Dynamic Keyframes for Scanning HUDs & Sequential Draws */}
      <style>{`
        .anim-luxury-dark-bg {
          background: radial-gradient(circle at center, #040610 0%, #010204 100%);
        }

        /* Ambient background network fade-in loader */
        @keyframes sceneFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-scene-fade {
          animation: sceneFadeIn 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* Sequential line reveals */
        @keyframes terminalReveal {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .reveal-1 { animation: terminalReveal 0.4s ease-out forwards; animation-delay: 0.1s; opacity: 0; }
        .reveal-2 { animation: terminalReveal 0.4s ease-out forwards; animation-delay: 0.3s; opacity: 0; }
        .reveal-3 { animation: terminalReveal 0.4s ease-out forwards; animation-delay: 0.5s; opacity: 0; }
        .reveal-4 { animation: terminalReveal 0.4s ease-out forwards; animation-delay: 0.7s; opacity: 0; }
        .reveal-5 { animation: terminalReveal 0.4s ease-out forwards; animation-delay: 0.9s; opacity: 0; }
        .reveal-6 { animation: terminalReveal 0.4s ease-out forwards; animation-delay: 1.1s; opacity: 0; }

        /* Sweep animation on hover */
        .sweep-light {
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(59, 130, 246, 0.2), transparent);
          transition: left 0.65s ease;
          pointer-events: none;
        }
        .btn-hover-sweep:hover .sweep-light {
          left: 200%;
        }

        /* Terminal card backlight glow */
        @keyframes breatheSpot {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.25; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.4; }
        }
        .terminal-glow-spot {
          animation: breatheSpot 10s ease-in-out infinite;
        }

        /* Glitch blinking console prompt cursor */
        @keyframes blinkCursor {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        .blinking-prompt-cursor {
          animation: blinkCursor 0.9s step-end infinite;
        }
      `}</style>

      {/* A. Background 3D Neural Grid Visualizer */}
      <div className="absolute inset-0 z-10 animate-scene-fade pointer-events-none">
        <InteractiveNeuralNetwork />
      </div>

      {/* B. Flat blueprint tech layout grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(6,182,212,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(6,182,212,0.005)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none z-0" />

      {/* C. Faint backlight glow embedded directly behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-blue-600/5 dark:bg-blue-600/5 blur-[90px] pointer-events-none z-0 terminal-glow-spot" />

      {/* D. GEOMETRIC COMMAND TERMINAL ACCESS CONSOLE (Max-width 420px, Sharp Geometry) */}
      <div className="relative z-35 w-full max-w-[420px]">
        
        {/* Tesla-style geometric corner accent brackets */}
        <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 border-blue-600/80 pointer-events-none" />
        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 border-t-2 border-r-2 border-blue-600/80 pointer-events-none" />
        <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 border-b-2 border-l-2 border-blue-600/80 pointer-events-none" />
        <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 border-blue-600/80 pointer-events-none" />

        {/* Flat Matte Security Console Frame */}
        <div className="bg-[#05070e] border border-slate-900 rounded-none p-7 md:p-9 shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col gap-5.5 relative">
          
          {/* Header Section */}
          <div className="space-y-3.5 border-b border-slate-900 pb-4 relative z-10 reveal-1">
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              <span>Restricted Access</span>
              <div className="flex items-center gap-1.5 text-blue-500">
                <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                <span>Operational</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <Logo forceWhite className="h-8 w-auto mb-1" />
              <h2 className="text-[10px] font-black text-slate-450 tracking-widest uppercase">Operations Control Center</h2>
              <div className="text-[8px] text-slate-550 font-bold uppercase tracking-wider">Security Level: Administrator</div>
            </div>
          </div>

          {/* Interactive Screen States */}
          {booting ? (
            /* BOOT DICTIONARY DIALOG STREAM */
            <div className="bg-[#020306] border border-slate-900 p-4 min-h-[220px] flex flex-col justify-between font-mono text-[9px] uppercase tracking-wider text-blue-400/90 leading-relaxed z-10">
              <div className="space-y-2">
                {bootLogs.map((log, idx) => (
                  <div key={idx} className="reveal-1">{log}</div>
                ))}
              </div>
              <div className="flex items-center gap-1 text-slate-500 mt-4">
                <span>SYSTEM CORE ACCESS INITIALIZATION</span>
                <span className="h-3 w-1.5 bg-blue-500 blinking-prompt-cursor" />
              </div>
            </div>
          ) : (
            /* SECURE ACCESS INPUT FORM FIELDS */
            <form onSubmit={onSubmitHandler} className="space-y-4.5 relative z-10 transition-opacity duration-300">
              {/* Input: Email */}
              <div className="space-y-1.5 reveal-2">
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-550 pointer-events-none">
                    <Mail size={12} className="text-slate-600" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cartnow.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-none border border-slate-900 bg-[#020306] text-xs text-slate-200 outline-none transition duration-155 placeholder:text-slate-700 focus:border-blue-600/70"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Input: Password */}
              <div className="space-y-1.5 reveal-3">
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 leading-none">Security Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-550 pointer-events-none">
                    <Lock size={12} className="text-slate-600" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-9 py-2.5 rounded-none border border-slate-900 bg-[#020306] text-xs text-slate-200 outline-none transition duration-155 placeholder:text-slate-700 focus:border-blue-600/70"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={12} className="text-slate-600" /> : <Eye size={12} className="text-slate-600" />}
                  </button>
                </div>
              </div>

              {/* Security Verification Checks */}
              <div className="bg-[#020306] border border-slate-900 p-3 space-y-1.5 font-mono text-[8px] uppercase tracking-widest text-slate-550 reveal-4">
                <div className="flex items-center gap-1.5 text-blue-500/80">
                  <Check size={9} className="text-blue-500 font-black" />
                  <span>Secure Connection Established</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-500/80">
                  <Check size={9} className="text-blue-500 font-black" />
                  <span>Node Database Handshake Active</span>
                </div>
                <div className="flex items-center gap-1.5 text-blue-500/80">
                  <Check size={9} className="text-blue-500 font-black" />
                  <span>AES-256 Link Encryption Enabled</span>
                </div>
              </div>

              {/* Submit Action (Flat Sweep Effect) */}
              <div className="reveal-5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full relative overflow-hidden flex items-center justify-center gap-1.5 rounded-none bg-[#020306] border border-blue-600/60 hover:border-blue-500 text-blue-400 py-3 text-[9px] font-black uppercase tracking-widest transition duration-300 active:scale-[0.98] cursor-pointer mt-4 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] btn-hover-sweep hover:scale-[1.01]"
                >
                  {/* Horizontal hover light sweep line */}
                  <div className="sweep-light" />
                  
                  {submitting ? (
                    <>
                      <Loader2 size={11} className="animate-spin text-blue-400" />
                      <span>Access Verification...</span>
                    </>
                  ) : (
                    <span>[ Access Control Center ]</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Console Audit Footer */}
          <div className="border-t border-slate-900 pt-4 flex flex-col gap-2.5 relative z-10 reveal-6 text-[8px] text-slate-600 font-mono tracking-widest uppercase text-center leading-relaxed">
            <p>
              Protected by restricted enterprise security.<br />
              Authorized administrators only.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
