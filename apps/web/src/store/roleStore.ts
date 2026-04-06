import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'user' | 'institute' | null;

interface RoleState {
  // wallet address (lowercase) -> role
  rolesByWallet: Record<string, Role>;
  setRole: (address: string, role: Role) => void;
  getRoleForWallet: (address: string) => Role;
  clearRole: (address: string) => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      rolesByWallet: {},

      setRole: (address, role) =>
        set((state) => ({
          rolesByWallet: {
            ...state.rolesByWallet,
            [address.toLowerCase()]: role,
          },
        })),

      getRoleForWallet: (address) =>
        get().rolesByWallet[address.toLowerCase()] ?? null,

      clearRole: (address) =>
        set((state) => {
          const updated = { ...state.rolesByWallet };
          delete updated[address.toLowerCase()];
          return { rolesByWallet: updated };
        }),
    }),
    { name: 'unitrust-roles-v2' } // new key so old single-role cache is ignored
  )
);
