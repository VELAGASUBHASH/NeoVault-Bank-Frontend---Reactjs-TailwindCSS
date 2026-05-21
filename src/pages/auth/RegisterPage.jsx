import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Vault, User, Mail, Lock, ArrowRight, CheckCircle } from "lucide-react";
import { sendRegisterOtp, verifyRegisterOtp } from "../../services/authService";
import OtpInput from "../../components/ui/OtpInput";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.password) return toast.error("All fields required");
        setLoading(true);
        try {
            await sendRegisterOtp(form);
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length < 6) return toast.error("Enter complete OTP");
        setLoading(true);
        try {
            await verifyRegisterOtp({ email: form.email, otp });
            setStep(3);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-12">
            <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-navy-600/15 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card-dark p-8 shadow-glass">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-vault-red flex items-center justify-center">
                            <Vault size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-display text-lg font-bold text-white">NeoVault</p>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Create Account</p>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-navy-500" : "bg-vault-border"}`} />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
                                <p className="text-gray-500 text-sm mb-6">Start your secure banking journey</p>
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div className="relative">
                                        <User size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                                        <input
                                            type="text" placeholder="Full Name"
                                            className="input-field pl-10"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                                        <input
                                            type="email" placeholder="Email Address"
                                            className="input-field pl-10"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                                        <input
                                            type="password" placeholder="Password"
                                            className="input-field pl-10"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
                                        {loading ? "Sending OTP..." : <><span>Send OTP</span><ArrowRight size={16} /></>}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="text-2xl font-bold text-white mb-2">Verify your email</h2>
                                <p className="text-gray-500 text-sm mb-6">We sent a 6-digit code to <span className="text-navy-300">{form.email}</span></p>
                                <div className="mb-6">
                                    <OtpInput value={otp} onChange={setOtp} />
                                </div>
                                <button onClick={handleVerify} disabled={loading} className="btn-primary w-full">
                                    {loading ? "Verifying..." : "Verify & Register"}
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                                <CheckCircle size={56} className="text-green-400 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
                                <p className="text-gray-500 text-sm mb-6">You're all set. Sign in to get started.</p>
                                <button onClick={() => navigate("/login")} className="btn-primary w-full">Go to Login</button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <p className="text-center text-sm text-gray-500 mt-5">
                            Already have an account?{" "}
                            <Link to="/login" className="text-navy-300 hover:text-white transition-colors">Sign In</Link>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}