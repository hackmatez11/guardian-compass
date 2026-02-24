"""
Supabase client configuration and initialization
Falls back to SUPABASE_SERVICE_KEY if SUPABASE_KEY is not set.
"""
from supabase import create_client, Client
from config.config import get_config

config = get_config()


class SupabaseClient:
    """Singleton class for Supabase client"""
    
    _instance: Client = None
    _service_instance: Client = None
    
    @classmethod
    def get_client(cls) -> Client:
        """Get Supabase client with anon key (falls back to service key)"""
        if cls._instance is None:
            # Use anon key if available, otherwise fall back to service key
            key = config.SUPABASE_KEY or config.SUPABASE_SERVICE_KEY
            if not key:
                raise ValueError(
                    "No Supabase key configured. Set SUPABASE_KEY or SUPABASE_SERVICE_KEY in backend/.env"
                )
            cls._instance = create_client(
                config.SUPABASE_URL,
                key
            )
        return cls._instance
    
    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role key (admin privileges)"""
        if cls._service_instance is None:
            key = config.SUPABASE_SERVICE_KEY
            if not key:
                raise ValueError(
                    "SUPABASE_SERVICE_KEY is not configured. Set it in backend/.env"
                )
            cls._service_instance = create_client(
                config.SUPABASE_URL,
                key
            )
        return cls._service_instance


# Export instances
supabase_client = SupabaseClient.get_client()
supabase_service_client = SupabaseClient.get_service_client()
