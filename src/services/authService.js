import api from "./api";

export const sendRegisterOtp = (data) => api.post("/api/auth/register/send-otp", data);
export const verifyRegisterOtp = (data) => api.post("/api/auth/register/verify-otp", data);
export const login = (data) => api.post("/api/auth/login", data);
export const verifyLoginOtp = (data) => api.post("/api/auth/login/verify-otp", data);