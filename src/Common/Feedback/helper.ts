import axios from "axios"
import { BaseUrl, FeedBackBase, FeedbackApis } from "../../../environment/ApiManager";


export const FeedbackTagService = (token: any) => {
    return axios.get(`${BaseUrl}${FeedBackBase}${FeedbackApis?.Tags}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

export const submitFeedbackService = (payload: any, token: any) => {
    return axios.post(`${BaseUrl}${FeedBackBase}${FeedbackApis?.Submit}`, payload, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}