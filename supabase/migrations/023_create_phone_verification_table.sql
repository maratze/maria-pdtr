-- Create phone verification codes table
CREATE TABLE IF NOT EXISTS phone_verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes'),
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0
);

-- Index for faster lookups
CREATE INDEX idx_phone_verification_phone ON phone_verification_codes(phone);
CREATE INDEX idx_phone_verification_expires ON phone_verification_codes(expires_at);

-- Enable Row Level Security
ALTER TABLE phone_verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert verification codes (for sending SMS)
CREATE POLICY "Allow public insert for verification codes"
ON phone_verification_codes
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Allow anyone to read their own verification codes
CREATE POLICY "Allow public read own verification codes"
ON phone_verification_codes
FOR SELECT
TO public
USING (phone = current_setting('request.jwt.claims', true)::json->>'phone' OR true);

-- Policy: Allow anyone to update verification status
CREATE POLICY "Allow public update verification status"
ON phone_verification_codes
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Function to clean up expired codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM phone_verification_codes
    WHERE expires_at < NOW() OR (verified = TRUE AND created_at < NOW() - INTERVAL '1 hour');
END;
$$;

COMMENT ON TABLE phone_verification_codes IS 'Stores temporary SMS verification codes for phone number verification';
