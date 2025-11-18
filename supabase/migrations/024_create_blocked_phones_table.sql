-- Create blocked phones table
CREATE TABLE IF NOT EXISTS blocked_phones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL UNIQUE,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_by VARCHAR(255)
);

-- Index for faster lookups
CREATE INDEX idx_blocked_phones_phone ON blocked_phones(phone);

-- Enable Row Level Security
ALTER TABLE blocked_phones ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users (admins) can read
CREATE POLICY "Allow authenticated read blocked phones"
ON blocked_phones
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only authenticated users (admins) can insert
CREATE POLICY "Allow authenticated insert blocked phones"
ON blocked_phones
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Only authenticated users (admins) can delete
CREATE POLICY "Allow authenticated delete blocked phones"
ON blocked_phones
FOR DELETE
TO authenticated
USING (true);

-- Function to check if phone is blocked
CREATE OR REPLACE FUNCTION is_phone_blocked(phone_number VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM blocked_phones 
        WHERE phone = phone_number
    );
END;
$$;

COMMENT ON TABLE blocked_phones IS 'Stores blocked phone numbers to prevent abuse';
COMMENT ON FUNCTION is_phone_blocked IS 'Check if a phone number is blocked';
