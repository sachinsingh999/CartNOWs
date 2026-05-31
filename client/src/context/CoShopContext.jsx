import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CoShopContext = createContext();

export const useCoShop = () => {
  const context = useContext(CoShopContext);
  if (!context) {
    throw new Error("useCoShop must be used within a CoShopProvider");
  }
  return context;
};

export const CoShopProvider = ({ children }) => {
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [shopperId] = useState(() => `user-${Math.random().toString(36).substr(2, 9)}`);
  const [shopperName, setShopperName] = useState(() => localStorage.getItem("shopperName") || `Shopper ${Math.floor(Math.random() * 900) + 100}`);
  const [roomProducts, setRoomProducts] = useState([]);
  const [members, setMembers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  
  const channelRef = useRef(null);
  const navigate = useNavigate();

  // Avatar choices
  const avatarColors = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#3b82f6"];

  // Setup BroadcastChannel on Room Activation
  useEffect(() => {
    if (!activeRoomId) return;

    const channel = new BroadcastChannel(`coshop-room-${activeRoomId}`);
    channelRef.current = channel;

    // Local user details
    const localMember = {
      id: shopperId,
      name: shopperName,
      color: avatarColors[Math.abs(shopperId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % avatarColors.length],
    };

    // Join room locally immediately
    setMembers([localMember]);

    // Handle messages
    channel.onmessage = (event) => {
      const { type, data, member, message, productId, voteValue, fromId, memberId, newName } = event.data;

      switch (type) {
        case "JOIN":
          // Add the newly joined member
          setMembers((prev) => {
            if (prev.some((m) => m.id === member.id)) return prev;
            return [...prev, member];
          });
          
          // Send current state back to the new member outside of the functional setstate
          channel.postMessage({
            type: "SYNC_STATE",
            toId: member.id,
            data: {
              roomProducts: getLatestProducts(),
              chatMessages: getLatestChat(),
              members: [...getLatestMembers(), member], // send updated list
            },
          });
          break;

        case "SYNC_STATE":
          if (event.data.toId === shopperId) {
            if (data.roomProducts) setRoomProducts(data.roomProducts);
            if (data.chatMessages) setChatMessages(data.chatMessages);
            if (data.members) {
              setMembers((prev) => {
                const merged = [...prev];
                data.members.forEach((m) => {
                  if (!merged.some((existing) => existing.id === m.id)) {
                    merged.push(m);
                  }
                });
                return merged;
              });
            }
          }
          break;

        case "SUGGEST_PRODUCT":
          setRoomProducts((prev) => {
            if (prev.some((item) => item.product._id === data._id)) return prev;
            return [...prev, { product: data, votes: {}, suggestedBy: member.name }];
          });
          toast.info(`${member.name} suggested: ${data.name.split(" ")[0]}`);
          break;

        case "VOTE":
          setRoomProducts((prev) =>
            prev.map((item) => {
              if (item.product._id === productId) {
                const newVotes = { ...item.votes, [fromId]: voteValue };
                if (voteValue === 0) delete newVotes[fromId];
                return { ...item, votes: newVotes };
              }
              return item;
            })
          );
          break;

        case "CHAT":
          setChatMessages((prev) => [...prev, message]);
          break;

        case "NAME_CHANGE":
          setMembers((prev) => 
            prev.map((m) => m.id === memberId ? { ...m, name: newName } : m)
          );
          setChatMessages((prev) => 
            prev.map((msg) => msg.senderId === memberId ? { ...msg, sender: newName } : msg)
          );
          break;

        case "LEAVE":
          setMembers((prev) => prev.filter((m) => m.id !== fromId));
          break;

        default:
          break;
      }
    };

    // Helper functions to escape stale state closures
    const getLatestProducts = () => {
      let val;
      setRoomProducts((p) => { val = p; return p; });
      return val;
    };
    const getLatestChat = () => {
      let val;
      setChatMessages((c) => { val = c; return c; });
      return val;
    };
    const getLatestMembers = () => {
      let val;
      setMembers((m) => { val = m; return m; });
      return val;
    };

    // Broadcast JOIN event to notify others (using a short delay to guarantee connection is fully established)
    const joinTimer = setTimeout(() => {
      channel.postMessage({
        type: "JOIN",
        member: localMember,
      });
    }, 200);

    return () => {
      clearTimeout(joinTimer);
      channel.postMessage({ type: "LEAVE", fromId: shopperId });
      channel.close();
      setMembers([]);
      setRoomProducts([]);
      setChatMessages([]);
    };
  }, [activeRoomId]);

  // Sync nickname changes with local storage and broadcast to others
  useEffect(() => {
    localStorage.setItem("shopperName", shopperName);
    
    if (activeRoomId && channelRef.current) {
      setMembers((prev) => 
        prev.map((m) => m.id === shopperId ? { ...m, name: shopperName } : m)
      );
      
      channelRef.current.postMessage({
        type: "NAME_CHANGE",
        memberId: shopperId,
        newName: shopperName,
      });
    }
  }, [shopperName, activeRoomId, shopperId]);

  // Actions
  const createRoom = () => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    setActiveRoomId(roomId);
    navigate(`/coshop/${roomId}`);
    toast.success(`Welcome to Co-Shop Room: ${roomId}`);
  };

  const joinRoomById = (roomId) => {
    setActiveRoomId(roomId);
    navigate(`/coshop/${roomId}`);
    toast.success(`Joined room: ${roomId}`);
  };

  const suggestProduct = (product) => {
    if (!activeRoomId) {
      toast.warning("Start or join a Co-Shop Room first!");
      return;
    }
    if (roomProducts.some((item) => item.product._id === product._id)) {
      toast.info("Product is already suggested in the room");
      return;
    }

    const payload = {
      product,
      votes: {},
      suggestedBy: shopperName,
    };

    setRoomProducts((prev) => [...prev, payload]);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "SUGGEST_PRODUCT",
        data: product,
        member: { name: shopperName },
      });
    }
    toast.success("Suggested to co-shopping board");
  };

  const toggleVote = (productId, val) => {
    setRoomProducts((prev) =>
      prev.map((item) => {
        if (item.product._id === productId) {
          const currentVote = item.votes[shopperId];
          const newVoteVal = currentVote === val ? 0 : val;
          const updatedVotes = { ...item.votes, [shopperId]: newVoteVal };
          if (newVoteVal === 0) delete updatedVotes[shopperId];

          if (channelRef.current) {
            channelRef.current.postMessage({
              type: "VOTE",
              productId,
              voteValue: newVoteVal,
              fromId: shopperId,
            });
          }

          return { ...item, votes: updatedVotes };
        }
        return item;
      })
    );
  };

  const sendChatMessage = (text) => {
    if (!text.trim()) return;

    const messagePayload = {
      senderId: shopperId,
      sender: shopperName,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, messagePayload]);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: "CHAT",
        message: messagePayload,
      });
    }
  };

  const leaveRoom = () => {
    setActiveRoomId(null);
    navigate("/");
    toast.info("Left the co-shopping room");
  };

  return (
    <CoShopContext.Provider
      value={{
        activeRoomId,
        shopperId,
        shopperName,
        setShopperName,
        roomProducts,
        members,
        chatMessages,
        createRoom,
        joinRoomById,
        suggestProduct,
        toggleVote,
        sendChatMessage,
        leaveRoom,
      }}
    >
      {children}
    </CoShopContext.Provider>
  );
};
