import axios from "axios";
import { BaseUrl, paymentBase, wallet } from "../../../../environment/ApiManager";

export const walletService = (token: any) => {
    return axios.get(`${BaseUrl}${paymentBase}${wallet.transactions_history}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}