import React, { useEffect, useState } from 'react';
import { earningService, EarningPlan } from '../services/earning.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format } from 'date-fns';

export const RevenuePlans = () => {
    const [plans, setPlans] = useState<EarningPlan[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const data = await earningService.getPlans();
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await earningService.updatePlanStatus(id, !currentStatus);
            fetchPlans();
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        }
    };

    const handleCreateNew = async () => {
        const name = prompt('Plan Name? (e.g. Standard Tier)');
        const type = prompt('Plan Type code? (e.g. TIER_1)');
        const viewBase = prompt('Reward Per View in USD? (e.g. 0.005)');
        const signupBase = prompt('Reward Per Signup in USD? (e.g. 2.0)');

        if (name && type && viewBase && signupBase) {
            try {
                await earningService.createPlan({
                    planName: name,
                    planType: type,
                    description: name + ' Description',
                    rewardPerViewUnits: (parseFloat(viewBase) * 1_000_000).toString(),
                    rewardPerSignupUnits: (parseFloat(signupBase) * 1_000_000).toString(),
                    minViewsForReward: 10,
                    maxRewardsPerDay: 1000,
                    isActive: true
                });
                fetchPlans();
            } catch (error) {
                console.error(error);
                alert('Failed to create plan');
            }
        }
    };

    const convertUnits = (units?: string) => {
        if (!units) return '0';
        return (BigInt(units) / BigInt(1_000_000)).toString();
    };

    if (loading) return <div className="p-8">Loading plans...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">Earning Plans</h1>
                <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">Create New Plan</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map(plan => (
                    <Card key={plan.id} className={plan.isActive ? 'border-emerald-200 shadow-sm' : 'opacity-70 bg-slate-50 dark:bg-slate-900'}>
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{plan.planName}</CardTitle>
                                    <p className="text-xs text-slate-500 font-mono mt-1">{plan.planType}</p>
                                </div>
                                <Badge variant={plan.isActive ? 'default' : 'secondary'} className={plan.isActive ? 'bg-emerald-100 text-emerald-800' : ''}>
                                    {plan.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                {plan.description}
                            </div>

                            <div className="space-y-2 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-md">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Reward / View</span>
                                    <span className="font-semibold text-emerald-600">${convertUnits(plan.rewardPerViewUnits)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Reward / Signup</span>
                                    <span className="font-semibold text-emerald-600">${convertUnits(plan.rewardPerSignupUnits)}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                    <span className="text-slate-500">Min Views / Reward</span>
                                    <span className="font-medium">{plan.minViewsForReward}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Max Rewards / Day</span>
                                    <span className="font-medium">{plan.maxRewardsPerDay}</span>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                                <span className="text-xs text-slate-400">Changed {format(new Date(plan.updatedAt), 'MMM dd, yyyy')}</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleToggleStatus(plan.id, plan.isActive)}
                                    className={plan.isActive ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}
                                >
                                    {plan.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {plans.length === 0 && <div className="p-8 text-center col-span-full">No plans available.</div>}
            </div>
        </div>
    );
};
