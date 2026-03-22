import React, { useEffect, useState } from 'react';
import { earningService, EarningConfig } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

export const RevenueConfig = () => {
    const [config, setConfig] = useState<EarningConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const [minPayoutUnits, setMinPayoutUnits] = useState('');
    const [autoProcessPayouts, setAutoProcessPayouts] = useState(false);
    const [maxPayoutsPerDay, setMaxPayoutsPerDay] = useState(0);
    const [maxEventsPerUserPerDay, setMaxEventsPerUserPerDay] = useState(0);
    const [fraudScoreThreshold, setFraudScoreThreshold] = useState(0);
    const [payoutHoldDays, setPayoutHoldDays] = useState(0);
    const [allowManualWithdrawals, setAllowManualWithdrawals] = useState(false);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const data = await earningService.getConfig();
            setConfig(data);
            setMinPayoutUnits((BigInt(data.minPayoutUnits) / BigInt(1_000_000)).toString());
            setAutoProcessPayouts(data.autoProcessPayouts);
            setMaxPayoutsPerDay(data.maxPayoutsPerDay);
            setMaxEventsPerUserPerDay(data.maxEventsPerUserPerDay);
            setFraudScoreThreshold(data.fraudScoreThreshold);
            setPayoutHoldDays(data.payoutHoldDays);
            setAllowManualWithdrawals(data.allowManualWithdrawals);
        } catch (error) {
            console.error('Failed to fetch config', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    const handleSave = async () => {
        try {
            if (!config) return;
            await earningService.updateConfig({
                minPayoutUnits: (BigInt(minPayoutUnits) * BigInt(1_000_000)).toString(),
                autoProcessPayouts,
                maxPayoutsPerDay,
                maxEventsPerUserPerDay,
                fraudScoreThreshold,
                payoutHoldDays,
                allowManualWithdrawals
            });
            alert('Config updated successfully');
            fetchConfig();
        } catch (error) {
            console.error(error);
            alert('Failed to update config');
        }
    };

    if (loading) return <div className="p-8">Loading configuration...</div>;

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Revenue Configuration</h1>
                <p className="text-slate-500 mt-1">Manage global earning and payout rules</p>
            </div>

            <Card>
                <CardHeader><CardTitle>Global Settings</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Min Payout Amount (USD)</label>
                            <input
                                type="number"
                                value={minPayoutUnits}
                                onChange={e => setMinPayoutUnits(e.target.value)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Payouts Per Day (Global limit)</label>
                            <input
                                type="number"
                                value={maxPayoutsPerDay}
                                onChange={e => setMaxPayoutsPerDay(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Max Events Per User Per Day</label>
                            <input
                                type="number"
                                value={maxEventsPerUserPerDay}
                                onChange={e => setMaxEventsPerUserPerDay(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fraud Score Threshold (0-100)</label>
                            <input
                                type="number"
                                value={fraudScoreThreshold}
                                onChange={e => setFraudScoreThreshold(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payout Hold Days</label>
                            <input
                                type="number"
                                value={payoutHoldDays}
                                onChange={e => setPayoutHoldDays(parseInt(e.target.value) || 0)}
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                                placeholder="Number of days to hold funds before payout"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-4 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoProcessPayouts}
                                    onChange={e => setAutoProcessPayouts(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto Process Payouts</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={allowManualWithdrawals}
                                    onChange={e => setAllowManualWithdrawals(e.target.checked)}
                                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Allow Manual Withdrawals</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                            Save Configuration
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
