import { prisma } from "@/prisma/client";
import { createAccessToken, createRefreshToken, hashToken, verifyHashedToken, type SessionUser } from "@/lib/auth";
import crypto from "crypto";

const PASSWORD_RESET_TOKEN_MINUTES = 15;

function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  phone: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await hashToken(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      hashedPassword,
      role: {
        connectOrCreate: {
          where: { name: "RECRUITER" },
          create: { name: "RECRUITER" },
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      departmentId: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    departmentId: user.departmentId,
    role: user.role.name,
  };
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      role: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  const valid = await verifyHashedToken(password, user.hashedPassword);
  if (!valid) {
    return null;
  }

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role.name,
    departmentId: user.departmentId,
  };

  return sessionUser;
}

export async function createUserTokens(user: SessionUser) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  const hashedRefresh = await hashToken(refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashedRefresh },
  });

  return { accessToken, refreshToken };
}

export async function generatePasswordResetToken(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't expose whether email exists
    return null;
  }

  // Generate a secure random token. Only a deterministic SHA-256 hash is stored,
  // so the emailed token is never saved in plain text and can be looked up quickly.
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashPasswordResetToken(token);
  
  // Reset links are intentionally short lived.
  const expiryTime = new Date(Date.now() + PASSWORD_RESET_TOKEN_MINUTES * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: expiryTime,
    },
  });

  // Return unhashed token for email link
  return token;
}

export async function verifyPasswordResetToken(token: string) {
  const hashedToken = hashPasswordResetToken(token);

  // Keep expired tokens from being reused and limit how many hashes we compare.
  await prisma.user.updateMany({
    where: {
      resetPasswordExpires: { lte: new Date() },
    },
    data: {
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });
}

export async function resetPassword(token: string, newPassword: string) {
  const user = await verifyPasswordResetToken(token);
  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  const hashedPassword = await hashToken(newPassword);
  const hashedToken = hashPasswordResetToken(token);

  // Consume the reset token in the same update that changes the password.
  // This keeps the token one-time even if the form is submitted twice quickly.
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { gt: new Date() },
    },
    data: {
      hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      refreshToken: null,
    },
  });

  if (result.count === 0) {
    throw new Error("Invalid or expired reset token");
  }

  return user;
}
