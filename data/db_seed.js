// seed file for mongodb

import { createUser, getAllUsers, getUserById, getUserByUsername, removeUser, updateUser, updateUserTags, getUserTags, create_auth, addFriend, removeFriend } from './users.js';
import { createPost, getAllPosts, getPostById, getPostsByUserId, removePost, updatePost, grabfilteredPosts } from './posts.js';
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
        const user4 = await createUser('zakypoo', 'StarwarsBearSauce12!');
        const user5 = await createUser('annaBanana', 'BananaPass123!');

        console.log('Created users:');
        console.log(user1);
        console.log(user2);
        console.log(user3);
        console.log(user4);
        console.log(user5);

        // Test creating a user with the same username
        try {
            console.log('Attempting to create a user with a duplicate username (johnDoe)...');
            await createUser('johnDoe', 'AnotherPassword123!');
            console.log("UH OH! Did not catch duplicate username!");
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

        // get skill tags of user1
        console.log('Fetching skill tags for user1...');
        const userTags = await getUserTags(user1._id);
        console.log('User1 skill tags:');
        console.log(userTags);

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

        /**
         * 
         *      TESTING POST FUNCTIONS
         * 
         */
        
        // add anna as friend of zakypoo
        console.log('Adding user5 as a friend of user4...');
        const updatedUser4WithFriend = await addFriend(user4._id, user5._id);
        console.log('Updated user4 with friends:');
        console.log(updatedUser4WithFriend);

        // Create sample posts from user4 nd user5
        console.log('Creating sample posts...');
        const post1 = await createPost("Bi-directional LSTM #pride", user4._id, "LSTMs ain't the only things that can be flexible! Celebrating pride with my study on Bi-direction LSTMs!", "https://github.com/ZakariyyaScavotto/miniStockDash", ["Machine Learning", "Deep Learning"]);
        const post2 = await createPost('Web Programming Final Project', user5._id, 'Need help with my GitMatches final project. Need javascript, mongo, and awesomeness to help.', 'https://github.com/annahauk/cs-546', ['JavaScript', 'MongoDB']);

        console.log('Created posts:');
        console.log(post1);
        console.log(post2);

        // Test getAllPosts
        const allPosts = await getAllPosts();
        console.log('All posts in the database:');
        console.log(allPosts);

        // Test getPostById
        const postById = await getPostById(post1._id);
        console.log(`Post fetched by ID (${post1._id}):`);
        console.log(postById);

        // Test getPostsByUserId
        const postsByUserId = await getPostsByUserId(user4._id);
        console.log(`Posts fetched by user ID (${user4._id}):`);
        console.log(postsByUserId);
        
        // Test updatePost
        console.log('Updating content for post1...');
        const updatedPost = await updatePost(post1._id, {
            content: 'Updated content for post1'
        });
        console.log('Updated post:');
        console.log(updatedPost);

        // Test removePost
        console.log('Removing post2...');
        const removedPost = await removePost(post2._id);
        console.log(removedPost);
        // Verify removal
        const remainingPosts = await getAllPosts();
        console.log('Remaining posts after removal:');
        console.log(remainingPosts);

        // Test grabfilteredPosts
        console.log('Fetching posts with filters...');
        const filteredPosts = await grabfilteredPosts({ topic_tags: 'Machine Learning' });
        console.log('Filtered posts:');
        console.log(filteredPosts);

        

        // Test invalid inputs
        try {
            console.log('Attempting to create a user with an invalid username...');
            await createUser('', 'InvalidPassword!');
            console.log("UH OH! Did not catch invalid username!");
        } catch (error) {
            console.error('Expected error for invalid username:', error);
        }

        try {
            console.log('Attempting to fetch a user with an invalid ID...');
            await getUserById('invalidObjectId');
            console.log("UH OH! Did not catch invalid ID!");
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