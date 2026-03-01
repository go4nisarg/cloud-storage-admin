import { UserStorageLimit } from "../types";
import { apiClient } from "./api";

interface StorageLimitsParams {
    page?: number;
    limit?: number;
}

export const getStorageLimits = async (params?: StorageLimitsParams): Promise<UserStorageLimit[]> => {
    try {
        const response = await apiClient.get('/web/admin/user-storage-limits', { params });
        return response.data?.data || [];
    } catch (error) {
        console.error("Failed to fetch storage limits", error);
        return [];
    }
};

export const getUserStorageLimit = async (userId: string): Promise<UserStorageLimit | undefined> => {
    try {
        const response = await apiClient.get(`/web/admin/user-storage-limits/${userId}`);
        return response.data?.data;
    } catch (error) {
        console.error(`Failed to fetch storage limit for user ${userId}`, error);
        return undefined;
    }
};
