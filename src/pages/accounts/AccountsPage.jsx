import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Eye, EyeOff, CreditCard, Wallet, RefreshCw } from "lucide-react";
import { createAccount, getBalance } from "../../services/accountService";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";

const ACCOUNT_TYPES = ["SAVINGS", "CURRENT", "SALARY"];

export default function AccountsPage() {
    const [showCreate, setShowCreate] = useState(false);
    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingBalance, setLoadingBalance] = useState({});
    const [accounts, setAccounts] = useState([]);
    const [visibleBalances, setVisibleBalances] = useState({});
    const [form, setForm] = useState({ accountType: "SAVINGS", transactionPin: "" });
    const [pageLoading, setPageLoading] = useState(true);

    // Simulate initial load (replace with real fetch if you have a "get all accounts" endpoint)
    useEffect(() => {
        const t = setTimeout(() => setPageLoading(false), 900);
        return () => clearTimeout(t);
    }, []);

    const handleCreate = async () => {
        if (!form.transactionPin || form.transactionPin.length < 4) {
            return toast.error("Enter a valid 4-digit transaction PIN");
        }
        setLoadingCreate(true);
        try {
            const res = await createAccount({
                accountType: form.accountType,
                transactionPin: form.transactionPin,
            });
            // API Response: { accountNumber, accountType, balance, accountStatus }
            const newAccount = res.data;
            setAccounts((prev) => [...prev, newAccount]);
            toast.success(`${form.accountType} account created — ${newAccount.accountNumber}`);
            setShowCreate(false);
            setForm({ accountType: "SAVINGS", transactionPin: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create account");
        } finally {
            setLoadingCreate(false);
        }
    };

    const fetchBalance = async (accountNumber) => {
        setLoadingBalance((p) => ({ ...p, [accountNumber]: true }));
        try {
            const res = await getBalance(accountNumber);
            // API Response: { accountNumber, accountType, balance, accountStatus }
            setVisibleBalances((p) => ({ ...p, [accountNumber]: res.data.balance }));
            // Also update accountStatus in case it changed
            setAccounts((prev) =>
                prev.map((a) =>
                    a.accountNumber === accountNumber
                        ? { ...a, accountStatus: res.data.accountStatus, balance: res.data.balance }
                        : a
                )
            );
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not fetch balance");
        } finally {
            setLoadingBalance((p) => ({ ...p, [accountNumber]: false }));
        }
    };

    const toggleBalance = (accountNumber) => {
        if (visibleBalances[accountNumber] !== undefined) {
            // Hide it
            setVisibleBalances((p) => {
                const copy = { ...p };
                delete copy[accountNumber];
                return copy;
            });
        } else {
            fetchBalance(accountNumber);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Accounts</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Manage your NeoVault bank accounts</p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> New Account
                </button>
            </div>

            {/* Account cards grid */}
            {pageLoading ? (
                <div className="grid md:grid-cols-2 gap-5">
                    {[1, 2].map((i) => <SkeletonCard key={i} />)}
                </div>
            ) : accounts.length === 0 ? (
                /* Empty state */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-12 text-center"
                >
                    <div className="w-16 h-16 rounded-3xl bg-navy-800/60 flex items-center justify-center mx-auto mb-4">
                        <CreditCard size={28} className="text-gray-500" />
                    </div>
                    <p className="text-lg font-semibold text-white mb-2">No accounts yet</p>
                    <p className="text-gray-500 text-sm mb-6">Create your first bank account to get started</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
                        <Plus size={16} /> Open an Account
                    </button>
                </motion.div>
            ) : (
                <div className="grid md:grid-cols-2 gap-5">
                    {accounts.map((acc, i) => (
                        <motion.div
                            key={acc.accountNumber}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300"
                        >
                            {/* Decorative blobs */}
                            <div className="absolute top-0 right-0 w-40 h-40 bg-navy-500/10 rounded-full -translate-x-4 -translate-y-8 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-vault-red/5 rounded-full translate-x-2 translate-y-6 pointer-events-none" />

                            <div className="relative z-10">
                                {/* Top row */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center">
                                            {acc.accountType === "SAVINGS"
                                                ? <Wallet size={18} className="text-white" />
                                                : <CreditCard size={18} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                                                {acc.accountType}
                                            </p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                                                {acc.accountNumber}
                                            </p>
                                        </div>
                                    </div>
                                    {/* accountStatus from API response */}
                                    <StatusBadge status={acc.accountStatus} />
                                </div>

                                {/* Balance row */}
                                <div className="mb-5">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                                        Available Balance
                                    </p>
                                    <div className="flex items-center gap-3">
                                        {visibleBalances[acc.accountNumber] !== undefined ? (
                                            <p className="text-3xl font-bold text-white font-display">
                                                ₹{Number(visibleBalances[acc.accountNumber]).toLocaleString("en-IN", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            })}
                                            </p>
                                        ) : (
                                            <p className="text-3xl font-bold text-white font-display tracking-widest">
                                                ₹ ••••••
                                            </p>
                                        )}
                                        <button
                                            onClick={() => toggleBalance(acc.accountNumber)}
                                            disabled={loadingBalance[acc.accountNumber]}
                                            className="text-gray-500 hover:text-white transition-colors"
                                        >
                                            {loadingBalance[acc.accountNumber]
                                                ? <RefreshCw size={17} className="animate-spin" />
                                                : visibleBalances[acc.accountNumber] !== undefined
                                                    ? <EyeOff size={17} />
                                                    : <Eye size={17} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Card number decoration */}
                                <div className="flex items-center gap-2 pt-4 border-t border-vault-border/40">
                  <span className="text-xs font-mono text-gray-600 tracking-widest">
                    •••• •••• •••• {acc.accountNumber.slice(-4)}
                  </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Account Modal */}
            <Modal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                title="Open New Account"
            >
                <div className="space-y-5">
                    {/* Account type selector */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2.5 block">Account Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ACCOUNT_TYPES.map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setForm({ ...form, accountType: type })}
                                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                                        form.accountType === type
                                            ? "bg-navy-600 text-white border border-navy-500 shadow-glow"
                                            : "glass-card text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Transaction PIN */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2.5 block">
                            Transaction PIN <span className="text-gray-600">(4 digits)</span>
                        </label>
                        <input
                            type="password"
                            inputMode="numeric"
                            maxLength={4}
                            placeholder="••••"
                            className="input-field text-center text-2xl tracking-[0.5em] font-mono"
                            value={form.transactionPin}
                            onChange={(e) =>
                                setForm({ ...form, transactionPin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                            }
                        />
                        <p className="text-xs text-gray-600 mt-1.5">
                            This PIN is required for all withdrawals and transfers.
                        </p>
                    </div>

                    <button
                        onClick={handleCreate}
                        disabled={loadingCreate}
                        className="btn-primary w-full"
                    >
                        {loadingCreate ? "Creating Account..." : "Create Account"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}