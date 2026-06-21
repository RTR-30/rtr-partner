import { configureStore } from "@reduxjs/toolkit";
import statusReducer from "./reduxReducer";

const store = configureStore({
    reducer: {
        status: statusReducer,
    },
});

export default store;
