import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RevenueEvent, earningService } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

export const RevenueEventDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [event, setEvent] = useState<RevenueEvent | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvent = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await earningService.getEventById(id);
            setEvent(data);
        } catch (error) {
            console.error('Failed to fetch event', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const handleAction = async (actionFn: () => Promise<any>) => {
        try {
            await actionFn();
            fetchEvent();
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
    if (!event) return <div className="p-8">Event not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/revenue/events')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Event Details</h1>
                </div>
                <div className="flex items-center gap-2">
                    {['PENDING', 'APPROVED'].includes(event.status) && (
                        <>
                            <Button
                                onClick={() => handleAction(() => earningService.approveEvent(event.id, 'Manually approved from details view'))}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                Approve
                            </Button>
                            <Button
                                onClick={() => {
                                    const reason = prompt('Enter rejection reason (e.g., FRAUD_CONFIRMED, POLICY_VIOLATION)', 'OTHER');
                                    if (reason) handleAction(() => earningService.rejectEvent(event.id, reason, 'Rejected by admin'));
                                }}
                                variant="destructive"
                            >
                                Reject
                            </Button>
                        </>
                    )}
                    {(event.fraud_flags || event.fraudFlags)?.length ? (
                        <Button
                            onClick={() => {
                                const just = prompt('Enter justification for overriding fraud flags (min 20 chars)');
                                if (just && just.length >= 20) handleAction(() => earningService.overrideFraudFlag(event.id, just));
                                else if (just) alert('Justification must be at least 20 characters');
                            }}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                        >
                            Override Fraud Flags
                        </Button>
                    ) : null}
                    {['PENDING', 'APPROVED'].includes(event.status) && (
                        <Button
                            onClick={() => {
                                const reason = prompt('Enter flag reason (e.g., SUSPICIOUS_PATTERN)', 'OTHER');
                                if (reason) handleAction(() => earningService.flagEvent(event.id, reason, 'Manually flagged'));
                            }}
                            variant="outline"
                        >
                            Flag Manually
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader><CardTitle>Event Information</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-semibold">ID:</span> {event.id}</div>
                        <div><span className="font-semibold">Status:</span> {event.status}</div>
                        <div><span className="font-semibold">Type:</span> {event.event_type || event.eventType}</div>
                        <div><span className="font-semibold">Reward:</span> ${convertUnits(event.reward_units || event.rewardUnits)} {event.currency}</div>
                        <div>
                            <span className="font-semibold">Date:</span> {
                                format(new Date((event.inserted_at || event.insertedAt) as string), 'PPP p')
                            }
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Audit & Fraud</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div><span className="font-semibold">Fraud Flags:</span> {(event.fraud_flags || event.fraudFlags)?.join(', ') || 'None'}</div>
                        <div><span className="font-semibold">Overridden Flags:</span> {(event.fraud_flags_overridden || event.fraudFlagsOverridden)?.join(', ') || 'None'}</div>
                        <div><span className="font-semibold">Admin Note:</span> {event.admin_note || event.adminNote || 'N/A'}</div>
                        <div><span className="font-semibold">Rejected Reason:</span> {event.rejected_reason || event.rejectedReason || 'N/A'}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
