// ===== IMPORT =====
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const twilio = require("twilio");

// ===== INIT =====
const app = express();
app.use(cors());
app.use(express.json());

// ===== TWILIO CONFIG =====
const client = twilio(
  process.env.ACCOUNT_SID,
  process.env.AUTH_TOKEN
);

const SERVICE_SID = process.env.SERVICE_SID;

// ===== ROOT =====
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    message: "Twilio OTP Server is running 🚀"
  });
});

// ===== SEND OTP =====
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Missing phone" });
  }

  try {
    const response = await client.verify.v2
      .services(SERVICE_SID)
      .verifications.create({
        to: phone,
        channel: "sms"
      });

    res.json({
      success: true,
      status: response.status
    });
  } catch (err) {
    console.error("❌ Send OTP error:", err.message);

    res.status(500).json({
      error: "Send OTP failed",
      detail: err.message
    });
  }
});

// ===== VERIFY OTP =====
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: "Missing phone or otp" });
  }

  try {
    const result = await client.verify.v2
      .services(SERVICE_SID)
      .verificationChecks.create({
        to: phone,
        code: otp
      });

    if (result.status === "approved") {
      return res.json({
        success: true,
        message: "✅ OTP correct"
      });
    } else {
      return res.status(400).json({
        error: "❌ OTP incorrect"
      });
    }
  } catch (err) {
    console.error("❌ Verify error:", err.message);

    res.status(500).json({
      error: "Verify failed",
      detail: err.message
    });
  }
});

// ===== START SERVER =====
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});