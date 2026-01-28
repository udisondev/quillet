import { create } from "zustand";

type ToastSeverity = "success" | "error" | "info" | "warning";

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
  showToast: (message: string, severity: ToastSeverity) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>()((set) => ({
  open: false,
  message: "",
  severity: "info",
  showToast: (message, severity) => set({ open: true, message, severity }),
  hideToast: () => set({ open: false }),
}));
