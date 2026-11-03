import React, { useEffect } from "react";
import NavigationPage from "./src/AuthScreen/navigationPage";
import { Provider } from "react-redux";
import store from "./src/redux/store";
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { AppID } from "./environment/ApiManager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from './src/utils/ColorCode';
import { AppState } from "react-native";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { setStatus } from "./src/redux/reduxReducer";
import { enableBackgroundIconSync, syncIconNow } from "./src/services/festivalIcon";

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

  useEffect(() => {
    // 1. Initialize WorkManager background periodic scheduler
    enableBackgroundIconSync();

    // 2. Perform immediate sync on app launch
    syncIconNow();

    const subscription = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "background" || nextAppState === "inactive") {
          // App minimized or moved to background
          store.dispatch(setStatus(false));
        } else if (nextAppState === "active") {
          // Re-sync icon when returning to active foreground
          syncIconNow();
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <Provider store={store}>
        <NavigationPage />
      </Provider>
    </SafeAreaProvider>
  )
}

export default App;
