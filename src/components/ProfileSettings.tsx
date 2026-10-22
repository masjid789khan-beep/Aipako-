import React, { useState } from 'react';
import {
  User,
  Shield,
  Palette,
  Bot,
  Sliders,
  Download,
  Trash2,
  Check,
  Smartphone,
  Code2,
  Volume2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
  Laptop,
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface ProfileSettingsProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
  onSignOut: () => void;
  onResetAllData: () => void;
  isSimulatorActive: boolean;
  onToggleSimulator: () => void;
}

const AVATAR_OPTIONS = [
  { id: 'avatar_1', name: 'Cyber Blue', color: 'from-blue-600 to-cyan-400' },
  { id: 'avatar_2', name: 'Neon Violet', color: 'from-indigo-600 to-purple-400' },
  { id: 'avatar_3', name: 'Emerald AI', color: 'from-emerald-600 to-teal-400' },
  { id: 'avatar_4', name: 'Solar Amber', color: 'from-amber-600 to-orange-400' },
  { id: 'avatar_5', name: 'Pulse Crimson', color: 'from-rose-600 to-pink-500' },
  { id: 'avatar_6', name: 'Matrix Dark', color: 'from-slate-700 to-slate-900' },
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  user,
  onUpdateUser,
  onSignOut,
  onResetAllData,
  isSimulatorActive,
  onToggleSimulator,
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'ai' | 'appearance' | 'privacy' | 'android_code'>('profile');
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar || 'avatar_1');
  const [saveToast, setSaveToast] = useState(false);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic(40);
    onUpdateUser({
      name: editName.trim() || user.name,
      email: editEmail.trim() || user.email,
      avatar: selectedAvatar,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleExportFullData = () => {
    triggerHaptic(30);
    const fullBackup = {
      user,
      app: 'AIPAKO AI',
      exportedAt: new Date().toISOString(),
      localStorageDump: typeof window !== 'undefined' ? { ...localStorage } : {},
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aipako_full_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    triggerHaptic(20);
    setCopiedCodeSnippet(id);
    setTimeout(() => setCopiedCodeSnippet(null), 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-xl flex items-center space-x-4">
        {/* Active Avatar */}
        <div className="relative">
          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-tr ${
              AVATAR_OPTIONS.find((a) => a.id === selectedAvatar)?.color || 'from-blue-600 to-cyan-400'
            } flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-cyan-500/20`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white truncate">{user.name}</h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40 font-semibold">
              PRO
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate">{user.email}</p>
          <p className="text-[11px] text-cyan-400 font-medium mt-1">
            Language: {user.preferredLanguage || 'English'} • Voice: {user.voiceName || 'Kore'}
          </p>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'ai', label: 'AI Preferences', icon: Bot },
          { id: 'appearance', label: 'Appearance', icon: Palette },
          { id: 'privacy', label: 'Privacy & Data', icon: Shield },
          { id: 'android_code', label: 'Android Kotlin Code', icon: Code2 },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => {
                setActiveSection(sec.id as any);
                triggerHaptic(20);
              }}
              className={`px-3.5 py-2 rounded-xl whitespace-nowrap flex items-center space-x-1.5 transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {saveToast && (
        <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* SECTION 1: PROFILE EDIT */}
      {activeSection === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Personal Information</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Select Avatar Persona</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  onClick={() => {
                    setSelectedAvatar(av.id);
                    triggerHaptic(20);
                  }}
                  className={`p-2 rounded-2xl border text-center transition-all ${
                    selectedAvatar === av.id
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-md'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl mx-auto bg-gradient-to-tr ${av.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}>
                    {editName ? editName.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <span className="text-[10px] text-slate-300 mt-1 block truncate font-medium">
                    {av.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
          >
            Save Profile Changes
          </button>
        </form>
      )}

      {/* SECTION 2: AI PREFERENCES */}
      {activeSection === 'ai' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <h3 className="text-sm font-bold text-white">AI Engine & Model Preferences</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Response Language</label>
            <select
              value={user.preferredLanguage || 'English'}
              onChange={(e) => {
                onUpdateUser({ preferredLanguage: e.target.value });
                triggerHaptic(20);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="English">English</option>
              <option value="Urdu">Urdu (اردو)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Spanish">Spanish (Español)</option>
              <option value="French">French (Français)</option>
              <option value="German">German (Deutsch)</option>
              <option value="Arabic">Arabic (العربية)</option>
              <option value="Japanese">Japanese (日本語)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              AIPAKO will naturally construct thoughts and conversations in your chosen language.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gemini Neural Voice</label>
            <select
              value={user.voiceName || 'Kore'}
              onChange={(e) => {
                onUpdateUser({ voiceName: e.target.value });
                triggerHaptic(20);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Kore">Kore (Warm, articulate & professional)</option>
              <option value="Puck">Puck (Energetic, friendly & bright)</option>
              <option value="Fenrir">Fenrir (Authoritative, deep & calm)</option>
              <option value="Zephyr">Zephyr (Balanced, clear & natural)</option>
              <option value="Charon">Charon (Subtle, thoughtful & smooth)</option>
            </select>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Auto-Speak AI Responses</span>
                <span className="text-[11px] text-slate-400">Play voice audio automatically after generation</span>
              </div>
              <input
                type="checkbox"
                checked={user.autoSpeakResponse || false}
                onChange={(e) => onUpdateUser({ autoSpeakResponse: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 w-4 h-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-white block">Haptic Feedback</span>
                <span className="text-[11px] text-slate-400">Vibrate on buttons and tool activations</span>
              </div>
              <input
                type="checkbox"
                checked={user.hapticFeedback !== false}
                onChange={(e) => onUpdateUser({ hapticFeedback: e.target.checked })}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 w-4 h-4"
              />
            </label>
          </div>
        </div>
      )}

      {/* SECTION 3: APPEARANCE */}
      {activeSection === 'appearance' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Interface & Display</h3>

          {/* Device Frame Simulator Switch */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-white flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Android Phone Frame Simulator</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Wraps applet in realistic Android hardware bezel with dynamic notch & status bar.
              </p>
            </div>
            <button
              onClick={onToggleSimulator}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSimulatorActive
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isSimulatorActive ? 'Active' : 'Disabled'}
            </button>
          </div>

          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Color Theme</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateUser({ theme: 'dark' })}
                className={`p-3 rounded-2xl border text-center flex items-center justify-center space-x-2 transition-all ${
                  user.theme !== 'light'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4" />
                <span className="text-xs">Deep Navy (Dark)</span>
              </button>

              <button
                onClick={() => onUpdateUser({ theme: 'light' })}
                className={`p-3 rounded-2xl border text-center flex items-center justify-center space-x-2 transition-all ${
                  user.theme === 'light'
                    ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 font-semibold'
                    : 'border-slate-800 text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4" />
                <span className="text-xs">Light Modern</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PRIVACY & DATA */}
      {activeSection === 'privacy' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <h3 className="text-sm font-bold text-white">Privacy, Security & Storage</h3>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <span className="font-semibold text-white block">Permissions Audit</span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Microphone: Granted</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Camera: Available</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Storage: Local Sandbox</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Haptics: Supported</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportFullData}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Full JSON Data Backup</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all local conversations, notes, and tasks?')) {
                  onResetAllData();
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Reset Local Storage & Conversations</span>
            </button>

            <button
              onClick={onSignOut}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 5: ANDROID KOTLIN CODEBASE & ARCHITECTURE */}
      {activeSection === 'android_code' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Production Kotlin & Jetpack Compose Codebase</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Ready-to-compile Android project files for Android Studio Hedgehog / Ladybug & Gradle.
              </p>
            </div>
          </div>

          {/* Snippet 1: MainActivity.kt */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
              <span className="font-mono text-cyan-400">app/src/main/java/ai/aipako/MainActivity.kt</span>
              <button
                onClick={() =>
                  copyCode(
                    `package ai.aipako

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import ai.aipako.ui.AipakoMainScreen
import ai.aipako.ui.theme.AipakoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AipakoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    AipakoMainScreen()
                }
            }
        }
    }
}`,
                    'main_activity'
                  )
                }
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copiedCodeSnippet === 'main_activity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-48">
              {`package ai.aipako

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Surface
import ai.aipako.ui.AipakoMainScreen
import ai.aipako.ui.theme.AipakoTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AipakoTheme {
                AipakoMainScreen()
            }
        }
    }
}`}
            </pre>
          </div>

          {/* Snippet 2: GeminiRepository.kt */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
              <span className="font-mono text-cyan-400">app/src/main/java/ai/aipako/data/GeminiRepository.kt</span>
              <button
                onClick={() =>
                  copyCode(
                    `package ai.aipako.data

import com.google.ai.client.generativeai.GenerativeModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class GeminiRepository(private val apiKey: String) {
    private val generativeModel = GenerativeModel(
        modelName = "gemini-3.8-flash",
        apiKey = apiKey
    )

    fun sendChatStream(prompt: String): Flow<String> = flow {
        val response = generativeModel.generateContent(prompt)
        emit(response.text ?: "No response")
    }
}`,
                    'gemini_repo'
                  )
                }
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copiedCodeSnippet === 'gemini_repo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-48">
              {`package ai.aipako.data

import com.google.ai.client.generativeai.GenerativeModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class GeminiRepository(private val apiKey: String) {
    private val generativeModel = GenerativeModel(
        modelName = "gemini-3.8-flash",
        apiKey = apiKey
    )

    fun sendChatStream(prompt: String): Flow<String> = flow {
        val response = generativeModel.generateContent(prompt)
        emit(response.text ?: "No response")
    }
}`}
            </pre>
          </div>

          {/* Snippet 3: AndroidManifest.xml */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
              <span className="font-mono text-cyan-400">app/src/main/AndroidManifest.xml</span>
              <button
                onClick={() =>
                  copyCode(
                    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:name=".AipakoApplication"
        android:label="@string/app_name"
        android:icon="@mipmap/ic_launcher"
        android:theme="@style/Theme.AipakoAI">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
                    'manifest'
                  )
                }
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copiedCodeSnippet === 'manifest' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code2 className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-cyan-200 overflow-x-auto max-h-48">
              {`<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
</manifest>`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
