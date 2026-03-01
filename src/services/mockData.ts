import { FSObjectView, FSObjectDownload } from "../types";

export const mockViews: FSObjectView[] = [
    ...Array(50).fill(null).map((_, i) => ({
        id: `v${i}`,
        userId: i % 2 === 0 ? "1" : "2",
        objectId: "obj1",
        createdAt: new Date(Date.now() - Math.random() * 8640000000).toISOString(),
        fileType: "image/png"
    }))
];

export const mockDownloads: FSObjectDownload[] = [
    ...Array(30).fill(null).map((_, i) => ({
        id: `d${i}`,
        userId: i % 2 === 0 ? "2" : "1",
        objectId: "obj1",
        createdAt: new Date(Date.now() - Math.random() * 8640000000).toISOString(),
        fileType: "video/mp4"
    }))
];
