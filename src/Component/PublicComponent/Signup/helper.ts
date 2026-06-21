import axios from "axios";
import { BaseUrl, PartnerUser, Auth } from "../../../../environment/ApiManager/index";

export const fetchSignUp = ( formData:any) => {
    return axios.post(`${BaseUrl}${PartnerUser}${Auth.signupapi}`, formData);
}

export const signUpVerifyingMail = (data:any) => {
    return axios.post(`${BaseUrl}${PartnerUser}${Auth.verifyemailapi}`, data);
}

export const signUpVerifyingOtp = (data:any) => {
    return axios.post(`${BaseUrl}${PartnerUser}${Auth.verifyotpapi}`, data);
}