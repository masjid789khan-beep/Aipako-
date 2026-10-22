import React from 'react';
import { Home, MessageSquare, PenTool, Wrench, User } from 'lucide-react';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface BottomNavBarProps {
  currentTab: 'home' | 'chats' | 'create' | 'tools' | 'profile';
  onSelectTab: (tab: 'home' | 'chats' | 'create' | 'tools' | 'profile') => void;
  unreadChatsCount?: number;
}

interface NavTab {
  id: 'home' | 'chats' | 'create' | 'tools' | 'profile';
  label: string;
  icon: any;
  badge?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  unreadChatsCount = 0,
}) => {
  const tabs: NavTab[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chats', label: 'Chats', icon: MessageSquare, badge: unreadChatsCount },
    { id: 'create', label: 'Create', icon: PenTool },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 inset-x-0 mx-auto max-w-lg z-30 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around select-none shadow-2xl"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic(20);
              onSelectTab(tab.id);
            }}
            aria-label={`Navigate to ${tab.label}`}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 relative transition-all rounded-2xl ${
              isActive ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {/* Active Pill Indicator */}
            {isActive && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-sm shadow-cyan-400" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-cyan-500 text-slate-950 font-mono text-[9px] font-extrabold rounded-full">
                  {tab.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] tracking-tight mt-1">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
