import { create } from 'zustand';

interface UIStore {
  isCartSidebarOpen: boolean;
  isMenuSidebarOpen: boolean;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
  openMenuSidebar: () => void;
  closeMenuSidebar: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  isCartSidebarOpen: false,
  isMenuSidebarOpen: false,
  openCartSidebar: () => set({ isCartSidebarOpen: true }),
  closeCartSidebar: () => set({ isCartSidebarOpen: false }),
  openMenuSidebar: () => set({ isMenuSidebarOpen: true }),
  closeMenuSidebar: () => set({ isMenuSidebarOpen: false }),
}));
