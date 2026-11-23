import { WeeklyLog, LogEntry, AuditLog } from '@/types/database';
import { StoreManager } from '@/lib/store';

export interface LockValidationResult {
  allowed: boolean;
  code?: 'FUTURE_DATE' | 'OUT_OF_BOUNDS' | 'WEEK_LOCKED' | 'OK';
  error?: string;
  isLocked: boolean;
}

export const DEFAULT_GRACE_HOURS = 24;

/**
 * Validates whether a log entry is allowed to be inserted or updated.
 * Matches exact PostgreSQL trigger logic from fn_prevent_weekly_log_backfilling().
 */
export function validateLogEntryLock(
  weeklyLog: WeeklyLog,
  entryDateStr: string,
  graceHours: number = DEFAULT_GRACE_HOURS,
  simulatedNow?: Date
): LockValidationResult {
  const now = simulatedNow || new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Rule 1: No entries for future dates
  if (entryDateStr > todayStr) {
    return {
      allowed: false,
      code: 'FUTURE_DATE',
      error: `BACKFILL_PROHIBITED: Cannot log entries for future dates (${entryDateStr}).`,
      isLocked: false,
    };
  }

  // Rule 2: Within designated week window
  if (entryDateStr < weeklyLog.week_start || entryDateStr > weeklyLog.week_end) {
    return {
      allowed: false,
      code: 'OUT_OF_BOUNDS',
      error: `INVALID_WEEK_DATE: Date ${entryDateStr} does not belong to Week ${weeklyLog.week_no} [${weeklyLog.week_start} to ${weeklyLog.week_end}].`,
      isLocked: false,
    };
  }

  // Rule 3: Check if already explicitly locked
  if (weeklyLog.locked_at) {
    const lockedAtDate = new Date(weeklyLog.locked_at);
    if (now > lockedAtDate) {
      return {
        allowed: false,
        code: 'WEEK_LOCKED',
        error: `WEEK_LOCKED: Week ${weeklyLog.week_no} ended on ${weeklyLog.week_end} and was locked on ${lockedAtDate.toLocaleDateString()}. Editing is strictly barred.`,
        isLocked: true,
      };
    }
  }

  // Rule 4: Check if grace period has expired (Week end at 23:59:59 + grace_hours)
  const weekEndDate = new Date(`${weeklyLog.week_end}T23:59:59Z`);
  const lockExpirationTime = new Date(weekEndDate.getTime() + graceHours * 60 * 60 * 1000);

  if (now > lockExpirationTime) {
    return {
      allowed: false,
      code: 'WEEK_LOCKED',
      error: `WEEK_LOCKED: Grace window of ${graceHours} hours expired on ${lockExpirationTime.toLocaleDateString()} at ${lockExpirationTime.toLocaleTimeString()}. Database trigger blocked update.`,
      isLocked: true,
    };
  }

  return {
    allowed: true,
    code: 'OK',
    isLocked: false,
  };
}

/**
 * Saves or updates a log entry with strict trigger validation and append-only audit trail logging.
 */
export function saveLogEntryWithAudit(
  weeklyLog: WeeklyLog,
  entryDateStr: string,
  content: string,
  studentId: string,
  specificityScore: number = 0
): { success: boolean; entry?: LogEntry; error?: string } {
  // Validate with lock engine
  const validation = validateLogEntryLock(weeklyLog, entryDateStr);
  if (!validation.allowed) {
    return {
      success: false,
      error: validation.error,
    };
  }

  const store = StoreManager.getInstance();
  const state = store.getState();

  // Find or create entry
  const existingIdx = state.logEntries.findIndex(
    (e) => e.weekly_log_id === weeklyLog.id && e.entry_date === entryDateStr
  );

  const nowIso = new Date().toISOString();
  let savedEntry: LogEntry;

  if (existingIdx >= 0) {
    const beforeState = { ...state.logEntries[existingIdx] };
    state.logEntries[existingIdx].content = content;
    state.logEntries[existingIdx].specificity_score = specificityScore;
    state.logEntries[existingIdx].updated_at = nowIso;
    savedEntry = state.logEntries[existingIdx];

    store.addAuditLog(
      studentId,
      'UPDATE_LOG_ENTRY',
      'log_entries',
      savedEntry.id,
      beforeState,
      savedEntry
    );
  } else {
    savedEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      weekly_log_id: weeklyLog.id,
      entry_date: entryDateStr,
      content,
      specificity_score: specificityScore,
      created_at: nowIso,
      updated_at: nowIso,
    };
    state.logEntries.push(savedEntry);

    store.addAuditLog(
      studentId,
      'INSERT_LOG_ENTRY',
      'log_entries',
      savedEntry.id,
      null,
      savedEntry
    );
  }

  store.saveState();
  return {
    success: true,
    entry: savedEntry,
  };
}
