import { createSlice } from "@reduxjs/toolkit";

const token = localStorage.getItem("accessToken");
const user = JSON.parse(localStorage.getItem("user") || "null");

const authSlice = createSlice({
    name: "auth",
    initialState: {
        isAuthenticated: !!token,
        user: user,
        accessToken: token,
        refreshToken: localStorage.getItem("refreshToken"),
    },
    reducers: {
        loginSuccess(state, action) {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            localStorage.setItem("accessToken", action.payload.accessToken);
            localStorage.setItem("refreshToken", action.payload.refreshToken);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        logout(state) {
            state.isAuthenticated = false;
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            localStorage.clear();
        },
        updateUser(state, action) {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem("user", JSON.stringify(state.user));
        },
    },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;