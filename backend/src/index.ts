import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRoute from "./routes/user.route";
import authRoute from "./routes/auth.route";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

io.on("connect", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("message", (msg) => {
    console.log(`Received message from ${socket.id}:`, msg);
    if (typeof msg === "string" && msg.trim().length > 0) {
      const message = {
        id: Date.now().toString(),
        content: msg,
        senderId: socket.id,
      };
      console.log(`Broadcasting message:`, message);
      io.emit("message", message);
    } else {
      console.log(`Invalid message from ${socket.id}:`, msg);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const cache = `products:page:${1}:limit:${5}`;
const cache1 = `product:${123}`;
