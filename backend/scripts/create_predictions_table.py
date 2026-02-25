"""
Script to create the predictions table in Supabase
Run this script to apply the missing migration
"""
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

from config.supabase import supabase_client

def create_predictions_table():
    """Create the predictions table and set up RLS policies"""
    
    # SQL to create the predictions table and set up RLS
    sql_statements = [
        """
        CREATE TABLE IF NOT EXISTS public.predictions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
            risk_score DECIMAL(5,2) NOT NULL,
            risk_level public.risk_level NOT NULL,
            confidence_score DECIMAL(5,2),
            predicted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            model_version TEXT,
            features JSONB,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        """,
        """
        ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
        """,
        """
        CREATE POLICY IF NOT EXISTS "Students can view their own predictions"
        ON public.predictions FOR SELECT
        USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()));
        """,
        """
        CREATE POLICY IF NOT EXISTS "Admins can view all predictions"
        ON public.predictions FOR SELECT
        USING (public.has_role(auth.uid(), 'admin'));
        """,
        """
        CREATE POLICY IF NOT EXISTS "Counselors can view all predictions"
        ON public.predictions FOR SELECT
        USING (public.has_role(auth.uid(), 'counselor'));
        """,
        """
        CREATE POLICY IF NOT EXISTS "Admins can insert predictions"
        ON public.predictions FOR INSERT
        WITH CHECK (public.has_role(auth.uid(), 'admin'));
        """,
        """
        CREATE POLICY IF NOT EXISTS "Counselors can insert predictions"
        ON public.predictions FOR INSERT
        WITH CHECK (public.has_role(auth.uid(), 'counselor'));
        """,
        """
        CREATE POLICY IF NOT EXISTS "Admins can update predictions"
        ON public.predictions FOR UPDATE
        USING (public.has_role(auth.uid(), 'admin'));
        """,
        """
        CREATE TRIGGER IF NOT EXISTS update_predictions_updated_at
        BEFORE UPDATE ON public.predictions
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
        """,
    ]
    
    try:
        # Use the Supabase client's RPC call or raw SQL execution
        # Since we're using the service role key, we should have permission to execute DDL
        from supabase import create_client
        
        supabase_url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not supabase_url or not service_key:
            print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
            return False
        
        # Create a new client with service role key for administrative operations
        admin_client = create_client(supabase_url, service_key)
        
        # Execute SQL statements through Supabase
        print("Creating predictions table...")
        
        # Use the RPC endpoint to execute raw SQL
        result = admin_client.rpc('exec_sql', {
            'sql_query': '\n'.join(sql_statements)
        }).execute()
        
        print("✓ Predictions table created successfully!")
        return True
        
    except Exception as e:
        print(f"Error creating table: {str(e)}")
        print("\nYou can manually create the table by running the SQL in the Supabase dashboard:")
        print("1. Go to https://app.supabase.com")
        print("2. Select your project")
        print("3. Go to SQL Editor")
        print("4. Create a new query and paste the following SQL:\n")
        print("\n".join(sql_statements))
        return False

if __name__ == '__main__':
    success = create_predictions_table()
    sys.exit(0 if success else 1)
