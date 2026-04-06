import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'user' | 'institute' | null;

interface RoleState {
  role: Role;
  setRole: (role: Role) => void;
  clearRole: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
    }),
    { name: 'unitrust-role' }
  )
);
