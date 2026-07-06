import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar, Search, ChevronLeft, ChevronRight, Phone, MapPin, 
  CheckCircle, Clock, Navigation, Inbox, CalendarDays, DollarSign, 
  Wallet, Truck, Sparkles, Activity, Star, LogOut, ToggleLeft, ToggleRight,
  MessageSquare, AlertOctagon, ShieldAlert, ShieldCheck, LifeBuoy, QrCode, Key,
  RefreshCw, TrendingUp, BarChart2, Check, X, AlertTriangle, Eye, EyeOff,
  User, CheckCircle2, Navigation2, Crosshair, ArrowRight, CornerDownRight,
  ChevronDown, ChevronUp, Bell, Zap, PhoneCall, PhoneOff, Video, VideoOff, Mic, MicOff, Lock, Paperclip, Send
} from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const getUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded._id;
  } catch (e) {
    return null;
  }
};

const MyDeliveriesTab = ({
  token,
  driver,
  stats,
  orders,
  nextOrder,
  pendingAcceptance = [],
  handleAcceptAssignment,
  handleRejectAssignment,
  toggleDutyStatusHandler,
  logout,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  tablePage,
  setTablePage,
  tableRowsPerPage,
  handleStatusChange,
  setVerifyModal,
  formatAddress,
  getStatusBadgeStyle,
  completedTodayCount,
  todayEarningsVal,
  tableFilteredOrders,
  paginatedTableOrders,
  totalTablePages
}) => {
  // WebRTC Symmetrical Call States & Refs & FSM
  const [callState, setCallState] = useState("idle");
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState("connecting");
  const [callTime, setCallTime] = useState(0);
  const [incomingCall, setIncomingCall] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [callType, setCallType] = useState("audio"); // "audio" | "video"
  const [currentCallId, setCurrentCallId] = useState(null);

  // Camera & Audio Outputs
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentVideoDeviceId, setCurrentVideoDeviceId] = useState(null);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDropdownOpen, setCallDropdownOpen] = useState(false);

  // References
  const peerConnectionRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const ringingTimeoutRef = useRef(null);
  const callTimerIntervalRef = useRef(null);
  const localStreamRef = useRef(null);
  
  const callStateRef = useRef("idle");
  const incomingCallRef = useRef(false);
  const currentCallIdRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    incomingCallRef.current = incomingCall;
  }, [incomingCall]);

  useEffect(() => {
    currentCallIdRef.current = currentCallId;
  }, [currentCallId]);

  const incomingCallDataRef = useRef(null);
  useEffect(() => {
    incomingCallDataRef.current = incomingCallData;
  }, [incomingCallData]);

  const transitionTo = (newState) => {
    console.log(`[FSM Transition] ${callStateRef.current} -> ${newState}`);
    
    // Enforce basic FSM constraints
    if (newState === "ringing" && callStateRef.current !== "calling" && callStateRef.current !== "connecting") {
      console.warn(`[FSM] Invalid state skip to ringing`);
      return;
    }
    if (newState === "connected" && callStateRef.current !== "connecting" && callStateRef.current !== "ringing" && callStateRef.current !== "calling") {
      console.warn(`[FSM] Invalid state skip to connected`);
      return;
    }

    setCallState(newState);

    if (["idle", "ended", "rejected", "failed", "missed", "busy"].includes(newState)) {
      setCallActive(false);
      setCallStatus("connecting");
      setIncomingCall(false);
      setIncomingCallData(null);
      if (newState !== "idle") {
        setCallState("idle");
      }
    } else if (newState === "calling") {
      setCallActive(true);
      setCallStatus("connecting");
    } else if (newState === "ringing") {
      setCallActive(true);
      setCallStatus("ringing");
    } else if (newState === "connecting") {
      setCallActive(true);
      setCallStatus("connecting");
    } else if (newState === "connected") {
      setCallActive(true);
      setCallStatus("connected");
    }
  };

  // Modal states for simulation
  const [activeActionsOpen, setActiveActionsOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportIssueType, setReportIssueType] = useState("Traffic Delay");
  const [reportNotes, setReportNotes] = useState("");

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");

  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  
  // Expanded states for deliveries list card
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Confetti celebration state upon successful delivery
  const [showCelebration, setShowCelebration] = useState(false);

  // Helpers for progress timeline
  const getProgressStepIndex = (status) => {
    switch (status) {
      case "Assigned": return 0;
      case "Accepted": return 1;
      case "Picked Up": return 2;
      case "Out for Delivery": return 3;
      case "Delivered": return 4;
      default: return 1;
    }
  };

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatModalOpenRef = useRef(chatModalOpen);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    chatModalOpenRef.current = chatModalOpen;
  }, [chatModalOpen]);

  // Persistent Socket Connection for background notifications
  useEffect(() => {
    console.log("🔌 SOCKET CONNECTION EFFECT RUNNING:", { 
      nextOrderExists: !!nextOrder, 
      nextOrderId: nextOrder?._id, 
      tokenExists: !!token 
    });
    if (!nextOrder || !token) return;

    const orderId = nextOrder._id;
    const myId = getUserIdFromToken(token);

    // Connect to socket.io
    const socketUrl = backendUrl.startsWith("http") ? backendUrl : window.location.origin;
    const socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000
    });
    socketRef.current = socket;

    // Join room when connected/reconnected
    const handleJoinRoom = () => {
      socket.emit("join_order_room", { orderId });
    };

    if (socket.connected) {
      handleJoinRoom();
    }
    socket.on("connect", () => {
      console.log(`[Socket Connected] Socket ID: ${socket.id} (User: ${myId})`);
      console.log(`[ROOM JOIN REQUEST] Requesting to join room for order: ${orderId}`);
      handleJoinRoom();
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket Disconnected] Reason: ${reason}`);
    });

    socket.on("connect_error", (error) => {
      console.error(`[Socket Connection Error] Message: ${error.message}`);
    });

    socket.on("room_joined", () => {
      console.log(`[ROOM JOIN SUCCESS] Successfully joined secure communication room for order: ${orderId}`);
      socket.emit("mark_seen", { orderId });
    });

    socket.on("room_error", (err) => {
      console.error(`[ROOM JOIN FAILURE] Socket room connection error: ${err.message}`);
      toast.error(err.message || "Failed to join communication channel.");
    });

    socket.on("receive_message", (msg) => {
      console.log("🔥 RECEIVE_MESSAGE EVENT (Deliveryman Client)");
      console.log(msg);
      setChatMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 50);

      const isMe = myId && String(msg.senderId) === String(myId);

      // Alert/notification if from another user
      if (!isMe) {
        // Sound alert
        try {
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav");
          audio.volume = 0.35;
          audio.play().catch(() => {});
        } catch (e) {}

        // Emit mark_seen if chat modal is open
        if (chatModalOpenRef.current) {
          socket.emit("mark_seen", { orderId });
        } else {
          // Toast notification if chat modal is not open
          toast.info(`Message from Customer: ${msg.message}`, {
            position: "bottom-right",
            autoClose: 5000,
            onClick: () => setChatModalOpen(true)
          });
        }
      }
    });

    // Real-Time Typing Indicator
    socket.on("typing_status", ({ userId, isTyping }) => {
      if (String(userId) !== String(myId)) {
        setPartnerTyping(isTyping);
      }
    });

    // Real-Time User Presence Status
    socket.on("user_online", ({ userId }) => {
      if (String(userId) !== String(myId)) {
        setPartnerOnline(true);
      }
    });

    socket.on("user_offline", ({ userId }) => {
      if (String(userId) !== String(myId)) {
        setPartnerOnline(false);
      }
    });

    socket.on("partner_presence", ({ online }) => {
      setPartnerOnline(online);
    });

    // Real-Time Seen Receipts
    socket.on("messages_seen", ({ seenBy }) => {
      if (String(seenBy) !== String(myId)) {
        setChatMessages((prev) =>
          prev.map((m) => {
            const isMeMsg = m.senderId === myId || m.senderRole === "deliveryman";
            if (isMeMsg) {
              return { ...m, status: "seen" };
            }
            return m;
          })
        );
      }
    });

    // WebRTC Signaling listeners
    socket.on("incoming_call", (callInfo) => {
      console.log(`[Socket Call] incoming_call received from: ${callInfo.from}`);
      if (!callInfo.offer) {
        console.log("[Socket Call] Ignoring call event without WebRTC offer");
        return;
      }
      const callerId = callInfo.from || callInfo.callerId;
      if (String(callerId) === String(myId)) {
        console.log("[Socket Call] Ignoring self-relayed incoming call event");
        return;
      }
      if (callStateRef.current !== "idle" || incomingCallRef.current) {
        console.log("[Socket Call] Line busy, rejecting call");
        socket.emit("call_busy", { to: callInfo.from, orderId });
        return;
      }
      setIncomingCall(true);
      setIncomingCallData(callInfo);
      socket.emit("ringing", { to: callInfo.from, orderId });
    });

    socket.on("ringing", () => {
      console.log("[Socket Call] ringing received");
      if (callStateRef.current === "calling") {
        transitionTo("ringing");
      }
    });

    socket.on("call_accepted", async ({ answer }) => {
      console.log("[Socket Call] call_accepted received");
      if (callStateRef.current === "calling" || callStateRef.current === "ringing" || callStateRef.current === "connecting") {
        transitionTo("connecting");
        if (peerConnectionRef.current) {
          try {
            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            
            // Process any queued ICE candidates
            if (iceCandidatesQueueRef.current.length > 0) {
              console.log(`[WebRTC] Processing ${iceCandidatesQueueRef.current.length} queued ICE candidates`);
              for (const cand of iceCandidatesQueueRef.current) {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand)).catch(err => {
                  console.error("Error adding queued ICE candidate:", err);
                });
              }
              iceCandidatesQueueRef.current = [];
            }
          } catch (err) {
            console.error("Error setting remote description on call_accepted:", err);
            transitionTo("failed");
            cleanupMediaAndPeerConnection();
          }
        }
      }
    });

    socket.on("ice_candidate", async ({ candidate }) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding ICE candidate:", e);
        }
      } else {
        console.log("[WebRTC] Remote description not set yet, queuing ICE candidate");
        iceCandidatesQueueRef.current.push(candidate);
      }
    });

    socket.on("end_call", () => {
      console.log("[Socket Call] end_call received");
      toast.info("Call ended.");
      transitionTo("ended");
      cleanupMediaAndPeerConnection();
    });

    socket.on("call_rejected", () => {
      console.log("[Socket Call] call_rejected received");
      toast.warning("Call declined.");
      transitionTo("rejected");
      cleanupMediaAndPeerConnection();
    });

    socket.on("call_busy", () => {
      console.log("[Socket Call] call_busy received");
      toast.warning("Customer is currently on another call.");
      transitionTo("busy");
      cleanupMediaAndPeerConnection();
    });

    socket.on("call_timeout", () => {
      console.log("[Socket Call] call_timeout received");
      toast.info("Call unanswered.");
      transitionTo("missed");
      cleanupMediaAndPeerConnection();
    });

    socket.on("call_failed", () => {
      console.log("[Socket Call] call_failed received");
      toast.error("Call connection failed.");
      transitionTo("failed");
      cleanupMediaAndPeerConnection();
    });

    socket.on("call_status_updated", () => {
      if (chatModalOpen) {
        // Fetch new chat history (to show system missed call bubbles)
        const fetchHistory = async () => {
          try {
            const response = await axios.get(
              `${backendUrl}/api/order-communication/${orderId}/messages`,
              { headers: { token } }
            );
            if (response.data.success) {
              setChatMessages(response.data.messages || []);
            }
          } catch (e) {}
        };
        fetchHistory();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [nextOrder?._id, token]);

  // Load chat history when modal opens
  useEffect(() => {
    if (!chatModalOpen || !nextOrder || !token) return;

    const orderId = nextOrder._id;

    if (socketRef.current) {
      socketRef.current.emit("mark_seen", { orderId });
    }

    const fetchChatHistory = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/order-communication/${orderId}/messages`,
          { headers: { token } }
        );
        if (response.data.success) {
          setChatMessages(response.data.messages || []);
          setTimeout(scrollToBottom, 100);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    fetchChatHistory();
  }, [chatModalOpen, nextOrder, token]);

  // Cleanup WebRTC resources on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (ringingTimeoutRef.current) {
        clearTimeout(ringingTimeoutRef.current);
      }
      if (callTimerIntervalRef.current) {
        clearInterval(callTimerIntervalRef.current);
      }
    };
  }, []);

  // Set up local video stream rendering
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callActive]);

  // Set up remote video stream rendering
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callActive]);

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicMuted(!audioTrack.enabled);
      }
    }
  };

  // Enumerate devices on mount / camera access
  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoIns = devices.filter((d) => d.kind === "videoinput");
      setVideoDevices(videoIns);
      if (videoIns.length > 0 && !currentVideoDeviceId) {
        setCurrentVideoDeviceId(videoIns[0].deviceId);
      }
    } catch (e) {
      console.error("Error enumerating devices:", e);
    }
  };

  const switchCamera = async () => {
    if (videoDevices.length < 2 || !localStream || !currentVideoDeviceId) {
      toast.info("No alternative cameras found.");
      return;
    }
    try {
      const currentIndex = videoDevices.findIndex((d) => d.deviceId === currentVideoDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { deviceId: { exact: nextDevice.deviceId } }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const localVideoTrack = localStream.getVideoTracks()[0];
      
      if (localVideoTrack) {
        localStream.removeTrack(localVideoTrack);
        localVideoTrack.stop();
      }
      
      localStream.addTrack(newVideoTrack);
      setCurrentVideoDeviceId(nextDevice.deviceId);

      // Update track on peer connection
      if (peerConnectionRef.current) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find((s) => s.track && s.track.kind === "video");
        if (videoSender) {
          await videoSender.replaceTrack(newVideoTrack);
        }
      }
      toast.success("Switched camera.");
    } catch (err) {
      console.error("Error switching camera:", err);
      toast.error("Failed to switch camera.");
    }
  };

  const toggleSpeaker = async () => {
    if (remoteVideoRef.current && typeof remoteVideoRef.current.setSinkId === "function") {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
        if (audioOutputs.length > 0) {
          const nextSpeaker = isSpeakerOn ? audioOutputs[audioOutputs.length - 1] : audioOutputs[0];
          await remoteVideoRef.current.setSinkId(nextSpeaker.deviceId);
          setIsSpeakerOn(!isSpeakerOn);
          toast.success(`Audio output changed to ${nextSpeaker.label || "device"}`);
        } else {
          toast.info("No alternative speaker output detected.");
        }
      } catch (err) {
        console.error("Error setting audio output sink:", err);
      }
    } else {
      toast.info("Audio output routing is managed by your system settings.");
    }
  };

  const cleanupMediaAndPeerConnection = () => {
    // If cleaning up while calling/active, notify the remote peer
    if (socketRef.current) {
      if (callStateRef.current !== "idle" && nextOrder) {
        const partnerId = nextOrder.userId;
        if (partnerId) {
          socketRef.current.emit("end_call", {
            to: partnerId,
            orderId: nextOrder._id,
          });
        }
      }
      if (incomingCallRef.current && incomingCallDataRef.current && nextOrder) {
        socketRef.current.emit("call_rejected", {
          to: incomingCallDataRef.current.from,
          orderId: nextOrder._id,
        });
      }
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    iceCandidatesQueueRef.current = [];

    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    if (callTimerIntervalRef.current) {
      clearInterval(callTimerIntervalRef.current);
      callTimerIntervalRef.current = null;
    }
  };

  // Ringing timeout handler
  const startRingingTimeout = (cId, partnerId) => {
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
    ringingTimeoutRef.current = setTimeout(() => {
      toast.warning("Call not answered.");
      handleEndCallLocally("no-answer", cId, partnerId);
    }, 30000);
  };

  const createPeerConnection = (stream, partnerId, type, cId) => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
          ],
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        }
      ],
      iceCandidatePoolSize: 10
    });

    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    pc.ontrack = (event) => {
      console.log("[WebRTC] Received remote stream track");
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && nextOrder) {
        socketRef.current.emit("ice_candidate", {
          candidate: event.candidate,
          to: partnerId,
          orderId: nextOrder._id,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state changed: ${pc.connectionState}`);
      if (pc.connectionState === "connected" && nextOrder) {
        transitionTo("connected");
        if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
        
        setCallTime(0);
        if (callTimerIntervalRef.current) clearInterval(callTimerIntervalRef.current);
        callTimerIntervalRef.current = setInterval(() => {
          setCallTime((prev) => prev + 1);
        }, 1000);

        axios.patch(
          `${backendUrl}/api/order-communication/${nextOrder._id}/call/${cId}/status`,
          { status: "connected" },
          { headers: { token } }
        ).catch((err) => console.error("Error updating call status:", err));
      } else if (pc.connectionState === "failed") {
        console.error("[WebRTC] Connection state failed. Clearing call.");
        toast.error("Call connection failed.");
        transitionTo("failed");
        handleEndCallLocally("failed", cId, partnerId);
      } else if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "closed"
      ) {
        transitionTo("ended");
        handleEndCallLocally("completed", cId, partnerId);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const handleInitiateCall = async (type = "audio") => {
    if (!nextOrder) return;
    
    // Only call when orderStatus is out for delivery
    const status = (nextOrder.orderStatus || "").toLowerCase();
    if (status !== "out for delivery") {
      return toast.error("Calling is only allowed when order is Out For Delivery!");
    }

    try {
      transitionTo("calling");
      setCallTime(0);
      setCallType(type);
      enumerateDevices();

      const receiverRole = "customer";

      const response = await axios.post(
        `${backendUrl}/api/order-communication/${nextOrder._id}/call`,
        { receiverRole, type },
        { headers: { token } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to start call");
      }

      const { callId } = response.data;
      setCurrentCallId(callId);

      const constraints = {
        audio: true,
        video: type === "video" ? { facingMode: "user" } : false,
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      localStreamRef.current = stream;

      const partnerId = nextOrder.userId;
      const pc = createPeerConnection(stream, partnerId, type, callId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("call_user", {
        offer,
        to: partnerId,
        orderId: nextOrder._id,
        type,
        callId,
        callerName: "Delivery Partner"
      });

      startRingingTimeout(callId, partnerId);
    } catch (error) {
      console.error("[WebRTC Call Error]", error);
      toast.error("Could not access camera/microphone.");
      transitionTo("failed");
      cleanupMediaAndPeerConnection();
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCallData || !nextOrder) return;
    try {
      setIncomingCall(false);
      transitionTo("connecting");
      setCallTime(0);
      setCallType(incomingCallData.type);
      setCurrentCallId(incomingCallData.callId);
      enumerateDevices();

      const constraints = {
        audio: true,
        video: incomingCallData.type === "video" ? { facingMode: "user" } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      localStreamRef.current = stream;

      const pc = createPeerConnection(stream, incomingCallData.from, incomingCallData.type, incomingCallData.callId);
      await pc.setRemoteDescription(new RTCSessionDescription(incomingCallData.offer));

      // Process any queued ICE candidates
      if (iceCandidatesQueueRef.current.length > 0) {
        console.log(`[WebRTC] Processing ${iceCandidatesQueueRef.current.length} queued ICE candidates`);
        for (const cand of iceCandidatesQueueRef.current) {
          await pc.addIceCandidate(new RTCIceCandidate(cand)).catch(err => {
            console.error("Error adding queued ICE candidate:", err);
          });
        }
        iceCandidatesQueueRef.current = [];
      }

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketRef.current.emit("call_accepted", {
        answer,
        to: incomingCallData.from,
        orderId: nextOrder._id,
      });

      await axios.patch(
        `${backendUrl}/api/order-communication/${nextOrder._id}/call/${incomingCallData.callId}/status`,
        { status: "connected" },
        { headers: { token } }
      );
    } catch (error) {
      console.error("[WebRTC Accept Call Error]", error);
      toast.error("Could not accept call: camera/microphone access denied.");
      handleRejectCall();
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCallData || !nextOrder) return;
    try {
      setIncomingCall(false);
      socketRef.current.emit("call_rejected", {
        to: incomingCallData.from,
        orderId: nextOrder._id,
      });

      await axios.patch(
        `${backendUrl}/api/order-communication/${nextOrder._id}/call/${incomingCallData.callId}/status`,
        { status: "rejected" },
        { headers: { token } }
      );
    } catch (error) {
      console.error("[WebRTC Reject Call Error]", error);
    } finally {
      setIncomingCallData(null);
    }
  };

  const handleEndCall = () => {
    const partnerId = nextOrder?.userId;
    handleEndCallLocally("completed", currentCallId, partnerId);
  };

  const handleEndCallLocally = async (finalStatus = "completed", cId, partnerId) => {
    if (socketRef.current && partnerId && nextOrder) {
      socketRef.current.emit("end_call", {
        to: partnerId,
        orderId: nextOrder._id,
      });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current);
      ringingTimeoutRef.current = null;
    }
    if (callTimerIntervalRef.current) {
      clearInterval(callTimerIntervalRef.current);
      callTimerIntervalRef.current = null;
    }

    const fsmStateMap = {
      completed: "ended",
      "no-answer": "missed",
      rejected: "rejected",
      busy: "busy",
      failed: "failed"
    };
    const nextFsmState = fsmStateMap[finalStatus] || "ended";
    transitionTo(nextFsmState);

    const activeCId = cId || currentCallId;
    if (activeCId && nextOrder) {
      try {
        await axios.patch(
          `${backendUrl}/api/order-communication/${nextOrder._id}/call/${activeCId}/status`,
          { status: finalStatus, duration: callTime },
          { headers: { token } }
        );
      } catch (err) {
        console.error("Error logging call end:", err);
      }
    }
    
    setCallTime(0);
    setCurrentCallId(null);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleInputChange = (e) => {
    setNewChatMessage(e.target.value);
    
    if (socketRef.current && nextOrder) {
      socketRef.current.emit("typing", { orderId: nextOrder._id, isTyping: true });
      
      if (typingTimeout) clearTimeout(typingTimeout);
      
      const timeout = setTimeout(() => {
        socketRef.current.emit("typing", { orderId: nextOrder._id, isTyping: false });
      }, 1500);
      
      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newChatMessage.trim() || !nextOrder || !token) return;

    if (socketRef.current && nextOrder) {
      socketRef.current.emit("typing", { orderId: nextOrder._id, isTyping: false });
      if (typingTimeout) clearTimeout(typingTimeout);
    }

    const orderId = nextOrder._id;
    const messageContent = newChatMessage;
    setNewChatMessage("");

    try {
      await axios.post(
        `${backendUrl}/api/order-communication/${orderId}/message`,
        {
          receiverRole: "customer",
          message: messageContent
        },
        { headers: { token } }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    alert(`Issue reported: ${reportIssueType}\nNotes: ${reportNotes || "None"}`);
    setReportModalOpen(false);
    setReportNotes("");
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setOtpError("Please enter a valid 6-character code.");
      return;
    }
    setOtpModalOpen(false);
    setOtpValue("");
    setOtpError("");
    
    // Trigger the verify flow using the parent's verification handler
    if (nextOrder) {
      setVerifyModal({ open: true, orderId: nextOrder._id, status: "Delivered" });
    }
  };

  const handleScanSimulation = () => {
    setScanSuccess(true);
    setTimeout(() => {
      setScanModalOpen(false);
      setScanSuccess(false);
      if (nextOrder) {
        if (nextOrder.orderStatus === "Accepted") {
          handleStatusChange(nextOrder._id, "Picked Up");
        } else if (nextOrder.orderStatus === "Picked Up") {
          handleStatusChange(nextOrder._id, "Out for Delivery");
        }
      }
    }, 1500);
  };

  // Perform status transitions in Command Center
  const handleCommandCenterCTA = () => {
    if (!nextOrder) return;
    if (nextOrder.orderStatus === "Accepted") {
      handleStatusChange(nextOrder._id, "Picked Up");
    } else if (nextOrder.orderStatus === "Picked Up") {
      handleStatusChange(nextOrder._id, "Out for Delivery");
    } else if (nextOrder.orderStatus === "Out for Delivery") {
      setOtpModalOpen(true);
    }
  };

  // Status CTA naming helper
  const getCommandCenterCTAText = (status) => {
    switch (status) {
      case "Accepted": return "Mark Picked Up (Scan Package)";
      case "Picked Up": return "Mark Out for Delivery";
      case "Out for Delivery": return "Complete Delivery (Verify OTP)";
      default: return "Process Shipment";
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200">
      
      {/* CSS Injection for custom offset path truck animation */}
      <style>{`
        @keyframes moveAlongPath {
          0% { offset-distance: 0%; }
          50% { offset-distance: 60%; }
          100% { offset-distance: 100%; }
        }
        .driver-vehicle-marker {
          offset-path: path("M 30 150 C 90 90, 160 40, 220 120 T 360 80");
          animation: moveAlongPath 15s infinite ease-in-out;
        }
        .animate-dash {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawPath 3s ease-out forwards;
        }
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border: 1px border-slate-200;
        }
        .dark .glass-panel {
          background: rgba(17, 24, 39, 0.85);
          backdrop-filter: blur(8px);
          border: 1px border-slate-800/80;
        }
      `}</style>

      {/* SECTION 1: SMART HEADER */}
      <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl transition-all duration-300 relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          {/* Agent info & Avatar */}
          <div className="flex items-center gap-4.5 w-full md:w-auto">
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-slate-100 dark:text-white font-extrabold text-lg shadow-md border-2 border-white/10 dark:border-slate-800 dark:border-slate-900">
                {driver?.name ? driver.name.split(" ").map(n=>n[0]).join("").toUpperCase() : <User size={24} />}
              </div>
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white/10 dark:border-slate-800 dark:border-slate-900 flex items-center justify-center ${stats.isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight tracking-tight">{driver?.name || "Agent Courier"}</h2>
                <div className="flex items-center gap-0.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black">
                  <Star size={10} className="fill-amber-500 text-amber-500" />
                  <span>{driver?.rating?.toFixed(2) || "4.85"}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-semibold uppercase tracking-wider flex items-center gap-1">
                <span>Sector: {driver?.deliveryZone || "Zone A-2"}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span>Radius: {driver?.deliveryRadius || 10}km</span>
              </p>
            </div>
          </div>

          {/* Metrics summary */}
          <div className="flex flex-wrap items-center justify-around gap-6 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl px-5 py-3 w-full md:w-auto">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Earnings Today</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1.5">₹{todayEarningsVal}</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Delivered</p>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1.5">{completedTodayCount} jobs</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Active orders</p>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1.5">
                {orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length}
              </p>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={toggleDutyStatusHandler}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-black tracking-wider uppercase transition-all duration-200 active:scale-95 cursor-pointer ${ stats.isOnline ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500" }`}
            >
              <span>On Duty</span>
              {stats.isOnline ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} />}
            </button>
            
            <button
              onClick={logout}
              className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/45 transition active:scale-95 cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* PENDING ASSIGNMENTS REQUEST SECTION */}
      {pendingAcceptance && pendingAcceptance.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              Pending Delivery Requests ({pendingAcceptance.length})
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingAcceptance.map((order) => (
              <div 
                key={order._id} 
                className="bg-gradient-to-br from-rose-50/50 to-white dark:from-rose-950 dark:to-gray-900 border-2 border-rose-100 dark:border-rose-950/40 rounded-2xl p-5 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-rose-200 dark:hover:border-rose-900/60 animate-pulse"
              >
                <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md">
                      Action Required
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm mt-1.5">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-rose-600 dark:text-rose-400">
                      ₹{order.amount}
                    </span>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                      {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Customer</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {order.address?.firstName} {order.address?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Address</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                      {formatAddress(order.address)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-5">
                  <button
                    onClick={() => handleRejectAssignment(order._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-800/80 hover:border-rose-200 dark:hover:border-rose-900/60 text-slate-800 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-xs active:scale-98"
                  >
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleAcceptAssignment(order._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-slate-100 dark:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md shadow-emerald-500/10 active:scale-98"
                  >
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CORE GRID: COMMAND CENTER & LIVE MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* SECTION 2: PRIMARY DELIVERY COMMAND CENTER */}
        <div className="lg:col-span-7 flex flex-col justify-between glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 h-40 w-40 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex-1 flex flex-col justify-between gap-6">
            <div>
              {/* Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-slate-100 dark:text-white font-extrabold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-md shadow-blue-500/15">
                    Primary Dispatch
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    ID: <span className="text-slate-900 dark:text-white font-black">#{nextOrder?._id?.slice(-6).toUpperCase() || "N/A"}</span>
                  </span>
                </div>
                {nextOrder && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border bg-blue-50/50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-950/50">
                    <Clock size={10} className="animate-spin" />
                    <span>ETA: 18 mins</span>
                  </span>
                )}
              </div>

              {nextOrder ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Details */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Customer</p>
                      <p className="font-extrabold text-slate-900 dark:text-white text-base mt-1">
                        {nextOrder.address.firstName} {nextOrder.address.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Delivery Address</p>
                      <p className="leading-relaxed text-slate-600 dark:text-slate-300 text-xs font-semibold mt-1">
                        {formatAddress(nextOrder.address)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">Customer Notes</p>
                      <p className="text-xs italic font-medium text-slate-500 dark:text-amber-400/90 mt-1 bg-amber-500/5 dark:bg-amber-500/10 border-l-2 border-amber-500 px-3 py-1.5 rounded-r-xl">
                        "Please call when outside the main gate."
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Values & Specs */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Distance & Area</p>
                      <p className="font-extrabold text-slate-900 dark:text-white text-xs mt-1 flex items-center gap-1.5">
                        <Navigation2 size={12} className="text-blue-500 fill-blue-500" />
                        <span>3.5 km</span>
                        <span className="text-slate-300 dark:text-slate-700">|</span>
                        <span className="text-slate-400 dark:text-slate-500 font-medium">Zone A-2 Sector</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Payment & Collection</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${ nextOrder.paymentMethod.toLowerCase() === "cod" ? "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" }`}>
                          {nextOrder.paymentMethod}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {nextOrder.paymentMethod.toLowerCase() === "cod" ? `Collect ₹${nextOrder.amount}` : "Paid Online"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Verification</p>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Key size={12} className="text-indigo-500" />
                        <span>Requires Secure OTP delivery confirmation</span>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-44 flex flex-col items-center justify-center text-center">
                  <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-300">Logistics Queue Idle</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Currently no active dispatches. Select a job from the pool or wait for auto-assignment.</p>
                </div>
              )}
            </div>

            {/* SECTION 4: DELIVERY PROGRESS TRACKER (timeline embedded inside Command Center) */}
            {nextOrder && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-3.5">Delivery Pipeline Timeline</p>
                <div className="relative flex items-center justify-between">
                  {/* Background line */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-900 rounded-full z-0" />
                  
                  {/* Dynamic progress fill line */}
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full z-0 transition-all duration-500" 
                    style={{ width: `${(getProgressStepIndex(nextOrder.orderStatus) / 4) * 100}%` }}
                  />

                  {["Assigned", "Accepted", "Picked Up", "Out for Delivery", "Delivered"].map((step, idx) => {
                    const currentIdx = getProgressStepIndex(nextOrder.orderStatus);
                    const isCompleted = idx < currentIdx || nextOrder.orderStatus === "Delivered";
                    const isCurrent = idx === currentIdx && nextOrder.orderStatus !== "Delivered";
                    
                    return (
                      <div key={step} className="flex flex-col items-center relative z-10">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center text-[9px] font-black transition-all duration-300 ${ isCompleted ? "bg-emerald-500 border-emerald-600 text-slate-100 dark:text-white shadow-md shadow-emerald-500/15" : isCurrent ? "bg-blue-600 border-blue-700 text-slate-100 dark:text-white shadow-md shadow-blue-500/20 animate-pulse scale-110" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400" }`}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className={`text-[8px] font-bold uppercase tracking-widest mt-1.5 hidden md:inline ${ isCompleted ? "text-emerald-600 dark:text-emerald-400 font-black" : isCurrent ? "text-blue-600 dark:text-blue-400 font-black" : "text-slate-400" }`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions & Primary CTA Button */}
            {nextOrder && (
              <div className="flex flex-col sm:flex-row gap-3 mt-2">
                <div className="flex gap-2.5 flex-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(nextOrder.address))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm"
                  >
                    <Navigation size={12} className="text-blue-500 dark:text-blue-400" />
                    <span>Navigate</span>
                  </a>
                  
                  <button
                    onClick={() => handleInitiateCall("audio")}
                    disabled={nextOrder.orderStatus !== "Out For Delivery"}
                    className={`flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm ${nextOrder.orderStatus !== "Out For Delivery" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Phone size={12} className="text-emerald-500" />
                    <span>Voice</span>
                  </button>

                  <button
                    onClick={() => handleInitiateCall("video")}
                    disabled={nextOrder.orderStatus !== "Out For Delivery"}
                    className={`flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm ${nextOrder.orderStatus !== "Out For Delivery" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Video size={12} className="text-indigo-500" />
                    <span>Video</span>
                  </button>

                  <button
                    onClick={() => setChatModalOpen(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm"
                  >
                    <MessageSquare size={12} className="text-indigo-500" />
                    <span>Chat</span>
                  </button>
                </div>

                <button
                  onClick={handleCommandCenterCTA}
                  className="sm:w-56 w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-slate-100 dark:text-white py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer text-center"
                >
                  <CheckCircle size={12} />
                  <span>{getCommandCenterCTAText(nextOrder.orderStatus)}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: LIVE MAP PANEL */}
        <div className="lg:col-span-5 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[360px]">
          {/* Header Map overlay */}
          <div className="absolute top-4 left-4 z-10 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-xl px-3.5 py-2 shadow-md flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">GPS Connection</p>
              <h5 className="text-[10px] font-black text-slate-900 dark:text-white mt-1">Live Tracking Active</h5>
            </div>
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-1.5">
            <button className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-md cursor-pointer text-slate-600">
              <Crosshair size={13} />
            </button>
          </div>

          {/* SVG Map Canvas */}
          <div className="w-full flex-1 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800/60 relative mt-1.5">
            <svg viewBox="0 0 400 240" className="w-full h-full">
              {/* Background abstract roads pattern */}
              <g stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="dark:stroke-slate-900 opacity-60">
                <line x1="20" y1="40" x2="380" y2="40" />
                <line x1="20" y1="120" x2="380" y2="120" />
                <line x1="20" y1="200" x2="380" y2="200" />
                <line x1="60" y1="20" x2="60" y2="220" />
                <line x1="200" y1="20" x2="200" y2="220" />
                <line x1="340" y1="20" x2="340" y2="220" />
                <path d="M 60 120 C 120 70, 280 170, 340 120" fill="none" strokeWidth="6" />
              </g>

              {/* Grid dots mapping */}
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#94a3b8" opacity="0.15" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Suggested route mapping path */}
              <path 
                d="M 30 150 C 90 90, 160 40, 220 120 T 360 80" 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="4" 
                strokeLinecap="round" 
                className="animate-dash opacity-40" 
              />
              <path 
                d="M 30 150 C 90 90, 160 40, 220 120 T 360 80" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeDasharray="8 6" 
              />

              {/* Hub / Store pin marker */}
              <g transform="translate(30, 150)">
                <circle cx="0" cy="0" r="10" fill="#3b82f6" fillOpacity="0.15" />
                <circle cx="0" cy="0" r="5" fill="#3b82f6" />
                <text x="8" y="3" className="text-[8px] font-black uppercase text-blue-500 fill-blue-500">Pick-up</text>
              </g>

              {/* Customer pin destination */}
              <g transform="translate(360, 80)">
                <circle cx="0" cy="0" r="14" fill="#ef4444" fillOpacity="0.15" className="animate-ping" />
                <circle cx="0" cy="0" r="6" fill="#ef4444" />
                <path d="M-4 -12 L4 -12 L0 -6 Z" fill="#ef4444" />
                <text x="-38" y="-4" className="text-[8px] font-black uppercase text-rose-500 fill-rose-500">Destination</text>
              </g>

              {/* Animated driver marker moving along the path */}
              {nextOrder && (
                <g className="driver-vehicle-marker">
                  <circle cx="0" cy="0" r="12" fill="#10b981" fillOpacity="0.25" className="animate-pulse" />
                  <circle cx="0" cy="0" r="5" fill="#10b981" border="1px solid white" />
                  <polygon points="-4,-4 5,0 -4,4" fill="#ffffff" transform="rotate(-30)" />
                </g>
              )}
            </svg>

            {/* Float Bottom Map overlay */}
            {nextOrder && (
              <div className="absolute bottom-3 left-3 right-3 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 shadow-md flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Truck size={14} />
                  </div>
                  <div>
                    <h6 className="text-[10px] font-black text-slate-800 dark:text-white leading-none">Delivering to Room B-3</h6>
                    <p className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Eta 12 mins • Light traffic</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-blue-500 dark:text-blue-400">2.1 km left</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* SECTION 5: TODAY'S PERFORMANCE (Grid of premium metrics cards with inline SVGs) */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider px-1">Today's Logistics Scoreboard</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          
          {/* Card: Completed */}
          <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Jobs Done</p>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">{completedTodayCount}</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider font-semibold">+100%</span>
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 w-full mt-3">
              <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500 stroke-[2] fill-none">
                <path d="M 0 25 Q 20 20 40 22 T 80 10 T 100 5" />
                <path d="M 0 25 Q 20 20 40 22 T 80 10 T 100 5 L 100 30 L 0 30 Z" fill="rgba(16, 185, 129, 0.05)" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Card: Active */}
          <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Ongoing</p>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {orders.filter(o => o.orderStatus !== "Delivered" && o.orderStatus !== "Cancelled").length}
              </span>
              <span className="text-[8px] font-black text-blue-500 uppercase tracking-wider font-semibold">In queue</span>
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 w-full mt-3">
              <svg viewBox="0 0 100 30" className="w-full h-full stroke-blue-500 stroke-[2] fill-none">
                <path d="M 0 15 Q 30 15 50 25 T 100 5" />
                <path d="M 0 15 Q 30 15 50 25 T 100 5 L 100 30 L 0 30 Z" fill="rgba(59, 130, 246, 0.05)" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Card: Today Earnings */}
          <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Earnings</p>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">₹{todayEarningsVal}</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider font-semibold">Daily</span>
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 w-full mt-3">
              <svg viewBox="0 0 100 30" className="w-full h-full stroke-emerald-500 stroke-[2] fill-none">
                <path d="M 0 28 Q 20 15 45 20 T 90 5 T 100 2" />
                <path d="M 0 28 Q 20 15 45 20 T 90 5 T 100 2 L 100 30 L 0 30 Z" fill="rgba(16, 185, 129, 0.05)" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Card: COD cash collected */}
          <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">COD Collected</p>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹{stats.cashCollected?.toFixed(0) || "0"}</span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-semibold">On hand</span>
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 w-full mt-3">
              <svg viewBox="0 0 100 30" className="w-full h-full stroke-amber-500 stroke-[2] fill-none">
                <path d="M 0 25 Q 30 10 60 18 T 100 8" />
                <path d="M 0 25 Q 30 10 60 18 T 100 8 L 100 30 L 0 30 Z" fill="rgba(245, 158, 11, 0.05)" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Card: Success Rate */}
          <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Success Rate</p>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">98.6%</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider font-semibold">Top Tier</span>
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 w-full mt-3">
              <svg viewBox="0 0 100 30" className="w-full h-full stroke-indigo-500 stroke-[2] fill-none">
                <path d="M 0 5 Q 40 8 70 4 T 100 6" />
                <path d="M 0 5 Q 40 8 70 4 T 100 6 L 100 30 L 0 30 Z" fill="rgba(99, 102, 241, 0.05)" stroke="none" />
              </svg>
            </div>
          </div>

          {/* Card: Avg Delivery Time */}
          <div className="glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 shadow-sm relative overflow-hidden hover:border-slate-300 dark:hover:border-slate-700/80 transition duration-200">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Avg Speed</p>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className="text-xl font-black text-slate-900 dark:text-white">22 mins</span>
              <span className="text-[8px] font-black text-emerald-500 uppercase tracking-wider font-semibold">-4% time</span>
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 w-full mt-3">
              <svg viewBox="0 0 100 30" className="w-full h-full stroke-teal-500 stroke-[2] fill-none">
                <path d="M 0 10 Q 30 25 60 12 T 100 8" />
                <path d="M 0 10 Q 30 25 60 12 T 100 8 L 100 30 L 0 30 Z" fill="rgba(20, 184, 166, 0.05)" stroke="none" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* MID SECTION: ROUTE OPTIMIZATION & PERFORMANCE GRAPHS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 6: ROUTE OPTIMIZATION PANEL */}
        <div className="lg:col-span-4 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} className="text-blue-500" />
                <span>Today's Optimal Route</span>
              </h4>
              <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded text-blue-500 dark:text-blue-400">AI Sequenced</span>
            </div>

            <div className="space-y-3.5">
              {/* Route stop 1 */}
              <div className="flex items-start gap-3 relative">
                <div className="absolute left-3.5 top-7 bottom-[-14px] w-[2px] bg-slate-200 dark:bg-slate-800" />
                <div className="h-7 w-7 rounded-full bg-blue-500 text-slate-100 dark:text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20">1</div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-900 dark:text-white">Main Distribution Hub</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Pick up packages • Out for dispatch</p>
                </div>
              </div>

              {/* Route stop 2 */}
              <div className="flex items-start gap-3 relative">
                <div className="absolute left-3.5 top-7 bottom-[-14px] w-[2px] bg-slate-200 dark:bg-slate-800" />
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">2</div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">
                    {nextOrder ? `${nextOrder.address?.firstName} ${nextOrder.address?.lastName}` : "Customer A"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">3.5 km • Next Priority</p>
                </div>
              </div>

              {/* Route stop 3 */}
              <div className="flex items-start gap-3 relative">
                <div className="absolute left-3.5 top-7 bottom-[-14px] w-[2px] bg-slate-200 dark:bg-slate-800" />
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">3</div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">Customer B</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">5.2 km • 2nd dispatch</p>
                </div>
              </div>

              {/* Route stop 4 */}
              <div className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-[10px] flex items-center justify-center shrink-0">4</div>
                <div className="text-xs">
                  <p className="font-extrabold text-slate-800 dark:text-slate-200">Customer C</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">7.1 km • 3rd dispatch</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
            <div>
              <p className="text-slate-400 font-bold uppercase tracking-wider">Total distance</p>
              <h5 className="text-xs font-black text-slate-900 dark:text-white mt-0.5">9.6 kilometers</h5>
            </div>
            <div className="text-right">
              <p className="text-slate-400 font-bold uppercase tracking-wider">Est. Completion</p>
              <h5 className="text-xs font-black text-blue-600 dark:text-blue-400 mt-0.5">~48 minutes</h5>
            </div>
          </div>
        </div>

        {/* SECTION 9: PERFORMANCE DASHBOARD */}
        <div className="lg:col-span-8 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3 mb-4">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart2 size={14} className="text-indigo-500" />
                <span>Earnings & Volume Analytics</span>
              </h4>
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900/65 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                <TrendingUp size={10} className="text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">+18.4% Weekly</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart 1: Weekly Earnings */}
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Weekly Earnings History (INR)</p>
                <div className="h-32 w-full bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 p-2 relative flex flex-col justify-between">
                  {/* Grid background lines */}
                  <div className="absolute inset-0 flex flex-col justify-around p-3 pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-slate-400" />
                    <div className="w-full h-[1px] bg-slate-400" />
                    <div className="w-full h-[1px] bg-slate-400" />
                  </div>
                  
                  {/* SVG Wave chart */}
                  <svg viewBox="0 0 200 80" className="w-full h-24 relative z-10">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path 
                      d="M 0 70 Q 30 50 60 55 T 120 20 T 180 30 T 200 10 L 200 80 L 0 80 Z" 
                      fill="url(#chartGlow)" 
                    />
                    <path 
                      d="M 0 70 Q 30 50 60 55 T 120 20 T 180 30 T 200 10" 
                      fill="none" 
                      stroke="#6366f1" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  
                  <div className="flex justify-between text-[8px] font-bold text-slate-400 px-1 mt-1 z-10">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>

              {/* Chart 2: Delivery Trend Graph */}
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2.5">Daily Delivery Count (Jobs)</p>
                <div className="h-32 w-full bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80 p-2.5 relative flex flex-col justify-between">
                  <div className="absolute inset-0 flex flex-col justify-around p-3 pointer-events-none opacity-20">
                    <div className="w-full h-[1px] bg-slate-400" />
                    <div className="w-full h-[1px] bg-slate-400" />
                  </div>
                  
                  {/* Bar Chart Representation */}
                  <div className="flex items-end justify-around h-20 w-full px-2 relative z-10">
                    {[12, 18, 14, 25, 20].map((val, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 w-6">
                        <div 
                          className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-indigo-500 shadow-md shadow-blue-500/10 transition-all duration-500" 
                          style={{ height: `${(val / 30) * 100}%` }}
                        />
                        <span className="text-[8px] font-extrabold text-slate-900 dark:text-white mt-1">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[8px] font-bold text-slate-400 px-2.5 z-10">
                    <span>11/06</span>
                    <span>12/06</span>
                    <span>13/06</span>
                    <span>14/06</span>
                    <span>15/06</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
            <div className="flex gap-4">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider">Weekly Revenue</span>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">₹4,225.00</p>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider">Total distance</span>
                <p className="text-xs font-black text-slate-900 dark:text-white mt-0.5">62.8 km</p>
              </div>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
              Level 4 Courier Badge
            </span>
          </div>
        </div>

      </div>

      {/* SECTION 7: ACTIVE DELIVERIES (Redesigned delivery cards replacing standard table) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Logistics Dispatch Center</h3>
            <p className="text-[9px] text-slate-400 mt-0.5">Browse active or completed courier schedules</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[140px] md:w-56 md:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 pointer-events-none">
                <Search size={12} />
              </span>
              <input
                type="text"
                placeholder="Search ID, Customer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setTablePage(1);
                }}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTablePage(1);
              }}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer transition shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <option value="All">All Jobs</option>
              <option value="Pending">Pending</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Deliveries cards stack */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedTableOrders.length === 0 ? (
            <div className="col-span-2 glass-panel rounded-2xl p-10 text-center text-slate-500">
              No orders found matching the filter criteria.
            </div>
          ) : (
            paginatedTableOrders.map((order) => {
              const isNext = nextOrder && nextOrder._id === order._id;
              const isExpanded = expandedCardId === order._id;
              
              return (
                <div 
                  key={order._id}
                  className={`glass-panel border rounded-2xl p-4.5 shadow-sm transition-all duration-300 relative ${ isNext ? "border-blue-400 dark:border-blue-700 bg-blue-500/5 dark:bg-blue-500/10" : "border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700" }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-xs text-slate-900 dark:text-white">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                        {isNext && (
                          <span className="bg-blue-600 text-slate-100 dark:text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">Next</span>
                        )}
                        {order.assignmentStatus === "Assigned" && (
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-500/25 uppercase tracking-wider">Pending Action</span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1">
                        {order.address?.firstName} {order.address?.lastName}
                      </h4>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900 dark:text-white">₹{order.amount}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border mt-1 ${ order.orderStatus === "Delivered" ? "bg-emerald-50 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-950/40" : "bg-indigo-50 text-indigo-700 dark:text-indigo-400 border-indigo-100 dark:border-indigo-950/40" }`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/60 pt-2.5">
                    <span className="font-semibold">{order.paymentMethod}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    
                    <button 
                      onClick={() => setExpandedCardId(isExpanded ? null : order._id)}
                      className="text-blue-500 dark:text-blue-400 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                    >
                      <span>{isExpanded ? "Collapse" : "Expand"}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>

                  {/* Expandable details content */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block mb-1">Shipping address</span>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 leading-normal">{formatAddress(order.address)}</p>
                      </div>

                      <div className="flex gap-2">
                        {order.orderStatus === "Out For Delivery" ? (
                          <button
                            onClick={() => handleInitiateCall("audio")}
                            className="flex-1 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer border-none"
                          >
                            Call Customer
                          </button>
                        ) : (
                          <a
                            href={`tel:${order.address?.phone}`}
                            className="flex-1 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                          >
                            Call (Native)
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatAddress(order.address))}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 text-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Navigate Map
                        </a>
                      </div>

                      {/* Dropdown status update */}
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">Change dispatch stage</span>
                        {order.orderStatus === "Delivered" ? (
                          <span className="text-emerald-500 font-extrabold text-[10px]">✓ Delivered & Confirmed</span>
                        ) : order.assignmentStatus === "Assigned" ? (
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleRejectAssignment(order._id)}
                              className="flex-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950/45 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleAcceptAssignment(order._id)}
                              className="flex-1 bg-emerald-600 text-slate-100 dark:text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-wider cursor-pointer animate-pulse"
                            >
                              Accept
                            </button>
                          </div>
                        ) : (
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="Order Placed">Order Placed</option>
                            <option value="Packed">Packed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Table pagination controls */}
        {totalTablePages > 1 && (
          <div className="p-3.5 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-2xl flex items-center justify-between text-xs mt-4">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Showing Page {tablePage} of {totalTablePages} ({tableFilteredOrders.length} entries)
            </span>
            
            <div className="flex items-center gap-1.5">
              <button
                disabled={tablePage === 1}
                onClick={() => setTablePage(p => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <button
                disabled={tablePage === totalTablePages}
                onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white transition disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Date Filter Panel */}
      <div className="glass-panel border border-slate-200/85 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-100 dark:border-slate-800">
            <Calendar size={14} />
          </div>
          <div>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider leading-none">Logistics Calendar Filters</h4>
            <p className="text-[9px] text-slate-400 mt-1">Review historical entries and performance stats</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex-1 md:flex-none">
            <span className="text-[9px] font-black uppercase text-slate-400">From:</span>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none w-full cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 flex-1 md:flex-none">
            <span className="text-[9px] font-black uppercase text-slate-400">To:</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-300 outline-none w-full cursor-pointer"
            />
          </div>
          {(filterStartDate || filterEndDate) && (
            <button
              onClick={() => {
                setFilterStartDate("");
                setFilterEndDate("");
              }}
              className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition uppercase tracking-wider px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 cursor-pointer w-full md:w-auto text-center"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* SECTION 8: QUICK ACTION CENTER (Floating lightning bolt drawer in bottom-right corner) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setActiveActionsOpen(!activeActionsOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-slate-100 dark:text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer relative"
        >
          {activeActionsOpen ? <X size={20} /> : <Zap size={20} className="fill-white" />}
          {pendingAcceptance.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-rose-500 rounded-full text-slate-100 dark:text-white text-[10px] font-black flex items-center justify-center border-2 border-white/10 dark:border-slate-800 dark:border-slate-950 animate-bounce">
              {pendingAcceptance.length}
            </span>
          )}
        </button>

        {activeActionsOpen && (
          <div className="absolute bottom-16 right-0 w-72 glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-500" />
              <span>Quick Action Center</span>
            </h4>

            <div className="grid grid-cols-2 gap-3.5">
              <button 
                onClick={() => { setScanModalOpen(true); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <QrCode size={20} className="text-indigo-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Scan QR</span>
              </button>

              <button 
                onClick={() => { setOtpModalOpen(true); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-blue-500/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <Key size={20} className="text-blue-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Verify OTP</span>
              </button>

              <button 
                onClick={() => { setReportModalOpen(true); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-amber-500/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <AlertOctagon size={20} className="text-amber-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider font-semibold">Report Issue</span>
              </button>

              <button 
                onClick={() => { alert("Navigating to complaints / returns module..."); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/60 hover:bg-purple-500/10 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <RefreshCw size={20} className="text-purple-500" />
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Returns</span>
              </button>
            </div>

            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button 
                onClick={() => { alert("Opening courier support channel..."); setActiveActionsOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <LifeBuoy size={11} />
                <span>Support</span>
              </button>
              
              <button 
                onClick={() => { setEmergencyModalOpen(true); setActiveActionsOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-slate-100 dark:text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
              >
                <ShieldAlert size={11} className="animate-pulse" />
                <span>Emergency</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OVERLAY MODALS & SIMULATION CONTROLS */}
      {/* ========================================================================= */}

      {/* ✅ CHAT CUSTOMER MODAL */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/50 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[480px]">
            {/* Header */}
            <div className="bg-slate-900 px-5 py-4 text-slate-100 dark:text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400 animate-pulse" />
                <div className="text-left">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider leading-none">
                    Secure Chat Channel
                  </h4>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">
                    Encrypted & secure
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {nextOrder && (nextOrder.orderStatus || "").toLowerCase() === "out for delivery" && (
                  <div className="relative">
                    <button
                      onClick={() => setCallDropdownOpen(!callDropdownOpen)}
                      className="px-3.5 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer border-none shadow-sm transition active:scale-95 shrink-0"
                    >
                      <Phone size={11} />
                      <span>CALL</span>
                    </button>
                    
                    {callDropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                        <button
                          onClick={() => {
                            setCallDropdownOpen(false);
                            handleInitiateCall("audio");
                          }}
                          className="w-full px-3 py-2 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                        >
                          <Phone size={11} className="text-indigo-600 dark:text-indigo-400" />
                          <span>Voice Call</span>
                        </button>
                        <button
                          onClick={() => {
                            setCallDropdownOpen(false);
                            handleInitiateCall("video");
                          }}
                          className="w-full px-3 py-2 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                        >
                          <Video size={11} className="text-indigo-600 dark:text-indigo-400" />
                          <span>Video Call</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <button 
                  onClick={() => setChatModalOpen(false)} 
                  className="text-slate-400 hover:text-white cursor-pointer border-none bg-transparent flex items-center justify-center p-1"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Profile Status card */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900 shrink-0">
              {/* Circular Avatar */}
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-[#4f46e5] dark:text-indigo-400 font-black text-sm uppercase border border-indigo-100 dark:border-indigo-900/50">
                  {nextOrder ? nextOrder.address?.firstName?.charAt(0) : "C"}
                </div>
                {/* Online indicator dot */}
                <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-950 ${partnerOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`} />
              </div>

              {/* Partner Details */}
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${partnerOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                  <span className={`text-[10px] font-bold ${partnerOnline ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} uppercase tracking-wide`}>
                    Customer is {partnerOnline ? "online" : "offline"}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate uppercase tracking-wide">
                  {nextOrder ? `${nextOrder.address?.firstName} ${nextOrder.address?.lastName || ""}`.trim() : "Customer"}
                  <span className="text-[10px] text-slate-400 font-bold ml-1.5 tracking-normal uppercase">
                    • Customer
                  </span>
                </h5>
              </div>

              {/* Typing status */}
              {partnerTyping && (
                <span className="text-[#4f46e5] dark:text-indigo-400 text-[10px] font-extrabold animate-pulse lowercase select-none">typing...</span>
              )}
            </div>
            
            {/* Message Pane */}
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-900/40">
              {chatMessages.map((msg, i) => {
                const myId = getUserIdFromToken(token);
                const isMe = myId && String(msg.senderId) === String(myId);
                const timeStr = msg.createdAt 
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : (msg.time || "");
                return (
                  <div key={msg._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`p-2.5 rounded-2xl max-w-[80%] text-xs font-semibold leading-normal ${ isMe ? "bg-[#4f46e5] text-slate-100 dark:text-white rounded-tr-none shadow-xs" : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs" }`}>
                      {msg.message || msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[8px] text-slate-400 font-bold">{timeStr}</span>
                      {isMe && (
                        <span className="text-[9px] leading-none">
                          {msg.status === "seen" ? (
                            <span className="text-blue-500 font-black">✓✓</span>
                          ) : msg.status === "delivered" ? (
                            <span className="text-slate-400 font-black">✓✓</span>
                          ) : (
                            <span className="text-slate-400">✓</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form & Lock Footer */}
            {nextOrder && ["delivered", "cancelled", "returned", "refunded"].includes((nextOrder.orderStatus || "").toLowerCase()) ? (
              <div className="p-4 bg-slate-100 dark:bg-slate-900/60 text-center text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-1.5 shrink-0">
                <Lock size={12} />
                <span>This communication channel is archived.</span>
              </div>
            ) : (
              <div className="px-4 py-3 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  {/* Attachment Button */}
                  <button
                    type="button"
                    className="h-8 w-8 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 cursor-pointer border-none shrink-0"
                  >
                    <Paperclip size={14} />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    placeholder="Type your message securely..."
                    value={newChatMessage}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition"
                  />

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!newChatMessage.trim()}
                    className="h-8 w-8 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center hover:bg-[#4338ca] active:scale-95 disabled:bg-slate-100 disabled:dark:bg-slate-900 disabled:text-slate-400 transition cursor-pointer border-none shrink-0 shadow-sm"
                  >
                    <Send size={12} className="fill-current text-white" />
                  </button>
                </form>

                {/* Centered Lock Footer */}
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                  <Lock size={10} className="text-slate-400" />
                  <span>
                    Only you and the customer can see these messages.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ✅ REPORT ISSUE MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/50 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon size={16} className="text-amber-500" />
                <span>Report Delivery Issue</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Issue Category</label>
                <select 
                  value={reportIssueType}
                  onChange={(e) => setReportIssueType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs font-bold cursor-pointer"
                >
                  <option value="Traffic Delay">Traffic / Route Delay</option>
                  <option value="Customer Unreachable">Customer Unreachable</option>
                  <option value="Address Incorrect">Address Incorrect</option>
                  <option value="Vehicle Issue">Vehicle Breakdown</option>
                  <option value="Package Damaged">Package Issue</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Additional description</label>
                <textarea
                  rows="3"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Stuck in heavy rain/flooding on main highway..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs outline-none resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-slate-100 dark:text-white font-bold py-3 rounded-xl text-xs cursor-pointer"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ SECURE OTP MODAL */}
      {otpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/50 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Key size={16} className="text-indigo-500" />
                <span>OTP Secure verification</span>
              </h3>
              <button onClick={() => setOtpModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <p className="text-xs text-slate-500 leading-normal">Ask the customer for the 6-character unique verification code sent to their app or SMS to complete the dispatch.</p>
              
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => {
                    setOtpValue(e.target.value.toUpperCase());
                    setOtpError("");
                  }}
                  placeholder="e.g. EX89K2"
                  className="w-full text-center text-2xl font-black tracking-[0.3em] uppercase bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 outline-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                  autoFocus
                />
                {otpError && <p className="text-[10px] text-rose-500 font-bold mt-1.5">{otpError}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-slate-100 dark:text-white font-bold py-3 rounded-xl text-xs cursor-pointer"
                >
                  Confirm Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ BARCODE / QR SCAN MODAL */}
      {scanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/50 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <QrCode size={16} className="text-indigo-500" />
                <span>Package QR scanner</span>
              </h3>
              <button onClick={() => setScanModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={16} /></button>
            </div>

            <div className="space-y-5 text-center">
              <p className="text-xs text-slate-500">Scan order barcode / QR code to confirm checkout pick-up or delivery stage.</p>
              
              {/* Simulated camera scanning box */}
              <div className="h-44 w-full border-2 border-indigo-500 rounded-2xl relative overflow-hidden bg-slate-950 flex items-center justify-center">
                {scanSuccess ? (
                  <div className="text-emerald-500 flex flex-col items-center gap-2">
                    <CheckCircle2 size={40} className="animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-wider">Scan Confirmed</span>
                  </div>
                ) : (
                  <>
                    {/* Scanning red horizontal line */}
                    <div className="absolute left-0 right-0 h-[2px] bg-rose-500 top-1/4 animate-bounce" style={{ animationDuration: '2.5s' }} />
                    <div className="border border-white/40 h-28 w-28 rounded flex flex-col justify-between p-1">
                      <div className="flex justify-between">
                        <span className="border-t-2 border-l-2 border-indigo-500 w-3.5 h-3.5" />
                        <span className="border-t-2 border-r-2 border-indigo-500 w-3.5 h-3.5" />
                      </div>
                      <QrCode size={40} className="text-white/45 mx-auto" />
                      <div className="flex justify-between">
                        <span className="border-b-2 border-l-2 border-indigo-500 w-3.5 h-3.5" />
                        <span className="border-b-2 border-r-2 border-indigo-500 w-3.5 h-3.5" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!scanSuccess && (
                <button
                  onClick={handleScanSimulation}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-slate-100 dark:text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-2"
                >
                  <Activity size={14} className="animate-pulse" />
                  <span>Simulate Camera Scan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ✅ EMERGENCY SIGNAL MODAL */}
      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/50 dark:bg-rose-950/40 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-3xl bg-white border border-slate-200 dark:bg-slate-950 dark:border-rose-950/80 shadow-2xl p-6 text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-500/30">
              <ShieldAlert size={36} className="animate-ping" />
            </div>

            <h3 className="font-extrabold text-sm text-rose-600 dark:text-rose-400 uppercase tracking-wider">Trigger Emergency SOS Assistance</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Clicking trigger will alert nearby courier depots, customer support representatives, and dispatch dispatchers of your live coordinates for immediate vehicle, road, or security help.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(false)}
                className="flex-1 border border-slate-200 dark:border-slate-800 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("SOS Emergency Alert Dispatched! Depot and Police authorities notified with GPS coordinates.");
                  setEmergencyModalOpen(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-slate-100 dark:text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-md"
              >
                Trigger SOS Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. WebRTC Portaled Calling Overlays */}
      {createPortal(
        <>
          {/* Incoming Call Screen */}
          {incomingCall && incomingCallData && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-[320px] text-center space-y-6 animate-fade-in shadow-2xl">
                <div className="flex flex-col items-center space-y-3 pt-4">
                  <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                    {incomingCallData.type === "video" ? <Video size={30} /> : <PhoneCall size={30} />}
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {incomingCallData.callerName}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Incoming {incomingCallData.type} call...
                  </p>
                </div>

                <div className="flex items-center justify-center gap-6 pb-2">
                  <button
                    onClick={handleRejectCall}
                    className="h-12 w-12 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition border-none cursor-pointer shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95"
                  >
                    <PhoneOff size={18} />
                  </button>

                  <button
                    onClick={handleAcceptCall}
                    className="h-12 w-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition border-none cursor-pointer shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 animate-bounce"
                  >
                    <Phone size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Call screen */}
          {callActive && (
            <div className="fixed inset-0 bg-slate-950/95 z-[9999] flex flex-col items-center justify-center p-4 select-none">
              <div className="relative w-full max-w-lg aspect-video sm:aspect-square bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                
                {/* Stream render elements */}
                {callType === "video" ? (
                  <div className="absolute inset-0 w-full h-full">
                    {/* Remote Stream Track */}
                    {remoteStream ? (
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-3">
                        <div className="w-6 h-6 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Waiting for remote stream...</span>
                      </div>
                    )}

                    {/* Local Picture-in-Picture Track */}
                    {localStream && (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-24 h-32 rounded-xl bg-slate-950 border border-slate-750/85 shadow-md object-cover absolute bottom-4 right-4 z-10 hover:scale-105 transition"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                      <PhoneCall size={36} />
                    </div>
                    <h3 className="text-md font-black text-white uppercase tracking-wider">
                      Customer
                    </h3>
                    <p className="text-[10px] font-bold text-indigo-400 tracking-wider">
                      {callStatus === "connecting" ? "CONNECTING SECURE SESSION..." : "CONNECTED SECURELY"}
                    </p>
                    {remoteStream && (
                      <audio ref={remoteVideoRef} autoPlay />
                    )}
                  </div>
                )}

                {/* Header calling stats overlay */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-full text-white text-[10px] font-black tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{callStatus === "connected" ? formatTime(callTime) : "Ringing..."}</span>
                </div>

                {/* Calling control panel */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-4 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-4 py-2.5 rounded-full shadow-2xl">
                  <button
                    onClick={toggleMic}
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition border-none cursor-pointer ${
                      isMicMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>

                  {callType === "video" && (
                    <button
                      onClick={toggleVideo}
                      className={`h-10 w-10 rounded-full flex items-center justify-center transition border-none cursor-pointer ${
                        isVideoMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      {isVideoMuted ? <VideoOff size={16} /> : <Video size={16} />}
                    </button>
                  )}

                  <button
                    onClick={handleEndCall}
                    className="h-10 w-10 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition border-none cursor-pointer shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95"
                  >
                    <X size={16} />
                  </button>
                </div>

              </div>
            </div>
          )}
        </>,
        document.body
      )}

    </div>
  );
};

export default MyDeliveriesTab;
