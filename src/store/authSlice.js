import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: "auth",
    initialState: {
        // FIX: Initialize state from localStorage so the app knows you are logged in on refresh
        user: JSON.parse(localStorage.getItem("user")) || null,
        token: localStorage.getItem("token") || null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.accessToken;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            localStorage.clear(); // Ensure clean logout
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;