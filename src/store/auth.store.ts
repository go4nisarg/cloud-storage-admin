import { create } from "zustand";

interface AuthState {
    isAuthenticated: boolean;
    user: { email: string; role: string } | null;
    token: string | null;
    login: (token: string, user: { email: string; role: string }) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: !!localStorage.getItem("admin_token"),
    token: localStorage.getItem("admin_token"),
    user: localStorage.getItem("admin_user") ? JSON.parse(localStorage.getItem("admin_user") as string) : null,
    login: (token, user) => {
        localStorage.setItem("admin_token", token);
        localStorage.setItem("admin_user", JSON.stringify(user));
        set({ isAuthenticated: true, token, user });
    },
    logout: () => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        set({ isAuthenticated: false, token: null, user: null });
    },
}));
