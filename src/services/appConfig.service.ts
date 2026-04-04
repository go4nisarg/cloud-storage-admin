import { apiClient } from "./api";

export interface AppConfig {
    isWebsurfer: boolean;
    isDisplay: boolean;
}

export interface AppConfigUpdateResponse {
    updatedKeys: string[];
}

export const appConfigService = {
    getAppConfig: async (): Promise<AppConfig> => {
        const response = await apiClient.get<{ data: AppConfig }>("/web/admin/config");
        return response.data.data;
    },

    updateAppConfig: async (config: Partial<AppConfig>): Promise<AppConfigUpdateResponse> => {
        const response = await apiClient.patch<{ data: AppConfigUpdateResponse }>("/web/admin/config", config);
        return response.data.data;
    }
};
