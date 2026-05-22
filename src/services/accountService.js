import api from "./api";

export const createAccount = (data) => api.post("/api/accounts/create", data);

export const getBalance = (accountNumber) =>
    api.get(`/api/accounts/balance/${accountNumber}`);

export const getMyAccount = async () => {
    // FIX: Added "/api" to the beginning of the URL route
    const response = await api.get("/api/accounts/my-account");
    return response.data;
};