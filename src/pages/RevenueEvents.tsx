import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RevenueEvent, earningService, PaginatedResult } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';

export const RevenueEvents = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('all');
    const [data, setData] = useState<PaginatedResult<RevenueEvent> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            if (activeTab === 'fraud') {
                const res = await earningService.getFraudQueue({ page, limit: 50 });
                setData(res);
            } else {
                const res = await earningService.getEvents({ page, limit: 50 });
                setData(res);
            }
        } catch (error) {
            console.error('Failed to fetch revenue events', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        setSelectedIds([]);
    }, [page, activeTab]);

    const convertUnits = (units?: string) => {
        if (!units) return '0';
        return (BigInt(units) / BigInt(1_000_000)).toString();
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkAction = async (action: 'APPROVE' | 'REJECT') => {
        if (!selectedIds.length) return;
        if (!confirm(`Are you sure you want to bulk ${action.toLowerCase()} ${selectedIds.length} items?`)) return;

        try {
            await earningService.bulkActionEvents(selectedIds, action, 'BULK_ACTION');
            fetchEvents();
            setSelectedIds([]);
        } catch (err) {
            console.error(err);
            alert('Bulk action failed');
        }
    };

    const renderTable = () => (
        <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <tr>
                        <th className="px-4 py-3 font-medium w-10">
                            <input
                                type="checkbox"
                                checked={data?.data?.length ? selectedIds.length === data.data.length : false}
                                onChange={(e) => {
                                    if (e.target.checked && data?.data) {
                                        setSelectedIds(data.data.map(i => i.id));
                                    } else {
                                        setSelectedIds([]);
                                    }
                                }}
                            />
                        </th>
                        <th className="px-4 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Type</th>
                        <th className="px-4 py-3 font-medium text-right">Reward</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">Fraud Flags</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {data?.data?.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <td className="px-4 py-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(item.id)}
                                    onChange={() => toggleSelection(item.id)}
                                />
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                {item.inserted_at || item.insertedAt ? format(new Date((item.inserted_at || item.insertedAt) as string), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.event_type || item.eventType}</td>
                            <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                ${convertUnits(item.reward_units || item.rewardUnits)}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800`}>
                                    {item.status}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                {(item.fraud_flags || item.fraudFlags || []).length > 0 ? (
                                    <span className="text-red-500 font-medium">{(item.fraud_flags || item.fraudFlags)?.join(', ')}</span>
                                ) : (
                                    <span className="text-slate-400">None</span>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <Button variant="outline" size="sm" onClick={() => navigate(`/revenue/events/${item.id}`)}>
                                    Details
                                </Button>
                            </td>
                        </tr>
                    ))}
                    {data?.data?.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                No events found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Revenue Events</h1>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Events List</CardTitle>
                        {selectedIds.length > 0 && (
                            <div className="flex gap-2">
                                <Button size="sm" onClick={() => handleBulkAction('APPROVE')} className="bg-emerald-600 hover:bg-emerald-700">Approve ({selectedIds.length})</Button>
                                <Button size="sm" onClick={() => handleBulkAction('REJECT')} variant="destructive">Reject ({selectedIds.length})</Button>
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <Button
                            variant={activeTab === 'all' ? 'default' : 'ghost'}
                            onClick={() => { setActiveTab('all'); setPage(1); }}
                        >
                            All Events
                        </Button>
                        <Button
                            variant={activeTab === 'fraud' ? 'default' : 'ghost'}
                            onClick={() => { setActiveTab('fraud'); setPage(1); }}
                        >
                            Fraud Queue
                        </Button>
                    </div>

                    <div className="m-0">
                        {loading ? <div className="p-8 text-center">Loading...</div> : renderTable()}
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
                </CardContent>
            </Card>
        </div>
    );
};
