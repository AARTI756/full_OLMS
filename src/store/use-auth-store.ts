'use client';

import { create } from "zustand";
import type { UserSession } from "@/types/auth";

interface AuthState {
  user: UserSession | null;
  isHydrated: boolean;
  setUser: (user: UserSession | null) => void;
  setHydrated: (isHydrated: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user }),
  setHydrated: (isHydrated) => set({ isHydrated }),
  clearUser: () => set({ user: null }),
}));
