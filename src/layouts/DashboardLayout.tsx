import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Cloud, Users, LayoutDashboard, BarChart3, LogOut, Menu, AlertTriangle } from 'lucide-react';
import { useAuthStore, isSuperAdmin } from '../store/auth.store';
import { Button } from '../components/ui/button';

export const DashboardLayout = () => {
    const logout = useAuthStore(state => state.logout);
    const user = useAuthStore(state => state.user);
    const navigate = useNavigate();
    const location = useLocation();
    const superAdmin = isSuperAdmin(user);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const allNavItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, superAdminOnly: false },
        { name: 'Users', path: '/users', icon: Users, superAdminOnly: true },
        { name: 'Analytics', path: '/analytics', icon: BarChart3, superAdminOnly: true },
        { name: 'Reported Files', path: '/reported-files', icon: AlertTriangle, superAdminOnly: false },
    ];

    const navItems = allNavItems.filter(item => !item.superAdminOnly || superAdmin);

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
                        <Cloud className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TenBoxAdmin</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-6">
                    <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={handleLogout}>
                        <LogOut className="h-5 w-5 mr-3 text-slate-400" />
                        Sign out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" className="md:hidden mr-2">
                            <Menu className="h-5 w-5" />
                        </Button>
                        <h1 className="text-xl font-semibold text-slate-800 dark:text-white capitalize">
                            {location.pathname.split('/')[1] || 'Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                            A
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/50">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
