"use client";
import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

function Chat() {
  const [messages, setMessages] = useState<
    { id: string; content: string; senderId: string }[]
  >([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLUListElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Initialize Socket.IO
  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io("http://localhost:5000", {
      reconnectionAttempts: 5, //Failed 5 time ? => connect_error
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setIsConnected(true);
      setError("");
      console.log("Connected to server:", socket.id);
    });

    socket.on(
      "message",
      (msg: { id: string; content: string; senderId: string }) => {
        console.log("Received message:", msg);
        setMessages((prevMessages) => {
          if (prevMessages.some((m) => m.id === msg.id)) return prevMessages;
          return [...prevMessages, msg];
        });
      }
    );

    //If he failed to connect for the fifth time
    socket.on("connect_error", (err) => {
      setIsConnected(false);
      setError(`Connection error: ${err.message}`);
      console.log("Connection error:", err.message);
    });

    socket.on("reconnect", (attempt) => {
      console.log(`Reconnected to server after ${attempt} attempts`);
      setIsConnected(true);
      setError("");
    });

    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("message");
      socket.off("connect_error");
      socket.off("reconnect");
    };
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  const handleMessage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setError("");
  };

  const handleSend = () => {
    if (message.trim().length === 0) {
      setError("Message must be at least 1 character");
      return;
    }
    if (socketRef.current && socketRef.current.connected) {
      console.log("Sending message:", message);
      socketRef.current.emit("message", message);
      setMessage("");
      setError("");
    } else {
      setError("Not connected to server");
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-w-lg w-full mx-auto bg-white rounded-lg shadow-lg overflow-hidden sm:max-w-md">
      <h1 className="bg-blue-600 text-white text-center text-xl font-medium p-4 sm:text-lg">
        Socket.io Chat
      </h1>
      {!isConnected && (
        <p className="mx-5 mb-2 p-2 text-yellow-800 bg-yellow-100 rounded text-center text-sm">
          Connecting to server...
        </p>
      )}
      {error && (
        <p className="mx-5 mb-2 p-2 text-red-800 bg-red-100 rounded text-center text-sm">
          {error}
        </p>
      )}
      <ul
        ref={messagesEndRef}
        className="flex-1 list-none p-5 overflow-y-auto bg-gray-50"
      >
        {messages.length === 0 && (
          <li className="text-center text-gray-500">No messages yet</li>
        )}
        {messages.map((msg) => (
          <li
            key={msg.id}
            className={`mb-2 p-3 rounded-2xl max-w-[70%] break-words text-base leading-relaxed ${
              msg.senderId === socketRef.current?.id
                ? "ml-auto bg-blue-100 text-blue-900"
                : "mr-auto bg-gray-200 text-gray-900"
            }`}
          >
            {msg.content}
          </li>
        ))}
      </ul>
      <div className="flex p-4 border-t border-gray-200 gap-2">
        <Input
          value={message}
          onChange={handleMessage}
          placeholder="Type a message..."
          className="flex-1 p-2 text-base rounded-full border-gray-300 focus:border-blue-500 sm:text-sm"
          disabled={!isConnected}
        />
        <Button
          disabled={!!error || !isConnected}
          onClick={handleSend}
          className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-400 sm:text-sm sm:px-4"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

export default Chat;

