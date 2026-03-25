import { create } from "zustand";
import { ReportedItem } from "../types";
import * as reportedService from "../services/reported.service";

interface ReportedState {
    reportedItems: ReportedItem[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    page: number;
    fetchReportedItems: (reset?: boolean) => Promise<void>;
}

export const useReportedStore = create<ReportedState>((set, get) => ({
    reportedItems: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1,

    fetchReportedItems: async (reset = false) => {
        const currentPage = reset ? 1 : get().page;
        if (reset) {
            set({ loading: true, error: null, reportedItems: [], page: 1, hasMore: true });
        } else {
            set({ loading: true, error: null });
        }

        try {
            const [itemsList] = await Promise.all([
                reportedService.getReportedItems({ page: currentPage, limit: 20 }),
            ]);

            const currentItems = reset ? [] : get().reportedItems;
            const newItems = [...currentItems, ...itemsList];

            const hasMore = itemsList.length === 20;
            set({
                reportedItems: newItems,
                loading: false,
                hasMore,
                page: currentPage + 1
            });
        } catch (err: unknown) {
            const error = err as Error;
            set({ error: error.message, loading: false });
        }
    },
}));
