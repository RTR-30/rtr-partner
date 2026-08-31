import axios from "axios";
import { BaseUrl, PackageApis, packageBase, PartnerUser, paymentApis, paymentBase, UserDetailsApi, verificationDetails, verificationTable } from "../../../../environment/ApiManager";
import { Get, Post } from "../../../Common/HttpService";

export const verifyDetailsServices = (data: any) => {
    return Post(`${BaseUrl}${verificationTable}${verificationDetails.verifyDetails}`, data, "rtrToken")
};

export const PaymentProcessService = () => {
    return Get(`${BaseUrl}${packageBase}`, "rtrToken")
}

export const GetMyPackageService = () => {
    return Get(`${BaseUrl}${packageBase}${PackageApis.myPackages}`, "rtrToken")
}

export const getUserDetailsService = () => {
    return Get(`${BaseUrl}${PartnerUser}${UserDetailsApi?.me}`, "rtrToken")
}