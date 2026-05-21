import { createSlice } from '@reduxjs/toolkit';

const accountSlice = createSlice({
    name: 'account',
    initialState: {
        currentAccount: null,
    },
    reducers: {

        setAccount: (state, action) => {
            state.currentAccount = action.payload;
        },
        clearAccount: (state) => {
            state.currentAccount = null;
        }
    },
});


export const { setAccount, clearAccount } = accountSlice.actions;

export default accountSlice.reducer;