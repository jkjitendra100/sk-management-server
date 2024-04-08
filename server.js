import app from "./app.js";
import dotenv from "dotenv";
import connectDb from "./config/database.js";
import { Server } from "socket.io";
import { createServer } from "node:http";
import Razorpay from "razorpay";

// Config
dotenv.config({ path: "config/config.env" });

// Connecting to database
connectDb();

// Razorpay instance
export const razorPayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Integrate socket.io for chat module
const server = createServer(app);
const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  // console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    if (userData) {
      socket.join(userData?.user[0]?._id);
      socket.emit("connected");
    }
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    // console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    // console.log(newMessageRecieved);
    var chat = newMessageRecieved.chatId;

    if (!chat?.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user == newMessageRecieved.senderId._id) return;

      socket.in(user).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

// Uncaught promise rejection
process.on("uncaughtException", (err) => {
  console.log(err.message);
  console.log(
    "Shutting down the server due to uncaught exception: " + err.message
  );

  server.close(() => {
    process.exit(1);
  });
});

// Listening the app
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(err.message);
  console.log(
    "Shutting down the server due to unhandledRejection exception: " +
      err.message
  );

  server.close(() => {
    process.exit(1);
  });
});
