import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { createServer } from "http";
import { Server } from "socket.io";

import mainRouter from './routes/index.js'; 
import { notFound, errorHandler } from './middleware/error.middleware.js';

dotenv.config();
connectDB();


const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", mainRouter);

app.get("/", (req, res) => {
  res.send("Vlant API is running...");
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(" User connected", socket.id);
  socket.on("disconnect", () => console.log("User disconnected"));
});

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
