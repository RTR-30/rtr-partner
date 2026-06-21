import React, { useEffect } from "react";
import NavigationPage from "./src/AuthScreen/navigationPage";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import messaging from "@react-native-firebase/messaging";
import {OneSignal, LogLevel} from 'react-native-onesignal';
import { AppID } from "./environment/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  useEffect(()=>{
    fetchUserId();
  }, []);

  return(
    <Provider store={store}>
      <NavigationPage />;
    </Provider>
  )
}

export default App;
