import { BaseUrl, PartnerUser, Auth } from "../../../../environment/ApiManager/index";
import { withoutTokenPost } from "../../../Common/HttpService";

export const fetchSignUp = ( formData:any) => {
    return withoutTokenPost(`${BaseUrl}${PartnerUser}${Auth.signupapi}`, formData);
}

export const signUpVerifyingMail = (data:any) => {
    return withoutTokenPost(`${BaseUrl}${PartnerUser}${Auth.verifyemailapi}`, data);
}

export const signUpVerifyingOtp = (data:any) => {
    return withoutTokenPost(`${BaseUrl}${PartnerUser}${Auth.verifyotpapi}`, data);
}