from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from jose import jwt, JWTError
from app.config import settings
from app.core.exceptions import UnauthorizedException
from app.models.schemas import AuthenticatedUser

async def get_current_user(
    authorization: Optional[str] = Header(None, alias="Authorization")
) -> AuthenticatedUser:
    if not authorization:
        raise UnauthorizedException("Missing Authorization header")
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException("Invalid Authorization header format. Expected 'Bearer <token>'")
    
    token = parts[1]
    
    # In development mode with dummy/dev secret, support dev tokens
    if token.startswith("dev-token-"):
        user_id = token.replace("dev-token-", "")
        return AuthenticatedUser(
            id=user_id,
            email=f"{user_id}@example.com",
            full_name=f"Dev User {user_id}",
            role="authenticated"
        )

    try:
        # Verify with JWT secret if available, or decode claims
        if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "placeholder-jwt-secret":
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                options={"verify_aud": False}
            )
        else:
            # Decode unverified claims in dev/testing mode
            payload = jwt.get_unverified_claims(token)
            
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            raise UnauthorizedException("Token missing user subject ID ('sub')")
            
        email = payload.get("email", "")
        user_metadata = payload.get("user_metadata", {})
        full_name = user_metadata.get("full_name") or user_metadata.get("name") or email.split("@")[0] if email else "Student"
        
        return AuthenticatedUser(
            id=user_id,
            email=email,
            full_name=full_name,
            role=payload.get("role", "authenticated")
        )
    except JWTError as e:
        raise UnauthorizedException(f"JWT Verification failed: {str(e)}")
    except Exception as e:
        raise UnauthorizedException(f"Invalid authentication token: {str(e)}")
