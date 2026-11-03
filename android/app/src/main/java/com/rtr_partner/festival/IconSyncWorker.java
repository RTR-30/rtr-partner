package com.rtr_partner.festival;

import android.content.Context;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.work.Data;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class IconSyncWorker extends Worker {
    private static final String TAG = "IconSyncWorker";
    public static final String KEY_API_URL = "api_url";

    public IconSyncWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.i(TAG, "IconSyncWorker triggered.");
        try {
            String apiUrl = getInputData().getString(KEY_API_URL);
            String resultIcon = IconSyncer.sync(getApplicationContext(), apiUrl);
            Log.i(TAG, "IconSyncWorker finished successfully. Current active icon: " + resultIcon);

            Data output = new Data.Builder()
                .putString("activeIcon", resultIcon)
                .build();
            return Result.success(output);
        } catch (Exception e) {
            Log.e(TAG, "IconSyncWorker failed with exception", e);
            return Result.retry();
        }
    }
}

