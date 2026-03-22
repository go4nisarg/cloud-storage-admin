import { useEffect, useState } from 'react';
import { earningService, AuditLogItem } from '../services/earning.service';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';
import { Download, Filter } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

export const AuditLog = () => {
    const [logs, setLogs] = useState<AuditLogItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [entityFilter, setEntityFilter] = useState('');

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await earningService.getAuditLog({
                page,
                limit: 50,
                action: actionFilter || undefined,
                entityType: entityFilter || undefined
            });
            setLogs(data.data);
            setTotal(data.total);
        } catch (error) {
            console.error('Failed to fetch audit log', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, entityFilter]);

    const handleExportCSV = () => {
        const token = useAuthStore.getState().token;
        const url = new URL(`${import.meta.env.VITE_API_URL}/api/v1/web/earning/audit-log`);
        url.searchParams.append('format', 'csv');
        if (actionFilter) url.searchParams.append('action', actionFilter);
        if (entityFilter) url.searchParams.append('entityType', entityFilter);

        // Create temporary link to trigger download with token in URL (if supported) or just prompt user.
        // Since we need auth headers, a common trick is to fetch the blob directly.
        fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.blob())
            .then(blob => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `audit_log_${format(new Date(), 'yyyyMMdd')}.csv`;
                a.click();
            });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">System Audit Log</h1>
                <Button onClick={handleExportCSV} variant="outline" className="flex gap-2">
                    <Download className="w-4 h-4" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <Filter className="w-5 h-5 text-slate-400" />
                        <select
                            value={actionFilter}
                            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                            className="border border-slate-200 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-900 text-sm"
                        >
                            <option value="">All Actions</option>
                            <option value="APPROVE_EVENT">Approve Event</option>
                            <option value="REJECT_EVENT">Reject Event</option>
                            <option value="APPROVE_PAYOUT">Approve Payout</option>
                            <option value="HOLD_PAYOUT">Hold Payout</option>
                            <option value="SUSPEND_EARNING">Suspend User Earning</option>
                            <option value="UPDATE_CONFIG">Update Config</option>
                            <option value="CREATE_PLAN">Create Plan</option>
                        </select>
                        <select
                            value={entityFilter}
                            onChange={e => { setEntityFilter(e.target.value); setPage(1); }}
                            className="border border-slate-200 dark:border-slate-700 rounded-md p-2 bg-white dark:bg-slate-900 text-sm"
                        >
                            <option value="">All Entities</option>
                            <option value="revenue_event">Revenue Event</option>
                            <option value="payout">Payout</option>
                            <option value="user">User</option>
                            <option value="system_config">System Config</option>
                            <option value="earning_plan">Earning Plan</option>
                        </select>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading audit logs...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="px-4 py-3">Timestamp</th>
                                        <th className="px-4 py-3">Admin ID</th>
                                        <th className="px-4 py-3">Action</th>
                                        <th className="px-4 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                                {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-xs">{log.admin_user_id.split('-')[0]}...</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <Badge variant="outline" className="mb-1">{log.action}</Badge>
                                                    <div className="text-xs text-slate-500">{log.entity_type} ({log.entity_id})</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 max-w-xs truncate text-xs text-slate-600 dark:text-slate-400">
                                                {log.note || 'No note attached'}
                                            </td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-slate-500">No logs found matching criteria</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {total > 0 && (
                                <div className="p-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                                    <span className="text-sm text-slate-500">
                                        Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, total)} of {total}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                                        <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 50 >= total}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
