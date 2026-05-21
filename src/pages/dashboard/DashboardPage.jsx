import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, PiggyBank, TrendingUp, Plus, Send, Download, Upload } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import StatCard from "../../components/ui/StatCard";
import { SkeletonCard, SkeletonTable } from "../../components/ui/SkeletonLoader";

const mockChartData = [
    { month: "Jan", income: 45000, expense: 28000 },
    { month: "Feb", income: 52000, expense: 31000 },
    { month: "Mar", income: 48000, expense: 27000 },
    { month: "Apr", income: 61000, expense: 35000 },
    { month: "May", income: 55000, expense: 29000 },
    { month: "Jun", income: 67000, expense: 38000 },
];

const mockTransactions = [
    { id: 1, name: "Amazon Pay", amount: -2499, type: "DEBIT",  date: "Today, 2:45 PM",   icon: "A" },
    { id: 2, name: "Salary Credit", amount: 85000, type: "CREDIT", date: "Yesterday", icon: "S" },
    { id: 3, name: "Swiggy Order", amount: -349, type: "DEBIT",  date: "May 19",       icon: "SW" },
    { id: 4, name: "Fund Transfer", amount: 15000, type: "CREDIT", date: "May 18",     icon: "FT" },
    { id: 5, name: "Netflix", amount: -649, type: "DEBIT",  date: "May 17",            icon: "N" },
];

const quickActions = [
    { label: "Send Money", icon: Send, color: "from-navy-600 to-navy-800" },
    { label: "Deposit", icon: Download, color: "from-green-700 to-green-900" },
    { label: "Withdraw", icon: Upload, color: "from-orange-700 to-orange-900" },
    { label: "New Account", icon: Plus, color: "from-purple-700 to-purple-900" },
];

export default function DashboardPage() {
    const { user } = useSelector((s) => s.auth);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(t);
    }, []);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Welcome */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                    {greeting}, <span className="text-navy-300">{user?.name || "there"}</span> 👋
                </h1>
                <p className="text-gray-500 text-sm mt-1">Here's your financial overview</p>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                    <>
                        <StatCard title="Total Balance" value="₹2,48,350" change="+8.2% this month" changeType="up" icon={Wallet} gradient="bg-gradient-to-br from-navy-500 to-navy-700" delay={0} />
                        <StatCard title="Monthly Income" value="₹85,000" change="+12% vs last month" changeType="up" icon={ArrowDownLeft} gradient="bg-gradient-to-br from-green-600 to-emerald-700" delay={0.1} />
                        <StatCard title="Monthly Spend" value="₹38,000" change="+5% vs last month" changeType="down" icon={ArrowUpRight} gradient="bg-gradient-to-br from-orange-600 to-red-700" delay={0.2} />
                        <StatCard title="Savings Rate" value="55.3%" change="+3% this month" changeType="up" icon={PiggyBank} gradient="bg-gradient-to-br from-purple-600 to-purple-800" delay={0.3} />
                    </>
                )}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-4 gap-3">
                {quickActions.map(({ label, icon: Icon, color }, i) => (
                    <motion.button
                        key={label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * i }}
                        className="glass-card p-4 flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200 group"
                    >
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:shadow-glow transition-shadow`}>
                            <Icon size={18} className="text-white" />
                        </div>
                        <span className="text-xs text-gray-400 group-hover:text-white transition-colors text-center">{label}</span>
                    </motion.button>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-semibold text-white">Cash Flow Analytics</h3>
                            <p className="text-xs text-gray-500">Income vs Expenses — 2025</p>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-navy-400" /><span className="text-gray-400">Income</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-vault-red" /><span className="text-gray-400">Expenses</span></div>
                        </div>
                    </div>
                    {loading ? (
                        <div className="h-48 shimmer rounded-2xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2d55ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2d55ff" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e8192c" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#e8192c" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "#6b7280", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ background: "#111e6e", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "12px", color: "#fff" }}
                                    formatter={(v) => [`₹${v.toLocaleString()}`, ""]}
                                />
                                <Area type="monotone" dataKey="income" stroke="#2d55ff" strokeWidth={2} fill="url(#income)" />
                                <Area type="monotone" dataKey="expense" stroke="#e8192c" strokeWidth={2} fill="url(#expense)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Recent transactions */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">Recent</h3>
                        <TrendingUp size={16} className="text-gray-500" />
                    </div>
                    {loading ? (
                        <SkeletonTable rows={4} />
                    ) : (
                        <div className="space-y-4">
                            {mockTransactions.slice(0, 4).map((tx) => (
                                <div key={tx.id} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-navy-800/60 flex items-center justify-center text-xs font-bold text-gray-300 flex-shrink-0">
                                        {tx.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{tx.name}</p>
                                        <p className="text-xs text-gray-500">{tx.date}</p>
                                    </div>
                                    <span className={`text-sm font-semibold font-mono ${tx.amount > 0 ? "text-green-400" : "text-vault-red"}`}>
                    {tx.amount > 0 ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                  </span>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}