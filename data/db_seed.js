// seed file for mongodb

import { createUser, getAllUsers, getUserById, getUserByUsername, removeUser, updateUser, updateUserTags, getUserTags, create_auth, addFriend, removeFriend } from './users.js';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';

async function main() {
    const db = await dbConnection();
    const userCollection = await db.collection('users');

    console.log('Clearing the users collection...');
    await userCollection.deleteMany({});

    console.log('Seeding database with sample users...');

    try {
        // Create sample users
        const user1 = await createUser('johndoe', 'Password123!');
        const user2 = await createUser('janedoe', 'SecurePass456!');
        const user3 = await createUser('alicesmith', 'MyPassword789!');

        console.log('Created users:');
        console.log(user1);
        console.log(user2);
        console.log(user3);

        // Test creating a user with the same username
        try {
            console.log('Attempting to create a user with a duplicate username (johndoe)...');
            await createUser('johndoe', 'AnotherPassword123!');
        } catch (error) {
            console.error('Expected error for duplicate username:', error);
        }

        // Test getAllUsers
        const allUsers = await getAllUsers();
        console.log('All users in the database:');
        console.log(allUsers);

        // Test getUserById
        const userById = await getUserById(user1._id);
        console.log(`User fetched by ID (${user1._id}):`);
        console.log(userById);

        // Test getUserByUsername
        const userByUsername = await getUserByUsername('janedoe');
        console.log('User fetched by username (janedoe):');
        console.log(userByUsername);

        // Test updateUserTags
        console.log('Updating skill tags for user1...');
        const updatedTags = await updateUserTags(user1._id, ['JavaScript', 'Node.js']);
        console.log('Updated skill tags:');
        console.log(updatedTags);

        // Test updateUser
        console.log('Updating achievements for user2...');
        const updatedUser = await updateUser(user2._id, {
            achievements: ['Completed 100 projects', 'Top contributor']
        });
        console.log('Updated user:');
        console.log(updatedUser);

        console.log('Updating github_profile for user1...');
        const updatedUserGithub = await updateUser(user1._id, {
            github_profile: "johndoe123"
        });
        console.log('Updated user with new github profile:');
        console.log(updatedUserGithub);

        // Test adding friends
        console.log('Adding user2 as a friend of user1...');
        const updatedUser1WithFriend = await addFriend(user1._id, user2._id);
        console.log('Updated user1 with friends:');
        console.log(updatedUser1WithFriend);

        console.log('Adding user3 as a friend of user2...');
        const updatedUser2WithFriend = await addFriend(user2._id, user3._id);
        console.log('Updated user2 with friends:');
        console.log(updatedUser2WithFriend);

        console.log('Adding user3 as a friend of user1...');
        const updatedUser1WithFriend3 = await addFriend(user1._id, user3._id);
        console.log('Updated user1 with friends:');
        console.log(updatedUser1WithFriend3);

        // Test removeFriend
        console.log('Removing user2 from user1\'s friends...');
        const updatedUser1WithoutFriend = await removeFriend(user1._id, user2._id);
        console.log('Updated user1 without user2 as a friend:');
        console.log(updatedUser1WithoutFriend);

        // Test removeUser
        console.log('Removing user3...');
        const removedUser = await removeUser(user3._id);
        console.log(removedUser);

        // Verify removal
        const remainingUsers = await getAllUsers();
        console.log('Remaining users after removal:');
        console.log(remainingUsers);

        // Test invalid inputs
        try {
            console.log('Attempting to create a user with an invalid username...');
            await createUser('', 'InvalidPassword!');
        } catch (error) {
            console.error('Expected error for invalid username:', error);
        }

        try {
            console.log('Attempting to create a user with an existing username...');
            await createUser('JoHnDoE', 'MyPassword789!');
            console.log('This should not have succeeded!');
        }
        catch (error) {
            console.error('Expected error for existing username:', error);
        }

        try {
            console.log('Attempting to fetch a user with an invalid ID...');
            await getUserById('invalidObjectId');
        } catch (error) {
            console.error('Expected error for invalid ID:', error);
        }
    } catch (error) {
        console.error('Error during seeding or testing:', error);
    } finally {
        console.log('Closing database connection...');
        await closeConnection();
    }
}

main();