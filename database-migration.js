// database-migration.js
// Run this script to migrate existing users from googleId/authProvider to providerId/providerName

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function migrateUsers() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');

        // Step 1: Check how many users need migration
        const usersToMigrate = await usersCollection.countDocuments({
            googleId: { $exists: true, $ne: null }
        });

        console.log(`\n📊 Found ${usersToMigrate} users with googleId to migrate`);

        if (usersToMigrate === 0) {
            console.log('✅ No users to migrate. All done!');
            await mongoose.connection.close();
            return;
        }

        // Step 2: Show sample of what will be migrated
        console.log('\n📝 Sample of users to migrate:');
        const sampleUsers = await usersCollection.find({
            googleId: { $exists: true, $ne: null }
        }).limit(3).toArray();

        sampleUsers.forEach((user, index) => {
            console.log(`\n  User ${index + 1}:`);
            console.log(`    Email: ${user.email}`);
            console.log(`    Current googleId: ${user.googleId}`);
            console.log(`    Current authProvider: ${user.authProvider}`);
            console.log(`    Will become:`);
            console.log(`      providerId: ${user.googleId}`);
            console.log(`      providerName: google`);
        });

        // Step 3: Ask for confirmation (in production, you might want to add a prompt here)
        console.log('\n⚠️  This will modify user documents in the database.');
        console.log('📌 Make sure you have a backup before proceeding!');
        
        // Uncomment the next line to require manual confirmation
        // const readline = require('readline').createInterface({ input: process.stdin, output: process.stdout });
        // await new Promise(resolve => readline.question('\nType "YES" to continue: ', answer => { if (answer !== 'YES') process.exit(0); resolve(); }));

        console.log('\n🚀 Starting migration...');

        // Step 4: Perform the migration
        const result = await usersCollection.updateMany(
            { googleId: { $exists: true, $ne: null } },
            [
                {
                    $set: {
                        providerId: "$googleId",
                        providerName: "google"
                    }
                },
                {
                    $unset: ["googleId", "authProvider"]
                }
            ]
        );

        console.log(`\n✅ Migration completed successfully!`);
        console.log(`   Matched: ${result.matchedCount} documents`);
        console.log(`   Modified: ${result.modifiedCount} documents`);

        // Step 5: Verify the migration
        console.log('\n🔍 Verifying migration...');
        
        const oldFieldUsers = await usersCollection.countDocuments({
            googleId: { $exists: true }
        });

        const newFieldUsers = await usersCollection.countDocuments({
            providerName: "google",
            providerId: { $exists: true, $ne: null }
        });

        console.log(`   Users with old fields (googleId): ${oldFieldUsers}`);
        console.log(`   Users with new fields (providerName: "google"): ${newFieldUsers}`);

        if (oldFieldUsers === 0 && newFieldUsers === result.modifiedCount) {
            console.log('\n✅ Migration verified successfully!');
        } else {
            console.log('\n⚠️  Warning: Verification numbers don\'t match. Please check manually.');
        }

        // Step 6: Show sample of migrated users
        console.log('\n📝 Sample of migrated users:');
        const migratedUsers = await usersCollection.find({
            providerName: "google",
            providerId: { $exists: true, $ne: null }
        }).limit(3).toArray();

        migratedUsers.forEach((user, index) => {
            console.log(`\n  User ${index + 1}:`);
            console.log(`    Email: ${user.email}`);
            console.log(`    providerId: ${user.providerId}`);
            console.log(`    providerName: ${user.providerName}`);
        });

        console.log('\n🎉 All done! Your database is ready for the new authentication system.');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the migration
console.log('='.repeat(60));
console.log('  DATABASE MIGRATION: googleId → providerId/providerName');
console.log('='.repeat(60));

migrateUsers()
    .then(() => {
        console.log('\n✅ Migration script completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Migration script failed:', error);
        process.exit(1);
    });

// Usage:
// 1. Update your .env file with MONGODB_URI
// 2. Run: node database-migration.js
// 3. Check the output to verify everything worked