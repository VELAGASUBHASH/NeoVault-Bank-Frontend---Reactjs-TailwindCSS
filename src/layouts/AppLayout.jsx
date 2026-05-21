import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { getMyAccount } from "../services/accountService";
import { setAccount } from "../store/accountSlice";

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();


    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const accountData = await getMyAccount();
                dispatch(setAccount(accountData));
            } catch (error) {
                console.error("Account fetch failed:", error);
                // Optionally dispatch an error or handle empty state
            }
        };

        if (user && user.role !== 'ROLE_ADMIN') {
            fetchAccountData();
        }
    }, [user, dispatch]);

    return (
        <div className="flex h-screen overflow-hidden bg-navy-950 text-white">

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    >

                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
}