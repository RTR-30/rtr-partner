import axios from "axios";
import { BaseUrl, PartnerUser, Auth, ForgetTable, forget } from "../../../../environment/ApiManager/index";

export const FetchLogin = ( formData:any) => {
    return axios.post(`${BaseUrl}${PartnerUser}${Auth.loginapi}`, formData);
}

export const VerifyingMail = (data:any) => {
    return axios.post(`${ForgetTable}${forget.verifyEmail}`, data);
}

export const verifyingOtp = (data:any) => {
    return axios.post(`${ForgetTable}${forget.verifyOtp}`, data);
}

export const forgetedPassword = (data:any) => {
    return axios.post(`${ForgetTable}${forget.forgetPassword}`, data);
}