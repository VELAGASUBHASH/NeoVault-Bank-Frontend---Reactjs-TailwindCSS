import api from "./api";

export const freezeAccount = (accountNumber) =>
    api.put(`/api/admin/accounts/freeze/${accountNumber}`);
export const unfreezeAccount = (accountNumber) =>
    api.put(`/api/admin/accounts/unfreeze/${accountNumber}`);
export const closeAccount = (accountNumber) =>
    api.put(`/api/admin/accounts/close/${accountNumber}`);
export const approveLoan = (loanId) =>
    api.put(`/api/admin/loans/${loanId}/approve`);