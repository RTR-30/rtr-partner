import axios from "axios"
import { BaseUrl, PackageApis, packageBase } from "../../../environment/ApiManager"
import { Get, Post } from "../HttpService"

export const PaymentProcessService = () => {
    return Get(`${BaseUrl}${packageBase}`, "rtrToken")
}

export const PurchacePackageService = (payload: any) => {
    return Post(`${BaseUrl}${packageBase}${PackageApis.purchasePackage}`, payload, "rtrToken")
}

export const VerifyPaymentService = (payload: any) => {
    return Post(`${BaseUrl}${packageBase}${PackageApis.verifyPament}`, payload, "rtrToken")
}
