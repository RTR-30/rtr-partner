import axios from "axios";
import { BaseUrl, LoginApi } from "../../../../environment/ApiManager/index";

export const FetchLogin = ( formData:any) => {
    return axios.post(BaseUrl + LoginApi, formData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
}