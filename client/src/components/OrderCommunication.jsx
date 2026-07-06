import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import io from "socket.io-client";
import { backendUrl } from "../config";
import { MessageSquare, Phone, Send, ShieldCheck, X, ChevronDown, ChevronUp, Clock, User, PhoneCall, Volume2, VolumeX, Video, VideoOff, Mic, MicOff, PhoneOff, Paperclip, Lock } from "lucide-react";
import { toast } from "react-toastify";

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

const OrderCommunication = ({ orderId }) => {
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("delivery"); // "delivery" | "support"
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  // Call state & FSM
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

  const isOpenRef = useRef(isOpen);
  const statusRef = useRef(status);
  
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

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const token = localStorage.getItem("token") || "";

  // 1. Fetch communication permissions status
  const fetchStatus = async () => {
    if (!token) return;
    try {
      const response = await axios.get(
        `${backendUrl}/api/order-communication/${orderId}/status`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setStatus(response.data);
      }
    } catch (error) {
      console.error("Error fetching communication status:", error);
    }
  };

  // 2. Fetch paginated messages
  const fetchMessages = async (pageNum = 1, append = false) => {
    if (!token) return;
    try {
      setLoadingMessages(true);
      const response = await axios.get(
        `${backendUrl}/api/order-communication/${orderId}/messages?page=${pageNum}&limit=15`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const fetched = response.data.messages || [];
        setMessages((prev) => mergeAndDeduplicate(prev, fetched));
        setHasMore(response.data.total > pageNum * 15);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching room messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // 3. Connect Socket.IO room with JWT authentication
  useEffect(() => {
    fetchStatus();
  }, [orderId]);

  useEffect(() => {
    if (!token || !orderId) return;

    const myId = getUserIdFromToken(token);

    // Connect to backend Socket
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
      // Mark messages as seen since we just joined/rejoined
      socket.emit("mark_seen", { orderId });
    });

    socket.on("room_error", (err) => {
      console.error(`[ROOM JOIN FAILURE] Socket room connection error: ${err.message}`);
      toast.error(err.message || "Failed to join communication channel.");
    });

    socket.on("receive_message", (msg) => {
      console.log("🔥 RECEIVE_MESSAGE EVENT (Customer Client)");
      console.log(msg);
      setMessages((prev) => mergeAndDeduplicate(prev, [msg]));
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

        // Emit mark_seen immediately if panel is open
        if (isOpenRef.current) {
          socket.emit("mark_seen", { orderId });
        } else {
          // Toast notification if chat panel is not open
          toast.info(`Message from ${msg.senderRole.toUpperCase()}: ${msg.message}`, {
            position: "bottom-right",
            autoClose: 5000,
            onClick: () => setIsOpen(true)
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
        setMessages((prev) =>
          prev.map((m) => {
            const isMeMsg = m.senderId === myId || (status?.customerId && m.senderId === status.customerId);
            if (isMeMsg) {
              return { ...m, status: "seen" };
            }
            return m;
          })
        );
      }
    });

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
      toast.warning("Delivery agent is currently on another call.");
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
      fetchMessages(1, false);
    });

    socket.on("new_notification", (notif) => {
      // Avoid duplicate toasts for text messages (already handled by receive_message)
      if (notif.type === "message") return;

      toast.info(`${notif.senderName}: ${notif.message}`, {
        position: "bottom-right",
        autoClose: 3000
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  // Load initial messages on expand
  useEffect(() => {
    if (isOpen) {
      fetchMessages(1, false);
      if (socketRef.current) {
        socketRef.current.emit("mark_seen", { orderId });
      }
      setTimeout(scrollToBottom, 300);
    }
  }, [isOpen]);

  // Symmetrical call timer is now managed in connection callback

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit("typing", { orderId, isTyping: true });
      
      if (typingTimeout) clearTimeout(typingTimeout);
      
      const timeout = setTimeout(() => {
        socketRef.current.emit("typing", { orderId, isTyping: false });
      }, 1500);
      
      setTypingTimeout(timeout);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    if (socketRef.current) {
      socketRef.current.emit("typing", { orderId, isTyping: false });
      if (typingTimeout) clearTimeout(typingTimeout);
    }

    try {
      setSending(true);
      
      // Determine recipient role
      let receiverRole = "deliveryman";
      if (status.role === "customer") {
        receiverRole = activeTab === "delivery" ? "deliveryman" : "seller";
      } else if (status.role === "seller") {
        receiverRole = activeTab === "delivery" ? "deliveryman" : "customer";
      } else if (status.role === "deliveryman") {
        receiverRole = activeTab === "delivery" ? "customer" : "seller";
      }

      const response = await axios.post(
        `${backendUrl}/api/order-communication/${orderId}/message`,
        { receiverRole, message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNewMessage("");
        scrollToBottom();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to transmit message.");
    } finally {
      setSending(false);
    }
  };

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
      if (callStateRef.current !== "idle") {
        const partnerId = statusRef.current?.role === "customer" ? statusRef.current?.deliverymanId : statusRef.current?.customerId;
        if (partnerId) {
          socketRef.current.emit("end_call", {
            to: partnerId,
            orderId,
          });
        }
      }
      if (incomingCallRef.current && incomingCallDataRef.current) {
        socketRef.current.emit("call_rejected", {
          to: incomingCallDataRef.current.from,
          orderId,
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
    }, 30000); // 30 seconds ringing timeout
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
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice_candidate", {
          candidate: event.candidate,
          to: partnerId,
          orderId,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state changed: ${pc.connectionState}`);
      if (pc.connectionState === "connected") {
        transitionTo("connected");
        if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current);
        
        setCallTime(0);
        if (callTimerIntervalRef.current) clearInterval(callTimerIntervalRef.current);
        callTimerIntervalRef.current = setInterval(() => {
          setCallTime((prev) => prev + 1);
        }, 1000);

        axios.patch(
          `${backendUrl}/api/order-communication/${orderId}/call/${cId}/status`,
          { status: "connected" },
          { headers: { Authorization: `Bearer ${token}` } }
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
    if (status?.locked) return;
    if (status.role === "customer" && !status.canCallDeliveryman) {
      return toast.error("Calling is only allowed when order is Out For Delivery!");
    }
    
    try {
      transitionTo("calling");
      setCallTime(0);
      setCallType(type);
      enumerateDevices();

      const receiverRole = status.role === "customer" ? "deliveryman" : "customer";

      const response = await axios.post(
        `${backendUrl}/api/order-communication/${orderId}/call`,
        { receiverRole, type },
        { headers: { Authorization: `Bearer ${token}` } }
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

      const partnerId = status.role === "customer" ? status.deliverymanId : status.customerId;
      const pc = createPeerConnection(stream, partnerId, type, callId);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current.emit("call_user", {
        offer,
        to: partnerId,
        orderId,
        type,
        callId,
        callerName: "Customer"
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
    if (!incomingCallData) return;
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
        orderId,
      });

      await axios.patch(
        `${backendUrl}/api/order-communication/${orderId}/call/${incomingCallData.callId}/status`,
        { status: "connected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("[WebRTC Accept Call Error]", error);
      toast.error("Could not accept call: camera/microphone access denied.");
      handleRejectCall();
    }
  };

  const handleRejectCall = async () => {
    if (!incomingCallData) return;
    try {
      setIncomingCall(false);
      socketRef.current.emit("call_rejected", {
        to: incomingCallData.from,
        orderId,
      });

      await axios.patch(
        `${backendUrl}/api/order-communication/${orderId}/call/${incomingCallData.callId}/status`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error("[WebRTC Reject Call Error]", error);
    } finally {
      setIncomingCallData(null);
    }
  };

  const handleEndCall = () => {
    const partnerId = status?.role === "customer" ? status?.deliverymanId : status?.customerId;
    handleEndCallLocally("completed", currentCallId, partnerId);
  };

  const handleEndCallLocally = async (finalStatus = "completed", cId, partnerId) => {
    if (socketRef.current && partnerId) {
      socketRef.current.emit("end_call", {
        to: partnerId,
        orderId,
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
    if (activeCId) {
      try {
        await axios.patch(
          `${backendUrl}/api/order-communication/${orderId}/call/${activeCId}/status`,
          { status: finalStatus, duration: callTime },
          { headers: { Authorization: `Bearer ${token}` } }
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

  if (!status) return null;

  // Render widget if user has permission OR if there are already historical messages to inspect
  const hasActivePermission = status.canChatCustomer || status.canChatDeliveryman || status.canChatSeller;
  if (!hasActivePermission && messages.length === 0 && !status.locked) {
    return null;
  }

  return (
    <div className="border border-slate-200/50 dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-950 overflow-hidden flex flex-col h-[490px] shadow-lg shadow-slate-100 dark:shadow-none select-none shrink-0 transition-all duration-300">
      
      {/* 1. Header with details & call stub */}
      <div className="bg-linear-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white px-4.5 py-3.5 flex justify-between items-center shrink-0 shadow-md shadow-indigo-900/5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className={status.locked ? "text-slate-400" : "text-emerald-400 animate-pulse"} />
          <div className="text-left">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider leading-none">
              {status.locked ? "Chat Channel Closed" : "Secure Chat Channel"}
            </h4>
            <p className="text-[9px] text-indigo-200/70 font-medium mt-0.5">
              {status.locked ? "Archived (Read Only)" : "Encrypted & secure"}
            </p>
          </div>
        </div>

        {/* Integrated Call Trigger */}
        {!status.locked && status.canCallDeliveryman && (
          <div className="relative animate-fade-in">
            <button
              onClick={() => setCallDropdownOpen(!callDropdownOpen)}
              className="px-4 py-1.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 cursor-pointer border-none shadow-sm transition active:scale-95 shrink-0"
            >
              <Phone size={12} />
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
                  <Phone size={12} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Voice Call</span>
                </button>
                <button
                  onClick={() => {
                    setCallDropdownOpen(false);
                    handleInitiateCall("video");
                  }}
                  className="w-full px-3 py-2 text-left text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer border-none bg-transparent"
                >
                  <Video size={12} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Video Call</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>


      {/* 3. Delivery Partner / Support Executive Status Card */}
      {!status.locked && (
        <div className="flex items-center gap-3 px-4.5 py-2.5 bg-slate-50/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-900 shrink-0">
          {/* Circular Avatar */}
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-[#4f46e5] dark:text-indigo-400 font-black text-xs uppercase border border-indigo-100/50 dark:border-indigo-900/30">
              {(activeTab === "delivery" ? status.deliverymanName : status.sellerName)?.charAt(0) || "P"}
            </div>
            {/* Online indicator dot */}
            <span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950 ${partnerOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-700"}`} />
          </div>

          {/* Partner Details */}
          <div className="flex-1 text-left min-w-0">
            <h5 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate uppercase tracking-wide flex items-center gap-1.5">
              <span>{activeTab === "delivery" ? status.deliverymanName : status.sellerName}</span>
              <span className="text-[8px] bg-slate-100 dark:bg-slate-900 text-slate-450 dark:text-slate-500 font-bold px-1.5 py-0.5 rounded-md tracking-wider uppercase border border-slate-205 dark:border-slate-800/40">
                {activeTab === "delivery" ? "Delivery Executive" : "Support"}
              </span>
            </h5>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`h-1.5 w-1.5 rounded-full ${partnerOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
              <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                {partnerOnline ? "Active now" : "Offline"}
              </span>
            </div>
          </div>

          {/* Typing status */}
          {partnerTyping && (
            <span className="text-[#4f46e5] dark:text-indigo-400 text-[10px] font-extrabold animate-pulse lowercase select-none">typing...</span>
          )}
        </div>
      )}

      {/* 4. Messages scroll container */}
      <div ref={messagesContainerRef} className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/20">
        {hasMore && (
          <button
            onClick={() => fetchMessages(page + 1, true)}
            disabled={loadingMessages}
            className="w-full text-center py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-[9px] font-extrabold uppercase text-slate-500 rounded-lg cursor-pointer border-none"
          >
            {loadingMessages ? "Retrieving..." : "Load previous messages"}
          </button>
        )}

        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-350 dark:text-slate-700 p-4">
            <MessageSquare size={20} className="stroke-1.5 mb-2 text-indigo-400 animate-pulse" />
            <p className="text-[10px] font-extrabold uppercase tracking-wider">Start a secure conversation</p>
          </div>
        ) : (
          messages.map((m) => {
            const myId = getUserIdFromToken(token);
            const isMe = myId && String(m.senderId) === String(myId);
            const isSystemMsg = m.message && m.message.startsWith("[System]");

            if (isSystemMsg) {
              const displayMsg = m.message.replace("[System] ", "");
              return (
                <div key={m._id} className="flex justify-center my-3 animate-fade-in">
                  <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 rounded-full px-3.5 py-1 text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shadow-xs flex items-center gap-1.5 select-none">
                    {m.message.toLowerCase().includes("video") ? <Video size={10} /> : <Phone size={10} />}
                    <span>{displayMsg}</span>
                  </div>
                </div>
              );
            }

            return (
              <div key={m._id} className={`flex flex-col space-y-0.5 ${isMe ? "items-end" : "items-start"} animate-fade-in`}>
                <div className="flex items-center gap-1 px-1 text-[8px] font-bold tracking-wider text-slate-455 dark:text-slate-500 uppercase">
                  <span>{m.senderName}</span>
                  <span className="text-[7px] text-slate-350 dark:text-slate-650">({m.senderRole})</span>
                </div>
                <div
                  className={`max-w-[72%] rounded-2xl px-3.5 py-2 text-xs font-semibold leading-relaxed shadow-sm transition ${
                    isMe
                      ? "bg-linear-to-br from-indigo-500 to-[#4f46e5] text-white rounded-tr-none"
                      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-800/80"
                  }`}
                >
                  {m.message}
                </div>
                
                <div className="flex items-center gap-1 px-1.5 mt-0.5 text-[7px] text-slate-400 font-bold select-none">
                  <span>
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isMe && (
                    <span className="text-[8px] leading-none">
                      {m.status === "seen" ? (
                        <span className="text-[#4f46e5] dark:text-indigo-400 font-black">✓✓</span>
                      ) : m.status === "delivered" ? (
                        <span className="text-slate-400 font-black">✓✓</span>
                      ) : (
                        <span className="text-slate-400">✓</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 5. Input Form & Footer Lock */}
      {status.locked ? (
        <div className="bg-slate-100 dark:bg-slate-900/60 p-4 text-center text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-col items-center justify-center gap-1.5">
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
              value={newMessage}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-[#4f46e5] focus:ring-1 focus:ring-[#4f46e5] transition"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="h-8 w-8 rounded-xl bg-[#4f46e5] text-white flex items-center justify-center hover:bg-[#4338ca] active:scale-95 disabled:bg-slate-100 disabled:dark:bg-slate-900 disabled:text-slate-400 transition cursor-pointer border-none shrink-0 shadow-sm"
            >
              <Send size={12} className="fill-current text-white" />
            </button>
          </form>

          {/* Centered Lock Footer */}
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
            <Lock size={10} className="text-slate-400" />
            <span>
              Only you and your {activeTab === "delivery" ? "delivery partner" : "seller partner"} can see these messages.
            </span>
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
                      {status.role === "customer" ? "Delivery Partner" : "Customer"}
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

export default OrderCommunication;
