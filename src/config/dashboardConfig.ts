/**
 * Controls which dashboard cards/charts are visible to admin users.
 * Super admins always see everything regardless of these settings.
 * Set any value to false to hide it from admin users.
 */
export const ADMIN_DASHBOARD_VISIBILITY = {
    // Stat cards
    totalUsers: true,
    activeUsers: true,
    deletedUsers: true,
    totalStorage: true,
    sharedLinkViews: false,
    totalDownloads: false,

    // Charts
    storageUsageTrend: false,
    fileViewsTrend: false,
    downloadsTrend: false,
};
