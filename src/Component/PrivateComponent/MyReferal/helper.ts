import { BaseUrl, referalApi } from "../../../../environment/ApiManager";
import { Get } from "../../../Common/HttpService";

export const referalHistoryService = async () => {
    return Get(`${BaseUrl}${referalApi.referal_history}`, "rtrToken")
}