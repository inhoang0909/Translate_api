import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const LOGGER_URL = process.env.LOGGER_URL || "http://0.0.0.0:4000/logs";

const logger = {
  async send(logData) {
    try {
      await axios.post(LOGGER_URL, logData, {
        headers: { "Content-Type": "application/json" },
        timeout: 2000,
      });
    } catch (err) {
      console.error("[LOGGER] Failed to send log:", err.message);
    }
  },
  log: (...args) => console.log("[LOG]", ...args),
  error: (...args) => console.error("[ERROR]", ...args),
};

export default logger;
