import { create } from "zustand";
import * as analyticsService from "../services/analytics.service";

export interface DashboardStats {
    summary: {
        totalUsers: number;
        activeUsers: number;
        deletedUsers: number;
        totalStorageBytes: number;
        totalSharedLinkViews: number;
        totalDownloads: number;
    };
    trends: {
        storageUsageTrend: { month: string; storageGB: number }[];
        fileViewsTrend: { month: string; viewCount: number }[];
        downloadsTrend: { month: string; downloadCount: number }[];
        newUsersTrend: { date: string; userCount: number }[];
    };
}

interface AnalyticsState {
    dashboardStats: DashboardStats | null;
    loading: boolean;
    error: string | null;
    fetchDashboardStats: () => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
    dashboardStats: null,
    loading: false,
    error: null,
    fetchDashboardStats: async () => {
        set({ loading: true, error: null });
        try {
            const stats = await analyticsService.getDashboardStats();
            set({ dashboardStats: stats, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    }
}));
