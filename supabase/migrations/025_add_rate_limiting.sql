-- Add rate limiting table to track SMS sends and prevent abuse
CREATE TABLE IF NOT EXISTS sms_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45), -- IPv4 or IPv6
    user_agent TEXT
);

-- Indexes for faster lookups
CREATE INDEX idx_sms_rate_limits_phone ON sms_rate_limits(phone);
CREATE INDEX idx_sms_rate_limits_sent_at ON sms_rate_limits(sent_at);
CREATE INDEX idx_sms_rate_limits_ip ON sms_rate_limits(ip_address);

-- Enable Row Level Security
ALTER TABLE sms_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public insert (we'll check limits in the application)
CREATE POLICY "Allow public insert for rate limits"
ON sms_rate_limits
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Allow public read for checking limits
CREATE POLICY "Allow public read rate limits"
ON sms_rate_limits
FOR SELECT
TO public
USING (true);

-- Function to check if phone can send SMS (rate limiting)
CREATE OR REPLACE FUNCTION can_send_sms(
    phone_number VARCHAR,
    max_per_hour INTEGER DEFAULT 3,
    max_per_day INTEGER DEFAULT 10
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    count_hour INTEGER;
    count_day INTEGER;
BEGIN
    -- Check sends in last hour
    SELECT COUNT(*) INTO count_hour
    FROM sms_rate_limits
    WHERE phone = phone_number
    AND sent_at > NOW() - INTERVAL '1 hour';
    
    -- Check sends in last 24 hours
    SELECT COUNT(*) INTO count_day
    FROM sms_rate_limits
    WHERE phone = phone_number
    AND sent_at > NOW() - INTERVAL '24 hours';
    
    RETURN count_hour < max_per_hour AND count_day < max_per_day;
END;
$$;

-- Function to check if phone has too many bookings
CREATE OR REPLACE FUNCTION check_booking_abuse(
    phone_number VARCHAR,
    max_active_bookings INTEGER DEFAULT 3,
    max_bookings_per_day INTEGER DEFAULT 3
)
RETURNS TABLE(
    is_suspicious BOOLEAN,
    active_bookings_count INTEGER,
    today_bookings_count INTEGER,
    reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    active_count INTEGER;
    today_count INTEGER;
BEGIN
    -- Count active bookings (pending or confirmed) with slot_date >= today
    SELECT COUNT(*) INTO active_count
    FROM bookings b
    INNER JOIN time_slots ts ON b.slot_id = ts.id
    WHERE b.client_phone = phone_number
    AND b.status IN ('pending', 'confirmed')
    AND ts.slot_date >= CURRENT_DATE;
    
    -- Count bookings created today
    SELECT COUNT(*) INTO today_count
    FROM bookings
    WHERE client_phone = phone_number
    AND created_at > CURRENT_DATE;
    
    -- Return results
    is_suspicious := active_count >= max_active_bookings OR today_count >= max_bookings_per_day;
    active_bookings_count := active_count;
    today_bookings_count := today_count;
    
    IF active_count >= max_active_bookings THEN
        reason := format('Слишком много активных записей (%s)', active_count);
    ELSIF today_count >= max_bookings_per_day THEN
        reason := format('Слишком много записей за сегодня (%s)', today_count);
    ELSE
        reason := NULL;
    END IF;
    
    RETURN NEXT;
END;
$$;

-- Function to clean up old rate limit records (run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM sms_rate_limits
    WHERE sent_at < NOW() - INTERVAL '7 days';
END;
$$;

COMMENT ON TABLE sms_rate_limits IS 'Tracks SMS sends for rate limiting and abuse prevention';
COMMENT ON FUNCTION can_send_sms IS 'Check if a phone number can send SMS based on rate limits';
COMMENT ON FUNCTION check_booking_abuse IS 'Check if a phone number shows suspicious booking patterns';
COMMENT ON FUNCTION cleanup_old_rate_limits IS 'Clean up old rate limit records (run periodically)';
