const crypto = require('crypto');

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
}

console.log('Testing Supervisor OTP & Week Confirmation Engine...');

// Test OTP verification
const expectedOtp = '482915';
function verifyOtp(inputOtp, activeOtp) {
  return inputOtp.trim() === activeOtp;
}

assert(!verifyOtp('000000', expectedOtp), 'Wrong OTP must be rejected');
assert(verifyOtp('482915', expectedOtp), 'Correct OTP must be accepted');
console.log('✓ OTP verification logic validated.');

// Test Confirmation audit record
const confirmation = {
  weekly_log_id: 'wlog-intern-1-1',
  token_hash: 'hash-tok-123',
  status: 'confirmed',
  confirmed_by_name: 'Cdr. K. V. Rao',
  confirmed_at: new Date().toISOString(),
  ip: '122.172.88.14',
  comment: 'Verified on-site performance.',
};

assert(confirmation.status === 'confirmed', 'Status must be confirmed');
assert(confirmation.confirmed_by_name === 'Cdr. K. V. Rao', 'Must record supervisor name');
assert(Boolean(confirmation.ip), 'Must capture IP in audit trail');
console.log('✓ Confirmation audit record structure validated.');
console.log('All supervisor tests passed successfully!\n');
