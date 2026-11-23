import { validateLogEntryLock } from '../src/lib/lock-engine';
import { WeeklyLog } from '../src/types/database';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Week Lock Engine Unit Tests ---');

// Test 1: Locked week rejection
const lockedWeek: WeeklyLog = {
  id: 'w1',
  internship_id: 'intern-1',
  week_no: 1,
  week_start: '2024-07-01',
  week_end: '2024-07-07',
  locked_at: '2024-07-08T23:59:59Z',
  created_at: '2024-07-01T00:00:00Z',
};

const resultLocked = validateLogEntryLock(lockedWeek, '2024-07-03', 24, new Date('2024-07-15T00:00:00Z'));
assert(!resultLocked.allowed, 'Should reject editing locked week');
assert(resultLocked.code === 'WEEK_LOCKED', 'Should return code WEEK_LOCKED');
console.log('✓ Test 1 Passed: Sealed locked week successfully blocked.');

// Test 2: Future date rejection
const activeWeek: WeeklyLog = {
  id: 'w3',
  internship_id: 'intern-1',
  week_no: 3,
  week_start: '2024-07-15',
  week_end: '2024-07-21',
  created_at: '2024-07-15T00:00:00Z',
};

const resultFuture = validateLogEntryLock(activeWeek, '2024-07-18', 24, new Date('2024-07-16T00:00:00Z'));
assert(!resultFuture.allowed, 'Should reject future-dated log entry');
assert(resultFuture.code === 'FUTURE_DATE', 'Should return code FUTURE_DATE');
console.log('✓ Test 2 Passed: Future-dated entry successfully blocked.');

// Test 3: Out of bounds date
const resultOutOfBounds = validateLogEntryLock(activeWeek, '2024-07-25', 24, new Date('2024-07-26T00:00:00Z'));
assert(!resultOutOfBounds.allowed, 'Should reject date outside week window');
assert(resultOutOfBounds.code === 'OUT_OF_BOUNDS', 'Should return code OUT_OF_BOUNDS');
console.log('✓ Test 3 Passed: Out of bounds date successfully blocked.');

// Test 4: Allowed on-time entry
const resultAllowed = validateLogEntryLock(activeWeek, '2024-07-16', 24, new Date('2024-07-16T15:00:00Z'));
assert(resultAllowed.allowed, 'Should allow valid on-time entry');
assert(resultAllowed.code === 'OK', 'Should return code OK');
console.log('✓ Test 4 Passed: On-time entry allowed.');

console.log('All lock engine unit tests passed successfully!\n');
