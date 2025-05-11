import { projectPosts } from "../config/mongoCollections.js"; // imported to reference that collection
import { ObjectId } from "mongodb";

// helper imports
import {
	stringVal,
	arrayVal,
	idVal,
	validatePassword,
	validateUserID
} from "../helpers.js";

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
 * @param {ObjectId} ownerId
 * @param {Array<String>} topic_tags
 * @returns {object} post object
 *
 */
async function createPost(title, ownerId, content, repoLink, topic_tags) {
	// INPUT VALIDATION
	title = stringVal(title, "title", "createPost");
	content = stringVal(content, "content", "createPost");
	repoLink = stringVal(repoLink, "repoLink", "createPost");
	ownerId = idVal(ownerId, "ownerId", "createPost");
	topic_tags = arrayVal(topic_tags, "topic_tags", "createPost");

	const postCollection = await projectPosts();
	let createdTime = new Date().toLocaleTimeString();

	// Create new post object
	let newPost = {
		_id: new ObjectId(),
		title: title,
		ownerId: ownerId,
		content: content,
		repoLink: repoLink,
		comments: [],
		createdAt: createdTime,
		likes: 0,
		topic_tags: topic_tags
	};

	const insertInfo = await postCollection.insertOne(newPost);
	if (!insertInfo.acknowledged) throw `Could not add post`;
	// return post object
	const newId = insertInfo.insertedId.toString();
	const post = await getPostById(newId);
	return post;
}

/**
 * This function retrieves all posts from the database
 * @returns {Array<Post>} posts, or empty list if no posts are found
 * */
async function getAllPosts() {
	const postCollection = await projectPosts();
	let posts = await postCollection.find({}).toArray();
	if (!posts) return [];
	posts = posts.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return posts;
}

/**
 * This function retrieves a post by its ID
 * @param {string} postId
 * @returns {Object} post
 * @throws {Error} if post is not found
 * */
async function getPostById(postId) {
	postId = idVal(postId, "postId", "getPostById");
	const postCollection = await projectPosts();
	const post = await postCollection.findOne({ _id: new ObjectId(postId) });
	if (!post) throw `No post with that id: ${postId}`;
	post._id = post._id.toString();
	return post;
}

/**
 * This function retrieves all posts created by a specific user
 * @param {string} ownerId - The ID of the user whose posts are to be retrieved
 * @returns {Array<Post>} posts - An array of posts created by the user
 * @throws {Error} if no posts are found for the user
 */
async function getPostsByUserId(ownerId) {
	ownerId = idVal(ownerId, "ownerId", "getPostsByUserId");
	const postCollection = await projectPosts();
	let posts = await postCollection
		.find({ ownerId: new ObjectId(ownerId) })
		.toArray();
	if (!posts || posts.length === 0)
		throw `No posts found for user with id: ${ownerId}`;
	posts = posts.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return posts;
}

/**
 * This function removes a post by its ID
 * @param {string} postId
 * @returns {ObjectId} postId
 * @throws {Error} if post is not found
 * */
async function removePost(postId) {
	postId = idVal(postId, "postId", "removePost");
	const postCollection = await projectPosts();
	const deletionInfo = await postCollection.deleteOne({
		_id: new ObjectId(postId)
	});
	if (deletionInfo.deletedCount === 0)
		throw `Could not delete post with id of ${postId}`;
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
	postId = idVal(postId, "postId", "updatePost");
	const postCollection = await projectPosts();
	const updateInfo = await postCollection.updateOne(
		{ _id: new ObjectId(postId) },
		{ $set: updateData }
	);
	if (updateInfo.modifiedCount === 0)
		throw `Could not update post with id of ${postId}`;
	return postId;
}

/**
 * This queries the database for the filtered posts by tags when a user selects from the menu in the frontend
 * @param {Array<String>} tags
 * @returns {Array<Post>} posts
 */
async function grabfilteredPosts(tags) {
	// Validate tags array, then get the posts collection
	tags = arrayVal(tags, "tags", "grabfilteredPosts");
	const postCollection = await projectPosts();
	// Create case-insensitive regex for each tag, using i flag for case-insensitive (casing doesn't matter)
	const regexTags = tags.map((tag) => new RegExp(`^${tag}$`, "i"));
	// Filter the project posts based on the topic tags
	let posts = await postCollection
		.find({ topic_tags: { $in: regexTags } })
		.toArray();
	// Found no posts, that's a problem
	if (!posts || posts.length === 0) throw `No posts with that tag`;
	posts = posts.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return posts;
}

export {
	createPost,
	getAllPosts,
	getPostById,
	removePost,
	updatePost,
	grabfilteredPosts,
	getPostsByUserId
};
