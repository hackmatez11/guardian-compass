"""
Supabase client configuration and initialization
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
        """Get Supabase client with anon key"""
        if cls._instance is None:
            cls._instance = create_client(
                config.SUPABASE_URL,
                config.SUPABASE_KEY
            )
        return cls._instance
    
    @classmethod
    def get_service_client(cls) -> Client:
        """Get Supabase client with service role key (admin privileges)"""
        if cls._service_instance is None:
            cls._service_instance = create_client(
                config.SUPABASE_URL,
                config.SUPABASE_SERVICE_KEY
            )
        return cls._service_instance


# Export instances
supabase_client = SupabaseClient.get_client()
supabase_service_client = SupabaseClient.get_service_client()
