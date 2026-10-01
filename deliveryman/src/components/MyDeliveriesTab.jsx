import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Calendar, Search, ChevronLeft, ChevronRight, Phone, MapPin, 
  CheckCircle, Clock, Navigation, Inbox, CalendarDays, DollarSign, 
  Wallet, Truck, Sparkles, Activity, Star, LogOut, ToggleLeft, ToggleRight,
  MessageSquare, AlertOctagon, ShieldAlert, ShieldCheck, LifeBuoy, QrCode, Key,
  RefreshCw, TrendingUp, BarChart2, Check, X, AlertTriangle, Eye, EyeOff,
  User, CheckCircle2, Navigation2, Crosshair, ArrowRight, CornerDownRight,
  ChevronDown, ChevronUp, Bell, Zap, PhoneCall, PhoneOff, Video, VideoOff, Mic, MicOff, Lock, Paperclip, Send, Package, Minus
} from "lucide-react";
import io from "socket.io-client";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import DeliveryMap from "./DeliveryMap";

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

const mergeAndDeduplicate = (existingMessages, newMessages) => {
  const mergedMap = new Map();

  existingMessages.forEach((msg, index) => {
    const key = msg._id || `${msg.senderId}_${msg.createdAt || msg.time || ""}_${index}`;
    mergedMap.set(key, msg);
  });

  newMessages.forEach((msg, index) => {
    const key = msg._id || `${msg.senderId}_${msg.createdAt || msg.time || ""}_${index}`;
    mergedMap.set(key, msg);
  });

  return Array.from(mergedMap.values()).sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (timeA !== timeB) return timeA - timeB;
    if (a._id && b._id) return String(a._id).localeCompare(String(b._id));
    return 0;
  });
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
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIdx, setSelectedOrderIdx] = useState(0);
  const [earningsTab, setEarningsTab] = useState("Today");
  const [performanceTimeframe, setPerformanceTimeframe] = useState("This Week");

  useEffect(() => {
    setIsNavigating(false);
    if (nextOrder) {
      setSelectedOrder(nextOrder);
    } else if (orders && orders.length > 0) {
      setSelectedOrder(orders[0]);
    }
  }, [nextOrder, orders]);

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

  // Modal and view states
  const [activeActionsOpen, setActiveActionsOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
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
  const [expandedCardIds, setExpandedCardIds] = useState({});

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
      transports: ["polling", "websocket"],
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
      setChatMessages((prev) => mergeAndDeduplicate(prev, [msg]));
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
          // Toast notification if chat is not currently open
          toast.info(`Message from Customer: ${msg.message}`, {
            position: "bottom-right",
            autoClose: 5000,
            onClick: () => {
              setChatModalOpen(true);
              setIsChatMinimized(false);
            }
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
    socket.on("user_online", ({ userId, role }) => {
      console.log(`[Socket Presence] user_online event received: userId=${userId}, role=${role}`);
      if (String(userId) !== String(myId)) {
        setPartnerOnline(true);
      }
    });

    socket.on("user_offline", ({ userId }) => {
      console.log(`[Socket Presence] user_offline event received: userId=${userId}`);
      if (String(userId) !== String(myId)) {
        setPartnerOnline(false);
      }
    });

    socket.on("partner_presence", ({ online, partnerRole }) => {
      console.log(`[Socket Presence] partner_presence event received: online=${online}, partnerRole=${partnerRole}`);
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
              setChatMessages((prev) => mergeAndDeduplicate(prev, response.data.messages || []));
            }
          } catch (e) {}
        };
        fetchHistory();
      }
    });

    return () => {
      socket.removeAllListeners();
      setTimeout(() => {
        if (socket.connected) {
          socket.disconnect();
        }
      }, 50);
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
          setChatMessages((prev) => mergeAndDeduplicate(prev, response.data.messages || []));
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

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    if (!nextOrder || !token) return;
    const orderId = nextOrder._id;

    const toastId = toast.info("Fetching your location coordinates...", { autoClose: false });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        toast.dismiss(toastId);
        
        try {
          await axios.post(
            `${backendUrl}/api/order-communication/${orderId}/message`,
            {
              receiverRole: "customer",
              message: `[Location] https://www.google.com/maps?q=${latitude},${longitude}`
            },
            { headers: { token } }
          );
          toast.success("Location shared successfully!");
        } catch (error) {
          console.error("Error sending location:", error);
          toast.error(error.response?.data?.message || "Failed to send location.");
        }
      },
      (error) => {
        toast.dismiss(toastId);
        let errorMsg = "Failed to retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Location access permission denied.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Request to get location timed out.";
        }
        toast.error(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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
    const submittedCode = otpValue.trim();
    setOtpModalOpen(false);
    setOtpValue("");
    setOtpError("");
    
    if (nextOrder) {
      handleStatusChange(nextOrder._id, "Delivered", submittedCode);
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
      handleStatusChange(nextOrder._id, "Delivered");
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

  const currentActiveOrder = selectedOrder 
    || nextOrder 
    || (orders && orders.find(o => {
        const s = (o.orderStatus || "").toLowerCase();
        return s !== "delivered" && s !== "cancelled";
      }))
    || (orders && orders[0]) 
    || null;

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const driverFirstName = driver?.name ? driver.name.split(" ")[0] : "Partner";
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  });

  const totalAssignedCount = orders ? orders.length : (stats?.activeCount ? (stats.activeCount + (stats.totalDelivered || 0)) : 0);
  const deliveredCount = orders 
    ? orders.filter(o => (o.orderStatus || "").toLowerCase() === "delivered").length 
    : (stats?.totalDelivered || 0);
  const pendingCount = orders 
    ? orders.filter(o => {
        const s = (o.orderStatus || "").toLowerCase();
        return s !== "delivered" && s !== "cancelled";
      }).length 
    : (stats?.activeCount || 0);
  const earningsVal = typeof todayEarningsVal === "number" && todayEarningsVal > 0 
    ? todayEarningsVal 
    : (stats?.totalEarnings || (deliveredCount * 75));
  const progressPercent = totalAssignedCount > 0 ? Math.round((deliveredCount / totalAssignedCount) * 100) : 0;

  const totalAllTimeEarnings = stats?.totalEarnings || (deliveredCount * 75);
  const displayedEarnings = earningsTab === "Today" 
    ? earningsVal 
    : earningsTab === "This Week" 
    ? (orders ? orders.filter(o => {
        if ((o.orderStatus || "").toLowerCase() !== "delivered") return false;
        const d = new Date(o.updatedAt || o.createdAt);
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return d >= oneWeekAgo;
      }).length * 75 : totalAllTimeEarnings)
    : totalAllTimeEarnings;

  const displayOrders = (tableFilteredOrders && tableFilteredOrders.length > 0)
    ? tableFilteredOrders
    : (orders || []);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyPerformanceData = [0, 1, 2, 3, 4, 5, 6].map(offset => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - offset));
    const dayStr = daysOfWeek[d.getDay()];
    const dateStr = d.toDateString();
    const count = (orders || []).filter(o => {
      const oDate = o.updatedAt || o.createdAt;
      return oDate && new Date(oDate).toDateString() === dateStr && (o.orderStatus || "").toLowerCase() === "delivered";
    }).length;
    return { day: dayStr, val: count, isToday: offset === 6 };
  });
  const maxWeeklyVal = Math.max(...weeklyPerformanceData.map(w => w.val), 1);

  return (
    <div className="space-y-2 text-slate-800 dark:text-slate-200">
      
      {/* 1. TOP GREETING & WEATHER ROW (matching reference image) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-0.5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{greeting}, {driverFirstName}</span>
            <span className="inline-block animate-wave">👋</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            You're doing great! {pendingCount} deliveries remaining today.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>{formattedDate}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-slate-700 dark:text-slate-300">
            <MapPin size={12} className="text-blue-500" />
            <span className="font-semibold text-slate-900 dark:text-white">{driver?.deliveryZone || "Registered Sector"}</span>
          </div>
        </div>
      </div>

      {/* 2. TOP METRIC CARDS ROW (4 Metric Cards + 1 Progress Card) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-0.5">
        {/* Card 1: Assigned Orders */}
        <div className="dashboard-card p-2.5 relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-sm bg-blue-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Package size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {totalAssignedCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Assigned Orders
              </div>
            </div>
          </div>
          <Package size={36} className="absolute -right-2 -bottom-2 text-blue-500/10 pointer-events-none" />
        </div>

        {/* Card 2: Delivered */}
        <div className="dashboard-card p-2.5 relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-sm bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Check size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {deliveredCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Delivered
              </div>
            </div>
          </div>
          <CheckCircle2 size={36} className="absolute -right-2 -bottom-2 text-emerald-500/10 pointer-events-none" />
        </div>

        {/* Card 3: Pending */}
        <div className="dashboard-card p-2.5 relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-sm bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {pendingCount}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Pending
              </div>
            </div>
          </div>
          <Clock size={36} className="absolute -right-2 -bottom-2 text-amber-500/10 pointer-events-none" />
        </div>

        {/* Card 4: Today's Earnings */}
        <div className="dashboard-card p-2.5 relative overflow-hidden flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-sm bg-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Wallet size={16} />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                ₹{earningsVal.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Today's Earnings
              </div>
            </div>
          </div>
          <BarChart2 size={36} className="absolute -right-2 -bottom-2 text-purple-500/10 pointer-events-none" />
        </div>

        {/* Card 5: Today's Progress */}
        <div className="dashboard-card p-2.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 dark:text-white">Today's Progress</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-mono">
              {deliveredCount} / {totalAssignedCount}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xs h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-xs transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono shrink-0">
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* PENDING ASSIGNMENTS BANNER (if any) */}
      {pendingAcceptance && pendingAcceptance.length > 0 && (
        <div className="dashboard-card p-2.5 border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 mb-0.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-xs bg-rose-500 animate-pulse" />
              <h4 className="font-bold text-xs text-rose-700 dark:text-rose-400">
                New Order Assignment ({pendingAcceptance.length})
              </h4>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {pendingAcceptance.map((order) => (
              <div key={order._id} className="bg-white dark:bg-slate-900 p-2 rounded-sm border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                    #{order._id.slice(-6).toUpperCase()} • ₹{order.amount}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {order.address?.firstName} • {order.address?.city}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => handleRejectAssignment(order._id)} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold rounded-xs hover:bg-rose-50 hover:text-rose-600 transition">
                    Reject
                  </button>
                  <button onClick={() => handleAcceptAssignment(order._id)} className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-semibold rounded-xs hover:bg-emerald-700 transition">
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. MIDDLE SECTION (Left 8-cols: Current Delivery + Map | Right 4-cols: Earnings + Performance + Motivation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-stretch mb-0.5">
        {/* Left 8 Cols (Current Delivery + Live Tracking Route Map) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-2 items-stretch">
          
          {/* Current Delivery Card */}
          <div className="dashboard-card p-3 flex flex-col justify-between">
            {currentActiveOrder ? (
              <>
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Current Delivery</span>
                    {displayOrders.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                        <span>#{selectedOrderIdx + 1} of {displayOrders.length}</span>
                        <button 
                          onClick={() => {
                            const nextIdx = (selectedOrderIdx + 1) % displayOrders.length;
                            setSelectedOrderIdx(nextIdx);
                            setSelectedOrder(displayOrders[nextIdx]);
                          }} 
                          className="p-1 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                          title="Next Delivery"
                        >
                          <ArrowRight size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Order ID & Status Badge */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-mono">
                      #{currentActiveOrder._id ? currentActiveOrder._id.slice(-7).toUpperCase() : ""}
                    </span>
                    <span className="px-2 py-0.5 rounded-xs text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                      {currentActiveOrder.orderStatus || "Assigned"}
                    </span>
                  </div>

                  {/* Customer Name & Phone icon */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                      {currentActiveOrder.address?.firstName || "Customer"} {currentActiveOrder.address?.lastName || ""}
                    </h3>
                    {currentActiveOrder.address?.phone && (
                      <button 
                        onClick={() => {
                          window.open(`tel:${currentActiveOrder.address.phone}`);
                        }}
                        className="h-7 w-7 rounded-xs bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center transition cursor-pointer"
                        title="Call Customer"
                      >
                        <Phone size={12} />
                      </button>
                    )}
                  </div>

                  {/* Address with Pin */}
                  <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300 mb-2.5">
                    <MapPin size={13} className="text-blue-500 shrink-0 mt-0.5" />
                    <span className="leading-snug line-clamp-2">
                      {formatAddress 
                        ? formatAddress(currentActiveOrder.address) 
                        : (currentActiveOrder.address?.street 
                            ? `${currentActiveOrder.address.street}, ${currentActiveOrder.address.city || ""}` 
                            : "Delivery destination assigned")}
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-3 gap-1.5 py-1.5 px-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-sm mb-2.5 text-center">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 text-xs mb-0.5">
                        <Navigation size={11} className="text-slate-400" />
                        <span className="font-bold">{currentActiveOrder.distance || "In Zone"}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Zone / Route</span>
                    </div>
                    <div className="border-x border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 text-xs mb-0.5">
                        <Clock size={11} className="text-slate-400" />
                        <span className="font-bold">{currentActiveOrder.orderStatus || "Active"}</span>
                      </div>
                      <span className="text-[9px] text-slate-400">Status</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-slate-700 dark:text-slate-300 text-xs mb-0.5">
                        <Wallet size={11} className="text-slate-400" />
                        <span className="font-bold">
                          {currentActiveOrder.paymentMethod ? currentActiveOrder.paymentMethod.toUpperCase() : "COD"} ₹{currentActiveOrder.amount || 0}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400">Payment</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Navigate, Call, Chat + Primary CTA */}
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => {
                        setIsNavigating(true);
                        toast.success("Navigation mode active!");
                      }}
                      className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer shadow-xs active:scale-95"
                    >
                      <Navigation size={12} className="fill-current" />
                      <span>Navigate</span>
                    </button>
                    <button
                      onClick={() => handleInitiateCall("audio")}
                      className="py-1.5 px-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded-sm text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95"
                    >
                      <Phone size={12} />
                      <span>Call</span>
                    </button>
                    <button
                      onClick={() => {
                        setChatModalOpen((prev) => !prev);
                        setIsChatMinimized(false);
                      }}
                      className={`py-1.5 px-2.5 rounded-sm text-xs font-semibold flex items-center justify-center gap-1 transition cursor-pointer active:scale-95 ${
                        chatModalOpen && !isChatMinimized
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-blue-50 hover:bg-blue-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400"
                      }`}
                    >
                      <MessageSquare size={12} />
                      <span>Chat</span>
                    </button>
                  </div>

                  {/* Mark as Picked Up / Out for Delivery / Delivered Button */}
                  <button
                    onClick={() => {
                      if (!currentActiveOrder) return;
                      const st = (currentActiveOrder.orderStatus || "").toLowerCase();
                      if (st === "assigned" || st === "order placed" || st === "accepted") {
                        handleStatusChange(currentActiveOrder._id, "Picked Up");
                        toast.success("Shipment marked as Picked Up!");
                      } else if (st === "picked up") {
                        handleStatusChange(currentActiveOrder._id, "Out for Delivery");
                        toast.success("Shipment is out for delivery!");
                      } else {
                        setOtpModalOpen(true);
                      }
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-sm text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-98"
                  >
                    <Package size={14} />
                    <span>
                      {(currentActiveOrder.orderStatus || "").toLowerCase() === "picked up"
                        ? "Mark as Out for Delivery"
                        : (currentActiveOrder.orderStatus || "").toLowerCase() === "out for delivery"
                        ? "Mark as Delivered (Verify OTP)"
                        : "Mark as Picked Up"}
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-4 space-y-3">
                <div className="h-11 w-11 rounded-sm bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Package size={22} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">No Active Shipments</h4>
                  <p className="text-[11px] text-slate-400 max-w-[210px] mt-1">
                    Stay Online to receive direct dispatch assignments, or browse available orders.
                  </p>
                </div>
                <div className="pt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[10px] font-mono font-medium ${
                    driver?.isOnline || stats?.isOnline
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${driver?.isOnline || stats?.isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                    <span>{driver?.isOnline || stats?.isOnline ? "Duty: ONLINE" : "Duty: OFFLINE"}</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Middle 4 Cols (Live Delivery Route Map - Always Visible) */}
          <div className="dashboard-card overflow-hidden relative flex flex-col min-h-[350px] justify-between p-0">
            <DeliveryMap 
              nextOrder={currentActiveOrder}
              stats={stats}
              driver={driver}
              isNavigating={isNavigating}
              setIsNavigating={setIsNavigating}
              formatAddress={formatAddress}
            />
          </div>
        </div>

        {/* Right 4 Cols (Earnings + Performance + Motivation) */}
        <div className="lg:col-span-4 space-y-2 flex flex-col justify-between">
          {/* 1. Earnings Card */}
          <div className="dashboard-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Earnings</span>
              <button onClick={() => setStatusFilter("All")} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer">
                <span>View Details</span>
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Tabs pill */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xs mb-2 text-xs">
              {["Today", "This Week", "This Month"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setEarningsTab(tab)}
                  className={`flex-1 py-1 rounded-xs text-xs font-medium transition cursor-pointer ${
                    earningsTab === tab 
                      ? "bg-blue-600 text-white shadow-xs" 
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Big value + percentage */}
            <div className="flex items-baseline justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{displayedEarnings.toLocaleString()}
                </span>
                <p className="text-[10px] text-slate-400 font-medium">
                  {earningsTab === "Today" ? "Today's Earnings" : `${earningsTab} Total`}
                </p>
              </div>
              <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-mono flex items-center gap-0.5">
                <span>{deliveredCount}</span>
                <span className="font-normal text-slate-400 ml-0.5">completed</span>
              </span>
            </div>

            {/* Breakdown items */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Base Payout</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{displayedEarnings.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>COD Cash Collected</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{(stats?.cashCollected || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Completed Orders</span>
                <span className="font-bold text-slate-900 dark:text-white">{deliveredCount} packages</span>
              </div>
            </div>
          </div>

          {/* 2. Performance Card */}
          <div className="dashboard-card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Performance</span>
              <select 
                value={performanceTimeframe}
                onChange={(e) => setPerformanceTimeframe(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xs px-2 py-0.5 text-slate-600 dark:text-slate-300 outline-none cursor-pointer"
              >
                <option value="This Week">This Week</option>
                <option value="Last Week">Last Week</option>
                <option value="This Month">This Month</option>
              </select>
            </div>

            {/* 2x2 stats */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <span className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  {totalAssignedCount > 0 ? `${((deliveredCount / totalAssignedCount) * 100).toFixed(0)}%` : (deliveredCount > 0 ? "100%" : "—")}
                </span>
                <p className="text-[10px] text-slate-400">Delivery Success</p>
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1 font-mono">
                  <span>{driver?.rating ? Number(driver.rating).toFixed(1) : "5.0"}</span>
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                </span>
                <p className="text-[10px] text-slate-400">Customer Rating</p>
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono">
                  {pendingCount}
                </span>
                <p className="text-[10px] text-slate-400">Pending Tasks</p>
              </div>
              <div>
                <span className={`text-sm sm:text-base font-bold font-mono ${driver?.isOnline || stats?.isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"}`}>
                  {driver?.isOnline || stats?.isOnline ? "Online" : "Offline"}
                </span>
                <p className="text-[10px] text-slate-400">Duty Status</p>
              </div>
            </div>

            {/* Bar chart */}
            <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-end justify-between gap-1.5 h-14 px-1 pt-1">
                {weeklyPerformanceData.map((bar) => (
                  <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    <div 
                      className={`w-full rounded-t-xs transition-all duration-300 ${
                        bar.isToday ? "bg-blue-600" : "bg-blue-200 dark:bg-blue-900/60 hover:bg-blue-400"
                      }`}
                      style={{ height: `${bar.val > 0 ? Math.max((bar.val / maxWeeklyVal) * 100, 16) : 8}%` }}
                      title={`${bar.day}: ${bar.val} completed`}
                    />
                    <span className={`text-[9px] font-medium ${bar.isToday ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-400"}`}>
                      {bar.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Motivation Card */}
          <div className="dashboard-card p-2.5 bg-gradient-to-r from-amber-500/10 to-orange-500/5 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between cursor-pointer hover:opacity-90 transition">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xs bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs text-xs">
                🏆
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-none">Keep going!</h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">You're making a difference</p>
              </div>
            </div>
            <ArrowRight size={13} className="text-slate-400" />
          </div>
        </div>
      </div>

      {/* 4. TODAY'S DELIVERIES TABLE (matching reference image) */}
      <div className="dashboard-card p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Today's Deliveries</h3>
          <button 
            onClick={() => setStatusFilter("All")}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-medium">
                <th className="pb-1.5 font-medium">#</th>
                <th className="pb-1.5 font-medium">Customer</th>
                <th className="pb-1.5 font-medium">Area</th>
                <th className="pb-1.5 font-medium">Distance</th>
                <th className="pb-1.5 font-medium">Payment</th>
                <th className="pb-1.5 font-medium">Status</th>
                <th className="pb-1.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {displayOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    <Package size={22} className="mx-auto mb-1.5 opacity-40 text-slate-400" />
                    <p className="font-semibold text-xs text-slate-700 dark:text-slate-300">No deliveries found</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Assigned and completed packages for today will be listed here.</p>
                  </td>
                </tr>
              ) : (
                displayOrders.map((order, idx) => {
                  const st = (order.orderStatus || "").toLowerCase();
                  const isSelected = currentActiveOrder && currentActiveOrder._id === order._id;

                  return (
                    <tr 
                      key={order._id || idx} 
                      onClick={() => {
                        setSelectedOrder(order);
                        setSelectedOrderIdx(idx);
                      }}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition cursor-pointer ${isSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""}`}
                    >
                      <td className="py-2 font-bold text-slate-900 dark:text-white font-mono">
                        #{order._id ? order._id.slice(-7).toUpperCase() : ""}
                      </td>
                      <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                        {order.address?.firstName || "Customer"} {order.address?.lastName || ""}
                      </td>
                      <td className="py-2 text-slate-600 dark:text-slate-400">
                        {order.address?.city || order.address?.street || "Assigned Sector"}
                      </td>
                      <td className="py-2 text-slate-600 dark:text-slate-400 font-medium">
                        {order.distance || "In Zone"}
                      </td>
                      <td className="py-2 font-medium text-slate-800 dark:text-slate-200">
                        {order.paymentMethod?.toLowerCase() === "cod" ? `COD ₹${order.amount || 0}` : `Paid ₹${order.amount || 0}`}
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] font-medium inline-block ${
                          st === "delivered" 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : st === "picked up"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : st === "out for delivery" || st === "on the way"
                            ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                            : "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                        }`}>
                          {order.orderStatus || "Assigned"}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                            setSelectedOrderIdx(idx);
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>View</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 8: QUICK ACTION CENTER (Sharp industrial floating trigger in bottom-right corner) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setActiveActionsOpen(!activeActionsOpen)}
          className="h-11 w-11 rounded-sm bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white flex items-center justify-center shadow-xl border border-slate-700 dark:border-blue-400 transition-all duration-150 cursor-pointer relative"
        >
          {activeActionsOpen ? <X size={18} /> : <Zap size={18} />}
          {pendingAcceptance.length > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-rose-500 rounded-xs text-white text-[9px] font-mono font-bold flex items-center justify-center border border-white dark:border-[#0C101B]">
              {pendingAcceptance.length}
            </span>
          )}
        </button>

        {activeActionsOpen && (
          <div className="absolute bottom-14 right-0 w-72 glass-panel-elevated rounded-md border-t-2 border-t-blue-500 p-3.5 shadow-2xl space-y-3 animate-in slide-in-from-bottom-2 fade-in duration-150">
            <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80 pb-2 flex items-center gap-1.5 font-mono">
              <Zap size={13} className="text-blue-500" />
              <span>Quick Actions</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => { setScanModalOpen(true); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <QrCode size={16} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Scan QR</span>
              </button>

              <button 
                onClick={() => { setOtpModalOpen(true); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <Key size={16} className="text-blue-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Verify OTP</span>
              </button>

              <button 
                onClick={() => { setReportModalOpen(true); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <AlertOctagon size={16} className="text-slate-600 dark:text-slate-400" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Report Issue</span>
              </button>

              <button 
                onClick={() => { alert("Navigating to complaints / returns module..."); setActiveActionsOpen(false); }}
                className="flex flex-col items-center justify-center gap-1.5 p-2.5 bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 rounded-sm text-slate-700 dark:text-slate-300 transition duration-150 cursor-pointer text-center"
              >
                <RefreshCw size={16} className="text-slate-500" />
                <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Returns</span>
              </button>
            </div>

            <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-2">
              <button 
                onClick={() => { alert("Opening courier support channel..."); setActiveActionsOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider transition cursor-pointer font-mono"
              >
                <LifeBuoy size={11} />
                <span>Support</span>
              </button>
              
              <button 
                onClick={() => { setEmergencyModalOpen(true); setActiveActionsOpen(false); }}
                className="flex-1 flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-wider transition cursor-pointer shadow-sm font-mono"
              >
                <ShieldAlert size={11} />
                <span>Emergency</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* OVERLAY MODALS & SIMULATION CONTROLS */}
      {/* ========================================================================= */}



      {/* ✅ REPORT ISSUE MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-100/50 dark:bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-sm rounded-md border-t-2 border-t-rose-500 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3.5">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <AlertOctagon size={14} className="text-rose-500" />
                <span>Report Delivery Issue</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={15} /></button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3.5">
              <div>
                <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Issue Category</label>
                <select 
                  value={reportIssueType}
                  onChange={(e) => setReportIssueType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm px-2.5 py-1.5 text-xs font-mono cursor-pointer"
                >
                  <option value="Traffic Delay">Traffic / Route Delay</option>
                  <option value="Customer Unreachable">Customer Unreachable</option>
                  <option value="Address Incorrect">Address Incorrect</option>
                  <option value="Vehicle Issue">Vehicle Breakdown</option>
                  <option value="Package Damaged">Package Issue</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-mono uppercase text-slate-400 block mb-1">Additional description</label>
                <textarea
                  rows="3"
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="e.g. Stuck in heavy rain/flooding on main highway..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm px-2.5 py-1.5 text-xs outline-none resize-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 py-2 rounded-sm text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold py-2 rounded-sm text-xs cursor-pointer uppercase"
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
          <div className="relative w-full max-w-sm rounded-md border-t-2 border-t-indigo-500 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl p-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3.5">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Key size={14} className="text-indigo-500" />
                <span>OTP Secure verification</span>
              </h3>
              <button onClick={() => setOtpModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={15} /></button>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-3.5">
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
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.35em] uppercase bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm py-2.5 outline-none focus:border-indigo-500"
                  autoFocus
                />
                {otpError && <p className="text-[10px] text-rose-500 font-mono mt-1">{otpError}</p>}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setOtpModalOpen(false)}
                  className="flex-1 border border-slate-200 dark:border-slate-800 py-2 rounded-sm text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold py-2 rounded-sm text-xs cursor-pointer uppercase"
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
          <div className="relative w-full max-w-sm rounded-md border-t-2 border-t-indigo-500 bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-2xl p-5 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3.5">
              <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <QrCode size={14} className="text-indigo-500" />
                <span>Package QR scanner</span>
              </h3>
              <button onClick={() => setScanModalOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"><X size={15} /></button>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-500">Scan order barcode / QR code to confirm checkout pick-up or delivery stage.</p>
              
              {/* Simulated camera scanning box */}
              <div className="h-44 w-full border border-indigo-500/40 rounded-sm relative overflow-hidden bg-slate-950 flex items-center justify-center">
                {scanSuccess ? (
                  <div className="text-emerald-500 flex flex-col items-center gap-2">
                    <CheckCircle2 size={36} className="animate-bounce" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">Scan Confirmed</span>
                  </div>
                ) : (
                  <>
                    {/* Scanning red horizontal line */}
                    <div className="absolute left-0 right-0 h-[2px] bg-rose-500 top-1/4 animate-bounce" style={{ animationDuration: '2.5s' }} />
                    <div className="border border-white/20 h-28 w-28 rounded-xs flex flex-col justify-between p-1">
                      <div className="flex justify-between">
                        <span className="border-t-2 border-l-2 border-indigo-500 w-3 h-3" />
                        <span className="border-t-2 border-r-2 border-indigo-500 w-3 h-3" />
                      </div>
                      <QrCode size={36} className="text-white/30 mx-auto" />
                      <div className="flex justify-between">
                        <span className="border-b-2 border-l-2 border-indigo-500 w-3 h-3" />
                        <span className="border-b-2 border-r-2 border-indigo-500 w-3 h-3" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {!scanSuccess && (
                <button
                  onClick={handleScanSimulation}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-bold py-2.5 rounded-sm text-xs cursor-pointer flex items-center justify-center gap-2 uppercase"
                >
                  <Activity size={13} className="animate-pulse" />
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
          <div className="relative w-full max-w-sm rounded-md border-t-2 border-t-rose-500 bg-white border border-slate-200 dark:bg-slate-950 dark:border-rose-950/80 shadow-2xl p-5 text-center space-y-3.5">
            <div className="mx-auto h-12 w-12 rounded-sm bg-rose-500/10 flex items-center justify-center text-rose-600 border border-rose-500/30">
              <ShieldAlert size={28} className="animate-ping" />
            </div>

            <h3 className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider font-mono">Trigger Emergency SOS</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Clicking trigger will alert nearby courier depots, customer support representatives, and dispatch dispatchers of your live coordinates for immediate assistance.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(false)}
                className="flex-1 border border-slate-200 dark:border-slate-800 py-2 rounded-sm text-xs font-mono font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 cursor-pointer uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert("SOS Emergency Alert Dispatched! Depot and Police authorities notified with GPS coordinates.");
                  setEmergencyModalOpen(false);
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold py-2 rounded-sm text-xs cursor-pointer shadow-sm uppercase"
              >
                Trigger SOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Non-Modal Floating Docked Customer Chat Widget (Corner Docked, Never a Blocking Popup) */}
      {chatModalOpen && currentActiveOrder && !isChatMinimized && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-88 md:w-92 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-150">
          {/* Header */}
          <div className="bg-slate-900 px-3 py-2 text-slate-100 dark:text-white flex justify-between items-center shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-7 w-7 rounded-xs bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase font-mono">
                  {currentActiveOrder.address?.firstName?.charAt(0) || "C"}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-xs border border-slate-900 ${partnerOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 leading-none">
                  <span>{currentActiveOrder.address?.firstName} {currentActiveOrder.address?.lastName || ""}</span>
                  <span className={`text-[9px] font-mono ${partnerOnline ? "text-emerald-400" : "text-slate-400"}`}>
                    {partnerOnline ? "• ONLINE" : "• OFFLINE"}
                  </span>
                </h4>
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Order #{currentActiveOrder._id ? currentActiveOrder._id.slice(-7).toUpperCase() : ""} • Direct Chat
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleInitiateCall("audio")}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-xs text-xs transition cursor-pointer"
                title="Voice Call"
              >
                <Phone size={13} />
              </button>
              <button
                type="button"
                onClick={() => setIsChatMinimized(true)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-xs text-xs transition cursor-pointer"
                title="Minimize Chat"
              >
                <Minus size={13} />
              </button>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-xs text-xs transition cursor-pointer"
                title="Close Chat"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Quick Courier Response Chips */}
          <div className="px-2 py-1.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {[
              "🛵 I've arrived",
              "📍 At the gate",
              "⏳ 2 mins away",
              "📦 Left at door",
              "📞 Please call back"
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setNewChatMessage(chip)}
                className="px-2 py-0.5 whitespace-nowrap bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 rounded-xs font-medium transition cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Message History Scroll Area */}
          <div 
            ref={messagesContainerRef}
            className="h-64 sm:h-72 overflow-y-auto p-3 space-y-2 bg-slate-50/60 dark:bg-slate-950/40 custom-scrollbar text-xs"
          >
            {chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6 text-center text-slate-400">
                <MessageSquare size={22} className="text-slate-300 dark:text-slate-600 mb-1" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Customer Delivery Chat</p>
                <p className="text-[10px] text-slate-400 max-w-[200px] mt-0.5">Send a quick message or share your live coordinates with the customer.</p>
              </div>
            ) : (
              chatMessages.map((msg, i) => {
                const myId = getUserIdFromToken(token);
                const isMe = myId && String(msg.senderId) === String(myId);
                const timeStr = msg.createdAt 
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                  : (msg.time || "");
                const msgText = msg.message || msg.text || "";
                const isLocationMsg = msgText.startsWith("[Location]");

                if (isLocationMsg) {
                  const url = msgText.replace("[Location] ", "");
                  return (
                    <div key={msg._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className={`p-2 rounded-xs max-w-[85%] text-xs font-medium border ${isMe ? "bg-slate-900 text-white border-slate-800" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"}`}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <MapPin size={12} className="text-blue-500" />
                          <span className="text-[10px] font-bold">Shared Location</span>
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="block text-center py-1 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xs text-[10px] font-bold">
                          Open in Maps
                        </a>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-mono">{timeStr}</span>
                    </div>
                  );
                }

                return (
                  <div key={msg._id || i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div className={`p-2 rounded-xs max-w-[85%] text-xs leading-relaxed ${isMe ? "bg-blue-600 text-white shadow-xs" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"}`}>
                      {msgText}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono">{timeStr}</span>
                  </div>
                );
              })
            )}
            {partnerTyping && (
              <div className="flex items-center gap-1 text-[10px] text-blue-500 italic">
                <span className="animate-pulse">Customer is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-2 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShareLocation}
                title="Share GPS Location"
                className="h-7 w-7 rounded-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-600 cursor-pointer shrink-0 transition"
              >
                <MapPin size={12} />
              </button>
              <input
                type="text"
                placeholder="Type your message..."
                value={newChatMessage}
                onChange={handleInputChange}
                className="flex-1 px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-xs outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-blue-500 transition"
              />
              <button
                type="submit"
                disabled={!newChatMessage.trim()}
                className="h-7 px-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xs text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer shrink-0 transition shadow-xs active:scale-95"
              >
                <Send size={11} />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Minimized Floating Chat Badge */}
      {chatModalOpen && isChatMinimized && currentActiveOrder && (
        <button
          type="button"
          onClick={() => setIsChatMinimized(false)}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-xl font-medium text-xs cursor-pointer active:scale-95 transition"
        >
          <MessageSquare size={13} />
          <span>Chat ({currentActiveOrder.address?.firstName || "Customer"})</span>
          <span className={`h-2 w-2 rounded-xs ${partnerOnline ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
        </button>
      )}

      {/* 6. WebRTC Portaled Calling Overlays */}
      {createPortal(
        <>
          {/* Incoming Call Screen */}
          {incomingCall && incomingCallData && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 border-t-2 border-t-indigo-500 rounded-md p-5 w-full max-w-[300px] text-center space-y-5 animate-fade-in shadow-2xl">
                <div className="flex flex-col items-center space-y-2.5 pt-2">
                  <div className="h-12 w-12 rounded-sm bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
                    {incomingCallData.type === "video" ? <Video size={24} /> : <PhoneCall size={24} />}
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {incomingCallData.callerName}
                  </h3>
                  <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Incoming {incomingCallData.type} call...
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4 pb-1">
                  <button
                    onClick={handleRejectCall}
                    className="h-10 w-10 rounded-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition border-none cursor-pointer shadow-sm"
                  >
                    <PhoneOff size={16} />
                  </button>

                  <button
                    onClick={handleAcceptCall}
                    className="h-10 w-10 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition border-none cursor-pointer shadow-sm animate-bounce"
                  >
                    <Phone size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Call screen */}
          {callActive && (
            <div className="fixed inset-0 bg-slate-950/95 z-[9999] flex flex-col items-center justify-center p-4 select-none">
              <div className="relative w-full max-w-lg aspect-video sm:aspect-square bg-slate-900 border border-slate-800 border-t-2 border-t-indigo-500 rounded-md overflow-hidden shadow-2xl flex flex-col">
                
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
                      <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 gap-2">
                        <div className="w-5 h-5 border-2 border-slate-700 border-t-slate-300 rounded-full animate-spin" />
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest animate-pulse">Waiting for remote stream...</span>
                      </div>
                    )}

                    {/* Local Picture-in-Picture Track */}
                    {localStream && (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-24 h-32 rounded-sm bg-slate-950 border border-slate-700 shadow-md object-cover absolute bottom-3 right-3 z-10 hover:scale-105 transition"
                      />
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                    <div className="h-16 w-16 rounded-sm bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 animate-pulse">
                      <PhoneCall size={28} />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      Customer
                    </h3>
                    <p className="text-[9px] font-mono font-bold text-indigo-400 tracking-wider">
                      {callStatus === "connecting" ? "CONNECTING SECURE SESSION..." : "CONNECTED SECURELY"}
                    </p>
                    {remoteStream && (
                      <audio ref={remoteVideoRef} autoPlay />
                    )}
                  </div>
                )}

                {/* Header calling stats overlay */}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-2.5 py-1 rounded-sm text-white text-[9px] font-mono font-bold tracking-wider uppercase">
                  <span className="h-1.5 w-1.5 rounded-xs bg-emerald-500 animate-pulse" />
                  <span>{callStatus === "connected" ? formatTime(callTime) : "Ringing..."}</span>
                </div>

                {/* Calling control panel */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-slate-900/90 backdrop-blur-sm border border-slate-800 px-3 py-1.5 rounded-sm shadow-2xl">
                  <button
                    onClick={toggleMic}
                    className={`h-8 w-8 rounded-sm flex items-center justify-center transition border-none cursor-pointer ${
                      isMicMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                    }`}
                  >
                    {isMicMuted ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>

                  {callType === "video" && (
                    <button
                      onClick={toggleVideo}
                      className={`h-8 w-8 rounded-sm flex items-center justify-center transition border-none cursor-pointer ${
                        isVideoMuted ? "bg-rose-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      {isVideoMuted ? <VideoOff size={14} /> : <Video size={14} />}
                    </button>
                  )}

                  <button
                    onClick={handleEndCall}
                    className="h-8 w-8 rounded-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center transition border-none cursor-pointer shadow-sm"
                  >
                    <X size={14} />
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
