import React, { useEffect } from "react";
import NavigationPage from "./src/AuthScreen/navigationPage";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import messaging from "@react-native-firebase/messaging";
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { AppID } from "./environment/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { COLORS } from './src/utils/ColorCode';
import { AppState } from "react-native";
import { setStatus } from "./src/redux/reduxReducer";

const App = () => {

  OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  OneSignal.initialize(AppID);
  OneSignal.Notifications.requestPermission(true);

  const fetchUserId = async () => {
    const userId = await OneSignal.User.getOnesignalId();
    if (userId) {
      await AsyncStorage.setItem('ONESIGNAL_PLAYER_ID', userId);
    }
  };



  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: 'green',
          backgroundColor: '#E8F5E9',
        }}
        text1Style={{
          color: 'green',
          fontSize: 16,
          fontWeight: 'bold',
        }}
        text2Style={{
          color: '#333',
          fontSize: 14,
        }}
      />
    ),

    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: 'red',
          backgroundColor: '#FFEBEE',
        }}
        text1Style={{
          color: 'red',
          fontSize: 16,
          fontWeight: 'bold',
        }}
        text2Style={{
          color: '#333',
          fontSize: 14,
        }}
      />
    ),
  };


  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "background" || nextAppState === "inactive") {
          // App minimized or moved to background
          store.dispatch(setStatus(false));
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    fetchUserId();
  }, []);

  return (
    <Provider store={store}>
      <NavigationPage />
      <Toast config={toastConfig} />
    </Provider>
  )
}

export default App;
