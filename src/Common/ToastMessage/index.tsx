import Toast from "react-native-simple-toast";

export const showSuccess = (msg: any) => {
  Toast.show(String(msg), Toast.SHORT);
};

export const showError = (msg: any) => {
  Toast.show(String(msg), Toast.LONG);
};
