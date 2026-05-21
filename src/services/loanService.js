import api from "./api";

export const applyLoan = (data) => api.post("/api/loans/apply", data);


export const getLoans = (accountNumber) =>
    api.get(`/api/loans/${accountNumber}`);