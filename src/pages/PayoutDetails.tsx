import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Payout, earningService } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const PayoutDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [payout, setPayout] = useState<Payout | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPayout = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await earningService.getPayoutById(id);
            setPayout(data);
        } catch (error) {
            console.error('Failed to fetch payout', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayout();
    }, [id]);

    const handleAction = async (actionFn: () => Promise<any>) => {
        try {
            await actionFn();
            fetchPayout();
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    const convertUnits = (units?: string) => {
        if (!units) return '0';
        return (BigInt(units) / BigInt(1_000_000)).toString();
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!payout) return <div className="p-8">Payout not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/revenue/payouts')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Payout Details</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {payout.status === 'PENDING' && (
                        <>
                            <Button
                                onClick={() => handleAction(() => earningService.approvePayout(payout.id, 'Manually approved from details view'))}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                Approve (PROCESSING)
                            </Button>
                            <Button
                                onClick={() => {
                                    const reason = prompt('Enter HOLD reason', 'Suspicious activity');
                                    if (reason) handleAction(() => earningService.holdPayout(payout.id, reason));
                                }}
                                variant="destructive"
                            >
                                Hold Payout
                            </Button>
                        </>
                    )}

                    {payout.status === 'PROCESSING' && (
                        <>
                            <Button
                                onClick={() => {
                                    const provider = prompt('Enter payment provider (e.g., Wise, Stripe)', 'Wise');
                                    const ref = prompt('Enter transaction reference', 'TXN-' + Math.floor(Math.random() * 1000000));
                                    if (provider && ref) handleAction(() => earningService.markPayoutPaid(payout.id, provider, ref, 'Manual entry'));
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Mark Paid
                            </Button>
                            <Button
                                onClick={() => {
                                    const reason = prompt('Enter fail reason (e.g., INVALID_BANK_DETAILS, PROVIDER_ERROR)', 'OTHER');
                                    if (reason) handleAction(() => earningService.markPayoutFailed(payout.id, reason, 'Failed during processing'));
                                }}
                                variant="destructive"
                            >
                                Mark Failed
                            </Button>
                        </>
                    )}

                    {payout.status === 'ON_HOLD' && (
                        <Button
                            onClick={() => {
                                const note = prompt('Release hold note?', 'Issue resolved');
                                handleAction(() => earningService.releasePayoutHold(payout.id, note || undefined));
                            }}
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                        >
                            Release Hold
                        </Button>
                    )}

                    {payout.status === 'FAILED' && (
                        <Button
                            onClick={() => {
                                const note = prompt('Retry note?', 'Bank details updated');
                                handleAction(() => earningService.retryPayout(payout.id, note || undefined));
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Retry Payout
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Payment Information</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                            <span className="block text-sm text-slate-500 uppercase font-semibold mb-1">Status</span>
                            <span className="font-medium text-lg">{payout.status}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 uppercase font-semibold mb-1">Amount</span>
                            <span className="font-medium text-lg">${convertUnits(payout.total_units || payout.totalUnits)} {payout.currency}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 uppercase font-semibold mb-1">Created At</span>
                            <span className="font-medium">{format(new Date((payout.created_at || payout.createdAt) as string), 'PPP p')}</span>
                        </div>

                        {/* Holding / Release related */}
                        <div>
                            <span className="block text-sm text-slate-500 uppercase font-semibold mb-1">Holding Release At</span>
                            <span className="font-medium">{payout.holding_release_at || payout.holdingReleaseAt ? format(new Date((payout.holding_release_at || payout.holdingReleaseAt) as string), 'PPP p') : 'N/A'}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500 uppercase font-semibold mb-1">Paid At</span>
                            <span className="font-medium text-emerald-600">{payout.paid_at || payout.paidAt ? format(new Date((payout.paid_at || payout.paidAt) as string), 'PPP p') : 'Unpaid'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>User Details & Audit</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><span className="font-semibold text-slate-500 w-32 inline-block">User Name:</span> <span className="font-medium">{payout.user_name || 'N/A'}</span></div>
                        <div><span className="font-semibold text-slate-500 w-32 inline-block">User Email:</span> <span className="font-medium">{payout.user_email || 'N/A'}</span></div>
                        <div><span className="font-semibold text-slate-500 w-32 inline-block">User ID:</span> <span className="font-mono text-sm">{payout.user_id || payout.userId}</span></div>

                        <div className="col-span-full border-t border-slate-100 dark:border-slate-800 my-4"></div>

                        <div><span className="font-semibold text-slate-500">Provider:</span> {payout.payment_provider || payout.paymentProvider || 'N/A'}</div>
                        <div><span className="font-semibold text-slate-500">Transaction Ref:</span> {payout.transaction_ref || payout.transactionRef || 'N/A'}</div>
                        <div><span className="font-semibold text-slate-500">Held Reason:</span> {payout.held_reason || payout.heldReason || 'N/A'}</div>
                        <div><span className="font-semibold text-slate-500">Failed Reason:</span> {payout.failed_reason || payout.failedReason || 'N/A'}</div>
                        <div className="col-span-full"><span className="font-semibold text-slate-500">Admin Note:</span> {payout.admin_note || payout.adminNote || 'N/A'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
