import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'user' | 'institute' | null;

interface RoleState {
  roles: Record<string, 'user' | 'institute'>;
  setRole: (address: string, role: 'user' | 'institute') => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set) => ({
      roles: {},
      setRole: (address, role) => set((state) => ({ roles: { ...state.roles, [address]: role } })),
    }),
    { name: 'unitrust-roles' }
  )
);
