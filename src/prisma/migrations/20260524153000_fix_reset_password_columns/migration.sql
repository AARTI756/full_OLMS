-- The first password-reset migration used passwordReset* names while the Prisma
-- model uses resetPassword* names. Keep the database aligned with the model.
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordResetToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "passwordResetTokenExpiry";

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetPasswordToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetPasswordExpires" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_resetPasswordExpires_idx" ON "User"("resetPasswordExpires");
