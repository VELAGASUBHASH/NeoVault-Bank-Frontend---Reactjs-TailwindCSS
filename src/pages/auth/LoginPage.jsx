import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Vault, Mail, Lock, ArrowRight } from "lucide-react";

// Corrected Imports: Importing the verified reducer action and auth API service helper utilities
import { setCredentials } from "../../store/authSlice";
import { login, verifyLoginOtp } from "../../services/authService";
import OtpInput from "../../components/ui/OtpInput";

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [form, setForm] = useState({ email: "", password: "" });

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error("All fields required");
        setLoading(true);
        try {
            await login(form);
            toast.success("OTP sent to your email!");
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) return toast.error("Enter complete OTP");
        setLoading(true);
        try {
            const res = await verifyLoginOtp({ email: form.email, otp });

            const accessToken = res.data?.accessToken || res.data?.token || res.token;

            // FIX: Prioritize the exact name and role sent by the backend AuthResponse
            const user = {
                name: res.data?.name || form.email.split("@")[0],
                email: form.email,
                role: res.data?.role || "ROLE_USER"
            };

            if (!accessToken) {
                throw new Error("Authentication token was not returned from server.");
            }

            dispatch(setCredentials({ user, accessToken }));

            toast.success("Welcome back!");
            navigate("/dashboard");
        } catch (err) {
            toast.error(err.response?.data?.message || err.response?.data || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-12">
            <div className="fixed bottom-1/4 right-1/4 w-64 h-64 bg-vault-red/10 rounded-full blur-3xl" />

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                <div className="glass-card-dark p-8 shadow-glass">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-500 to-vault-red flex items-center justify-center">
                            <Vault size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-display text-lg font-bold text-white">NeoVault</p>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Secure Sign In</p>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-8">
                        {[1, 2].map((s) => (
                            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? "bg-navy-500" : "bg-vault-border"}`} />
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
                                <p className="text-gray-500 text-sm mb-6">Sign in to your NeoVault account</p>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                                        <input
                                            type="email" placeholder="Email Address"
                                            className="input-field pl-10 w-full"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-3.5 top-3.5 text-gray-500" />
                                        <input
                                            type="password" placeholder="Password"
                                            className="input-field pl-10 w-full"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                                        {loading ? "Sending OTP..." : <><span>Continue</span><ArrowRight size={16} /></>}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                <h2 className="text-2xl font-bold text-white mb-2">Verify identity</h2>
                                <p className="text-gray-500 text-sm mb-6">Enter the OTP sent to <span className="text-navy-300">{form.email}</span></p>
                                <div className="mb-6 flex justify-center">
                                    <OtpInput value={otp} onChange={setOtp} />
                                </div>
                                <button onClick={handleVerifyOtp} disabled={loading} className="btn-primary w-full">
                                    {loading ? "Verifying..." : "Sign In"}
                                </button>
                                <button onClick={() => { setStep(1); setOtp(""); }} className="w-full text-center text-sm text-gray-500 hover:text-white mt-3 transition-colors">
                                    ← Back
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <p className="text-center text-sm text-gray-500 mt-5">
                            New to NeoVault?{" "}
                            <Link to="/register" className="text-navy-300 hover:text-white transition-colors">Create Account</Link>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}