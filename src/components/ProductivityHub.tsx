import React, { useState } from 'react';
import {
  CheckSquare,
  Bookmark,
  Bell,
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle,
  Circle,
  Calendar,
  Tag,
  AlertCircle,
  Download,
} from 'lucide-react';
import { Note, Task, Reminder } from '../types/index.ts';
import { filterNotes, sortTasks, formatTimeRemaining } from '../utils/productivityStorage.ts';
import { triggerHaptic } from '../utils/phoneBridge.ts';

interface ProductivityHubProps {
  notes: Note[];
  tasks: Task[];
  reminders: Reminder[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string) => void;
}

const NOTE_CATEGORIES = ['All', 'General', 'Work', 'Study', 'Ideas', 'AI Generated'];

export const ProductivityHub: React.FC<ProductivityHubProps> = ({
  notes,
  tasks,
  reminders,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddReminder,
  onDeleteReminder,
  onToggleReminder,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'reminders'>('notes');

  // Notes state
  const [noteSearch, setNoteSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<'General' | 'Work' | 'Study' | 'Ideas' | 'AI Generated'>('General');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Tasks state
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  // Reminders state
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDateTime, setNewReminderDateTime] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const filteredNotesList = filterNotes(notes, noteSearch, selectedCategory);
  const sortedTasksList = sortTasks(tasks, taskFilter);

  // Request Notification permission
  const handleRequestNotification = async () => {
    if (typeof Notification !== 'undefined') {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      triggerHaptic(30);
    }
  };

  const handleSaveNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) return;
    triggerHaptic(30);

    if (editingNoteId) {
      onUpdateNote(editingNoteId, {
        title: newNoteTitle.trim() || 'Untitled Note',
        content: newNoteContent,
        category: newNoteCategory,
      });
      setEditingNoteId(null);
    } else {
      onAddNote({
        title: newNoteTitle.trim() || 'Untitled Note',
        content: newNoteContent,
        category: newNoteCategory,
      });
    }

    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;
    triggerHaptic(30);
    onAddTask({
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      completed: false,
      dueDate: newTaskDueDate || undefined,
    });
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setIsAddingTask(false);
  };

  const handleSaveReminder = () => {
    if (!newReminderTitle.trim() || !newReminderDateTime) return;
    triggerHaptic(30);

    if (notificationPermission === 'default') {
      handleRequestNotification();
    }

    onAddReminder({
      title: newReminderTitle.trim(),
      datetime: newReminderDateTime,
      completed: false,
    });

    setNewReminderTitle('');
    setNewReminderDateTime('');
    setIsAddingReminder(false);
  };

  const handleExportNotes = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'aipako_notes_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Sub-tab Pill */}
      <div className="grid grid-cols-3 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-semibold">
        <button
          onClick={() => {
            setActiveTab('notes');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'notes'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4 shrink-0" />
          <span>Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('tasks');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'tasks'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4 shrink-0" />
          <span>Tasks ({tasks.filter((t) => !t.completed).length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('reminders');
            triggerHaptic(20);
          }}
          className={`py-2 px-1 rounded-xl flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'reminders'
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Reminders</span>
        </button>
      </div>

      {/* TAB 1: NOTES */}
      {activeTab === 'notes' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 max-w-xs">
              <div className="relative w-full">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportNotes}
                title="Export Notes"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditingNoteId(null);
                  setNewNoteTitle('');
                  setNewNoteContent('');
                  setIsAddingNote(true);
                  triggerHaptic(20);
                }}
                className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-1 shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            {NOTE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-medium'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* New / Edit Note Form */}
          {isAddingNote && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-cyan-400 uppercase">
                  {editingNoteId ? 'Edit Note' : 'Create Note'}
                </span>
                <select
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value as any)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                >
                  <option value="General">General</option>
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Ideas">Ideas</option>
                  <option value="AI Generated">AI Generated</option>
                </select>
              </div>

              <input
                type="text"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                placeholder="Note Title"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-cyan-500"
              />

              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                rows={5}
                placeholder="Note body or markdown..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNote}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          {/* Notes Grid */}
          {filteredNotesList.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
              <Bookmark className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No notes found in this view.</p>
              <p className="text-xs text-slate-500">Tap "New Note" to organize thoughts or save AI outputs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredNotesList.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-medium">
                        {note.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setNewNoteTitle(note.title);
                            setNewNoteContent(note.content);
                            setNewNoteCategory(note.category);
                            setIsAddingNote(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic(20);
                            onDeleteNote(note.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-400 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{note.title}</h4>
                    <p className="text-xs text-slate-300 line-clamp-3 mt-1 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(note.updatedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['all', 'active', 'completed'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTaskFilter(filter)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    taskFilter === filter ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsAddingTask(true);
                triggerHaptic(20);
              }}
              className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-1 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Add Task Box */}
          {isAddingTask && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 space-y-3 shadow-xl animate-fadeIn">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="What task needs to be completed?"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-white text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTask}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Save Task
                </button>
              </div>
            </div>
          )}

          {/* Tasks List */}
          {sortedTasksList.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">All tasks completed or none added.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTasksList.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-900 text-slate-500'
                      : 'bg-slate-900/70 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <button
                      onClick={() => {
                        triggerHaptic(30);
                        onToggleTask(task.id);
                      }}
                      className="shrink-0 text-cyan-400 hover:text-cyan-300"
                    >
                      {task.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs sm:text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-0.5 text-[10px]">
                        <span
                          className={`font-semibold uppercase tracking-wider ${
                            task.priority === 'high'
                              ? 'text-rose-400'
                              : task.priority === 'medium'
                              ? 'text-amber-400'
                              : 'text-slate-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-slate-500 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{task.dueDate}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic(20);
                      onDeleteTask(task.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Permission status banner */}
          {notificationPermission !== 'granted' && (
            <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
              <span className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Enable notifications to receive reminder alerts.</span>
              </span>
              <button
                onClick={handleRequestNotification}
                className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                Allow
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Active Scheduled Reminders</span>
            </h3>

            <button
              onClick={() => {
                setIsAddingReminder(true);
                triggerHaptic(20);
              }}
              className="py-1.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-1 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Set Reminder</span>
            </button>
          </div>

          {/* Add Reminder Modal / Card */}
          {isAddingReminder && (
            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-3xl p-4 space-y-3 shadow-xl animate-fadeIn">
              <input
                type="text"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                placeholder="Reminder title (e.g., Weekly Team Sync)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newReminderDateTime}
                  onChange={(e) => setNewReminderDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-white text-xs"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  onClick={() => setIsAddingReminder(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReminder}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Schedule Reminder
                </button>
              </div>
            </div>
          )}

          {/* Reminders List */}
          {reminders.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 space-y-2">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No active reminders scheduled.</p>
              <p className="text-xs text-slate-500">Add reminders with specific dates and times.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((rem) => {
                const remaining = formatTimeRemaining(rem.datetime);
                const isOverdue = remaining === 'Overdue';
                return (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          triggerHaptic(30);
                          onToggleReminder(rem.id);
                        }}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        {rem.completed ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <p className={`text-sm font-semibold ${rem.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {rem.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(rem.datetime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          rem.completed
                            ? 'bg-slate-800 text-slate-500'
                            : isOverdue
                            ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                            : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/40'
                        }`}
                      >
                        {rem.completed ? 'Done' : remaining}
                      </span>
                      <button
                        onClick={() => {
                          triggerHaptic(20);
                          onDeleteReminder(rem.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
