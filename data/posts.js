import {users} from '../config/mongoCollections.js'; // imported to reference that collection
import {ObjectId} from 'mongodb';

// helper imports
import {stringVal, arrayVal} from '../helpers.js';
import e from 'express';
// Do not forget, for any input that is a string (even if that string is in an array, or as a value of a property in an object), you must TRIM all string input using the trim function for ALL functions!

/*
Post Schema:

_id: ObjectId,
title: String,
ownerId: ObjectId,           Reference to the user who created the post
content: String, 
repoLink: String,            URL to the related GitHub repository
comments: Array<CommentIDs>, Comment ids associated with the post
createdAt: String,
likes: Number,
topic_tags: Array<String> 
*/

await function createPost() {
  // TODO: Implement this function
}

await function getAllPosts() {
  // TODO: Implement this function
}

await function getPostById() {
  // TODO: Implement this function
}

await function removePost(){
  // TODO: Implement this function
}

await function updatePost(){
  // TODO: Implement this function
};

export { createPost, 
         getAllPosts, 
         getPostById, 
         removePost, 
         updatePost
        };
