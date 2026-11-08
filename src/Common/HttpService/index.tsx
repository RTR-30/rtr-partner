import axios from "axios";
import { convertToLowerCase } from "../../utils/secureFile";
import { showError } from "../ToastMessage";
import { rtrToken } from "./headers";
import { networkManager } from "../NetworkCheck/networkManager";

const Noheaders: any = {
    "Content-Type": "application/json",
};

const handleHttpError = (error: any) => {
    if (
        !error?.response &&
        (error?.message === "Network Error" ||
            error?.code === "ERR_NETWORK" ||
            error?.code === "ECONNABORTED" ||
            (typeof error?.message === "string" &&
                error.message.toLowerCase().includes("network error")))
    ) {
        networkManager.notifyNetworkFailure();
    } else {
        showError(error);
    }
};

export const Get = async (url: string, attachToken = "NoToken"): Promise<any> => {
    let headers = {};
    if (convertToLowerCase(attachToken) === convertToLowerCase("rtrToken")) {
        headers = { ...(await rtrToken()), };
    }

    try {
        const res: any = await axios.get(url, {
            headers: headers,
        })
        return res
    } catch (error) {
        handleHttpError(error);
    }
}

export const Post = async (url: string, params: any = {}, attachToken = "NoToken"): Promise<any> => {
    let headers = {};
    if (convertToLowerCase(attachToken) === convertToLowerCase("rtrToken")) {
        headers = { ...(await rtrToken()) };
    }
    try {
        const res: any = await axios.post(url, params, {
            headers: {
                ...headers,
            },
        });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
}

export const Put = async (url: string, params: any = {}, attachToken: string = "NoToken"): Promise<any> => {
    let headers = {};
    if (convertToLowerCase(attachToken) === convertToLowerCase("rtrToken")) {
        headers = { ...(await rtrToken()) };
    }
    try {
        const res: any = await axios.put(url, params, { headers: headers });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
}

export const Delete = async (url: string, attachToken: string = ""): Promise<any> => {
    let headers = {};
    if (convertToLowerCase(attachToken) === convertToLowerCase("rtrToken")) {
        headers = { ...(await rtrToken()) };
    }
    try {
        const res: any = await axios.delete(url, { headers: headers });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
}

export const Patch = async (url: string, params: any = {}, attachToken = "NoToken"): Promise<any> => {
    let headers = {};
    if (convertToLowerCase(attachToken) === convertToLowerCase("rtrToken")) {
        headers = { ...(await rtrToken()) };
    }
    try {
        const res: any = await axios.patch(url, params, { headers: headers });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
};


export const withoutTokenGet = async (url: string) => {
    try {
        const res: any = await axios.get(url, {
            headers: Noheaders,
        });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
};

export const withoutTokenPost = async (
    url: string,
    params: any = {}
): Promise<any> => {
    try {
        const res: any = await axios.post(url, params, {
            headers: Noheaders,
        });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
};


export const withoutTokenPut = async (url: string, params: any = {}): Promise<any> => {
    try {
        const res: any = await axios.put(url, params, {
            headers: Noheaders,
        });
        return res;
    } catch (error: any) {
        handleHttpError(error);
    }
};
