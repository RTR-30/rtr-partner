import axios from "axios";
import { BaseUrl, verificationDetails, verificationTable } from "../../../../environment/ApiManager";

export const verifyDetailsServices = (token: any, data: any) => {
    return axios.post(`${BaseUrl}${verificationTable}${verificationDetails.verifyDetails}`, data, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
};