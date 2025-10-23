import { Request, Response, NextFunction } from 'express';

/**
 * Simple history API fallback middleware for SPAs using HTML5 History API.
 * Serves index.html for requests that don't match API routes or static files.
 *
 * This replaces connect-history-api-fallback to avoid Node.js url.parse() deprecation warnings.
 */
export function historyApiFallback() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only handle GET and HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    // Skip if request is for an API endpoint
    if (req.path.startsWith('/api/')) {
      return next();
    }

    // Skip if request is for images
    if (req.path.startsWith('/images/')) {
      return next();
    }

    // Skip if the path has a file extension (e.g., .js, .css, .png)
    const hasFileExtension = /\.[^/]+$/.test(req.path);
    if (hasFileExtension) {
      return next();
    }

    // Check if request accepts HTML
    const acceptsHtml = req.accepts('html');
    if (!acceptsHtml) {
      return next();
    }

    // Rewrite the URL to /index.html for SPA routing
    req.url = '/index.html';
    next();
  };
}
