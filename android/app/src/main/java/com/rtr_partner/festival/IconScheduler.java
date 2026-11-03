package com.rtr_partner.festival;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import androidx.work.Constraints;
import androidx.work.Data;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.ExistingWorkPolicy;
import androidx.work.NetworkType;
import androidx.work.OneTimeWorkRequest;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import java.util.concurrent.TimeUnit;

public class IconScheduler {
    private static final String TAG = "IconScheduler";

    public static final String PERIODIC_WORK_NAME = "FestivalIconPeriodicSync";
    public static final String BOUNDARY_WORK_NAME = "FestivalIconBoundaryTrigger";

    /**
     * Schedules periodic 15-minute background synchronization via WorkManager.
     */
    public static void schedulePeriodicSync(Context context, String apiUrl) {
        if (apiUrl != null && !apiUrl.trim().isEmpty()) {
            SharedPreferences prefs = context.getSharedPreferences(IconManager.PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().putString(IconManager.KEY_API_URL, apiUrl).apply();
        }

        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build();

        Data inputData = new Data.Builder()
            .putString(IconSyncWorker.KEY_API_URL, apiUrl)
            .build();

        PeriodicWorkRequest periodicRequest = new PeriodicWorkRequest.Builder(
            IconSyncWorker.class,
            15,
            TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .setInputData(inputData)
            .build();

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            PERIODIC_WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            periodicRequest
        );

        Log.i(TAG, "Scheduled periodic background icon sync (every 15m).");
    }

    /**
     * Schedules a one-time boundary trigger at nextChangeAt.
     */
    public static void scheduleBoundary(Context context, long delayMs, String apiUrl) {
        if (delayMs <= 0) {
            Log.d(TAG, "Boundary delay <= 0, skipping scheduling.");
            return;
        }

        Constraints constraints = new Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build();

        Data inputData = new Data.Builder()
            .putString(IconSyncWorker.KEY_API_URL, apiUrl)
            .build();

        OneTimeWorkRequest boundaryRequest = new OneTimeWorkRequest.Builder(IconSyncWorker.class)
            .setConstraints(constraints)
            .setInitialDelay(delayMs, TimeUnit.MILLISECONDS)
            .setInputData(inputData)
            .build();

        WorkManager.getInstance(context).enqueueUniqueWork(
            BOUNDARY_WORK_NAME,
            ExistingWorkPolicy.REPLACE,
            boundaryRequest
        );

        Log.i(TAG, "Enqueued boundary icon trigger with delay: " + (delayMs / 1000) + "s.");
    }

    /**
     * Cancels scheduled icon sync work.
     */
    public static void cancelAll(Context context) {
        WorkManager wm = WorkManager.getInstance(context);
        wm.cancelUniqueWork(PERIODIC_WORK_NAME);
        wm.cancelUniqueWork(BOUNDARY_WORK_NAME);
        Log.i(TAG, "Cancelled all scheduled icon sync workers.");
    }
}

