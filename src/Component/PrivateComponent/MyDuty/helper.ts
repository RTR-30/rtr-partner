import axios from "axios";
import { BaseUrl, bookings, bookingTable, paymentApis, paymentBase, ridersForm } from "../../../../environment/ApiManager";
import { Get, Post, Put } from "../../../Common/HttpService";

export const AcceptList = async () => {
    return Get(`${BaseUrl}${bookingTable}${bookings.acceptList}`, "rtrToken")
}

export const UpdateBooking = async (data:any) => {
    return Put(`${BaseUrl}${bookingTable}${bookings.updateBooking}`, data, "rtrToken")
}

export const CancelRideService = async (data: any) => {
    return Put(`${BaseUrl}${bookingTable}${bookings.cancelbooking}`, data, "rtrToken")
}

export const StartRideService = async (data: any) => {
    return Put(`${BaseUrl}${bookingTable}${ridersForm.startRide}`, data, "rtrToken")
}

export const EndRideService = async (data: any) => {
    return Put(`${BaseUrl}${bookingTable}${ridersForm.endRide}`, data, "rtrToken")
}

export const CashCollectService = async (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis.cashCollect}`, payload, "rtrToken")
}

export const onlinePaymentService = async (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis.cashFree}`, payload, "rtrToken")
}

export const verifyPaymentService = async (payload: any) => {
    return Post(`${BaseUrl}${paymentBase}${paymentApis.verify}`, payload, "rtrToken")
}