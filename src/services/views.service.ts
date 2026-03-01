import { mockViews } from "./mockData";
import { FSObjectView } from "../types";

export const getViews = async (): Promise<FSObjectView[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockViews), 300));
};

export const getUserViews = async (userId: string): Promise<FSObjectView[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockViews.filter(v => v.userId === userId)), 200));
};
