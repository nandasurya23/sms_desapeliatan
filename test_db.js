const supabase = require('../sms-backend-desa/src/models/db');

async function testProfilePictureLength() {
  const dummyBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(100000); // large payload

  console.log("Testing profile update...");
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (users && users.length > 0) {
    const { error } = await supabase
      .from('users')
      .update({ profile_picture: dummyBase64 })
      .eq('id', users[0].id);
    console.log("Profile Update Result:", error ? error.message : "Success");
  }

  console.log("Testing biopori insert...");
  const { error: bioporiError } = await supabase
    .from('biopori')
    .insert([{
      user_id: users[0].id,
      latitude: 0,
      longitude: 0,
      address: 'Test',
      image_url: dummyBase64,
      status: 'active'
    }]);
  console.log("Biopori Insert Result:", bioporiError ? bioporiError.message : "Success");

  console.log("Testing bank_sampah insert...");
  const { error: bankError } = await supabase
    .from('bank_sampah')
    .insert([{
      user_id: users[0].id,
      address: 'Test',
      weight: 10,
      category: 'Kertas',
      images: JSON.stringify([dummyBase64])
    }]);
  console.log("Bank Sampah Insert Result:", bankError ? bankError.message : "Success");
}

testProfilePictureLength().then(() => process.exit(0));
