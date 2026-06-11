import { create } from "zustand";
import { devtools } from "zustand/middleware";

type ModalId = string;

interface UiState {
  isSidebarCollapsed: boolean;
  openModals: ModalId[];
  toastQueue: Array<{ id: string; message: string; type: "success" | "error" | "info" }>;
}

interface UiStore extends UiState {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (id: ModalId) => void;
  closeModal: (id: ModalId) => void;
  isModalOpen: (id: ModalId) => boolean;
  pushToast: (message: string, type?: "success" | "error" | "info") => void;
  removeToast: (id: string) => void;
}

const initialState: UiState = {
  isSidebarCollapsed: false,
  openModals: [],
  toastQueue: [],
};

export const useUiStore = create<UiStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setSidebarCollapsed: (collapsed) =>
        set({ isSidebarCollapsed: collapsed }),
      openModal: (id) =>
        set((state) => ({
          openModals: state.openModals.includes(id)
            ? state.openModals
            : [...state.openModals, id],
        })),
      closeModal: (id) =>
        set((state) => ({
          openModals: state.openModals.filter((m) => m !== id),
        })),
      isModalOpen: (id) => get().openModals.includes(id),
      pushToast: (message, type = "info") =>
        set((state) => ({
          toastQueue: [
            ...state.toastQueue,
            { id: crypto.randomUUID(), message, type },
          ],
        })),
      removeToast: (id) =>
        set((state) => ({
          toastQueue: state.toastQueue.filter((t) => t.id !== id),
        })),
    }),
    {
      name: "ui-store",
      enabled:
        process.env.NODE_ENV !== "production" && typeof window !== "undefined",
    }
  )
);
