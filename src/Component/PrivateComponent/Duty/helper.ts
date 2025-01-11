import axios from "axios";
import { BookingBaseUrl, DutyList } from "../../../../environment/ApiManager";

export const fetchAllDuty = () => {
    return axios.get(BookingBaseUrl + DutyList, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
};