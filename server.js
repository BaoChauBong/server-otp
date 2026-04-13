// ===== IMPORT =====
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// ===== INIT =====
const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== MEMORY STORE =====
let otpList = [];

// ===== ROOT CHECK =====
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "OTP server is running 🚀"
  });
});

// ===== EXTRACT OTP =====
function extractOTP(text = "") {
  const match = text.match(/\d{6}/);
  return match ? match[0] : "";
}

// ===== RECEIVE OTP =====
app.post("/api/otp", (req, res) => {
  console.log("📩 Incoming OTP:", req.body);

  // lấy message linh hoạt
  const message =
    req.body.message ||
    req.body.sms ||
    req.body.text ||
    req.body.body ||
    JSON.stringify(req.body);

  const otp = extractOTP(message);

  const newOTP = {
    otp,
    message,
    sender: req.body.sender || "UNKNOWN",
    time: new Date().toISOString()
  };

  // lưu newest lên đầu
  otpList.unshift(newOTP);

  // broadcast realtime
  io.emit("new-otp", newOTP);

  res.json({
    success: true,
    otp
  });
});

// ===== GET OTP LIST =====
app.get("/api/otp", (req, res) => {
  res.json({
    success: true,
    data: otpList
  });
});

app.get("/view", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// ===== SOCKET =====
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.emit("init-otp", otpList);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});


// ===== START SERVER (IMPORTANT FOR RENDER) =====
const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});