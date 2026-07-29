import axios from "axios";
import { BaseUrl, bookingTable, bookings } from "../../../../environment/ApiManager";

export const gearTypeService = (token: any) => {
    return axios.get(`${BaseUrl}${bookingTable}${bookings.gear_Type}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    });
}

export const fetchAllDuty = (token: any, limit:any, page:any, lat: any, lng: any, selectedGearType: any) => {
    return axios.get(`${BaseUrl}${bookingTable}${bookings.allBooking}`, {
        params:{
            status:"Created",
            limit:limit,
            page:page,
            lat:lat,
            lng:lng,
            gearType: selectedGearType === "All" ? "" : selectedGearType
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