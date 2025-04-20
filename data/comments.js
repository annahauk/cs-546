//Export the following functions using ES6 Syntax
import {projectPosts} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb';

import {} from './posts.js'; 
// helper imports
import {stringVal} from '../helpers.js'

/*
Comment Schema:
_id: ObjectId,
ownerId: ObjectId,       Reference to the user who created the post
postId: ObjectId,        Reference to the post this comment belongs to
content: String,
comments: Array<string>, List of comments associated with the post if applicable
likes: Number 
*/

async function createComment() {
  // TODO: Implement this function
}

// dunno if we'll need this
async function getAllComments() {
  // TODO: Implement this function
}

async function getCommentById() {
  // TODO: Implement this function
}

async function removeComment() {
  // TODO: Implement this function
}

async function updateComment() {
  // TODO: Implement this function
}

async function addComment() {
  // TODO: Implement this function
};

export {
  createComment,
  getAllComments,
  getCommentById,
  removeComment,
  updateComment,
  addComment
};