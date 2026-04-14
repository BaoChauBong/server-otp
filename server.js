// ===== IMPORT =====
const express = require("express");
const cors = require("cors");

// ===== INIT =====
const app = express();
app.use(cors());
app.use(express.json());

// ===== MEMORY STORE =====
let otpList = [];

// ===== ROOT =====
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "OTP API running 🚀"
  });
});

// ===== PARSE MESSAGE =====
function parseMessage(text = "") {
  // PASSWORD
  let match = text.match(/(?:MK|mat khau|password)[^0-9]*(\d{6,12})/i);
  if (match) {
    return {
      type: "PASSWORD",
      value: match[1]
    };
  }

  // OTP keyword
  match = text.match(/otp[^0-9]*(\d{4,8})/i);
  if (match) {
    return {
      type: "OTP",
      value: match[1]
    };
  }

  // fallback OTP 6 số
  match = text.match(/\b\d{6}\b/);
  if (match) {
    return {
      type: "OTP",
      value: match[0]
    };
  }

  // ALERT
  return {
    type: "ALERT",
    value: ""
  };
}

// ===== RECEIVE MESSAGE =====
app.post("/api/otp", (req, res) => {
  console.log("📩 Incoming:", req.body);

  const message =
    req.body.message ||
    req.body.sms ||
    req.body.text ||
    req.body.body ||
    JSON.stringify(req.body);

  const parsed = parseMessage(message);

  const newItem = {
    type: parsed.type,
    value: parsed.value,
    message,
    sender: req.body.sender || "UNKNOWN",
    time: new Date().toISOString()
  };

  otpList.unshift(newItem);

  res.json({
    success: true,
    data: newItem
  });
});

// ===== GET ALL =====
app.get("/api/otp", (req, res) => {
  res.json({
    success: true,
    data: otpList
  });
});

// ===== FILTER BY TYPE =====
app.get("/api/otp/type/:type", (req, res) => {
  const type = req.params.type.toUpperCase();

  const result = otpList.filter(item => item.type === type);

  res.json({
    success: true,
    data: result
  });
});

// ===== LẤY OTP MỚI NHẤT =====
app.get("/api/latest", (req, res) => {
  res.json({
    success: true,
    data: otpList[0] || null
  });
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});