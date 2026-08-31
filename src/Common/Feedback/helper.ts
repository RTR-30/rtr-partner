import axios from "axios"
import { BaseUrl, FeedBackBase, FeedbackApis } from "../../../environment/ApiManager";
import { Get, Post } from "../HttpService";


export const FeedbackTagService = () => {
    return Get(`${BaseUrl}${FeedBackBase}${FeedbackApis?.Tags}`, 'rtrToken')
}

export const submitFeedbackService = (payload: any) => {
    return Post(`${BaseUrl}${FeedBackBase}${FeedbackApis?.Submit}`, payload, "rtrToken")
}