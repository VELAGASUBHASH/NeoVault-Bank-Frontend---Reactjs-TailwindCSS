import api from "./api";


export const createAccount = (data) => api.post("/api/accounts/create", data);

export const getBalance = (accountNumber) =>
    api.get(`/api/accounts/balance/${accountNumber}`);



export const getMyAccount = async () => {
    // A clean GET request with no empty body configurations
    const response = await api.get("/accounts/my-account");
    return response.data;
};