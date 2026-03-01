import { apiClient } from "./api";

export const login = async (email: string, otp: string): Promise<{ token: string; user: { email: string; role: string } }> => {
    try {
        const response = await apiClient.post("/auth/verify-otp", { email, otp });
        const { token, user } = response.data?.data || {};
        return {
            token: token || response.data?.token,
            user: {
                email: user?.email || email,
                role: user?.role || "admin"
            }
        };
    } catch (error: any) {
        throw new Error(error.response?.data?.message || "Invalid OTP");
    }
};

export const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), 300);
    });
};
