import api from "../../../utils/api";

export type OtpType = "register" | "reset-password" | "forgot-password";

export interface SendOtpData {
  email: string;
  type: OtpType;
}

export interface VerifyOtpData {
  email: string;
  otp: string;
  type: OtpType;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
}

export const authApi = {
  sendOtp: async (data: SendOtpData) => {
    const response = await api.post("/v1/send-otp", data);
    return response.data;
  },
  verifyOtp: async (data: VerifyOtpData) => {
    const response = await api.post("/v1/verify-otp", data);
    return response.data;
  },
  register: async (data: RegisterData) => {
    const response = await api.post("/v1/register", data);
    return response.data;
  },
  login: async (data: LoginData) => {
    const response = await api.post("/v1/login", data);
    return response.data;
  },
  forgotPassword: async (data: ResetPasswordData) => {
    const response = await api.post("/v1/forgot-password", data);
    return response.data;
  },
  resetPasswordSendOtp: async (data: SendOtpData) => {
    const response = await api.post("/v1/reset-password/send-otp", data);
    return response.data;
  },
  resetPasswordVerifyOtp: async (data: VerifyOtpData) => {
    const response = await api.post("/v1/reset-password/verify-otp", data);
    return response.data;
  },
  resetPasswordChange: async (data: ResetPasswordData) => {
    const response = await api.post("/v1/reset-password/change", data);
    return response.data;
  },
  logout: async () => {
    const response = await api.post("/v1/logout");
    return response.data;
  },
  authMe: async () => {
    const response = await api.get("/v1/auth-me");
    return response.data;
  },
};
