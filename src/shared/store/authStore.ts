import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "tutor" | "student";

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole | null;
}

interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  isHydrated: boolean;
}

interface AuthStore extends AuthState {
  setUser: (user: AuthUser, role: UserRole) => void;
  clearUser: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      isHydrated: false,
      setUser: (user, role) => set({ user, role }),
      clearUser: () => set({ user: null, role: null }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
