import {projectPosts} from '../config/mongoCollections.js'; // imported to reference that collection
import {ObjectId} from 'mongodb';

// helper imports
import { stringVal, arrayVal, idVal, validatePassword, validateUserID} from '../helpers.js'

// Do not forget, for any input that is a string (even if that string is in an array, or as a value of a property in an object), you must TRIM all string input using the trim function for ALL functions!

/*
Post Schema:
{
_id: ObjectId,
title: String,
ownerId: ObjectId,           Reference to the user who created the post
content: String, 
repoLink: String,            URL to the related GitHub repository
comments: Array<CommentIDs>, Comment ids associated with the post
createdAt: String,
likes: Number,
topic_tags: Array<String> 
}
*/

/**
 * Creates a post
 * @param {string} title
 * @param {string} content
 * @param {string} repoLink
 * @param {string} ownerId
 * @param {Array<String>} comments
 * @param {Array<String>} topic_tags
 * @returns {ObjectId} postId
 *
 */ 
async function createPost(title, ownerId, content, repoLink, comments, topic_tags) {
  // INPUT VALIDATION
  title = stringVal(title, 'title', 'createPost');
  content = stringVal(content, 'content', 'createPost');
  repoLink = stringVal(repoLink, 'repoLink', 'createPost');
  ownerId = stringVal(ownerId, 'ownerId', 'createPost');
  comments = arrayVal(comments, 'comments', 'createPost');
  topic_tags = arrayVal(topic_tags, 'topic_tags', 'createPost');

  const postCollection = await projectPosts();
  let createdTime = new Date().toLocaleTimeString();
  let likes = 0;
  // Create new post object
  let newPost = {
    "_id": new ObjectId(),
    "title": title,
    "ownerId": new ObjectId(ownerId),
    "content": content,
    "repoLink": repoLink,
    "comments": comments,
    "createdAt": createdTime,
    "likes": likes,
    "topic_tags": topic_tags
  }

  const insertInfo = await postCollection.insertOne(newPost);
  if (!insertInfo.acknowledged) throw `Could not add post`;
  return insertInfo.insertedId;
}

/**
 * This function retrieves all posts from the database
 * @returns {Array<Post>} posts
 * @throws {Error} if no posts are found
 * */
async function getAllPosts() {
  const postCollection = await projectPosts();
  const posts = await postCollection.find({}).toArray();
  if (!posts) throw `No posts found`;
  return posts;
}

/**
 * This function retrieves a post by its ID
 * @param {string} postId
 * @returns {Post} post
 * @throws {Error} if post is not found
 * */
async function getPostById(postId) {
  postId = stringVal(postId, 'postId', 'getPostById');
  const postCollection = await projectPosts();
  const post = await postCollection.findOne({_id: new ObjectId(postId)});
  if (!post) throw `No post with that id: ${postId}`;
  return post;
}

/**
 * This function retrieves all posts created by a specific user
 * @param {string} ownerId - The ID of the user whose posts are to be retrieved
 * @returns {Array<Post>} posts - An array of posts created by the user
 * @throws {Error} if no posts are found for the user
 */
async function getPostsByUserId(ownerId) {
  ownerId = stringVal(ownerId, 'ownerId', 'getPostsByUserId');
  const postCollection = await projectPosts();
  const posts = await postCollection.find({ ownerId: new ObjectId(ownerId) }).toArray();
  if (!posts || posts.length === 0) throw `No posts found for user with id: ${ownerId}`;
  return posts;
}

/**
 * This function removes a post by its ID
 * @param {string} postId
 * @returns {ObjectId} postId
 * @throws {Error} if post is not found
 * */
async function removePost(postId){
  postId = stringVal(postId, 'postId', 'removePost');
  const postCollection = await projectPosts();
  const deletionInfo = await postCollection.deleteOne({_id: new ObjectId(postId)});
  if (deletionInfo.deletedCount === 0) throw `Could not delete post with id of ${postId}`;
  return postId;
}

/**
 * This function updates a post by its ID
 * @param {string} postId
 * @param {Object} updateData
 * @returns {ObjectId} postId
 * @throws {Error} if post is not found
 */

// IDK if we wanna do an dict of field:update but yeah???
async function updatePost(postId, updateData) {
  postId = stringVal(postId, 'postId', 'updatePost');
  const postCollection = await projectPosts();
  const updateInfo = await postCollection.updateOne(
    {_id: new ObjectId(postId)},
    {$set: updateData}
  );
  if (updateInfo.modifiedCount === 0) throw `Could not update post with id of ${postId}`;
  return postId;
};


/**
 * This queries the database for the filtered posts by tags when a user selects from the menu in the frontend
 * @param {Array<String>} tags
 * @returns {Array<Post>} posts
 */
async function grabfilteredPosts(tags){
  tags = arrayVal(tags, 'tags', 'grabfilteredPosts');
  const postCollection = await projectPosts();
  const posts = await postCollection.find({topic_tags: {$in: tags}}).toArray();
  if (!posts) throw `No posts with that tag`;
  return posts;
}

export { createPost, 
         getAllPosts, 
         getPostById, 
         removePost, 
         updatePost,
        grabfilteredPosts, 
        getPostsByUserId
        };
