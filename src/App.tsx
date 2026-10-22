/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StatusBar } from './components/StatusBar.tsx';
import { SplashScreen } from './components/SplashScreen.tsx';
import { OnboardingModal } from './components/OnboardingModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { VoiceAssistantModal } from './components/VoiceAssistantModal.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { ChatView } from './components/ChatView.tsx';
import { WritingStudio } from './components/WritingStudio.tsx';
import { ToolsHub } from './components/ToolsHub.tsx';
import { ProductivityHub } from './components/ProductivityHub.tsx';
import { ProfileSettings } from './components/ProfileSettings.tsx';
import { BottomNavBar } from './components/BottomNavBar.tsx';
import { createNewConversation } from './utils/chatManager.ts';
import { UserProfile, Conversation, Note, Task, Reminder } from './types/index.ts';
import { Smartphone, Monitor, ShieldCheck, Sparkles } from 'lucide-react';

const DEFAULT_USER: UserProfile = {
  id: 'usr_guest_01',
  name: 'Alex Vance',
  email: 'alex@aipako.ai',
  avatar: 'avatar_1',
  preferredLanguage: 'English',
  theme: 'dark',
  voiceName: 'Kore',
  autoSpeakResponse: false,
  hapticFeedback: true,
  createdAt: new Date().toISOString(),
};

