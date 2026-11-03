package com.rtr_partner.festival;

import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.util.Log;

import java.util.HashMap;
import java.util.Map;

public class IconManager {
    private static final String TAG = "IconManager";
    public static final String PREFS_NAME = "festival_icon_prefs";
    public static final String KEY_CURRENT_ICON = "current_icon";
    public static final String KEY_APPLIED_AT = "applied_at";
    public static final String KEY_API_URL = "api_url";

    public static final String DEFAULT_ICON = "normal";

    // Map icon keys to their activity-alias component names
    private static final Map<String, String> ICON_ALIAS_MAP = new HashMap<>();

    static {
        ICON_ALIAS_MAP.put("normal", "com.rtr_partner.NormalIcon");
        ICON_ALIAS_MAP.put("pongal", "com.rtr_partner.PongalIcon");
        ICON_ALIAS_MAP.put("deepavali", "com.rtr_partner.DeepavaliIcon");
        ICON_ALIAS_MAP.put("christmas", "com.rtr_partner.ChristmasIcon");
        ICON_ALIAS_MAP.put("newyear", "com.rtr_partner.NewyearIcon");
        ICON_ALIAS_MAP.put("holi", "com.rtr_partner.HoliIcon");
        ICON_ALIAS_MAP.put("krishnajanmashtami", "com.rtr_partner.KrishnajanmashtamiIcon");
        ICON_ALIAS_MAP.put("valentineday", "com.rtr_partner.ValentinedayIcon");
        ICON_ALIAS_MAP.put("rakshabandhan", "com.rtr_partner.RakshabandhanIcon");
        ICON_ALIAS_MAP.put("ramzan", "com.rtr_partner.RamzanIcon");
        ICON_ALIAS_MAP.put("republicday", "com.rtr_partner.RepublicdayIcon");
        ICON_ALIAS_MAP.put("puthandu", "com.rtr_partner.PuthanduIcon");
        ICON_ALIAS_MAP.put("vinayagar", "com.rtr_partner.VinayagarIcon");
        ICON_ALIAS_MAP.put("navaratri", "com.rtr_partner.NavaratriIcon");
        ICON_ALIAS_MAP.put("karthigai_deepam", "com.rtr_partner.KarthigaiDeepamIcon");
    }

    /**
     * Applies the requested icon key, enabling its alias and disabling all others.
     */
    public static synchronized boolean applyIcon(Context context, String requestedKey) {
        if (requestedKey == null || requestedKey.trim().isEmpty()) {
            requestedKey = DEFAULT_ICON;
        }

        String targetKey = requestedKey.trim().toLowerCase();
        if (!ICON_ALIAS_MAP.containsKey(targetKey)) {
            Log.w(TAG, "Unknown icon key: '" + targetKey + "'. Falling back to '" + DEFAULT_ICON + "'");
            targetKey = DEFAULT_ICON;
        }

        String currentActive = getCurrentIcon(context);
        if (targetKey.equals(currentActive)) {
            Log.d(TAG, "Icon '" + targetKey + "' is already active. Skipping alias toggle.");
            return true;
        }

        PackageManager pm = context.getPackageManager();
        String targetAlias = ICON_ALIAS_MAP.get(targetKey);

        try {
            // 1. Enable the target alias FIRST
            ComponentName targetComponent = new ComponentName(context, targetAlias);
            pm.setComponentEnabledSetting(
                targetComponent,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            );
            Log.i(TAG, "Successfully enabled activity-alias: " + targetAlias);

            // 2. Disable all other aliases
            for (Map.Entry<String, String> entry : ICON_ALIAS_MAP.entrySet()) {
                if (!entry.getKey().equals(targetKey)) {
                    ComponentName otherComponent = new ComponentName(context, entry.getValue());
                    pm.setComponentEnabledSetting(
                        otherComponent,
                        PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                        PackageManager.DONT_KILL_APP
                    );
                }
            }

            // 3. Persist active icon state
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit()
                .putString(KEY_CURRENT_ICON, targetKey)
                .putLong(KEY_APPLIED_AT, System.currentTimeMillis())
                .apply();

            Log.i(TAG, "Icon flipped from '" + currentActive + "' to '" + targetKey + "'");
            return true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to apply icon alias: " + targetAlias, e);
            return false;
        }
    }

    public static String getCurrentIcon(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getString(KEY_CURRENT_ICON, DEFAULT_ICON);
    }

    public static long getAppliedAt(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        return prefs.getLong(KEY_APPLIED_AT, 0L);
    }
}

