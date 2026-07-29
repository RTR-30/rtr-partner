import axios from "axios";
import { BaseUrl, PackageApis, packageBase, paymentApis, paymentBase, verificationDetails, verificationTable } from "../../../../environment/ApiManager";

export const verifyDetailsServices = (token: any, data: any) => {
    return axios.post(`${BaseUrl}${verificationTable}${verificationDetails.verifyDetails}`, data, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
};

export const PaymentProcessService = (token: any) => {
    return axios.get(`${BaseUrl}${packageBase}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}

export const GetMyPackageService = (token: any) => {
    return axios.get(`${BaseUrl}${packageBase}${PackageApis.myPackages}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        }
    })
}