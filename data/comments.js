//Export the following functions using ES6 Syntax
import { projectPosts } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

import {} from "./posts.js";
// helper imports
import { stringVal, idVal } from "../helpers.js";

/*
Comment Schema:
_id: ObjectId,
ownerId: ObjectId,       Reference to the user who created the post
postId: ObjectId,        Reference to the post this comment belongs to
content: String,
comments: Array<string>, List of comments associated with the post if applicable
likes: Number 
*/

/**
 * Creates a comment
 * @param {string} content
 * @param {string} postId
 * @param {string} ownerId
 * Should this return anything?
 * The max a comment can be is length 100 and the min is 1.
 */
async function createComment(content, postId, ownerId) {
	// TODO: Implement this function
	//Should this also take in a postId?
	exists(content);
	stringVal(content);
	content = content.trim();
	validLength(content, 1, 100);

	exists(postId);
	stringVal(postId);

	exists(ownerId);
	stringVal(ownerId);

	const postIdObj = new Object(postId);

	let newComment = {
		_id: new ObjectId(),
		ownerId: new ObjectId(ownerId),
		postId: postIdObj,
		content: content,
		comments: [],
		likes: 0
	};

	const postCollection = await projectPosts();
	const post = await postCollection.findOneAndUpdate(
		{ _id: postIdObj },
		{ $push: { comments: newComment } }
	);
	if (post === null) throw `No post with that id: ${postId}`;
	return;
}

// dunno if we'll need this
async function getAllComments() {
	// TODO: Implement this function
}

/**
 * Returns a comment given the id
 * @param {string} commentId
 * @returns comment Object correlated with commentId
 */
async function getCommentById(commentId) {
	// TODO: Implement this function
	idVal(commentId);
	const postCollection = await projectPosts();
	const foundComment = await postCollection.findOne(
		{ "comments._id": new Object(commentId) },
		{ projection: { _id: 0, "comments.$": 1 } }
	);
	//Returns the matched comment instead of the whole post.
	if (!foundComment) throw `No comment with that id: ${commentId}`;
	//found comment is the form:
	// {
	// comments: [{_id: ..., ..., ...}]
	// }
	return foundComment.comments[0];
}
/**
 * Returns a comment given the id
 * @param {string} commentId
 */
async function removeComment(commentId) {
	// TODO: Implement this function
	idVal(commentId);
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
	const foundPostRtrn = await postCollection.findOne({ _id: foundPost._id });
	return foundPostRtrn;
}

async function updateComment() {
	// TODO: Implement this function
}

async function addComment() {
	// TODO: Implement this function
}

export {
	createComment,
	getAllComments,
	getCommentById,
	removeComment,
	updateComment,
	addComment
};
