import { useEffect, useState } from 'react';
import { ActivityFeedResponse, earningService } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

export const ActivityFeed = () => {
    const [data, setData] = useState<ActivityFeedResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [type, setType] = useState<string>('ALL');

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const res = await earningService.getActivityFeed({
                page,
                limit: 50,
                type: type !== 'ALL' ? type : undefined
            });
            setData(res);
        } catch (error) {
            console.error('Failed to fetch activity feed', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, [page, type]);

    const convertUnits = (units: string) => {
        return (BigInt(units) / BigInt(1_000_000)).toString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Activity Feed</h1>

                <div className="flex items-center gap-4">
                    <Select value={type} onValueChange={(val) => { setType(val); setPage(1); }}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="VIEW">View</SelectItem>
                            <SelectItem value="REFERRAL">Referral</SelectItem>
                            <SelectItem value="PAYOUT">Payout</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Type</th>
                                            <th className="px-4 py-3 font-medium">User ID</th>
                                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {data?.data?.map((item, idx) => (
                                            <tr key={item.id + idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                    {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                                <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.type}</td>
                                                <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.user_id}</td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                                    ${convertUnits(item.units)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {data?.data?.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                                    No activities found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {data && data.total > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-slate-500">
                                        Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setPage(p => p + 1)}
                                            disabled={page * 50 >= data.total}
                                        >
                                            Next
                                        </Button>
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
