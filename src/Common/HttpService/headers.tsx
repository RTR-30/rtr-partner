import AsyncStorage from "@react-native-async-storage/async-storage";
import { showError } from "../ToastMessage";

export const rtrToken = async () => {
    const tokens: any = await AsyncStorage.getItem("token");
    
    if(tokens){
        return {
            "Content-Type": 'application/json',
            Authorization: `Bearer ${tokens}`
        }
    }else{
        showError("Authorization Error");
    }
}