-- Index the hashed reset token so password reset verification can find the
-- matching account without scanning every user.
CREATE INDEX IF NOT EXISTS "User_resetPasswordToken_idx" ON "User"("resetPasswordToken");
