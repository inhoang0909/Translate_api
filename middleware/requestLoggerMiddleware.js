import logger from "../services/loggerService.js";
export default function requestLoggerMiddleware(req, res, next) {
  res.on("finish", async () => {
    try {
      if (req.originalUrl === "/translate" || req.originalUrl.startsWith("/translate?")) {
        let ip = req.ip || req.connection.remoteAddress || "";
        if (ip.startsWith("::ffff:")) {
          ip = ip.substring(7);
        }

        const logData = {
          service: "translate-api-service",
          endpoint: req.originalUrl,
          method: req.method,
          status: res.statusCode,
          ip,
          date: new Date().toISOString().slice(0, 10),
          time: new Date(),
        };

        await logger.send(logData);
      }
    } catch (error) {
      console.error("Logging error:", error);
    }
  });

  next();
}
