import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, Lock, Unlock, X, CheckCircle, Search, RefreshCw } from "lucide-react";
import {
    freezeAccount,
    unfreezeAccount,
    closeAccount,
    approveLoan,
} from "../../services/adminService";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { getBalance } from "../../services/accountService";
import { getLoans } from "../../services/loanService";

export default function AdminPage() {
    const [loading, setLoading]             = useState({});
    const [confirmModal, setConfirmModal]   = useState(null);
    const [searchAcc, setSearchAcc]         = useState("");
    const [searchLoan, setSearchLoan]       = useState("");

    // For fetching live data
    const [accInput, setAccInput]           = useState("");
    const [loanInput, setLoanInput]         = useState("");
    const [accounts, setAccounts]           = useState([]);
    const [loans, setLoans]                 = useState([]);
    const [fetchingAcc, setFetchingAcc]     = useState(false);
    const [fetchingLoan, setFetchingLoan]   = useState(false);

    const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));

    // Fetch account details by account number (via balance API)
    const fetchAccount = async () => {
        if (!accInput) return toast.error("Enter an account number");
        setFetchingAcc(true);
        try {
            const res = await getBalance(accInput.trim());
            // { accountNumber, accountType, balance, accountStatus }
            const acc = res.data;
            setAccounts((prev) => {
                const exists = prev.find((a) => a.accountNumber === acc.accountNumber);
                if (exists) return prev.map((a) => a.accountNumber === acc.accountNumber ? acc : a);
                return [acc, ...prev];
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Account not found");
        } finally {
            setFetchingAcc(false);
        }
    };

    // Fetch loans by account number
    const fetchLoansByAccount = async () => {
        if (!loanInput) return toast.error("Enter an account number");
        setFetchingLoan(true);
        try {
            const res = await getLoans(loanInput.trim());
            const fetched = res.data; // array of loan objects
            setLoans((prev) => {
                const existing = prev.filter((l) => l.accountNumber !== loanInput.trim());
                return [...existing, ...fetched];
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not fetch loans");
        } finally {
            setFetchingLoan(false);
        }
    };

    // Execute admin action
    const handleAction = async (action, id) => {
        setLoad(id, true);
        try {
            let message = "";
            if (action === "freeze")   { await freezeAccount(id);   message = "Account frozen successfully"; }
            if (action === "unfreeze") { await unfreezeAccount(id); message = "Account unfrozen successfully"; }
            if (action === "close")    { await closeAccount(id);    message = "Account closed successfully"; }
            if (action === "approve")  { await approveLoan(id);     message = "Loan approved and funds disbursed"; }
            toast.success(message);

            // Optimistically update local state
            if (action === "freeze")   setAccounts((p) => p.map((a) => a.accountNumber === id ? { ...a, accountStatus: "FROZEN" } : a));
            if (action === "unfreeze") setAccounts((p) => p.map((a) => a.accountNumber === id ? { ...a, accountStatus: "ACTIVE" } : a));
            if (action === "close")    setAccounts((p) => p.map((a) => a.accountNumber === id ? { ...a, accountStatus: "CLOSED" } : a));
            if (action === "approve")  setLoans((p) => p.map((l) => l.loanId === id ? { ...l, status: "APPROVED" } : l));
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setLoad(id, false);
            setConfirmModal(null);
        }
    };

    const filteredAccounts = accounts.filter(
        (a) =>
            a.accountNumber?.includes(searchAcc) ||
            a.accountType?.toLowerCase().includes(searchAcc.toLowerCase())
    );

    const filteredLoans = loans.filter(
        (l) =>
            l.loanId?.toLowerCase().includes(searchLoan.toLowerCase()) ||
            l.loanType?.toLowerCase().includes(searchLoan.toLowerCase()) ||
            l.accountNumber?.includes(searchLoan)
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-vault-red to-red-900 flex items-center justify-center shadow-card">
                    <ShieldCheck size={22} className="text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                    <p className="text-gray-500 text-sm">Freeze/unfreeze accounts, close accounts, approve loans</p>
                </div>
            </div>

            {/* ── Account Management ─────────────────────────────────────────────── */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-vault-border">
                    <h3 className="font-semibold text-white mb-3">Account Management</h3>
                    {/* Fetch account */}
                    <div className="flex gap-3">
                        <input
                            placeholder="Enter account number (e.g. IND2026511078)"
                            className="input-field font-mono text-sm flex-1 py-2"
                            value={accInput}
                            onChange={(e) => setAccInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchAccount()}
                        />
                        <button onClick={fetchAccount} disabled={fetchingAcc} className="btn-primary text-sm flex items-center gap-2 px-4">
                            <RefreshCw size={14} className={fetchingAcc ? "animate-spin" : ""} />
                            Fetch
                        </button>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input placeholder="Filter..." className="input-field pl-9 py-2 text-sm w-40"
                                   value={searchAcc} onChange={(e) => setSearchAcc(e.target.value)} />
                        </div>
                    </div>
                </div>

                {filteredAccounts.length === 0 ? (
                    <div className="py-10 text-center text-gray-600 text-sm">
                        Fetch an account number above to manage it
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-vault-border">
                                {["Account Number", "Type", "Balance", "Status", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAccounts.map((acc) => (
                                <motion.tr
                                    key={acc.accountNumber}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-vault-border/40 hover:bg-vault-glass transition-colors"
                                >
                                    <td className="px-5 py-4 font-mono text-gray-300 text-xs">{acc.accountNumber}</td>
                                    <td className="px-5 py-4 text-gray-400">{acc.accountType}</td>
                                    <td className="px-5 py-4 text-white font-mono text-sm">
                                        ₹{Number(acc.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                    </td>
                                    {/* API uses "accountStatus" not "status" */}
                                    <td className="px-5 py-4"><StatusBadge status={acc.accountStatus} /></td>
                                    <td className="px-5 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {acc.accountStatus === "FROZEN" ? (
                                                <button
                                                    onClick={() => setConfirmModal({ action: "unfreeze", id: acc.accountNumber, label: "Unfreeze" })}
                                                    disabled={loading[acc.accountNumber]}
                                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-900/40 text-blue-400 hover:bg-blue-900/60 transition-colors"
                                                >
                                                    <Unlock size={12} /> Unfreeze
                                                </button>
                                            ) : acc.accountStatus === "ACTIVE" ? (
                                                <button
                                                    onClick={() => setConfirmModal({ action: "freeze", id: acc.accountNumber, label: "Freeze" })}
                                                    disabled={loading[acc.accountNumber]}
                                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-orange-900/40 text-orange-400 hover:bg-orange-900/60 transition-colors"
                                                >
                                                    <Lock size={12} /> Freeze
                                                </button>
                                            ) : null}
                                            {acc.accountStatus !== "CLOSED" && (
                                                <button
                                                    onClick={() => setConfirmModal({ action: "close", id: acc.accountNumber, label: "Close Account" })}
                                                    disabled={loading[acc.accountNumber]}
                                                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 hover:bg-red-900/60 transition-colors"
                                                >
                                                    {loading[acc.accountNumber]
                                                        ? <RefreshCw size={12} className="animate-spin" />
                                                        : <X size={12} />}
                                                    Close
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ── Loan Approvals ─────────────────────────────────────────────────── */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-vault-border">
                    <h3 className="font-semibold text-white mb-3">Loan Approvals</h3>
                    <div className="flex gap-3">
                        <input
                            placeholder="Enter account number to load loans"
                            className="input-field font-mono text-sm flex-1 py-2"
                            value={loanInput}
                            onChange={(e) => setLoanInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchLoansByAccount()}
                        />
                        <button onClick={fetchLoansByAccount} disabled={fetchingLoan} className="btn-primary text-sm flex items-center gap-2 px-4">
                            <RefreshCw size={14} className={fetchingLoan ? "animate-spin" : ""} />
                            Fetch
                        </button>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-3 text-gray-500" />
                            <input placeholder="Filter..." className="input-field pl-9 py-2 text-sm w-40"
                                   value={searchLoan} onChange={(e) => setSearchLoan(e.target.value)} />
                        </div>
                    </div>
                </div>

                {filteredLoans.length === 0 ? (
                    <div className="py-10 text-center text-gray-600 text-sm">
                        Fetch loans by account number above
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b border-vault-border">
                                {["Loan ID", "Account", "Type", "Principal", "EMI", "Status", "Action"].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-medium">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredLoans.map((loan) => (
                                <motion.tr
                                    key={loan.loanId}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="border-b border-vault-border/40 hover:bg-vault-glass transition-colors"
                                >
                                    <td className="px-5 py-4 font-mono text-gray-400 text-xs">{loan.loanId}</td>
                                    <td className="px-5 py-4 font-mono text-gray-400 text-xs">{loan.accountNumber}</td>
                                    <td className="px-5 py-4 text-gray-300">{loan.loanType}</td>
                                    <td className="px-5 py-4 font-mono text-white text-sm">
                                        ₹{Number(loan.principalAmount).toLocaleString("en-IN")}
                                    </td>
                                    <td className="px-5 py-4 font-mono text-white text-sm">
                                        ₹{Number(loan.emi).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                    </td>
                                    <td className="px-5 py-4"><StatusBadge status={loan.status} /></td>
                                    <td className="px-5 py-4">
                                        {loan.status === "PENDING" ? (
                                            <button
                                                onClick={() => setConfirmModal({ action: "approve", id: loan.loanId, label: "Approve Loan" })}
                                                disabled={loading[loan.loanId]}
                                                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-green-900/40 text-green-400 hover:bg-green-900/60 transition-colors"
                                            >
                                                {loading[loan.loanId]
                                                    ? <RefreshCw size={12} className="animate-spin" />
                                                    : <CheckCircle size={12} />}
                                                Approve
                                            </button>
                                        ) : (
                                            <span className="text-xs text-gray-600">—</span>
                                        )}
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Confirmation modal */}
            <Modal open={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Action" size="sm">
                <p className="text-gray-400 text-sm mb-2">
                    You are about to{" "}
                    <span className="text-white font-semibold">{confirmModal?.label}</span>:
                </p>
                <p className="font-mono text-navy-300 text-sm mb-5 bg-navy-900/50 px-4 py-2 rounded-xl">
                    {confirmModal?.id}
                </p>
                <p className="text-xs text-gray-600 mb-5">This action will be sent to the server immediately.</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal(null)} className="btn-ghost flex-1">Cancel</button>
                    <button
                        onClick={() => handleAction(confirmModal.action, confirmModal.id)}
                        disabled={loading[confirmModal?.id]}
                        className={`flex-1 ${confirmModal?.action === "approve" ? "btn-primary" : "btn-danger"}`}
                    >
                        {loading[confirmModal?.id] ? "Processing..." : `Confirm ${confirmModal?.label}`}
                    </button>
                </div>
            </Modal>
        </div>
    );
}