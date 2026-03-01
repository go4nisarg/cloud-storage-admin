import { ReportedItem } from "../types";
import { apiClient } from "./api";

interface GetReportedItemsParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export const getReportedItems = async (params?: GetReportedItemsParams): Promise<ReportedItem[]> => {
    try {
        const response = await apiClient.get('/web/admin/reported-items', {
            params: {
                sortBy: 'createdAt',
                sortOrder: 'desc',
                ...params
            }
        });
        const apiItems = response.data?.data || [];
        return apiItems;
    } catch (error) {
        console.error("Failed to fetch reported items", error);
        return [];
    }
};
