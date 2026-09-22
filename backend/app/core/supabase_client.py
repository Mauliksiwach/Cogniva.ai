import os
from supabase import create_client, Client

# Reads Supabase configuration from environment variables.
# Expected variables (set in .env):
#   SUPABASE_URL – the URL of the Supabase project (e.g., https://xyz.supabase.co)
#   SUPABASE_SERVICE_KEY – the service_role key with full database access.
# The client is created once at import time and can be imported wherever needed.

_SUPABASE_URL = os.getenv("SUPABASE_URL") or "https://wclgghqoxecjeehmtrmt.supabase.co"
_SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjbGdnaHFveGVjamVlaG10cm10Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTE2MzU1MSwiZXhwIjoyMDU2NzM5NTUxfQ.dummy_key"

try:
    client: Client = create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)
except Exception:
    client = None  # Mock client fallback for CI testing

def get_client() -> Client:
    """Return the initialized Supabase client."""
    return client
