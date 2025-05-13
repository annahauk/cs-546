import { projectPosts } from "../config/mongoCollections.js"; // imported to reference that collection
import { ObjectId } from "mongodb";

// helper imports
import {
	stringVal,
	arrayVal,
	idVal,
	numberVal,
	validatePassword,
	validateUserID,
	TERMS_AND_DOMAINS,
	validObjectId
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
comments: Array<Comments>	 Comments associated with the post
createdAt: String,
likes: Array<String>,		 STRING of user IDs
topic_tags: Array<String> 
members: Array<ObjectId>,    User IDs of members in the project
applications: Array<Applications>
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
	let createdTime = new Date().toLocaleString();

	// Create new post object
	let newPost = {
		_id: new ObjectId(),
		title: title,
		ownerId: ownerId,
		content: content,
		repoLink: repoLink,
		comments: [],
		createdAt: createdTime,
		likes: [],
		topic_tags: topic_tags,
		members: [],
		applications: [],
		status: "active"
	};

	// Check and err if title or repoLink already exists
	let postExists = await postCollection.findOne({ title: title });
	if (postExists) {
		throw `Post with title ${title} already exists`;
	}
	postExists = await postCollection.findOne({ repoLink: repoLink });
	if (postExists) {
		throw `Post with repoLink ${repoLink} already exists`;
	}

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
 * @param {string} id - The ID of the user whose posts are to be retrieved
 * @returns {Array<Post>} posts - An array of posts created by the user
 * @throws {Error} if no posts are found for the user
 */
async function getPostsByUserId(id) {
	id = idVal(id, "ownerId", "getPostsByUserId");
	const postCollection = await projectPosts();
	let posts = await postCollection.find({ ownerId: id }).toArray();
	if (!posts || posts.length === 0)
		throw `No posts found for user with id: ${id}`;
	posts = posts.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return posts;
}

async function getAllMembersByPostID(postId) {
	postId = idVal(postId, "postId", "getAllMembersByPostID");
	const postCollection = await projectPosts();
	const post = await postCollection.findOne({ _id: new ObjectId(postId) });
	if (!post) throw `No post with that id: ${postId}`;
	return post.members;
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

	// Validate updateData fields
	if (updateData.title)
		updateData.title = stringVal(updateData.title, "title", "updatePost");
	if (updateData.content)
		updateData.content = stringVal(updateData.content, "content", "updatePost");
	if (updateData.repoLink)
		updateData.repoLink = stringVal(
			updateData.repoLink,
			"repoLink",
			"updatePost"
		);
	if (
		updateData.status &&
		!["active", "completed"].includes(updateData.status)
	) {
		throw `Invalid status value in updatePost.`;
	}
	if (updateData.topic_tags)
		updateData.topic_tags = arrayVal(
			updateData.topic_tags,
			"topic_tags",
			"updatePost"
		);

	const postCollection = await projectPosts();
	const updateInfo = await postCollection.updateOne(
		{ _id: new ObjectId(postId) },
		{ $set: updateData }
	);

	if (updateInfo.modifiedCount === 0) {
		throw `Could not update post with id of ${postId}`;
	}

	return postId;
}

/**
 * This queries the database for the filtered posts by tags when a user selects from the menu in the frontend
 * @param {Array<String>} tags
 * @param {String} name
 * @param {String} status
 * @returns {Array<Post>} posts
 */
async function grabfilteredPosts(tags, name, status) {
	// Validate tags array, allowing for empty tag array if user is only filtering by name
	if (!Array.isArray(tags)) {
		throw `Error in grabfilteredPosts: tags must be an array.`;
	}
	for (const item of tags) {
		if (typeof item !== "string" || item.trim().length === 0) {
			throw `Error in grabfilteredPosts: tags must contain only non-empty strings.`;
		}
	}
	// validate the name specifically just the type, since it can be empty if user doesn't care about project name
	if (typeof name !== "string") {
		throw `Error in grabfilteredPosts: name must be a string.`;
	}
	if (typeof status !== "string") {
		throw `Error in grabfilteredPosts: status must be a string, either 'active' or 'completed'.`;
	}
	const postCollection = await projectPosts();
	// Create case-insensitive regex for each tag, using i flag for case-insensitive (casing doesn't matter)
	const regexTags = tags.map((tag) => new RegExp(`^${tag}$`, "i"));
	// Create case-insensitive regex for the name, partial matching
	const regexName = new RegExp(name, "i");
	// Create case-insensitive regex for the status,
	const regexStatus = new RegExp(status, "i");
	// Filter the project posts based on the topic tags
	let posts = null;
	if (tags.length !== 0) {
		posts = await postCollection
			.find({
				topic_tags: { $in: regexTags },
				title: regexName,
				status: regexStatus
			})
			.toArray();
	} else {
		if (name !== "") {
			posts = await postCollection
				.find({ title: regexName, status: regexStatus })
				.toArray();
		} else {
			posts = await postCollection.find({ status: regexStatus }).toArray();
		}
	}
	// Found no posts, that's a problem
	if (!posts || posts.length === 0) throw `No posts with that tag`;
	posts = posts.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return posts;
}

/**
 * Check if user is member of project
 * @param {Post} post
 * @param {ObjectId} member_id
 * @returns {Promise<boolean>}
 */
async function post_has_member(post, member_id) {
	if(typeof post["members"] === "undefined") {
		return false;
	}

	let post_members = post.members.map((m) => {
		return m.toString();
	});
	return (
		post_members.includes(member_id.toString()) ||
		post.ownerId === member_id.toString()
	);
}

/**
 * Create application for project
 * @param {Post} post
 * @param {User} user
 * @param {string?} _additional_text
 * @returns {Promise<Application>}
 */
async function create_project_application(post, user, _additional_text) {
	let postsc = await projectPosts();
	let application = {
		_id: new ObjectId(),
		applicant: user.user_name,
		applicant_id: user._id,
		message: _additional_text ? _additional_text : "No additional message."
	};

	let res = await postsc.updateOne(
		{ _id: new ObjectId(post._id) },
		{ $push: { applications: application } }
	);
	if (!res.acknowledged) {
		throw new Error(`Failed to create post application`);
	}

	return application;
}

/**
 * Remove application from project applications
 * @param {Post} post
 * @param {Application} application
 * @param {boolean} approved
 * @returns {Promise<Application}
 */
async function remove_project_applicaiton(project, application, approved) {
	let postsc = await projectPosts();
	let res = await postsc.updateOne(
		{ _id: new ObjectId(project._id) },
		{ $pull: { applications: { _id: application._id } } }
	);
	if (!res.acknowledged) {
		throw new Error(`Failed to remove application`);
	}

	return application;
}

/**
 *
 * @param {Post} post
 * @param {string} app_id
 * @returns {Promise<null|Application>}
 */
async function get_project_application(post, app_id) {
	let applications = await post.applications.filter((app) => {
		return app._id.toString() === app_id;
	});

	if (applications.length < 1) {
		return null;
	}

	return applications[0];
}

/**
 *
 * @param {Post} post
 * @param {ObjectId} member_id
 * @returns {Promise<Post>}
 */
async function add_project_member(post, member_id) {
	validObjectId(member_id);

	let postsc = await projectPosts();
	let res = await postsc.updateOne(
		{ _id: new ObjectId(post._id) },
		{ $push: { members: member_id } }
	);
	if (!res.acknowledged) {
		throw new Error(`Failed to add member to project`);
	}

	let newpost = await postsc.findOne({ _id: new ObjectId(post._id) });
	if (!newpost) {
		throw new Error(`Could not retrieve modified post`);
	}

	//console.log(`[NOTIF]: Your application to ${post.title} has been accepted! ==> ${member_id.toString()}`);
	return newpost;
}

/**
 *
 * @param {Post} post
 * @param {ObjectId} member_id
 * @returns {Promise<Post>}
 */
async function remove_project_member(post, member_id) {
	validObjectId(member_id);

	let postsc = await projectPosts();
	let res = await postsc.updateOne(
		{ _id: new ObjectId(post._id) },
		{ $pull: { members: member_id } }
	);
	if (!res.acknowledged) {
		throw new Error(`Failed to remove member from project`);
	}

	let newpost = await postsc.findOne({ _id: new ObjectId(post._id) });
	if (!newpost) {
		throw new Error(`Could not retrieve modified post`);
	}

	return newpost;
}

/**
 * Gets the number of entries in the projects collection
 * @returns {number} The total number of projects in the collection
 */
async function getProjectCount(calibration = "all") {
	if (!calibration) {
		throw new Error("Calibration value is required");
	}
	const postCollection = await projectPosts();
	if (calibration === "all") {
		return (await postCollection.countDocuments());
	} else if (calibration === "active") {
		return (await postCollection.countDocuments(
			{ status: "active" }
		));
	} else if (calibration === "completed") {
		return (await postCollection.countDocuments(
			{ status: "completed" }
		));
	}
	throw new Error(`Invalid calibration value ${calibration}`);
}

/**
 * Gets the top n tags across all posts
 * @param {number} n number of tags to return
 * @returns {Array<String>} Array<string> of top n tags
 */
async function getTopPostTags(n = 3) {
	n = numberVal(n, "n", "getTopPostTags");
	const posts = await getAllPosts();
	const tagCount = {};
	for (let post of posts) {
		for (let tag of post.topic_tags) {
			if (tagCount[tag]) tagCount[tag]++;
			else tagCount[tag] = 1;
		}
	}
	const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
	const topTags = sortedTags.slice(0, n);
	return topTags;
}

async function getOldestActivePost() {
	const postCollection = await projectPosts();
	const oldestPost = await postCollection
		.find({status: "active"})
		.sort({ createdAt: 1 })
		.limit(1)
		.toArray();
	if (oldestPost.length === 0) {
		throw new Error("No posts found");
	}
	return oldestPost[0];
}

async function getNewestActivePost() {
	const postCollection = await projectPosts();
	const newestPost = await postCollection
		.find({status: "active"})
		.sort({ createdAt: -1 })
		.limit(1)
		.toArray();
	if (newestPost.length === 0) {
		throw new Error("No posts found");
	}
	return newestPost[0];
}

/**
 * This function does the like/remove like action.
 * @param {string} postId
 * @param {string} userId
 * @returns {Promise<Post>} postId
 * @throws {Error} if post is not found
 */
async function doPostLikeAction(postId, userId) {
	postId = idVal(postId, "postId", "doPostLikeAction");
	userId = idVal(userId, "userId", "doPostLikeAction");

	const postCollection = await projectPosts();
	const post = await postCollection.findOne({ _id: new ObjectId(postId) });

	if (!post) {
		throw new Error(`Post with ID ${postId} not found`);
	}

	const userIndex = post.likes.indexOf(userId);

	if (userIndex === -1) {
		// User has not liked the post, add their ID
		post.likes.push(userId);
	} else {
		// User has already liked the post, remove their ID
		post.likes.splice(userIndex, 1);
	}

	const updateInfo = await postCollection.updateOne(
		{ _id: new ObjectId(postId) },
		{ $set: { likes: post.likes } }
	);

	if (!updateInfo.modifiedCount) {
		throw new Error(`Failed to update likes for post with ID ${postId}`);
	}

	return post;
}

export {
	createPost,
	getAllPosts,
	getPostById,
	removePost,
	updatePost,
	grabfilteredPosts,
	getPostsByUserId,
	post_has_member,
	create_project_application,
	get_project_application,
	remove_project_applicaiton,
	add_project_member,
	remove_project_member,
	getProjectCount,
	getTopPostTags,
	doPostLikeAction,
	getOldestActivePost,
	getNewestActivePost
};
