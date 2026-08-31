import axios from "axios";
import { Auth, BaseUrl, PartnerUser } from "../../../../environment/ApiManager";
import { Put } from "../../../Common/HttpService";

export const updateUserService = ( payload:any ) => {
    return Put(`${BaseUrl}${PartnerUser}${Auth.updateUser}`, payload , "rtrToken")
}