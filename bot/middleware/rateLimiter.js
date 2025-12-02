/**
 * Simple in-memory rate limiter middleware
 * For production, consider using Redis-based rate limiting
 */

class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  /**
   * Create rate limiting middleware
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Function} Express middleware
   */
  createMiddleware(maxRequests = 10, windowMs = 60000) {
    return (req, res, next) => {
      // Use IP address as identifier
      const identifier = req.ip || req.connection.remoteAddress;
      
      const now = Date.now();
      const userRequests = this.requests.get(identifier) || [];
      
      // Remove expired requests
      const recentRequests = userRequests.filter(
        time => now - time < windowMs
      );
      
      // Check if limit exceeded
      if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please try again later.'
          }
        });
      }
      
      // Add current request
      recentRequests.push(now);
      this.requests.set(identifier, recentRequests);
      
      // Clean up old entries periodically
      if (Math.random() < 0.01) {
        this.cleanup(windowMs);
      }
      
      next();
    };
  }

  /**
   * Clean up expired entries
   * @param {number} windowMs - Time window in milliseconds
   */
  cleanup(windowMs) {
    const now = Date.now();
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => now - time < windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }

  /**
   * Clear all rate limit data
   */
  reset() {
    this.requests.clear();
  }
}

// Create singleton instance
const rateLimiter = new RateLimiter();

module.exports = {
  rateLimiter,
  authLimiter: rateLimiter.createMiddleware(5, 60000), // 5 requests per minute for auth
  apiLimiter: rateLimiter.createMiddleware(100, 60000) // 100 requests per minute for API
};
