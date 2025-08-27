const createDefaultAdmin = async (strapi: any) => {
  const adminEmail =  'admin@bzchair.com';
  const adminUsername = 'admin';
  const adminPassword =  'admin123';

  const existingAdmin = await strapi.query('plugin::users-permissions.user').findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log('⏳ Creating default admin user...');

   await strapi.plugins['users-permissions'].services.user.add({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // Will be hashed automatically
      confirmed: true,
      Type: 'admin',
      blocked: false,
    });

    console.log('✅ Admin user created:', adminEmail);
  } else {
    console.log('✅ Admin user already exists:', adminEmail);
  }
};

export default createDefaultAdmin;
