import { PhoneTool } from '../types/index.ts';

export const INITIAL_PHONE_TOOLS: PhoneTool[] = [
  {
    id: 'tool_dialer',
    title: 'Phone Dialer',
    category: 'Communication',
    description: 'Launch system dialer with a phone number ready to call.',
    iconName: 'PhoneCall',
    supported: true,
    androidIntent: 'android.intent.action.DIAL',
    permissionRequired: 'android.permission.CALL_PHONE',
    actionType: 'dial',
  },
  {
    id: 'tool_sms',
    title: 'SMS Messenger',
    category: 'Communication',
    description: 'Compose SMS messages with predefined recipient & body text.',
    iconName: 'MessageSquare',
    supported: true,
    androidIntent: 'android.intent.action.SENDTO',
    permissionRequired: 'android.permission.SEND_SMS',
    actionType: 'sms',
  },
  {
    id: 'tool_camera',
    title: 'Camera & Vision Scanner',
    category: 'Hardware',
    description: 'Access camera viewfinder to snap photos for AI image analysis.',
    iconName: 'Camera',
    supported: typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia),
    androidIntent: 'android.media.action.IMAGE_CAPTURE',
    permissionRequired: 'android.permission.CAMERA',
    actionType: 'camera',
  },
  {
    id: 'tool_battery',
    title: 'Battery Diagnostics',
    category: 'Device Control',
    description: 'Query battery level, charging state, and power management.',
    iconName: 'BatteryCharging',
    supported: typeof navigator !== 'undefined' && 'getBattery' in navigator,
    androidIntent: 'android.intent.action.BATTERY_CHANGED',
    permissionRequired: 'None (Device State)',
    actionType: 'battery',
  },
  {
    id: 'tool_vibration',
    title: 'Haptic Feedback Engine',
    category: 'Hardware',
    description: 'Trigger device vibration motor for tactile confirmations.',
    iconName: 'Vibrate',
    supported: typeof navigator !== 'undefined' && 'vibrate' in navigator,
    androidIntent: 'android.os.Vibrator.vibrate()',
    permissionRequired: 'android.permission.VIBRATE',
    actionType: 'vibrate',
  },
  {
    id: 'tool_share',
    title: 'Android Share Sheet',
    category: 'System',
    description: 'Broadcast text, summaries, or links across installed apps.',
    iconName: 'Share2',
    supported: typeof navigator !== 'undefined' && 'share' in navigator,
    androidIntent: 'android.intent.action.SEND',
    permissionRequired: 'None (Chooser Intent)',
    actionType: 'share',
  },
  {
    id: 'tool_settings',
    title: 'System Settings Shortcuts',
    category: 'System',
    description: 'Quick access to Wi-Fi, Bluetooth, Notifications, and Display.',
    iconName: 'Settings',
    supported: true,
    androidIntent: 'android.settings.SETTINGS',
    permissionRequired: 'None',
    actionType: 'settings',
  },
];

export function buildIntentUri(type: 'dial' | 'sms' | 'mailto', target: string, body?: string): string {
  const cleanTarget = target.trim();
  if (type === 'dial') {
    return `tel:${cleanTarget.replace(/[^\d+*#]/g, '')}`;
  }
  if (type === 'sms') {
    const encodedBody = body ? `?body=${encodeURIComponent(body)}` : '';
    return `sms:${cleanTarget.replace(/[^\d+*#]/g, '')}${encodedBody}`;
  }
  if (type === 'mailto') {
    const encodedSubject = body ? `?subject=${encodeURIComponent('From AIPAKO AI')}&body=${encodeURIComponent(body)}` : '';
    return `mailto:${cleanTarget}${encodedSubject}`;
  }
  return '';
}

export function triggerHaptic(duration: number | number[] = 50): boolean {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(duration);
    } catch {
      return false;
    }
  }
  return false;
}
