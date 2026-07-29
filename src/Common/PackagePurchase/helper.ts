import axios from "axios"
import { BaseUrl, PackageApis, packageBase } from "../../../environment/ApiManager"

export const PaymentProcessService = (token: any) => {
    return axios.get(`${BaseUrl}${packageBase}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

export const PurchacePackageService = (payload: any, token: any) => {
    return axios.post(`${BaseUrl}${packageBase}${PackageApis.purchasePackage}`, payload, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

export const VerifyPaymentService = (payload: any, token: any) => {
    return axios.post(`${BaseUrl}${packageBase}${PackageApis.verifyPament}`, payload, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}
