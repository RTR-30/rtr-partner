package com.rtr_partner.festival;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class IconSyncer {
    private static final String TAG = "IconSyncer";

    /**
     * Executes the HTTP request to the festival icon API, applies the icon, and schedules the boundary trigger.
     */
    public static String sync(Context context, String apiUrl) {
        if (apiUrl == null || apiUrl.trim().isEmpty()) {
            SharedPreferences prefs = context.getSharedPreferences(IconManager.PREFS_NAME, Context.MODE_PRIVATE);
            apiUrl = prefs.getString(IconManager.KEY_API_URL, null);
        }

        if (apiUrl == null || apiUrl.trim().isEmpty()) {
            Log.e(TAG, "Sync aborted: No API URL configured.");
            return IconManager.getCurrentIcon(context);
        }

        HttpURLConnection conn = null;
        try {
            Log.d(TAG, "Requesting festival icon from: " + apiUrl);
            URL url = new URL(apiUrl);
            conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setConnectTimeout(10000);
            conn.setReadTimeout(10000);
            conn.setRequestProperty("Accept", "application/json");

            int responseCode = conn.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                Log.w(TAG, "Icon API returned HTTP " + responseCode);
                return IconManager.getCurrentIcon(context);
            }

            InputStream in = conn.getInputStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(in));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            reader.close();

            JSONObject json = new JSONObject(sb.toString());
            String iconKey = json.optString("icon", IconManager.DEFAULT_ICON);
            String nextChangeAtStr = json.optString("nextChangeAt", null);

            Log.i(TAG, "API response parsed. Active icon: '" + iconKey + "', nextChangeAt: '" + nextChangeAtStr + "'");

            // Apply the icon
            IconManager.applyIcon(context, iconKey);

            // Schedule boundary trigger at nextChangeAt
            if (nextChangeAtStr != null && !nextChangeAtStr.trim().isEmpty() && !nextChangeAtStr.equalsIgnoreCase("null")) {
                long targetTimeMs = parseIsoDate(nextChangeAtStr);
                if (targetTimeMs > 0) {
                    long delayMs = targetTimeMs - System.currentTimeMillis();
                    if (delayMs > 0) {
                        Log.i(TAG, "Scheduling boundary icon flip in " + (delayMs / 1000) + " seconds (" + nextChangeAtStr + ")");
                        IconScheduler.scheduleBoundary(context, delayMs, apiUrl);
                    }
                }
            }

            return iconKey;
        } catch (Exception e) {
            Log.e(TAG, "Icon sync failed with exception", e);
            return IconManager.getCurrentIcon(context);
        } finally {
            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    private static long parseIsoDate(String dateStr) {
        String[] patterns = new String[]{
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
            "yyyy-MM-dd'T'HH:mm:ssXXX"
        };

        for (String pattern : patterns) {
            try {
                SimpleDateFormat sdf = new SimpleDateFormat(pattern, Locale.US);
                sdf.setTimeZone(TimeZone.getTimeZone("UTC"));
                Date date = sdf.parse(dateStr);
                if (date != null) {
                    return date.getTime();
                }
            } catch (Exception ignored) {
            }
        }

        try {
            return Long.parseLong(dateStr);
        } catch (Exception ignored) {
        }

        return 0L;
    }
}

