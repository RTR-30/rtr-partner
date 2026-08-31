import axios from "axios";
import { BaseUrl, bookingTable, bookings } from "../../../../environment/ApiManager";
import { Get, Post } from "../../../Common/HttpService";

export const gearTypeService = () => {
    return Get(`${BaseUrl}${bookingTable}${bookings.gear_Type}`, "rtrToken")
}

export const fetchAllDuty = (token: any, limit:any, page:any, lat: any, lng: any, selectedGearType: any) => {
    return Get(`${BaseUrl}${bookingTable}${bookings.allBooking}?status="Created"&limit=${limit}&page=${page}&lat=${lat}&lng=${lng}&gearType=${selectedGearType === "All" ? "" : selectedGearType}`, "rtrToken")
};

export const UpdateBooking = async (data:any) => {
    return Post(`${BaseUrl}${bookingTable}${bookings.acceptBooking}`, data, "rtrToken")
}