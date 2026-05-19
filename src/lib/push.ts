/**
 * Push notification helpers — Expo Notifications.
 *
 * We register an Expo push token, store it in `public.push_tokens` (RLS-locked
 * to the owner), and expose simple toggle helpers. Actual delivery requires a
 * server-side trigger to POST to https://exp.host/--/api/v2/push/send; the
 * client side ships ready for that.
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: true
  })
});

export type PushRegistrationResult =
  | { status: 'granted'; token: string }
  | { status: 'denied' }
  | { status: 'unsupported' };

export async function requestPushPermission(): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    return { status: 'unsupported' };
  }

  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;
  if (status !== 'granted') {
    const next = await Notifications.requestPermissionsAsync();
    status = next.status;
  }
  if (status !== 'granted') {
    return { status: 'denied' };
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'PocketNet',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: '#7C3AED'
    });
  }

  const projectId =
    (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const token = (
    await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
  ).data;

  return { status: 'granted', token };
}

export async function savePushToken(userId: string, token: string, enabled: boolean) {
  if (!supabase) return;
  await supabase.from('push_tokens').upsert(
    {
      user_id: userId,
      token,
      platform: Platform.OS as 'android' | 'ios' | 'web',
      enabled,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id,token' }
  );
}

export async function setPushEnabled(userId: string, enabled: boolean) {
  if (!supabase) return;
  await supabase
    .from('push_tokens')
    .update({ enabled, updated_at: new Date().toISOString() })
    .eq('user_id', userId);
}

export async function getPushEnabled(userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase
    .from('push_tokens')
    .select('enabled')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  return Boolean(data?.enabled);
}
