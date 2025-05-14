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

    console.log('Seeding database with sample users for Demo...');

    try {
        // Create sample users
        const rishi = await createUser('RishiRaj', 'Password123!');
        const chris = await createUser('chrisK', 'SecurePass456!');
        const zak = await createUser('zakypoo', 'StarwarsBear12!');

        console.log('Created users:');
        console.log(rishi);
        console.log(chris);
        console.log(zak);

        // Test updateUserTags
        const updatedTags = await updateUserTags(rishi._id, ['JavaScript', 'Node.js', "openAI"]);
        await updateUserTags(chris._id, ['Python', 'Machine Learning', 'Deep Learning']);
        await updateUserTags(zak._id, ['Java', 'Typescript', 'React', "c++"]);

        // // Test updateUser
        // const updatedUser = await updateUser(rishi._id, {
        //     achievements: ["Top Contributor", "Most Liked Project"] 
        // });

        // Test adding friends
        const updatedrishiWithFriend = await addFriend(rishi._id, chris._id);

        /**
         * 
         *      TESTING POST FUNCTIONS
         * 
         */
        
        // add anna as friend of zakypoo

        console.log('Seeding database with sample posts...');


        // Create sample posts from zak nd charli
        console.log('Creating sample posts...');
        const post1 = await createPost("Bi-directional LSTM #pride", zak._id, "Celebrating pride with my study on Bi-direction LSTMs! Up for the challenge?", "https://github.com/ZakariyyaScavotto/redditScraping", ["Machine learning", "Deep learning", "Python"]);
        const post2 = await createPost('Web Programming Final Project', chris._id, 'Need help with my GitMatches final project. Need javascript, mongo, and awesomeness to help.', 'https://github.com/annahauk/cs-546', ['JavaScript', 'MongoDB', 'Web', 'machine learning']);
        const post3 = await createPost('Convolutional Image Classifier', rishi._id, "I don't understand ML - someone help me please!", 'https://github.com/annahauk/cs-546-2', ['machine Learning', 'deep Learning', 'python']);
        let post4 = await createPost("Airbnb Ratings", rishi._id, "Testing different Machine learning models to see which has best accuracy for a regression classification.", "https://github.com/annahauk/Airbnb-Ratings", ["Machine Learning", "Deep Learning", "Python", "scikit-learn", "xgboost"]);
        let post5 = await createPost("Stock Trading Dashboard", zak._id, "Building out a trading dashboard to provide insights to users for informed stock trading and portfolio analysis.", "https://github.com/ZakariyyaScavotto/miniStockDash", ["javascript", "css", "Python", "sklearn", "streamlit" ]);
        // let post6 = await createPost("NYBG: Image Classifier", charli._id, "Partnering with the New York Botanical Garden. We're trying to construct an image classifier to detect good/bad data from their 1 billion image dataset for researchers around the world. You in? Join below!", "https://github.com/annahauk/NYBG", ["machine Learning", "Python", "tensorflow", "keras", "openAi", "OpenCV"]);
        let post6 = await createPost("Star Wars Lorebot", zak._id, "OMG are you are starwars lover like me???? Please PLEASE help me make a lorebot so I can geek out about the more important things in life! ;))))))", "https://github.com/ZakariyyaScavotto/StarWarsLorebot", ["javascript", "typescript", "angular", "node", "node.js", "OpenAPI"]);
        // Test updatePost

        try {
            // Create sample notifications
            // async function createNotif(ownerId, title, content, referencePost=null, referenceComment = null, origin)
            console.log('Creating sample notifications...');
            const notif1 = await createNotif(rishi._id, 'Friend Request', 'Chris has sent you a friend request.', null, null, 'friend_request');
            const notif3 = await createNotif(rishi._id, 'Achievement Unlocked', 'You have unlocked the "Top Contributor" badge.', null, null, 'achievement');

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
            const comment1 = await createComment('WOAH zak! This is supa cool!', post1._id, rishi._id);
            const comment2 = await createComment('Happy pride 🏳️‍🌈!', post1._id, chris._id);
            const comment3 = await createComment('I wanna help you with your project! Sending freind request now!', post3._id, zak._id);
            let comment4 = await createComment("You're such a nerd zak LOL. Someone should do this with him >.<", post6._id, chris._id );
            // let comment5 = await createComment("Interesting proj. You might wanna use a YOLO model for image class or a pretrained CNN like ImageNet", post6._id, zak._id);

        } catch (error) {
            console.error('Error during comment testing:', error);
        }
    } catch (error) {
        console.error('Error during seeding or testing:', error);
    } finally {
        console.log('Closing database connection...');
        await closeConnection();
    }

}


main();
