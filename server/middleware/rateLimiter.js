const rateLimit = (limit = 10, windowMs = 60 * 1000) => {
  const ipRequests = new Map();

  // Periodic cleanup interval to prevent memory leaks
  const interval = setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of ipRequests.entries()) {
      if (now > data.resetTime) {
        ipRequests.delete(ip);
      }
    }
  }, windowMs);

  // Unref the timer to prevent keeping the event loop alive
  if (interval.unref) {
    interval.unref();
  }

  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "anonymous";
    const now = Date.now();
    
    if (!ipRequests.has(ip)) {
      ipRequests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const data = ipRequests.get(ip);
    
    if (now > data.resetTime) {
      data.count = 1;
      data.resetTime = now + windowMs;
      return next();
    }

    if (data.count >= limit) {
      const retryAfter = Math.ceil((data.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${retryAfter} seconds.`
      });
    }

    data.count += 1;
    next();
  };
};

export default rateLimit;
