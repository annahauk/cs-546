//Export the following functions using ES6 Syntax
import { projectPosts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import { getPostById } from "./posts.js";
import { getUserById } from "./users.js";
// helper imports
import { stringVal, idVal } from "../helpers.js";

/*
Comment Schema:
_id: ObjectId,
ownerId: ObjectId,       Reference to the user who created the post
postId: ObjectId,        Reference to the post this comment belongs to
content: String,
likes: Number 
*/

/**
 * Creates a comment
 * @param {string} content
 * @param {string} postId
 * @param {string} ownerId
 * @returns post object
 */
async function createComment(content, postId, ownerId) {
	content = stringVal(content, "content", "createComment");
	postId = idVal(postId, "postId", "createComment");
	ownerId = idVal(ownerId, "ownerId", "createComment");
	if (content.length < 1 || content.length > 100)
		throw `Comment must be between 1 and 100 characters`;

	const postIdObj = new ObjectId(postId);

	// Get the author username
	let user = await getUserById(ownerId);

	let newComment = {
		_id: new ObjectId(),
		ownerId: new ObjectId(ownerId),
		author: user.user_name,
		postId: postIdObj,
		content: content,
		comments: [],
		likes: 0
	};

	const postCollection = await projectPosts();
	let post = await postCollection.findOneAndUpdate(
		{ _id: postIdObj },
		{ $push: { comments: newComment } }
	);
	if (post === null) throw `No post with id ${postId}`;
	post = await getPostById(post._id.toString());
	return post;
}

/**
 * Returns all comments for a given post id
 * @param {string} postId
 * @returns Array<CommentIds>
 */
async function getAllCommentsByPostId(postId) {
	postId = idVal(postId, "postId", "getAllCommentsByPostId");
	const postCollection = await projectPosts();
	const post = await postCollection.findOne({ _id: new ObjectId(postId) });
	if (post === null) throw `No post with id ${postId}`;
	let comments = post.comments;
	comments = comments.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return comments;
}

/**
 * Returns all comment IDs for a given user ID
 * @param {string} userId 
 * @returns Array<CommentIds>
 */
async function getAllCommentsByUserId(userId) {
	userId = idVal(userId, "userId", "getAllCommentsByUserId");
	const postCollection = await projectPosts();
	// All posts with comments
	const posts = await postCollection.find(
		{ comments: { $exists: true, $ne: [] } }
	).toArray();
	if (!posts || posts.length === 0) return [];
	// Only belonging to userId
	let comments = posts.flatMap(post => post.comments);
	comments.filter(c => c.ownerId.toString() === userId);
	return comments;
}

/**
 * Returns a comment given the id
 * @param {string} commentId
 * @returns comment Object correlated with commentId
 */
async function getCommentById(commentId) {
	commentId = idVal(commentId, "commentId", "getCommentById");
	const postCollection = await projectPosts();
	const foundComment = await postCollection.findOne(
		{ "comments._id": new ObjectId(commentId) },
		{ projection: { _id: 0, "comments.$": 1 } }
	);
	//Returns the matched comment instead of the whole post.
	if (!foundComment) throw `No comment with that id: ${commentId}`;
	//found comment is the form:
	// {
	// comments: [{_id: ..., ..., ...}]
	// }
	foundComment = foundComment.comments[0];
	foundComment._id = foundComment._id.toString();
	return foundComment;
}

/**
 * Returns a comment given the id
 * @param {string} commentId
 * @return The updated post of the given commentId without the comment
 */
async function removeComment(commentId) {
	commentId = idVal(commentId, "commentId", "removeComment");
	const commentIdObj = new ObjectId(commentId);
	const postCollection = await projectPosts();
	const foundPost = await postCollection.findOne({
		"comments._id": commentIdObj
	});
	if (!foundPost) throw `No post found with that comment id: ${commentId}`;
	const updateInfo = await postCollection.updateOne(
		{ _id: foundPost._id },
		{ $pull: { comments: { commentIdObj } } }
	);
	const foundPostRtrn = await getPostById(foundPost._id.toString());
	return foundPostRtrn;
}

/**
 * This function updates a comment by its ID
 * @param {string} commentId
 * @param {Object} updateData
 * @returns {ObjectId} commenttId
 * @throws {Error} if post or comment is not found
 */

async function updateComment(commentId, updateData) {
	commentId = idVal(commentId, "commentId", "updateComment");
	const postCollection = await projectPosts();
	const updateInfo = await postCollection.updateOne(
		{ "comments._id": new ObjectId(commentId) },
		{ $set: updateData }
	);
	if (updateInfo.modifiedCount === 0)
		throw `Could not update comment with id of ${commentId}`;
	return commentId;
}

export {
	createComment,
	getAllCommentsByPostId,
	getCommentById,
	removeComment,
	updateComment,
	getAllCommentsByUserId
};
