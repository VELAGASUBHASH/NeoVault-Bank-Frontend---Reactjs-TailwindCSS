import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, ArrowRight, Vault } from "lucide-react";

const features = [
    { icon: Shield, title: "Bank-Grade Security", desc: "End-to-end encryption with multi-factor authentication protecting every transaction." },
    { icon: Zap,    title: "Instant Transfers",   desc: "Send money anywhere in real-time with zero hidden charges and full transparency." },
    { icon: Globe,  title: "Smart Banking",       desc: "AI-powered insights, spending analytics, and intelligent loan recommendations." },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-navy-950 overflow-hidden">
            {/* Gradient orbs */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-vault-red/10 rounded-full blur-3xl pointer-events-none" />

            {/* Navbar */}
            <header className="flex items-center justify-between px-6 md:px-12 py-5 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-navy-500 to-vault-red flex items-center justify-center">
                        <Vault size={18} className="text-white" />
                    </div>
                    <span className="font-display text-xl font-bold text-white">NeoVault</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/login")} className="btn-ghost text-sm">Sign In</button>
                    <button onClick={() => navigate("/register")} className="btn-primary text-sm">Get Started</button>
                </div>
            </header>

            {/* Hero */}
            <section className="relative z-10 text-center px-6 py-24 md:py-36">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                    <div className="inline-flex items-center gap-2 glass-card px-4 py-2 text-xs text-navy-300 font-mono tracking-widest uppercase mb-8">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Next-Gen Digital Banking
                    </div>
                    <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
                        Banking Designed<br />
                        <span className="bg-gradient-to-r from-navy-400 via-blue-300 to-navy-200 bg-clip-text text-transparent">
              for the Future
            </span>
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        NeoVault combines enterprise-grade security with a beautifully intuitive experience.
                        Manage accounts, transfer funds, and access smart loans — all in one platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate("/register")}
                            className="btn-primary flex items-center justify-center gap-2 text-base"
                        >
                            Open Your Account <ArrowRight size={18} />
                        </button>
                        <button onClick={() => navigate("/login")} className="btn-ghost text-base">
                            Sign In
                        </button>
                    </div>
                </motion.div>

                {/* Floating card */}
                <motion.div
                    className="mt-16 mx-auto max-w-sm"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="glass-card p-6 text-left shadow-glow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-500 to-vault-red flex items-center justify-center font-bold">V</div>
                            <div>
                                <p className="text-sm font-semibold">Velaga Subhash</p>
                                <p className="text-xs text-gray-500 font-mono">•••• •••• •••• 4821</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Available Balance</p>
                        <p className="text-3xl font-bold font-display text-white">₹2,48,350.00</p>
                        <div className="mt-4 flex gap-2">
                            {["SAVINGS", "ACTIVE"].map((tag) => (
                                <span key={tag} className="text-[10px] px-2 py-1 bg-navy-800/60 text-gray-400 rounded-lg font-mono">{tag}</span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features */}
            <section className="relative z-10 px-6 md:px-12 py-16">
                <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
                    {features.map(({ icon: Icon, title, desc }, i) => (
                        <motion.div
                            key={title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="glass-card p-6 group hover:scale-[1.03] transition-transform duration-300"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                                <Icon size={22} className="text-navy-300" />
                            </div>
                            <h3 className="font-semibold text-white mb-2">{title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <footer className="text-center py-8 text-gray-600 text-sm border-t border-vault-border">
                © 2025 NeoVault. Secure. Smart. Simple.
            </footer>
        </div>
    );
}