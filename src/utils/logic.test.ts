import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateEmail,
  validatePassword,
  validateSignUpForm,
  validateSignInForm,
} from './authValidator.ts';
import {
  createNewConversation,
  generateConversationTitle,
  addMessageToConversation,
  pruneConversationForContext,
} from './chatManager.ts';
import {
  filterNotes,
  sortTasks,
  isReminderDue,
  formatTimeRemaining,
} from './productivityStorage.ts';
import { buildIntentUri } from './phoneBridge.ts';
import { Note, Task, Reminder } from '../types/index.ts';

test('authValidator: email validation checks standard patterns', () => {
  assert.equal(validateEmail('test@aipako.ai'), true);
  assert.equal(validateEmail('user.name+tag@gmail.com'), true);
  assert.equal(validateEmail('invalid-email'), false);
  assert.equal(validateEmail('missing@domain'), false);
  assert.equal(validateEmail(''), false);
});

test('authValidator: password strength score and rules', () => {
  const weak = validatePassword('123');
  assert.equal(weak.isValid, false);
  assert.equal(weak.score < 2, true);

  const strong = validatePassword('Aipako2026!');
  assert.equal(strong.isValid, true);
  assert.equal(strong.score >= 3, true);
});

test('authValidator: sign up validation errors for mismatched passwords', () => {
  const res = validateSignUpForm({
    name: 'Aipako User',
    email: 'user@example.com',
    password: 'Password123!',
    confirmPassword: 'MismatchPassword',
    acceptTerms: true,
  });
  assert.equal(res.isValid, false);
  assert.equal(Boolean(res.errors.confirmPassword), true);
});

test('chatManager: creates conversation with initial welcome message', () => {
  const conv = createNewConversation('Custom Title');
  assert.equal(conv.title, 'Custom Title');
  assert.equal(conv.messages.length, 1);
  assert.equal(conv.messages[0].role, 'assistant');
});

test('chatManager: generates clean concise titles from prompt', () => {
  assert.equal(generateConversationTitle('How to build an Android app with Kotlin?'), 'How to build an Android');
  assert.equal(generateConversationTitle(''), 'New Conversation');
});

test('chatManager: adds message and updates title when starting conversation', () => {
  const conv = createNewConversation();
  const updated = addMessageToConversation(conv, 'user', 'Explain quantum computing simply');
  assert.equal(updated.messages.length, 2);
  assert.equal(updated.title, 'Explain quantum computing simply');
});

test('chatManager: pruneConversationForContext trims long threads', () => {
  const conv = createNewConversation();
  const step1 = addMessageToConversation(conv, 'user', 'Turn 1');
  const step2 = addMessageToConversation(step1, 'assistant', 'Reply 1');
  const step3 = addMessageToConversation(step2, 'user', 'Turn 2');
  const context = pruneConversationForContext(step3.messages, 2);
  assert.equal(context.length, 2);
  assert.equal(context[1].content, 'Turn 2');
});

test('productivityStorage: filters notes by query and category', () => {
  const sampleNotes: Note[] = [
    { id: '1', title: 'Meeting summary', content: 'Notes from AI sync', category: 'Work', createdAt: '', updatedAt: '' },
    { id: '2', title: 'Kotlin Jetpack Compose', content: 'UI Architecture guide', category: 'Study', createdAt: '', updatedAt: '' },
    { id: '3', title: 'Grocery list', content: 'Apples, oranges', category: 'General', createdAt: '', updatedAt: '' },
  ];

  const workOnly = filterNotes(sampleNotes, '', 'Work');
  assert.equal(workOnly.length, 1);
  assert.equal(workOnly[0].id, '1');

  const searchKotlin = filterNotes(sampleNotes, 'compose', 'All');
  assert.equal(searchKotlin.length, 1);
  assert.equal(searchKotlin[0].id, '2');
});

test('productivityStorage: sorts tasks by completion and priority', () => {
  const sampleTasks: Task[] = [
    { id: '1', title: 'Low priority pending', completed: false, priority: 'low', createdAt: '2026-01-01T00:00:00Z' },
    { id: '2', title: 'High priority pending', completed: false, priority: 'high', createdAt: '2026-01-02T00:00:00Z' },
    { id: '3', title: 'Completed task', completed: true, priority: 'high', createdAt: '2026-01-03T00:00:00Z' },
  ];

  const sorted = sortTasks(sampleTasks, 'all');
  assert.equal(sorted[0].id, '2'); // High priority incomplete first
  assert.equal(sorted[1].id, '1'); // Low priority incomplete second
  assert.equal(sorted[2].id, '3'); // Completed task at bottom
});

test('productivityStorage: reminder due check and remaining format', () => {
  const now = new Date('2026-10-21T10:00:00Z');
  const pastReminder: Reminder = { id: '1', title: 'Past', datetime: '2026-10-21T09:00:00Z', completed: false, createdAt: '' };
  const futureReminder: Reminder = { id: '2', title: 'Future', datetime: '2026-10-21T10:30:00Z', completed: false, createdAt: '' };

  assert.equal(isReminderDue(pastReminder, now), true);
  assert.equal(isReminderDue(futureReminder, now), false);
  assert.equal(formatTimeRemaining(futureReminder.datetime, now), 'in 30 min');
});

test('phoneBridge: builds standard intent URIs for dialer and SMS', () => {
  assert.equal(buildIntentUri('dial', '+1 (555) 123-4567'), 'tel:+15551234567');
  assert.equal(buildIntentUri('sms', '123456', 'Hello from AIPAKO'), 'sms:123456?body=Hello%20from%20AIPAKO');
  assert.equal(buildIntentUri('mailto', 'support@aipako.ai', 'Feedback notes'), 'mailto:support@aipako.ai?subject=From%20AIPAKO%20AI&body=Feedback%20notes');
});
