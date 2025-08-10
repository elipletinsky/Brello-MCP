"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/api.js
const axios_1 = __importDefault(require("axios"));
const envApiUrl = process.env.VITE_API_URL;
const baseURL = envApiUrl || "http://localhost:4000";
const email = "bob@demo.local";
const api = axios_1.default.create({ baseURL });
const login = async (email) => {
    try {
        const res = await axios_1.default.post(`${baseURL}/auth/login`, {
            email,
            password: "demo123",
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("demoEmail", email);
        return res.data.token;
    }
    catch (err) {
        console.error("Demo login failed", err);
        alert("Demo login failed");
    }
};
api.interceptors.request.use((config) => {
    const token = login(email);
    if (token) {
        if (config.headers) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        //  else {
        //   config.headers = {...config.headers, Authorization: `Bearer ${token}` };
        // }
    }
    return config;
});
exports.default = api;
