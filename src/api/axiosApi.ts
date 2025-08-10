// src/api.js
import axios from "axios"
const envApiUrl = process.env.VITE_API_URL
const baseURL = envApiUrl || "http://localhost:4000"
const email = "bob@demo.local"
const api = axios.create({ baseURL })
let token: string | null = null
export const login = async (email: string) => {
  try {
    const res = await axios.post(`${baseURL}/auth/login`, {
      email,
      password: "demo123",
    })
    
    token = res.data.token
    return res.data.token
  } catch (err) {
    console.error("Demo login failed", err)
    alert("Demo login failed")
  }
}

token = await login(email)

api.interceptors.request.use((config) => {
  // token = await login(email)
  // const token = localStorage.getItem("token");
  if (token) {
    if (config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    //  else {
    //   config.headers = {...config.headers, Authorization: `Bearer ${token}` };
    // }
  }
  return config
})

export default api
