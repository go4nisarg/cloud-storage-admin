import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Payout, earningService, PaginatedResult } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

export const Payouts = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<PaginatedResult<Payout> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const res = await earningService.getPayouts({ page, limit: 50 });
            setData(res);
        } catch (error) {
            console.error('Failed to fetch payouts', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayouts();
    }, [page]);

    const convertUnits = (units?: string) => {
        if (!units) return '0';
        return (BigInt(units) / BigInt(1_000_000)).toString();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Payouts Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payouts List</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-8 text-center">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Creation Date</th>
                                            <th className="px-4 py-3 font-medium">User</th>
                                            <th className="px-4 py-3 font-medium text-right">Amount</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Release Date</th>
                                            <th className="px-4 py-3 font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                        {data?.data?.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                    {item.created_at || item.createdAt ? format(new Date((item.created_at || item.createdAt) as string), 'MMM dd, yyyy') : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                                                    {item.user_name || item.userId || item.user_id}
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                                    ${convertUnits(item.total_units || item.totalUnits)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {item.holding_release_at || item.holdingReleaseAt ? format(new Date((item.holding_release_at || item.holdingReleaseAt) as string), 'MMM dd, yyyy') : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Button variant="outline" size="sm" onClick={() => navigate(`/revenue/payouts/${item.id}`)}>
                                                        Review
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {data?.data?.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                                    No payouts found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {data && data.total > 0 && (
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-sm text-slate-500">
                                        Showing {(page - 1) * 50 + 1} to {Math.min(page * 50, data.total)} of {data.total}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
                                        <Button variant="outline" onClick={() => setPage(p => p + 1)} disabled={page * 50 >= data.total}>Next</Button>
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
