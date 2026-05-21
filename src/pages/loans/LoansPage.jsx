import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Landmark, Plus, Calendar, RefreshCw, TrendingDown } from "lucide-react";
import { applyLoan, getLoans } from "../../services/loanService";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { SkeletonCard } from "../../components/ui/SkeletonLoader";

// loanType: PERSONAL | HOME | EDUCATION | BUSINESS
const LOAN_TYPES = ["PERSONAL", "HOME", "EDUCATION", "BUSINESS"];

function formatDate(isoStr) {
    if (!isoStr) return "—";
    return new Date(isoStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });
}

export default function LoansPage() {
    const [showApply, setShowApply]     = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [loansLoading, setLoansLoading] = useState(false);
    const [loans, setLoans]             = useState([]);
    const [form, setForm] = useState({
        accountNumber: "",
        loanType:      "PERSONAL",
        amount:        "",
        durationMonths: "",
    });

    // ── Fetch loans ────────────────────────────────────────────────────────────
    const fetchLoans = useCallback(async (accNum) => {
        if (!accNum || accNum.length < 5) return;
        setLoansLoading(true);
        try {
            const res = await getLoans(accNum);
            // API returns array of loan objects:
            // { loanId, accountNumber, loanType, principalAmount,
            //   remainingAmount, emi, status, nextDueDate }
            setLoans(res.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not fetch loans");
        } finally {
            setLoansLoading(false);
        }
    }, []);

    // Refresh loans when account number changes (debounced)
    useEffect(() => {
        if (form.accountNumber.length >= 10) {
            const t = setTimeout(() => fetchLoans(form.accountNumber), 600);
            return () => clearTimeout(t);
        }
    }, [form.accountNumber, fetchLoans]);

    // ── Apply for loan ────────────────────────────────────────────────────────
    const handleApply = async () => {
        if (!form.accountNumber || !form.amount || !form.durationMonths)
            return toast.error("Fill all required fields");
        setSubmitting(true);
        try {
            const res = await applyLoan({
                accountNumber:  form.accountNumber,
                loanType:       form.loanType,
                amount:         parseFloat(form.amount),
                durationMonths: parseInt(form.durationMonths),
            });
            // API Response: { loanId, accountNumber, loanType, principalAmount,
            //                 remainingAmount, emi, status, nextDueDate }
            const newLoan = res.data;
            setLoans((prev) => [newLoan, ...prev]);
            toast.success(`${form.loanType} loan application submitted!`);
            setShowApply(false);
            setForm({ accountNumber: form.accountNumber, loanType: "PERSONAL", amount: "", durationMonths: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Loan application failed");
        } finally {
            setSubmitting(false);
        }
    };

    // EMI preview using same formula backend likely uses
    const previewEmi = () => {
        const p = parseFloat(form.amount);
        const n = parseInt(form.durationMonths);
        if (!p || !n) return null;
        const r = 10 / 12 / 100; // 10% p.a. monthly
        return Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
    };

    const emiPreview = previewEmi();

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalBorrowed   = loans.reduce((s, l) => s + (l.principalAmount || 0), 0);
    const totalRemaining  = loans.reduce((s, l) => s + (l.remainingAmount || 0), 0);
    const totalEmi        = loans.filter((l) => l.status === "APPROVED").reduce((s, l) => s + (l.emi || 0), 0);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Loans</h1>
                    <p className="text-gray-500 text-sm mt-0.5">Apply and track your loan applications</p>
                </div>
                <button
                    onClick={() => setShowApply(true)}
                    className="btn-primary flex items-center gap-2 text-sm"
                >
                    <Plus size={16} /> Apply for Loan
                </button>
            </div>

            {/* Account number input for fetching loans */}
            <div className="glass-card p-4 flex items-center gap-3">
                <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block uppercase tracking-wider">
                        Enter Account Number to view loans
                    </label>
                    <input
                        placeholder="e.g. IND2026511078"
                        className="input-field font-mono text-sm py-2"
                        value={form.accountNumber}
                        onChange={(e) => setForm({ ...form, accountNumber: e.target.value.trim() })}
                    />
                </div>
                <button
                    onClick={() => fetchLoans(form.accountNumber)}
                    disabled={loansLoading || !form.accountNumber}
                    className="btn-ghost flex items-center gap-2 text-sm mt-5"
                >
                    <RefreshCw size={15} className={loansLoading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </div>

            {/* Summary cards */}
            {loans.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { label: "Total Borrowed",   value: `₹${totalBorrowed.toLocaleString("en-IN")}`,  sub: `${loans.length} loan(s)` },
                        { label: "Total Remaining",  value: `₹${totalRemaining.toLocaleString("en-IN")}`, sub: "Outstanding principal" },
                        { label: "Monthly EMI",      value: `₹${Math.round(totalEmi).toLocaleString("en-IN")}`, sub: "Approved loans only" },
                    ].map(({ label, value, sub }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card p-5"
                        >
                            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                            <p className="text-2xl font-bold text-white font-display">{value}</p>
                            <p className="text-xs text-gray-600 mt-1">{sub}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Loan cards */}
            {loansLoading ? (
                <div className="grid gap-4">
                    {[1, 2].map((i) => <SkeletonCard key={i} />)}
                </div>
            ) : loans.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <div className="w-16 h-16 rounded-3xl bg-navy-800/60 flex items-center justify-center mx-auto mb-4">
                        <Landmark size={28} className="text-gray-500" />
                    </div>
                    <p className="text-lg font-semibold text-white mb-2">No loans found</p>
                    <p className="text-gray-500 text-sm mb-6">
                        {form.accountNumber.length >= 10
                            ? "No loans linked to this account"
                            : "Enter an account number above to view loans"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {loans.map((loan, i) => {
                        const repaidPercent = loan.principalAmount
                            ? Math.round(((loan.principalAmount - loan.remainingAmount) / loan.principalAmount) * 100)
                            : 0;
                        return (
                            <motion.div
                                key={loan.loanId}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="glass-card p-6"
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center">
                                            <Landmark size={20} className="text-navy-300" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{loan.loanType} LOAN</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">{loan.loanId}</p>
                                        </div>
                                    </div>
                                    <StatusBadge status={loan.status} />
                                </div>

                                {/* Metrics grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Principal</p>
                                        <p className="font-semibold text-white text-sm">
                                            ₹{Number(loan.principalAmount).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Remaining</p>
                                        <p className="font-semibold text-vault-red text-sm">
                                            ₹{Number(loan.remainingAmount).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">EMI / Month</p>
                                        <p className="font-semibold text-white text-sm">
                                            ₹{Number(loan.emi).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-0.5">Next Due Date</p>
                                        <p className="font-semibold text-white text-sm flex items-center gap-1">
                                            <Calendar size={13} className="text-navy-300" />
                                            {formatDate(loan.nextDueDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Repayment progress */}
                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span className="flex items-center gap-1">
                      <TrendingDown size={12} /> Repayment Progress
                    </span>
                                        <span>{repaidPercent}%</span>
                                    </div>
                                    <div className="h-2 bg-navy-800/70 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${repaidPercent}%` }}
                                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-navy-500 to-blue-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Apply for Loan Modal */}
            <Modal open={showApply} onClose={() => setShowApply(false)} title="Apply for a Loan" size="lg">
                <div className="space-y-4">
                    {/* Account Number */}
                    <div>
                        <label className="text-sm text-gray-400 mb-1.5 block">Account Number *</label>
                        <input
                            placeholder="e.g. IND2026511078"
                            className="input-field font-mono text-sm"
                            value={form.accountNumber}
                            onChange={(e) => setForm({ ...form, accountNumber: e.target.value.trim() })}
                        />
                    </div>

                    {/* Loan Type */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Loan Type</label>
                        <div className="grid grid-cols-4 gap-2">
                            {LOAN_TYPES.map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setForm({ ...form, loanType: t })}
                                    className={`py-2.5 rounded-xl text-xs font-medium transition-all ${
                                        form.loanType === t
                                            ? "bg-navy-600 text-white border border-navy-500"
                                            : "glass-card text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount + Duration */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Loan Amount *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3.5 text-gray-400 text-sm">₹</span>
                                <input
                                    type="number" min="1000" placeholder="500000"
                                    className="input-field pl-7"
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm text-gray-400 mb-1.5 block">Duration (months) *</label>
                            <input
                                type="number" min="1" max="360" placeholder="24"
                                className="input-field"
                                value={form.durationMonths}
                                onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* EMI Preview */}
                    {emiPreview && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-4 rounded-2xl bg-navy-800/50 border border-vault-border"
                        >
                            <Calendar size={18} className="text-navy-300 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-gray-500">Estimated Monthly EMI (10% p.a.)</p>
                                <p className="text-xl font-bold text-white font-display">
                                    ₹{emiPreview.toLocaleString("en-IN")}
                                </p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                    Actual EMI will be confirmed after approval.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <button
                        onClick={handleApply}
                        disabled={submitting}
                        className="btn-primary w-full"
                    >
                        {submitting ? "Submitting Application..." : "Submit Loan Application"}
                    </button>
                </div>
            </Modal>
        </div>
    );
}