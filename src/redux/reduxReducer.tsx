import { createSlice } from "@reduxjs/toolkit";

const statusSlice = createSlice({
    name: "status",
    initialState: {
        isEnabled: false, // Default state
    },
    reducers: {
        toggleStatus: (state) => {
            state.isEnabled = !state.isEnabled;
        },
        setStatus: (state, action) => {
            state.isEnabled = action.payload;
        },
    },
});

export const { toggleStatus, setStatus } = statusSlice.actions;
export default statusSlice.reducer;
