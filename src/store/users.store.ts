import { create } from "zustand";
import { User, UserStorageLimit } from "../types";
import * as userService from "../services/user.service";
// import * as storageService from "../services/storage.service";
// import * as viewsService from "../services/views.service";
// import * as downloadsService from "../services/downloads.service";

interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
    selectedUser: User | null;
    storageLimits: Record<string, UserStorageLimit>;
    userViewsCount: Record<string, number>;
    userDownloadsCount: Record<string, number>;
    hasMore: boolean;
    page: number;
    currentSearch: string;
    fetchUsers: (reset?: boolean, search?: string) => Promise<void>;
    fetchUserDetails: (userId: string) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    restoreUser: (userId: string) => Promise<void>;
    blockUser: (userId: string) => Promise<void>;
}

export const useUsersStore = create<UsersState>((set, get) => ({
    users: [],
    loading: false,
    error: null,
    selectedUser: null,
    storageLimits: {},
    userViewsCount: {},
    userDownloadsCount: {},
    hasMore: true,
    page: 1,
    currentSearch: '',

    fetchUsers: async (reset = false, search?: string) => {
        const currentSearch = reset ? (search ?? '') : get().currentSearch;
        const currentPage = reset ? 1 : get().page;
        if (reset) {
            set({ loading: true, error: null, users: [], page: 1, hasMore: true, currentSearch });
        } else {
            set({ loading: true, error: null });
        }

        try {
            const usersList = await userService.getUsers({
                page: currentPage,
                limit: 20,
                ...(currentSearch ? { search: currentSearch } : {}),
            });

            const currentUsers = reset ? [] : get().users;
            const newUsers = [...currentUsers, ...usersList];

            const hasMore = usersList.length === 20;
            set({
                users: newUsers,
                loading: false,
                hasMore,
                page: currentPage + 1
            });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchUserDetails: async (userId: string) => {
        set({ loading: true, error: null, selectedUser: null });
        try {
            const user = await userService.getUserById(userId);
            if (user) {
                set({
                    selectedUser: user,
                    loading: false
                });
            } else {
                set({ error: "User not found", loading: false });
            }
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    deleteUser: async (userId: string) => {
        try {
            const success = await userService.deleteUser(userId);
            if (success) {
                const updatedUsers = get().users.map(u => u.id === userId ? { ...u, deletedAt: new Date().toISOString(), status: "Soft Deleted" as const } : u);
                set({ users: updatedUsers });
            }
        } catch (err) {
            console.error(err);
        }
    },

    restoreUser: async (userId: string) => {
        try {
            const success = await userService.restoreUser(userId);
            if (success) {
                const updatedUsers = get().users.map(u => u.id === userId ? { ...u, deletedAt: null, status: "Active" as const } : u);
                set({ users: updatedUsers });
            }
        } catch (err) {
            console.error(err);
        }
    },

    blockUser: async (userId: string) => {
        try {
            await userService.blockUser(userId);
            const updatedUsers = get().users.map(u => u.id === userId ? { ...u, status: "Soft Deleted" as const, deletedAt: new Date().toISOString() } : u);
            set({ users: updatedUsers });
        } catch (err) {
            console.error(err);
        }
    }
}));
