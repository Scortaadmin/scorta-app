const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
require('dotenv').config();

// Sample profiles data
const sampleProfiles = [
    {
        name: 'Valeria',
        age: 24,
        city: 'Quito',
        bio: 'Profesional, educada y discreta. Disponible para eventos y compañía.',
        ethnicity: 'Latina',
        nationality: 'Ecuatoriana',
        photos: ['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=400&q=80'],
        pricing: { hourly: 60, overnight: 300 },
        services: ['Acompañamiento', 'Eventos', 'Cenas'],
        languages: ['Español', 'Inglés'],
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: false
        },
        verified: true,
        isPremium: false
    },
    {
        name: 'Camila',
        age: 22,
        city: 'Guayaquil',
        bio: 'Modelo profesional, alegre y carismática. Ideal para eventos sociales.',
        ethnicity: 'Latina',
        nationality: 'Colombiana',
        photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80'],
        pricing: { hourly: 80, overnight: 450 },
        services: ['Modelaje', 'Eventos VIP', 'Compañía'],
        languages: ['Español', 'Inglés', 'Portugués'],
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true
        },
        verified: false,
        isPremium: true
    },
    {
        name: 'Isabella',
        age: 26,
        city: 'Manta',
        bio: 'Conversadora inteligente, perfecta para cenas y eventos corporativos.',
        ethnicity: 'Caucásica',
        nationality: 'Española',
        photos: ['https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80'],
        pricing: { hourly: 50, overnight: 280 },
        services: ['Acompañamiento', 'Eventos corporativos'],
        languages: ['Español', 'Catalán'],
        availability: {
            monday: false,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: false
        },
        verified: true,
        isPremium: false
    },
    {
        name: 'Elena',
        age: 25,
        city: 'Quito',
        bio: 'Elite, sofisticada y elegante. Experiencia internacional en eventos de alto nivel.',
        ethnicity: 'Europea',
        nationality: 'Rusa',
        photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80'],
        pricing: { hourly: 100, overnight: 600 },
        services: ['Eventos VIP', 'Viajes internacionales', 'Eventos culturales'],
        languages: ['Ruso', 'Inglés', 'Español', 'Francés'],
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true
        },
        verified: true,
        isPremium: true
    },
    {
        name: 'Sofia',
        age: 23,
        city: 'Cuenca',
        bio: 'Dulce y amable, perfecta para momentos especiales y románticos.',
        ethnicity: 'Latina',
        nationality: 'Ecuatoriana',
        photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'],
        pricing: { hourly: 70, overnight: 350 },
        services: ['Cenas románticas', 'Compañía', 'Eventos'],
        languages: ['Español'],
        availability: {
            monday: true,
            tuesday: true,
            wednesday: false,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true
        },
        verified: true,
        isPremium: false
    },
    {
        name: 'Gabriela',
        age: 27,
        city: 'Machala',
        bio: 'Madura y profesional, experiencia en eventos corporativos.',
        ethnicity: 'Latina',
        nationality: 'Ecuatoriana',
        photos: ['https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80'],
        pricing: { hourly: 55, overnight: 300 },
        services: ['Eventos corporativos', 'Acompañamiento profesional'],
        languages: ['Español', 'Inglés'],
        availability: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false
        },
        verified: false,
        isPremium: false
    }
];

// Sample users (providers for the profiles above)
const sampleUsers = [
    {
        email: 'valeria@example.com',
        password: 'password123',
        role: 'provider',
        verified: true,
        name: 'Valeria',
        phone: '+593987654321'
    },
    {
        email: 'camila@example.com',
        password: 'password123',
        role: 'provider',
        verified: false,
        name: 'Camila',
        phone: '+593987654322'
    },
    {
        email: 'isabella@example.com',
        password: 'password123',
        role: 'provider',
        verified: true,
        name: 'Isabella',
        phone: '+593987654323'
    },
    {
        email: 'elena@example.com',
        password: 'password123',
        role: 'provider',
        verified: true,
        name: 'Elena',
        phone: '+593987654324'
    },
    {
        email: 'sofia@example.com',
        password: 'password123',
        role: 'provider',
        verified: true,
        name: 'Sofia',
        phone: '+593987654325'
    },
    {
        email: 'gabriela@example.com',
        password: 'password123',
        role: 'provider',
        verified: false,
        name: 'Gabriela',
        phone: '+593987654326'
    },
    // Test client user
    {
        email: 'client@test.com',
        password: 'password123',
        role: 'client',
        verified: true,
        name: 'Cliente de Prueba',
        phone: '+593987654327'
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('\n📝 Clearing existing data...');
        await User.deleteMany({});
        await Profile.deleteMany({});
        console.log('✅ Cleared existing users and profiles');

        // Create users
        console.log('\n👥 Creating users...');
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`   ✅ Created user: ${user.email}`);
        }

        // Create profiles (link to provider users)
        console.log('\n📋 Creating profiles...');
        for (let i = 0; i < sampleProfiles.length; i++) {
            const profileData = sampleProfiles[i];
            const providerUser = createdUsers[i]; // Match profile to user by index

            const profile = new Profile({
                ...profileData,
                user: providerUser._id
            });

            await profile.save();
            console.log(`   ✅ Created profile: ${profile.name} (${profile.city})`);
        }

        console.log('\n╔════════════════════════════════════════════════════════════════╗');
        console.log('║              ✅ DATABASE SEEDED SUCCESSFULLY                   ║');
        console.log('╚════════════════════════════════════════════════════════════════╝');
        console.log('');
        console.log('📊 Summary:');
        console.log(`   • ${createdUsers.length} users created`);
        console.log(`   • ${sampleProfiles.length} profiles created`);
        console.log('');
        console.log('🔐 Test Credentials:');
        console.log('   Client:');
        console.log('   - Email: client@test.com');
        console.log('   - Password: password123');
        console.log('');
        console.log('   Provider (Valeria):');
        console.log('   - Email: valeria@example.com');
        console.log('   - Password: password123');
        console.log('');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('✅ Database connection closed');
        process.exit(0);
    }
}

// Run seeding
seedDatabase();
