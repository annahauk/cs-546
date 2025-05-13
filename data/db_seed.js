// seed file for mongodb
import { createUser, getAllUsers, getUserById, getUserByUsername, removeUser, updateUser, updateUserTags, getUserTags, create_auth, addFriend, removeFriend } from './users.js';
import { createPost, getAllPosts, getPostById, getPostsByUserId, removePost, updatePost, grabfilteredPosts } from './posts.js';
import { createNotif, getAllNotifs, getNotif, removeNotif, removeAllNotif, resolveNotif } from './notifications.js';
import { createComment, getAllCommentsByPostId, getCommentById } from './comments.js';
import { dbConnection, closeConnection } from '../config/mongoConnection.js';


import { MongoClient, ObjectId } from 'mongodb';

/*

                COLLECTIONS

export const users = getCollectionFn("users");
// notifications will be a subcollection of users
export const projectPosts = getCollectionFn("projectPosts");
// comments will be a subcollection of projectPosts
export const auth = getCollectionFn("auth");

*/

async function main() {
    const db = await dbConnection();
    const userCollection = await db.collection('users');
    const postCollection = await db.collection('projectPosts');
    const authCollection = await db.collection('auth');

    console.log('Clearing the users collection...');
    await userCollection.deleteMany({});

    console.log('Clearing the posts collection...');
    await postCollection.deleteMany({});

    console.log('Clearing the auth collection...');
    await authCollection.deleteMany({});

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

        console.log('Updating skill tags for user2...');
        const updatedTags2 = await updateUserTags(user2._id, ['JavaScript', 'Python']);
        console.log('Updated skill tags:');
        console.log(updatedTags2);

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

        console.log('Adding user5 as a friend of user4...');
        const updatedUser4WithFriend = await addFriend(user4._id, user5._id);
        console.log('Updated user4 with friends:');
        console.log(updatedUser4WithFriend);

        /**
         * 
         *      TESTING POST FUNCTIONS
         * 
         */
        
        // add anna as friend of zakypoo

        console.log('Seeding database with sample posts...');


        // Create sample posts from user4 nd user5
        console.log('Creating sample posts...');
        const post1 = await createPost("Bi-directional LSTM #pride", user4._id, "LSTMs ain't the only things that can be flexible! Celebrating pride with my study on Bi-direction LSTMs!", "https://github.com/ZakariyyaScavotto/redditScraping", ["machine learning", "deep learning", "python"]);
        const post2 = await createPost('Web Programming Final Project', user5._id, 'Need help with my GitMatches final project. Need javascript, mongo, and awesomeness to help.', 'https://github.com/annahauk/cs-546', ['JavaScript', 'MongoDB', 'Web', 'machine learning']);
        const post3 = await createPost('Convolutional Image Classifier', user5._id, "I don't understand ML - someone help me please!", 'https://github.com/annahauk/cs-546-2', ['machine Learning', 'deep Learning', 'python']);

        try {
            const post4 = await createPost('Web Programming Final Project', user5._id, 'Need help with my GitMatches final project. Need javascript, mongo, and awesomeness to help.', 'https://github.com/annahauk/cs-546', ['JavaScript', 'MongoDB', 'Web', 'Machine Learning']);
            console.log("UH OH! Did not catch duplicate post!");
        } catch (error) {
            console.error('Expected error for duplicate post:', error);
        }

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
        const filteredPosts = await grabfilteredPosts(['Machine Learning'], "", "active");
        console.log('Filtered posts:');
        console.log(filteredPosts);

        // add more posts
        let post8 = await createPost("Airbnb Ratings", user5._id, "Testing different Machine learning models to see which has best accuracy for a regression classification.", "https://github.com/annahauk/Airbnb-Ratings", ["machine Learning", "deep Learning", "Python", "scikit-learn", "xgboost"]);
        let post5 = await createPost("Stock Trading Dashboard", user4._id, "Building out a trading dashboard to provide insights to users for informed stock trading and portfolio analysis.", "https://github.com/ZakariyyaScavotto/miniStockDash", ["javascript", "css", "Python", "sklearn", "streamlit" ]);
        let post6 = await createPost("NYBG: Image Classifier", user5._id, "Partnering with the New York Botanical Garden. We're trying to construct an image classifier to detect good/bad data from their 1 billion image dataset for researchers around the world. You in? Join below!", "https://github.com/annahauk/NYBG", ["machine Learning", "Python", "tensorflow", "keras", "openAi", "OpenCV"]);
        let post7 = await createPost("Star Wars Lorebot", user4._id, "OMG are you are starwars lover like me???? Please PLEASE help me make a lorebot so I can geek out about the more important things in life! ;))))))", "https://github.com/ZakariyyaScavotto/StarWarsLorebot", ["javascript", "typescript", "angular", "node", "node.js", "OpenAPI"]);
        
        /**
         * 
         *      TESTING NOTIFICATION FUNCTIONS
         * 
         */

        console.log('Testing notification functions...');

        try {
            // Create sample notifications
            // async function createNotif(ownerId, title, content, referencePost=null, referenceComment = null, origin)
            console.log('Creating sample notifications...');
            const notif1 = await createNotif(user4._id, 'Friend Request', 'User5 has sent you a friend request.', null, null, 'friend_request');
            const notif2 = await createNotif(user4._id, 'Post Liked', 'User5 liked your post.', post1._id, null, 'like');
            const notif3 = await createNotif(user5._id, 'Achievement Unlocked', 'You have unlocked the "Top Contributor" badge.', null, null, 'achievement');
            // we will add the comment reference when we test comments lmao
            const notif4 = await createNotif(user4._id, 'Commented on your post', 'User5 commented on your post.', post1._id, null, 'comment');
            const notif5 = await createNotif(user5._id, 'Friend Request', 'User4 has sent you a friend request.', null, null, 'friend_request');
            // console.log('Created notifications:');
            // console.log(notif1);
            // console.log(notif2);
            // console.log(notif3);
            // console.log(notif4);

            // Test getAllNotifs
            console.log('Fetching all notifications...');
            const allNotifs = await getAllNotifs(user4._id);
            console.log('All notifications for user4:');
            console.log(allNotifs);

            // Test getNotif by ID
            console.log(`Fetching notification by ID (${notif1._id})...`);
            console.log("notif1 is as follows: ", notif1);
            const fetchedNotif = await getNotif(notif1._id);
            console.log('Fetched notification:');
            console.log(fetchedNotif);

            // Test resolveNotif
            console.log(`Resolving notification with ID (${notif2._id})...`);
            const resolvedNotif = await resolveNotif(notif2._id);
            console.log('Resolved notification:');
            console.log(resolvedNotif);

            // Test removeNotif
            console.log(`Removing notification with ID (${notif3._id})...`);
            const removedNotif = await removeNotif(notif3._id);
            console.log('Removed notification:');
            console.log(removedNotif);

            // Verify removal
            console.log('Fetching all notifications after removal...');
            const remainingNotifs = await getAllNotifs(user5._id);
            console.log('Remaining notifications:');
            console.log(remainingNotifs);

            // Test removeAllNotif for a user
            console.log(`Removing all notifications for user (${user5._id})...`);
            const removedAllNotifs = await removeAllNotif(user5._id);
            console.log('Removed all notifications for user5:');
            console.log(removedAllNotifs);

            // Verify removal
            console.log('Fetching all notifications after removing all for user5...');
            const remainingNotifsAfterAllRemoved = await getAllNotifs(user5._id);
            console.log('Remaining notifications:');
            console.log(remainingNotifsAfterAllRemoved);

        } catch (error) {
        console.error('Error during notification testing:', error);
        }


        /**
         * 
         *      TESTING COMMENT FUNCTIONS
         * 
         */

        console.log('Testing comment functions...');

        try {
            // Create sample comments
            console.log('Creating sample comments...');
            const comment1 = await createComment('WOAH zak! THiS IS cuspa cool!', post1._id, user1._id);
            const comment2 = await createComment('Happy pride 🏳️‍🌈!', post1._id, user2._id);
            const comment3 = await createComment('I wanna help you with your project! Sending freind request now!', post3._id, user4._id);

            console.log('Created comments:');
            console.log(comment1);
            console.log(comment2);
            console.log(comment3);

            // Test getComment by ID
            console.log(`Fetching comment by ID (${comment1._id})...`);
            const fetchedComment = await getCommentById(comment1._id.toString());
            console.log('Fetched comment:');
            console.log(fetchedComment);

            let comment4 = await createComment("You're such a nerd zak LOL. Someone should do this with him >.<", post7._id, user5._id );
            let comment5 = await createComment("Hmm interesting proj. You might wanna use a YOLO model for image classificaiton. Or even a pretrained CNN like ImageNet.", post6._id, user4._id);
    


            // Verify removal
            console.log(`Fetching all comments for post (${post1._id}) after removal...`);
            const remainingCommentsForPost2 = await getAllCommentsByPostId(post1._id);
            console.log('Remaining comments for post2:');
            console.log(remainingCommentsForPost2);

        } catch (error) {
            console.error('Error during comment testing:', error);
        }


        // Test invalid inputs
        // try {
        //     console.log('TRY: Attempting to create a user with an invalid username...');
        //     await createUser('', 'InvalidPassword!');
        //     console.log("FAIL: Did not catch invalid username!");
        // } catch (error) {
        //     console.error('PASS: Expected error for invalid username:', error);
        // }

        // try {
        //     console.log('TRY: Attempting to fetch a user with an invalid ID...');
        //     await getUserById('invalidObjectId');
        //     console.log("FAIL: Did not catch invalid ID!");
        // } catch (error) {
        //     console.error('PASS: Expected error for invalid ID:', error);
        // }
    } catch (error) {
        console.error('Error during seeding or testing:', error);
    } finally {
        console.log('Closing database connection...');
        await closeConnection();
    }

}


main();
