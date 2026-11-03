import { NativeModules, Platform } from 'react-native';
import { BaseUrl } from '../../environment/ApiManager';

const { FestivalIconModule } = NativeModules;

const normalizedBaseUrl = BaseUrl.endsWith('/') ? BaseUrl : `${BaseUrl}/`;
export const FESTIVAL_ICON_API_URL = `${normalizedBaseUrl}api/app-icon?app=partner`;

export interface FestivalIconStatus {
  currentIcon: string;
  appliedAt: number;
}

export interface FestivalIconSyncResult {
  activeIcon: string;
}

/**
 * Configure Android WorkManager periodic background synchronization (every 15m)
 * and schedule boundary wakeups at nextChangeAt.
 */
export async function enableBackgroundIconSync(
  apiUrl: string = FESTIVAL_ICON_API_URL
): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (!FestivalIconModule?.configureBackgroundSync) {
    console.warn('[FestivalIcon] FestivalIconModule is not linked.');
    return false;
  }
  try {
    const success = await FestivalIconModule.configureBackgroundSync(apiUrl);
    return success;
  } catch (error) {
    console.error('[FestivalIcon] Failed to configure background sync:', error);
    return false;
  }
}

/**
 * Triggers an immediate HTTP sync against the festival icon API,
 * flips the icon if needed, and schedules the next change.
 */
export async function syncIconNow(
  apiUrl: string = FESTIVAL_ICON_API_URL
): Promise<FestivalIconSyncResult | null> {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (!FestivalIconModule?.syncNow) {
    console.warn('[FestivalIcon] FestivalIconModule is not linked.');
    return null;
  }
  try {
    const result = await FestivalIconModule.syncNow(apiUrl);
    return result;
  } catch (error) {
    console.error('[FestivalIcon] Failed to sync icon now:', error);
    return null;
  }
}

/**
 * Fetches the currently enabled launcher icon key and timestamp.
 */
export async function getIconStatus(): Promise<FestivalIconStatus | null> {
  if (Platform.OS !== 'android') {
    return null;
  }
  if (!FestivalIconModule?.getStatus) {
    return null;
  }
  try {
    return await FestivalIconModule.getStatus();
  } catch (error) {
    console.error('[FestivalIcon] Failed to get icon status:', error);
    return null;
  }
}

/**
 * Directly switches the launcher icon to the specified key.
 */
export async function applyIcon(iconKey: string): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false;
  }
  if (!FestivalIconModule?.applyIcon) {
    return false;
  }
  try {
    return await FestivalIconModule.applyIcon(iconKey);
  } catch (error) {
    console.error('[FestivalIcon] Failed to apply icon:', error);
    return false;
  }
}

