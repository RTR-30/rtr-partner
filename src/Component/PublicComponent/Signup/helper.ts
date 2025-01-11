import axios from "axios";
import { BaseUrl, SignUpApi } from "../../../../environment/ApiManager/index";

export const fetchSignUp = ( formData:any) => {
    return axios.post(BaseUrl + SignUpApi, formData, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
}