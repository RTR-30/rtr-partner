import axios from "axios";
import { BaseUrl, bookings, bookingTable, ridersForm } from "../../../../environment/ApiManager";

export const AcceptList = async (token: any) => {
    return axios.get(`${BaseUrl}${bookingTable}${bookings.acceptList}`,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

export const UpdateBooking = async (token:any, data:any) => {
    return axios.put(`${BaseUrl}${bookingTable}${bookings.updateBooking}`, data,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

export const CancelRideService = async (token: any, data: any) => {
    return axios.put(`${BaseUrl}${bookingTable}${bookings.cancelbooking}`, data,{
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

export const StartRideService = async (token: any, data: any) => {
    return axios.put(`${BaseUrl}${bookingTable}${ridersForm.startRide}`, data, {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

export const EndRideService = async (token: any, data: any) => {
    return axios.put(`${BaseUrl}${bookingTable}${ridersForm.endRide}`, data, {
        headers:{
            Authorization: `Bearer ${token}`,
        }
    })
}

export const PaymentService = async () => {
    
}