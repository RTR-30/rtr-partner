import axios from "axios";
import { BaseUrl, PartnerUser, statisticsApi } from "../../../../environment/ApiManager";
import { Get } from "../../../Common/HttpService";

export const StatisticService = async (payload: any) => { 
    return Get(`${BaseUrl}${PartnerUser}${statisticsApi.statistics}?filter=${payload.filter}&startDate=${payload.startDate}&endDate=${payload.endDate}`, "rtrToken")
}