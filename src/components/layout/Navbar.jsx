import { useState } from "react";
import { Menu, Bell, Sun, Moon, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ onMenuClick }) {
    const [dark, setDark] = useState(true);
    const [notifOpen, setNotifOpen] = useState(false);
    const { user } = useSelector((s) => s.auth);

    const notifications = [
        { id: 1, text: "Transfer of ₹5,000 successful", time: "2m ago", type: "success" },
        { id: 2, text: "Loan application under review", time: "1h ago", type: "info" },
        { id: 3, text: "New login from Chrome, Hyderabad", time: "3h ago", type: "warning" },
    ];

    return (
        <header className="h-16 bg-navy-950/80 backdrop-blur-md border-b border-vault-border flex items-center px-4 md:px-6 gap-4 sticky top-0 z-30">
            <button onClick={onMenuClick} className="lg:hidden text-gray-400 hover:text-white">
                <Menu size={22} />
            </button>

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-navy-900/50 border border-vault-border rounded-xl px-3 py-2 flex-1 max-w-sm">
                <Search size={16} className="text-gray-500" />
                <input
                    type="text"
                    placeholder="Search transactions, accounts..."
                    className="bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none flex-1"
                />
            </div>

            <div className="ml-auto flex items-center gap-3">
                {/* Dark mode toggle */}
                <button
                    onClick={() => setDark(!dark)}
                    className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                    {dark ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-gray-400 hover:text-white transition-colors relative"
                    >
                        <Bell size={16} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-vault-red rounded-full" />
                    </button>

                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-12 w-80 glass-card-dark shadow-glass overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-vault-border">
                                    <p className="text-sm font-semibold text-white">Notifications</p>
                                </div>
                                {notifications.map((n) => (
                                    <div key={n.id} className="px-4 py-3 border-b border-vault-border/50 hover:bg-vault-glass transition-colors">
                                        <p className="text-sm text-gray-200">{n.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-500 to-vault-red flex items-center justify-center font-bold text-sm cursor-pointer">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
            </div>
        </header>
    );
}