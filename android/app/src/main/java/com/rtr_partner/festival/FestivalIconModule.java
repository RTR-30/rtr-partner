package com.rtr_partner.festival;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

public class FestivalIconModule extends ReactContextBaseJavaModule {
    private static final String TAG = "FestivalIconModule";
    private final ReactApplicationContext reactContext;

    public FestivalIconModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "FestivalIconModule";
    }

    @ReactMethod
    public void configureBackgroundSync(String apiUrl, Promise promise) {
        try {
            IconScheduler.schedulePeriodicSync(reactContext, apiUrl);
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "configureBackgroundSync error", e);
            promise.reject("CONFIG_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void syncNow(String apiUrl, Promise promise) {
        new Thread(() -> {
            try {
                String activeIcon = IconSyncer.sync(reactContext, apiUrl);
                WritableMap map = Arguments.createMap();
                map.putString("activeIcon", activeIcon);
                promise.resolve(map);
            } catch (Exception e) {
                Log.e(TAG, "syncNow error", e);
                promise.reject("SYNC_ERROR", e.getMessage(), e);
            }
        }).start();
    }

    @ReactMethod
    public void applyIcon(String iconKey, Promise promise) {
        try {
            boolean success = IconManager.applyIcon(reactContext, iconKey);
            promise.resolve(success);
        } catch (Exception e) {
            Log.e(TAG, "applyIcon error", e);
            promise.reject("APPLY_ERROR", e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getStatus(Promise promise) {
        try {
            WritableMap map = Arguments.createMap();
            map.putString("currentIcon", IconManager.getCurrentIcon(reactContext));
            map.putDouble("appliedAt", (double) IconManager.getAppliedAt(reactContext));
            promise.resolve(map);
        } catch (Exception e) {
            Log.e(TAG, "getStatus error", e);
            promise.reject("STATUS_ERROR", e.getMessage(), e);
        }
    }
}

