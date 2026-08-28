import os
import re
from typing import Optional

ALLOWED_EXTENSIONS = {".pdf"}
ALLOWED_MIME_TYPES = {"application/pdf"}

def sanitize_filename(filename: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    return cleaned[:100]

def is_valid_pdf(filename: str, content_type: Optional[str] = None) -> bool:
    _, ext = os.path.splitext(filename.lower())
    if ext not in ALLOWED_EXTENSIONS:
        return False
    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES:
        return False
    return True
