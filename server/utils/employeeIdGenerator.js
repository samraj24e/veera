const { prepare } = require('../config/db');

/**
 * Generate Employee ID based on company name.
 * Logic: Extract first letter of each word, uppercase, append 4-digit sequence.
 * Example: "Vaiso Verse Technology" → VVT0001
 */
function generateEmployeeId(companyName) {
  const acronym = companyName
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  const lastEmployee = prepare(
    `SELECT employee_id FROM employees WHERE employee_id LIKE ? ORDER BY employee_id DESC LIMIT 1`
  ).get(`${acronym}%`);

  let nextNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.employee_id.replace(acronym, ''), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${acronym}${paddedNumber}`;
}

module.exports = { generateEmployeeId };