const INITIAL_NOTES: Note[] = [
  {
    id: 'note_1',
    title: 'AIPAKO Architecture Overview',
    content: 'Full-stack AI assistant integrating Gemini 3.8 Flash, speech recognition, vision intelligence, and Android system intents.',
    category: 'Work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'note_2',
    title: 'Kotlin Jetpack Compose Reference',
    content: 'Use Material3 scaffold, viewModel with coroutines, and PhoneToolsBridge for intent launching.',
    category: 'Study',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'task_1',
    title: 'Test voice assistant and audio visualizer',
    completed: false,
    priority: 'high',
    dueDate: '2026-10-25',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task_2',
    title: 'Inspect Android dialer and SMS bridge intents',
    completed: true,
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_REMINDERS: Reminder[] = [
  {
    id: 'rem_1',
    title: 'Review AIPAKO Technical Specification',
    datetime: new Date(Date.now() + 3600000 * 4).toISOString(),
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

export default function App() {
  // Check for autostart parameter to skip splash/intro if requested
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const autostart = urlParams?.get('autostart') === '1';

  // Core Flow State
  const [showSplash, setShowSplash] = useState(!autostart);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isSimulatorActive, setIsSimulatorActive] = useState(false);

  // User State
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('aipako_user');
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<'home' | 'chats' | 'create' | 'tools' | 'profile'>('home');
  const [toolsSubTab, setToolsSubTab] = useState<'translate' | 'summarize' | 'vision' | 'phone'>('translate');
  const [toolsViewMode, setToolsViewMode] = useState<'ai_tools' | 'productivity'>('ai_tools');

  // Conversations State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const stored = localStorage.getItem('aipako_conversations');
      return stored ? JSON.parse(stored) : [createNewConversation('Welcome to AIPAKO')];
    } catch {
      return [createNewConversation('Welcome to AIPAKO')];
    }
  });
  const [activeConvId, setActiveConvId] = useState<string>(() => conversations[0]?.id || '');

  // Productivity State
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem('aipako_notes');
      return stored ? JSON.parse(stored) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem('aipako_tasks');
      return stored ? JSON.parse(stored) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const stored = localStorage.getItem('aipako_reminders');
      return stored ? JSON.parse(stored) : INITIAL_REMINDERS;
    } catch {
      return INITIAL_REMINDERS;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('aipako_user', JSON.stringify(user));
    } catch {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('aipako_conversations', JSON.stringify(conversations));
    } catch {}
  }, [conversations]);

  useEffect(() => {
    try {
      localStorage.setItem('aipako_notes', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('aipako_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('aipako_reminders', JSON.stringify(reminders));
    } catch {}
  }, [reminders]);

  // Check onboarding on startup
  const handleSplashComplete = () => {
    setShowSplash(false);
    const hasSeenOnboarding = localStorage.getItem('aipako_onboarding_done');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleFinishOnboarding = () => {
    localStorage.setItem('aipako_onboarding_done', 'true');
    setShowOnboarding(false);
  };

  // Conversation Helpers
  const currentConversation =
    conversations.find((c) => c.id === activeConvId) || conversations[0] || createNewConversation();

  const handleNewConversation = () => {
    const newConv = createNewConversation();
    setConversations([newConv, ...conversations]);
    setActiveConvId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    const filtered = conversations.filter((c) => c.id !== id);
    if (filtered.length === 0) {
      const fresh = createNewConversation();
      setConversations([fresh]);
      setActiveConvId(fresh.id);
    } else {
      setConversations(filtered);
      if (activeConvId === id) {
        setActiveConvId(filtered[0].id);
      }
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(conversations.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  const handleUpdateConversation = (updated: Conversation) => {
    setConversations(conversations.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleStartChatWithPrompt = (prompt: string) => {
    setCurrentTab('chats');
  };

  // Productivity Handlers
  const handleAddNote = (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    const note: Note = {
      ...newNote,
      id: 'note_' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([note, ...notes]);
  };

  const handleUpdateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: 'task_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks([task, ...tasks]);
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddReminder = (newRem: Omit<Reminder, 'id' | 'createdAt'>) => {
    const rem: Reminder = {
      ...newRem,
      id: 'rem_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setReminders([rem, ...reminders]);
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const handleToggleReminder = (id: string) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setUser(DEFAULT_USER);
    setNotes(INITIAL_NOTES);
    setTasks(INITIAL_TASKS);
    setReminders(INITIAL_REMINDERS);
    const fresh = createNewConversation();
    setConversations([fresh]);
    setActiveConvId(fresh.id);
  };

  const isLightMode = user.theme === 'light';

  return (
    <div
      className={`min-h-screen ${
        isLightMode ? 'bg-slate-100 text-slate-900' : 'bg-[#070B14] text-slate-100'
      } flex flex-col items-center justify-start transition-colors duration-300 font-sans`}
    >
      {/* Top Floating App Bar (Desktop / Header Controls) */}
      <header className="w-full max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between z-20 border-b border-slate-800/40">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-black text-xs shadow-md shadow-cyan-500/20">
            A
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center space-x-1.5">
              <span>AIPAKO</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                AI
              </span>
            </h1>
          </div>
        </div>

        {/* Header Right Quick Toggles */}
        <div className="flex items-center space-x-2">
          {/* Android Frame Simulator Toggle */}
          <button
            onClick={() => setIsSimulatorActive(!isSimulatorActive)}
            title={isSimulatorActive ? 'Switch to Fullscreen Responsive' : 'Switch to Android Phone Simulator Frame'}
            className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            {isSimulatorActive ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Account Login / Status */}
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center space-x-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
          </button>
        </div>
      </header>

      {/* Main Container: Android Phone Chassis vs Edge-to-Edge */}
      <main
        className={`w-full max-w-lg flex-1 flex flex-col relative transition-all duration-300 ${
          isSimulatorActive
            ? 'my-4 rounded-[42px] border-[8px] border-slate-800/90 shadow-[0_0_50px_rgba(0,102,255,0.15)] overflow-hidden min-h-[844px] bg-[#070B14]'
            : 'px-4'
        }`}
      >
        {/* Android Status Bar */}
        <StatusBar />

        {/* Tab View Routing */}
        <div className="flex-1 pt-2 pb-24 overflow-y-auto">
          {currentTab === 'home' && (
            <DashboardView
              user={user}
              onNavigate={(tab, subTab) => {
                setCurrentTab(tab);
                if (subTab === 'productivity') {
                  setToolsViewMode('productivity');
                } else if (subTab) {
                  setToolsViewMode('ai_tools');
                  setToolsSubTab(subTab as any);
                }
              }}
              onStartChatWithPrompt={handleStartChatWithPrompt}
              onOpenVoice={() => setShowVoiceModal(true)}
            />
          )}

          {currentTab === 'chats' && (
            <ChatView
              conversation={currentConversation}
              conversations={conversations}
              onSelectConversation={(id) => setActiveConvId(id)}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onRenameConversation={handleRenameConversation}
              onUpdateConversation={handleUpdateConversation}
              onOpenVoice={() => setShowVoiceModal(true)}
              preferredLanguage={user.preferredLanguage}
              voiceName={user.voiceName}
            />
          )}

          {currentTab === 'create' && (
            <WritingStudio
              onSaveToNotes={handleAddNote}
              preferredLanguage={user.preferredLanguage}
            />
          )}

          {currentTab === 'tools' && (
            <div className="space-y-4 pb-36">
              {/* Segmented Switcher inside Tools */}
              <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setToolsViewMode('ai_tools')}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                    toolsViewMode === 'ai_tools'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  AI Tools & Phone Bridge
                </button>
                <button
                  onClick={() => setToolsViewMode('productivity')}
                  className={`flex-1 py-2 px-3 rounded-xl transition-all ${
                    toolsViewMode === 'productivity'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Productivity (Notes & Tasks)
                </button>
              </div>

              {toolsViewMode === 'ai_tools' ? (
                <ToolsHub
                  initialTab={toolsSubTab}
                  preferredLanguage={user.preferredLanguage}
                  onSaveToNotes={handleAddNote}
                />
              ) : (
                <ProductivityHub
                  notes={notes}
                  tasks={tasks}
                  reminders={reminders}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                  onDeleteNote={handleDeleteNote}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                  onAddReminder={handleAddReminder}
                  onDeleteReminder={handleDeleteReminder}
                  onToggleReminder={handleToggleReminder}
                />
              )}
            </div>
          )}

          {currentTab === 'profile' && (
            <ProfileSettings
              user={user}
              onUpdateUser={(updates) => setUser({ ...user, ...updates })}
              onSignOut={() => setShowAuthModal(true)}
              onResetAllData={handleResetAllData}
              isSimulatorActive={isSimulatorActive}
              onToggleSimulator={() => setIsSimulatorActive(!isSimulatorActive)}
            />
          )}
        </div>

        {/* Android Navigation Bar */}
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          unreadChatsCount={conversations.length}
        />
      </main>

      {/* Modals and Overlays */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {showOnboarding && <OnboardingModal onFinish={handleFinishOnboarding} />}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setShowAuthModal(false);
        }}
      />

      <VoiceAssistantModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSendToChat={(spokenText) => {
          setCurrentTab('chats');
        }}
        preferredLanguage={user.preferredLanguage}
        voiceName={user.voiceName}
      />
    </div>
  );
}
