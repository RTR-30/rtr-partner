import axios from "axios";
import { BaseUrl, referalApi } from "../../../../environment/ApiManager";

export const referalHistoryService = async (token: any) => {
    return axios.get(`${BaseUrl}${referalApi.referal_history}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}