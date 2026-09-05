from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from secure import SecureHeaders

# Rate limiter: 100 requests per minute per IP
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])

# Security headers middleware
secure_headers = SecureHeaders()

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers.update(secure_headers.get_secure_headers())
        return response
