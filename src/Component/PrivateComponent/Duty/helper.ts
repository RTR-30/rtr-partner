import axios from "axios";
import { BaseUrl, bookingTable, bookings } from "../../../../environment/ApiManager";

export const fetchAllDuty = (token: any, limit:any, page:any, lat: any, lng: any) => {
    return axios.get(`${BaseUrl}${bookingTable}${bookings.allBooking}`, {
        params:{
            status:"Created",
            limit:limit,
            page:page,
            lat:lat,
            lng:lng
        },
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
};

export const UpdateBooking = async (token:any, data:any) => {
    
    return axios.post(`${BaseUrl}${bookingTable}${bookings.acceptBooking}`, data,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}