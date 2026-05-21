import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
    Search, Filter, RefreshCw, CheckCircle2, XCircle,
} from "lucide-react";
import {
    deposit,
    withdraw,
    transfer,
    verifyTransferOtp,
    getTransactionHistory,
} from "../../services/transactionService";
import Modal from "../../components/ui/Modal";
import OtpInput from "../../components/ui/OtpInput";
import StatusBadge from "../../components/ui/StatusBadge";
import { SkeletonTable } from "../../components/ui/SkeletonLoader";

const tabs = [
    { id: "deposit",  label: "Deposit",  icon: ArrowDownLeft,  color: "text-green-400" },
    { id: "withdraw", label: "Withdraw", icon: ArrowUpRight,   color: "text-orange-400" },
    { id: "transfer", label: "Transfer", icon: ArrowLeftRight, color: "text-navy-300" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDateTime(isoStr) {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

function txIcon(type) {
    switch (type) {
        case "DEPOSIT":  return <ArrowDownLeft size={16} className="text-green-400" />;
        case "WITHDRAW": return <ArrowUpRight  size={16} className="text-orange-400" />;
        default:         return <ArrowLeftRight size={16} className="text-navy-300" />;
    }
}

function txColor(type) {
    return type === "DEPOSIT" ? "text-green-400" : "text-vault-red";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
    const { user } = useSelector((s) => s.auth);

    const [activeTab, setActiveTab]       = useState("deposit");
    const [submitting, setSubmitting]     = useState(false);
    const [histLoading, setHistLoading]   = useState(false);
    const [history, setHistory]           = useState([]);
    const [search, setSearch]             = useState("");
    const [otp, setOtp]                   = useState("");
    const [showOtp, setShowOtp]           = useState(false);
    const [pendingTransfer, setPendingTransfer] = useState(null); // store form snapshot
    const [resultModal, setResultModal]   = useState(null); // { success, message }

    const [form, setForm] = useState({
        accountNumber:  "",
        amount:         "",
        transactionPin: "",
        // transfer-only
        receiverAccount: "",
    });

    const resetForm = () =>
        setForm({ accountNumber: "", amount: "", transactionPin: "", receiverAccount: "" });

    // ── Fetch transaction history ──────────────────────────────────────────────
    const fetchHistory = useCallback(async (accNum) => {
        if (!accNum || accNum.length < 5) return;
        setHistLoading(true);
        try {
            const res = await getTransactionHistory(accNum);
            // API returns array: [{ id, type, amount, senderAccount, receiverAccount,
            //                       transactionReference, status, createdAt }]
            setHistory(res.data);
        } catch {
            toast.error("Could not load transaction history");
        } finally {
            setHistLoading(false);
        }
    }, []);

    // Auto-fetch history when accountNumber typed (debounced)
    useEffect(() => {
        if (form.accountNumber.length >= 10) {
            const t = setTimeout(() => fetchHistory(form.accountNumber), 600);
            return () => clearTimeout(t);
        }
    }, [form.accountNumber, fetchHistory]);

    // ── Deposit ───────────────────────────────────────────────────────────────
    const handleDeposit = async () => {
        if (!form.accountNumber || !form.amount) return toast.error("Account number and amount required");
        setSubmitting(true);
        try {
            await deposit({
                accountNumber: form.accountNumber,
                amount: parseFloat(form.amount),
            });
            // API returns: "Deposit successful"
            setResultModal({ success: true, message: `₹${Number(form.amount).toLocaleString("en-IN")} deposited successfully!` });
            fetchHistory(form.accountNumber);
            setForm((p) => ({ ...p, amount: "" }));
        } catch (err) {
            setResultModal({ success: false, message: err.response?.data?.message || "Deposit failed" });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Withdraw ──────────────────────────────────────────────────────────────
    const handleWithdraw = async () => {
        if (!form.accountNumber || !form.amount || !form.transactionPin)
            return toast.error("All fields required");
        setSubmitting(true);
        try {
            await withdraw({
                accountNumber:  form.accountNumber,
                amount:         parseFloat(form.amount),
                transactionPin: form.transactionPin,
            });
            // API returns: "Withdrawal successful"
            setResultModal({ success: true, message: `₹${Number(form.amount).toLocaleString("en-IN")} withdrawn successfully!` });
            fetchHistory(form.accountNumber);
            setForm((p) => ({ ...p, amount: "", transactionPin: "" }));
        } catch (err) {
            setResultModal({ success: false, message: err.response?.data?.message || "Withdrawal failed" });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Transfer ──────────────────────────────────────────────────────────────
    const handleTransfer = async () => {
        if (!form.accountNumber || !form.receiverAccount || !form.amount || !form.transactionPin)
            return toast.error("All fields required");

        setSubmitting(true);
        try {
            const res = await transfer({
                senderAccount:   form.accountNumber,
                receiverAccount: form.receiverAccount,
                amount:          parseFloat(form.amount),
                transactionPin:  form.transactionPin,
            });
            // API: "Transfer successful"   OR
            //      "Large transaction detected. OTP sent to registered email. Verify OTP first."
            const msg = res.data;
            if (typeof msg === "string" && msg.toLowerCase().includes("otp sent")) {
                setPendingTransfer({ ...form });
                setShowOtp(true);
                toast("OTP sent to your email — verify to complete transfer", { icon: "📧" });
            } else {
                setResultModal({ success: true, message: `₹${Number(form.amount).toLocaleString("en-IN")} transferred successfully!` });
                fetchHistory(form.accountNumber);
                resetForm();
            }
        } catch (err) {
            setResultModal({ success: false, message: err.response?.data?.message || "Transfer failed" });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Verify large transfer OTP ─────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (otp.length < 6) return toast.error("Enter complete 6-digit OTP");
        setSubmitting(true);
        try {
            await verifyTransferOtp({
                email: user?.email || "",
                otp,
            });
            // API returns: "OTP verified successfully"
            setShowOtp(false);
            setOtp("");
            setPendingTransfer(null);
            setResultModal({ success: true, message: `Large transfer of ₹${Number(pendingTransfer?.amount || 0).toLocaleString("en-IN")} verified and completed!` });
            if (pendingTransfer?.accountNumber) fetchHistory(pendingTransfer.accountNumber);
            resetForm();
        } catch (err) {
            toast.error(err.response?.data?.message || "OTP verification failed");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Filtered history ──────────────────────────────────────────────────────
    const filtered = history.filter((tx) =>
        tx.transactionReference?.toLowerCase().includes(search.toLowerCase()) ||
        tx.type?.toLowerCase().includes(search.toLowerCase()) ||
        tx.status?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Transactions</h1>
                <p className="text-gray-500 text-sm mt-0.5">Deposit, withdraw, and transfer funds securely</p>
            </div>

            {/* Tab switcher */}
            <div className="glass-card p-1 flex gap-1 w-fit">
                {tabs.map(({ id, label, icon: Icon, color }) => (
                    <button
                        key={id}
                        onClick={() => { setActiveTab(id); resetForm(); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === id
                                ? "bg-navy-600/60 text-white shadow-inner"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Icon size={15} className={activeTab === id ? color : ""} />
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">
                {/* ── Transaction Form ───────────────────────────────────────── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="lg:col-span-2 glass-card p-6 h-fit"
                    >
                        <h3 className="font-semibold text-white mb-5 capitalize">
                            {activeTab} Money
                        </h3>
                        <div className="space-y-4">
                            {/* Sender / Account Number */}
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider">
                                    {activeTab === "transfer" ? "Your Account Number" : "Account Number"}
                                </label>
                                <input
                                    placeholder="e.g. IND2026511078"
                                    className="input-field font-mono text-sm"
                                    value={form.accountNumber}
                                    onChange={(e) => setForm({ ...form, accountNumber: e.target.value.trim() })}
                                />
                            </div>

                            {/* Transfer-only: receiver */}
                            {activeTab === "transfer" && (
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider">
                                        Recipient Account Number
                                    </label>
                                    <input
                                        placeholder="e.g. IND9876543210"
                                        className="input-field font-mono text-sm"
                                        value={form.receiverAccount}
                                        onChange={(e) => setForm({ ...form, receiverAccount: e.target.value.trim() })}
                                    />
                                </div>
                            )}

                            {/* Amount */}
                            <div>
                                <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider">Amount</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-3.5 text-gray-400 font-semibold text-sm">₹</span>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="0.00"
                                        className="input-field pl-8 font-mono text-lg"
                                        value={form.amount}
                                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* PIN (withdraw + transfer) */}
                            {activeTab !== "deposit" && (
                                <div>
                                    <label className="text-xs text-gray-500 mb-1.5 block uppercase tracking-wider">
                                        Transaction PIN
                                    </label>
                                    <input
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        placeholder="••••"
                                        className="input-field font-mono tracking-[0.5em] text-center text-xl"
                                        value={form.transactionPin}
                                        onChange={(e) =>
                                            setForm({ ...form, transactionPin: e.target.value.replace(/\D/g, "").slice(0, 4) })
                                        }
                                    />
                                </div>
                            )}

                            {/* Large transfer notice */}
                            {activeTab === "transfer" && Number(form.amount) > 50000 && (
                                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs">
                                    <span className="text-base">⚠</span>
                                    <span>Transfers above ₹50,000 require OTP verification via your registered email.</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                onClick={
                                    activeTab === "deposit" ? handleDeposit
                                        : activeTab === "withdraw" ? handleWithdraw
                                            : handleTransfer
                                }
                                disabled={submitting}
                                className={`w-full mt-1 ${activeTab === "withdraw" ? "btn-danger" : "btn-primary"}`}
                            >
                                {submitting ? "Processing..." : (
                                    `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`
                                    + (form.amount ? ` ₹${Number(form.amount).toLocaleString("en-IN")}` : "")
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ── Transaction History ─────────────────────────────────────── */}
                <div className="lg:col-span-3 glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-white">
                            History
                            {history.length > 0 && (
                                <span className="ml-2 text-xs text-gray-500 font-normal font-mono">{history.length} records</span>
                            )}
                        </h3>
                        <button
                            onClick={() => fetchHistory(form.accountNumber)}
                            disabled={!form.accountNumber || histLoading}
                            className="text-gray-500 hover:text-white transition-colors disabled:opacity-40"
                            title="Refresh history"
                        >
                            <RefreshCw size={16} className={histLoading ? "animate-spin" : ""} />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative mb-4">
                        <Search size={14} className="absolute left-3 top-3.5 text-gray-500" />
                        <input
                            placeholder="Search by type, reference, status..."
                            className="input-field pl-9 py-2.5 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {histLoading ? (
                        <SkeletonTable rows={5} />
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12">
                            <Filter size={32} className="text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                                {history.length === 0
                                    ? form.accountNumber.length >= 10
                                        ? "No transactions found for this account"
                                        : "Enter an account number to load history"
                                    : "No results match your search"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                            {filtered.map((tx) => (
                                <motion.div
                                    key={tx.id}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-start gap-3 p-3 rounded-2xl hover:bg-vault-glass transition-colors"
                                >
                                    {/* Icon */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                        tx.type === "DEPOSIT" ? "bg-green-900/40" : "bg-red-900/30"
                                    }`}>
                                        {txIcon(tx.type)}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white capitalize">{tx.type}</p>
                                        <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                                            {tx.transactionReference}
                                        </p>
                                        {tx.senderAccount && (
                                            <p className="text-[11px] text-gray-600 truncate">
                                                From: {tx.senderAccount}
                                            </p>
                                        )}
                                        {tx.receiverAccount && (
                                            <p className="text-[11px] text-gray-600 truncate">
                                                To: {tx.receiverAccount}
                                            </p>
                                        )}
                                        <p className="text-[11px] text-gray-600 mt-0.5">{formatDateTime(tx.createdAt)}</p>
                                    </div>

                                    {/* Right side */}
                                    <div className="text-right flex-shrink-0">
                                        <p className={`text-sm font-semibold font-mono ${txColor(tx.type)}`}>
                                            {tx.type === "DEPOSIT" ? "+" : "−"}₹{Number(tx.amount).toLocaleString("en-IN", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                        </p>
                                        <div className="mt-1">
                                            <StatusBadge status={tx.status} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Large Transfer OTP Modal ─────────────────────────────────── */}
            <Modal open={showOtp} onClose={() => { setShowOtp(false); setOtp(""); }} title="Verify Large Transfer">
                <div className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">📧</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">OTP sent to</p>
                    <p className="text-white font-medium mb-5">{user?.email}</p>

                    <OtpInput value={otp} onChange={setOtp} />

                    <button
                        onClick={handleVerifyOtp}
                        disabled={submitting || otp.length < 6}
                        className="btn-primary w-full mt-6"
                    >
                        {submitting ? "Verifying..." : "Confirm Transfer"}
                    </button>
                    <button
                        onClick={() => { setShowOtp(false); setOtp(""); setPendingTransfer(null); }}
                        className="w-full text-center text-sm text-gray-500 hover:text-white mt-3 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>

            {/* ── Result Modal (success / failure) ────────────────────────── */}
            <Modal
                open={!!resultModal}
                onClose={() => setResultModal(null)}
                title={resultModal?.success ? "Transaction Successful" : "Transaction Failed"}
                size="sm"
            >
                <div className="text-center py-2">
                    {resultModal?.success
                        ? <CheckCircle2 size={52} className="text-green-400 mx-auto mb-4" />
                        : <XCircle      size={52} className="text-vault-red   mx-auto mb-4" />}
                    <p className="text-gray-300 text-sm mb-5">{resultModal?.message}</p>
                    <button onClick={() => setResultModal(null)} className="btn-primary w-full">
                        Done
                    </button>
                </div>
            </Modal>
        </div>
    );
}