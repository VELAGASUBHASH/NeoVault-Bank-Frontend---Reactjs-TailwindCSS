import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({ title, value, change, changeType = "up", icon: Icon, gradient, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.4 }}
            className="glass-card p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
        >
            <div className={`absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity ${gradient}`} />
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{title}</p>
                    {Icon && (
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${gradient} opacity-80`}>
                            <Icon size={16} className="text-white" />
                        </div>
                    )}
                </div>
                <p className="text-2xl font-bold text-white font-display">{value}</p>
                {change && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${changeType === "up" ? "text-green-400" : "text-vault-red"}`}>
                        {changeType === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {change}
                    </div>
                )}
            </div>
        </motion.div>
    );
}