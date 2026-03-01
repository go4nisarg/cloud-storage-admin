import { mockDownloads } from "./mockData";
import { FSObjectDownload } from "../types";

export const getDownloads = async (): Promise<FSObjectDownload[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockDownloads), 300));
};

export const getUserDownloads = async (userId: string): Promise<FSObjectDownload[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockDownloads.filter(d => d.userId === userId)), 200));
};
