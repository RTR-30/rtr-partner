import { BaseUrl, PartnerUser, paymentApis, paymentBase, UserDetailsApi, wallet } from "../../../../environment/ApiManager"
import { Get, Post, Put } from "../../../Common/HttpService";

export const UserDetailsService = () => {
    return Get(`${BaseUrl}${PartnerUser}${UserDetailsApi?.me}`, "rtrToken");
}

export const walletService = () => {
    return Get(`${BaseUrl}${paymentBase}${wallet.transactions_history}`, "rtrToken");
}

export const TopUpService = (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis?.topUp}`, payload, 'rtrToken');
}

export const TopUpVerifyService = (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis?.topUpVerify}`, payload, 'rtrToken');
}

export const UpdateBankDetailsService = (payload: any) => {
    return Put(`${BaseUrl}${PartnerUser}${paymentApis?.bankDetails}`, payload, 'rtrToken');
}

export const WithdrawRequestService = (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis?.withdrawRequest}`, payload, 'rtrToken')
}

export const RequestListService = () => {
    return Get(`${BaseUrl}${paymentBase}${paymentApis?.RequestList}`, 'rtrToken');
}

export const CancelRequestService = (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis?.cancelRequest}`, payload, 'rtrToken');
}