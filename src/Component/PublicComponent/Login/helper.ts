import { BaseUrl, PartnerUser, Auth, ForgetTable, forget } from "../../../../environment/ApiManager/index";
import { withoutTokenPost } from "../../../Common/HttpService";

export const FetchLogin = ( formData:any) => {
    return withoutTokenPost(`${BaseUrl}${PartnerUser}${Auth.loginapi}`, formData);
}

export const VerifyingMail = (data:any) => {
    return withoutTokenPost(`${ForgetTable}${forget.verifyEmail}`, data);
}

export const verifyingOtp = (data:any) => {
    return withoutTokenPost(`${ForgetTable}${forget.verifyOtp}`, data);
}

export const forgetedPassword = (data:any) => {
    return withoutTokenPost(`${ForgetTable}${forget.forgetPassword}`, data);
}