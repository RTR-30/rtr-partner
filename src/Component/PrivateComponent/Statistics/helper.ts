import axios from "axios";
import { BaseUrl, PartnerUser, statisticsApi } from "../../../../environment/ApiManager";

export const StatisticService = async (token: any, payload: any) => { 
    
    return axios.get(`${BaseUrl}${PartnerUser}${statisticsApi.statistics}?filter=${payload.filter}&startDate=${payload.startDate}&endDate=${payload.endDate}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}