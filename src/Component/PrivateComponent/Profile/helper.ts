import axios from "axios";
import { Auth, BaseUrl, PartnerUser } from "../../../../environment/ApiManager";

export const updateUserService = ( payload:any, token: any ) => {
    return axios.put(`${BaseUrl}${PartnerUser}${Auth.updateUser}`, payload ,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    });
}