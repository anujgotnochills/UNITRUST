import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'user' | 'institute' | null;

interface RoleState {
  /** Maps wallet address (lowercase) → role */
  roles: Record<string, Role>;
  /** Currently active role (derived from connected wallet) */
  role: Role;
  /** Set the role for a specific wallet address */
  setRoleForWallet: (wallet: string, role: Role) => void;
  /** Get the role for a specific wallet address */
  getRoleForWallet: (wallet: string) => Role;
  /** Legacy setter — sets role without wallet binding */
  setRole: (role: Role) => void;
  /** Clear role for the current session */
  clearRole: () => void;
}

export const useRoleStore = create<RoleState>()(
  persist(
    (set, get) => ({
      roles: {},
      role: null,
      setRoleForWallet: (wallet, role) =>
        set((state) => ({
          roles: { ...state.roles, [wallet.toLowerCase()]: role },
          role,
        })),
      getRoleForWallet: (wallet) => {
        return get().roles[wallet.toLowerCase()] || null;
      },
      setRole: (role) => set({ role }),
      clearRole: () => set({ role: null }),
    }),
    { name: 'unitrust-role' }
  )
);
