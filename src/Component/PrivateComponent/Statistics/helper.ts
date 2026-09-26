import { BaseUrl, PartnerUser, statisticsApi } from "../../../../environment/ApiManager";
import { Get } from "../../../Common/HttpService";

export const StatisticService = async (payload: any) => {
    const url =
        `${BaseUrl}${PartnerUser}${statisticsApi.statistics}` +
        `?filter=${payload?.filter || ""}` +
        `&startDate=${payload?.startDate || ""}` +
        `&endDate=${payload?.endDate || ""}`;
    
    return Get(url, "rtrToken");
};
