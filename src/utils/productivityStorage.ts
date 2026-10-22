import { Note, Task, Reminder } from '../types/index.ts';

export function filterNotes(
  notes: Note[],
  searchQuery: string,
  categoryFilter?: string
): Note[] {
  return notes.filter((note) => {
    const matchesCategory =
      !categoryFilter || categoryFilter === 'All' || note.category === categoryFilter;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });
}

export function sortTasks(tasks: Task[], filter: 'all' | 'active' | 'completed'): Task[] {
  const filtered = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const priorityOrder = { high: 1, medium: 2, low: 3 };

  return filtered.sort((a, b) => {
    // Incomplete tasks first
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // High priority first
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    // Newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function isReminderDue(reminder: Reminder, now: Date = new Date()): boolean {
  if (reminder.completed) return false;
  const remTime = new Date(reminder.datetime).getTime();
  return remTime <= now.getTime();
}

export function formatTimeRemaining(datetimeStr: string, now: Date = new Date()): string {
  const target = new Date(datetimeStr).getTime();
  const current = now.getTime();
  const diffSec = Math.floor((target - current) / 1000);

  if (diffSec < 0) return 'Overdue';
  if (diffSec < 60) return `${diffSec}s remaining`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `in ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `in ${diffHours} hr`;
  const diffDays = Math.floor(diffHours / 24);
  return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
}
