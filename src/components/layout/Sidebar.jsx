import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, CreditCard, ArrowLeftRight, Landmark,
    ShieldCheck, LogOut, X, Vault
} from "lucide-react";
import { logout } from "../../store/authSlice";
import { toast } from "sonner";

const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/accounts", icon: CreditCard, label: "Accounts" },
    { to: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
    { to: "/loans", icon: Landmark, label: "Loans" },
    { to: "/admin", icon: ShieldCheck, label: "Admin Panel" },
];

export default function Sidebar({ open, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((s) => s.auth);

    const handleLogout = () => {
        dispatch(logout());
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-vault-border">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-500 to-vault-red flex items-center justify-center">
                    <Vault size={18} className="text-white" />
                </div>
                <div>
                    <span className="font-display text-xl font-bold text-white">NeoVault</span>
                    <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase">Digital Banking</p>
                </div>
                <button onClick={onClose} className="ml-auto lg:hidden text-gray-500 hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* User info */}
            <div className="px-4 py-4 mx-3 mt-4 glass-card">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-500 to-navy-300 flex items-center justify-center font-bold text-sm">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[140px]">{user?.email || ""}</p>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {navItems.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                        }
                    >
                        <Icon size={18} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-6">
                <button
                    onClick={handleLogout}
                    className="sidebar-link w-full text-vault-red hover:text-vault-red hover:bg-red-950/30"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex w-64 min-h-screen bg-navy-950/80 border-r border-vault-border flex-col backdrop-blur-md">
                {sidebarContent}
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                            onClick={onClose}
                        />
                        <motion.aside
                            initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed left-0 top-0 bottom-0 w-64 bg-navy-950 border-r border-vault-border z-50 lg:hidden flex flex-col"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}