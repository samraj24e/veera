const { supabase } = require('../config/db');

/**
 * Generate Employee ID based on company name.
 * Logic: Extract first letter of each word, uppercase, append 4-digit sequence.
 * Example: "Vaiso Verse Technology" → VVT0001
 */
async function generateEmployeeId(companyName) {
  const acronym = companyName
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  const { data: employees, error } = await supabase
    .from('employees')
    .select('employee_id')
    .ilike('employee_id', `${acronym}%`)
    .order('employee_id', { ascending: false })
    .limit(1);

  const lastEmployee = employees && employees[0];

  let nextNumber = 1;
  if (lastEmployee) {
    const lastNumber = parseInt(lastEmployee.employee_id.replace(acronym, ''), 10);
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `${acronym}${paddedNumber}`;
}

module.exports = { generateEmployeeId };
