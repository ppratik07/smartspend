/**
 * notifications.ts — expo-notifications helpers
 * Call requestPermissions() once on app start.
 * Call scheduleDailyReminder() from profile settings.
 * Call triggerBudgetAlert() after fetching budget alerts.
 */
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications appear while the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions.
 * Returns true if granted.
 */
export async function requestPermissions(): Promise<boolean> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;

  // Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'SmartSpend',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
    });
    await Notifications.setNotificationChannelAsync('budget-alerts', {
      name: 'Budget Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

const DAILY_REMINDER_ID_KEY = 'daily-reminder';

/**
 * Schedule (or reschedule) a daily spending reminder at hh:mm.
 * Pass null to cancel the reminder.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  // Cancel existing before scheduling new
  await cancelDailyReminder();

  await Notifications.scheduleNotificationAsync({
    identifier: DAILY_REMINDER_ID_KEY,
    content: {
      title: '💸 SmartSpend',
      body: "Don't forget to log your spending today!",
      data: { type: 'daily-reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_ID_KEY).catch(() => {
    // Ignore errors if notification doesn't exist
  });
}

/**
 * Fire an immediate local notification for a budget that's near/over its limit.
 */
export async function triggerBudgetAlert(
  categoryName: string,
  percentUsed: number,
  isOver: boolean,
): Promise<void> {
  const title = isOver ? '🚨 Budget Exceeded' : '⚠️ Budget Alert';
  const body = isOver
    ? `You've exceeded your ${categoryName} budget (${Math.round(percentUsed)}% used).`
    : `Your ${categoryName} budget is at ${Math.round(percentUsed)}% — almost full.`;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { type: 'budget-alert', categoryName, percentUsed },
    },
    trigger: null, // fire immediately
  });
}
