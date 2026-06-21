import Toast from "react-native-toast-message";

export const showSuccess = (msg: any) => {
  Toast.show({
    type: "success",
    text1: "Success",
    text2: msg?.toString() || "",
    position: "top",
    visibilityTime: 2500,
  });
};

export const showError = (msg: any) => {
  Toast.show({
    type: "error",
    text1: "Error",
    text2: msg?.toString() || "",
    position: "top",
    visibilityTime: 2500,
  });
};
