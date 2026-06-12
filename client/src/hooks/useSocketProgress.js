import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import useTryOnStore from "../store/tryOnStore";
import { backendUrl } from "../config";

const useSocketProgress = (userId) => {
  const socketRef = useRef(null);
  const { setStatus, setProgress, setMessage, setGeneratedImage, setError } = useTryOnStore();

  useEffect(() => {
    if (!userId) return;

    // Establish Socket.io connection
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to Socket.io server");
      // Join private user room
      socket.emit("join", userId);
    });

    socket.on("tryon_progress", (data) => {
      console.log("Try-on progress received:", data);
      setStatus(data.status);
      setProgress(data.progress);
      setMessage(data.message);
    });

    socket.on("tryon_completed", (data) => {
      console.log("Try-on completed:", data);
      setGeneratedImage(data.session.generatedImage);
      setMessage("Virtual Try-On completed successfully!");
    });

    socket.on("tryon_failed", (data) => {
      console.error("Try-on failed:", data);
      setError(data.error || "Generation pipeline encountered an error.");
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId, setStatus, setProgress, setMessage, setGeneratedImage, setError]);

  return socketRef.current;
};

export default useSocketProgress;
