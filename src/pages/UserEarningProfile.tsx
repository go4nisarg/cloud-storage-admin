import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserEarningProfile, earningService } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, AlertTriangle, CheckCircle, Ban, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export const UserEarningProfileView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserEarningProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const data = await earningService.getUserEarningProfile(id);
            setProfile(data);
        } catch (error) {
            console.error('Failed to fetch user earning profile', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const handleAction = async (actionFn: () => Promise<any>) => {
        try {
            await actionFn();
            fetchProfile();
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
    if (!profile) return <div className="p-8">Earning Profile not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(`/user/${id}`)}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to User
                    </Button>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-emerald-500" />
                        User Earning Profile
                    </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                    {profile.user.earningSuspended ? (
                        <Button
                            onClick={() => {
                                const note = prompt('Enter reinstate note', 'Account verified');
                                if (note) handleAction(() => earningService.reinstateEarning(profile.user.id, note));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Reinstate Earning
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                const reason = prompt('Enter suspend reason', 'Suspicious activity detected');
                                if (reason) handleAction(() => earningService.suspendEarning(profile.user.id, reason));
                            }}
                            variant="outline"
                            className="border-amber-500 text-amber-600 hover:bg-amber-50"
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" /> Suspend Earning
                        </Button>
                    )}

                    {profile.user.payoutBlocked ? (
                        <Button
                            onClick={() => {
                                const note = prompt('Enter unblock payout note', 'Confirmed issue resolved');
                                if (note) handleAction(() => earningService.unblockPayouts(profile.user.id, note));
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Unblock Payouts
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                const reason = prompt('Enter block payout reason', 'Manual hold');
                                if (reason) handleAction(() => earningService.blockPayouts(profile.user.id, reason, 'OTHER'));
                            }}
                            variant="destructive"
                        >
                            <Ban className="w-4 h-4 mr-2" /> Block Payouts
                        </Button>
                    )}

                    <Button
                        onClick={() => {
                            const planId = prompt('Enter new Plan ID to override');
                            const note = prompt('Enter override note', 'Admin manual override');
                            if (planId && note) {
                                const reset = confirm('Reset switch count?');
                                handleAction(() => earningService.overrideEarningPlan(profile.user.id, planId, reset, note));
                            }
                        }}
                        variant="outline"
                    >
                        Override Plan
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader><CardTitle>Financial Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Total Earned</span>
                                <div className="text-3xl font-bold text-emerald-600">${convertUnits(profile.totalEarned)}</div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <span className="text-slate-500 font-semibold uppercase tracking-wider text-xs">Total Paid</span>
                                <div className="text-3xl font-bold text-blue-600">${convertUnits(profile.totalPaid)}</div>
                            </div>
                            <div className="mt-4 pt-4 border-t col-span-2">
                                <h4 className="font-semibold mb-2">Current Plan</h4>
                                {profile.earningPlan ? (
                                    <div>
                                        <span className="font-medium text-lg">{profile.earningPlan.earningPlan.planName}</span>
                                        <span className="text-sm text-slate-500 ml-2">({profile.earningPlan.earningPlan.planType})</span>
                                        <div className="text-sm mt-1">
                                            Switches: {profile.user.earningPlanSwitchCount} / {profile.user.maxEarningPlanSwitches}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-slate-500 italic">No plan selected</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Fraud Metrics</CardTitle></CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Total Events</span>
                                <span className="font-medium">{profile.fraudSummary.totalEvents}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Flagged Events</span>
                                <span className="font-medium text-amber-600">{profile.fraudSummary.flaggedEvents}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Rejected Events</span>
                                <span className="font-medium text-red-600">{profile.fraudSummary.rejectedEvents}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                                <span className="text-slate-500 font-semibold">Rejection Rate</span>
                                <span className="font-bold">{(profile.fraudSummary.rejectionRate * 100).toFixed(2)}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Constraints */}
            {(profile.user.earningSuspended || profile.user.payoutBlocked) && (
                <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800">
                    <CardHeader><CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Account Restrictions</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {profile.user.earningSuspended && (
                            <div>
                                <h4 className="font-bold text-red-700">Earning Suspended</h4>
                                <p className="text-sm text-red-600 mt-1"><span className="font-semibold">Reason:</span> {profile.user.earningSuspendedReason}</p>
                                <p className="text-sm text-slate-600"><span className="font-semibold">At:</span> {profile.user.earningSuspendedAt ? format(new Date(profile.user.earningSuspendedAt), 'PPP p') : 'N/A'}</p>
                            </div>
                        )}

                        {profile.user.payoutBlocked && (
                            <div className={profile.user.earningSuspended ? "border-t border-red-200 pt-4" : ""}>
                                <h4 className="font-bold text-red-700">Payouts Blocked</h4>
                                <p className="text-sm text-red-600 mt-1"><span className="font-semibold">Category:</span> {profile.user.payoutBlockedCategory}</p>
                                <p className="text-sm text-slate-600"><span className="font-semibold">At:</span> {profile.user.payoutBlockedAt ? format(new Date(profile.user.payoutBlockedAt), 'PPP p') : 'N/A'}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Basic tables for recent events/payouts */}
            <h3 className="font-semibold text-xl pt-4">Recent Payouts (Top 20)</h3>
            <div className="rounded-md border border-slate-200 bg-white dark:bg-slate-900 overflow-hidden text-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                        <tr>
                            <th className="px-4 py-2 font-medium">Date</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 font-medium text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-slate-600">
                        {profile.payouts.map(p => (
                            <tr key={p.id}>
                                <td className="px-4 py-2">{p.created_at || p.createdAt ? format(new Date((p.created_at || p.createdAt) as string), 'PPP') : 'N/A'}</td>
                                <td className="px-4 py-2">{p.status}</td>
                                <td className="px-4 py-2 text-right">${convertUnits(p.total_units || p.totalUnits)}</td>
                            </tr>
                        ))}
                        {profile.payouts.length === 0 && <tr><td colSpan={3} className="text-center p-4">No recent payouts</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
