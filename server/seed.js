const { supabase } = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const email = 'admin@veeragroup.com';
  const rawPassword = 'admin123';
  const hashedPassword = bcrypt.hashSync(rawPassword, 10);

  console.log('Seeding admin...');
  console.log('Email:', email);
  console.log('Target Hash:', hashedPassword);

  // Check if admin exists
  const { data: existing, error: fetchError } = await supabase
    .from('admins')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (fetchError) {
    console.error('Error checking for existing admin:', fetchError.message);
    process.exit(1);
  }

  if (existing) {
    console.log('Admin exists. Updating password to ensure it is correct...');
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (updateError) {
      console.error('Error updating admin:', updateError.message);
      process.exit(1);
    }
  } else {
    console.log('Admin does not exist. Creating new admin...');
    const { error: insertError } = await supabase
      .from('admins')
      .insert([{ email, password: hashedPassword, role: 'admin' }]);

    if (insertError) {
      console.error('Error seeding admin:', insertError.message);
      process.exit(1);
    }
  }

  console.log('Admin seeded/updated successfully!');
  console.log('Verification: bcrypt.compareSync("admin123", hash) =', bcrypt.compareSync(rawPassword, hashedPassword));
  process.exit(0);
}

seedAdmin();
