import logger from "../services/loggerService.js";

/**
 * Extract real client IP address
 * Handles proxies, load balancers, and Docker networking
 */
function getClientIp(req) {
  // 1. Check X-Forwarded-For header (most common for proxies/load balancers)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // The first one is the real client IP
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }

  // 2. Check X-Real-IP header (Nginx and some other proxies use this)
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }

  // 3. Check CF-Connecting-IP (if using Cloudflare)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp) {
    return cfIp;
  }

  // 4. Fallback to req.ip or connection remote address
  let ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '';

  // Remove IPv6 prefix if present
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // If still localhost/internal, try alternate sources
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('172.') || ip.startsWith('10.')) {
    return req.connection?.remoteAddress || 'unknown';
  }

  return ip || 'unknown';
}

export default function requestLoggerMiddleware(req, res, next) {
  res.on("finish", async () => {
    try {
      if (req.originalUrl === "/api/translate" || 
          req.originalUrl === "/api/translate-rag" || 
          req.originalUrl.startsWith("/api/translate?")) {
        
        const ip = getClientIp(req);

        const logData = {
          service: "translate-api-service",
          endpoint: req.originalUrl,
          method: req.method,
          status: res.statusCode,
          ip,
          date: new Date().toISOString().slice(0, 10),
          time: new Date(),
        };

        // await logger.send(logData);
      }
    } catch (error) {
      console.error("Logging error:", error);
    }
  });

  next();
}
