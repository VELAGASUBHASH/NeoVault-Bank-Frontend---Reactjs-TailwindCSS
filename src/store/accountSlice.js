import { createSlice } from "@reduxjs/toolkit";

const accountSlice = createSlice({
    name: "account",
    initialState: {
        accounts: [],
        selectedAccount: null,
        balance: null,
    },
    reducers: {
        setAccounts(state, action) {
            state.accounts = action.payload;
        },
        setSelectedAccount(state, action) {
            state.selectedAccount = action.payload;
        },
        setBalance(state, action) {
            state.balance = action.payload;
        },
    },
});

export const { setAccounts, setSelectedAccount, setBalance } = accountSlice.actions;
export default accountSlice.reducer;