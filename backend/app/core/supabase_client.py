import os
from supabase import create_client, Client

# Reads Supabase configuration from environment variables.
# Expected variables (set in .env):
#   SUPABASE_URL – the URL of the Supabase project (e.g., https://xyz.supabase.co)
#   SUPABASE_SERVICE_KEY – the service_role key with full database access.
# The client is created once at import time and can be imported wherever needed.

_SUPABASE_URL = os.getenv("SUPABASE_URL")
_SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not _SUPABASE_URL or not _SUPABASE_SERVICE_KEY:
    raise RuntimeError(
        "Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_SERVICE_KEY in the environment."
    )

client: Client = create_client(_SUPABASE_URL, _SUPABASE_SERVICE_KEY)

def get_client() -> Client:
    """Return the initialized Supabase client.

    This indirection makes it easy to mock the client in tests.
    """
    return client
