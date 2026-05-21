import api from "./api";


export const createAccount = (data) => api.post("/api/accounts/create", data);

export const getBalance = (accountNumber) =>
    api.get(`/api/accounts/balance/${accountNumber}`);