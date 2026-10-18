import { BaseUrl, verificationDetails, verificationTable } from "../../../environment/ApiManager";
import { Post } from "../HttpService";

export const verifyDetailsServices = (data: any) => {
    return Post(`${BaseUrl}${verificationTable}${verificationDetails.verifyDetails}`, data, "rtrToken");
};
