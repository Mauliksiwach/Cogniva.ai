import os
import re
from typing import Optional

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".md"}

def sanitize_filename(filename: str) -> str:
    cleaned = re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)
    return cleaned[:100]

def is_valid_document(filename: str, content_type: Optional[str] = None) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS

# Backward compatibility alias
is_valid_pdf = is_valid_document
