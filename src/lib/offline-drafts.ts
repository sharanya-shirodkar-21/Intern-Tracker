/**
 * Offline draft storage for students on spotty network connections.
 * Synchronizes with browser localStorage and syncs when online.
 */

const DRAFT_PREFIX = 'INTERNTRACK_OFFLINE_DRAFT_';

export function saveOfflineDraft(studentId: string, weekNo: number, entryDate: string, content: string): void {
  if (typeof window === 'undefined') return;
  const key = `${DRAFT_PREFIX}${studentId}_W${weekNo}_${entryDate}`;
  localStorage.setItem(key, JSON.stringify({
    studentId,
    weekNo,
    entryDate,
    content,
    savedAt: new Date().toISOString(),
  }));
}

export function getOfflineDraft(studentId: string, weekNo: number, entryDate: string): string | null {
  if (typeof window === 'undefined') return null;
  const key = `${DRAFT_PREFIX}${studentId}_W${weekNo}_${entryDate}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data).content;
  } catch {
    return null;
  }
}

export function clearOfflineDraft(studentId: string, weekNo: number, entryDate: string): void {
  if (typeof window === 'undefined') return;
  const key = `${DRAFT_PREFIX}${studentId}_W${weekNo}_${entryDate}`;
  localStorage.removeItem(key);
}
