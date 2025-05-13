import { users } from "../config/mongoCollections.js"; // imported to reference that collection
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

// helper imports
import {
	stringVal,
	arrayVal,
	idVal,
	validatePassword,
	validateUserID,
	validObjectId,
	numberVal,
	getAchievementByName,
	ACHIEVEMENTS
} from "../helpers.js";
import { create_auth } from "../src/lib/auth.js";
import { createNotif } from "./notifications.js";

/*
schema
{
    _id: ObjectId, 
    user_name: string,          Required, unique (case sensitive???)
    password: string,           Required, Hashed password
    Auth: ObjectId,             Reference to the Auth collection, generated  when user is created
    github_profile: string,     URL to the user's GitHub profile, generated when user is created --> where is this link coming from????
    skill_tags: Array<string>,  List of skills, e.g., ["Web Dev", "JavaScript"]
    friends: Array<ObjectId>,   References to other user documents in the collection
    achievements: Array<String>, 
    notifications: Array<String> Notification subdocument
}
*/

/**
 * Creates a new user
 * @param {string} userName
 * @param {string} gh_info
 * @param {Array<string>} skillTags
 * @param {Array<ObjectId>} friends
 * @param {Array<string>} achievements
 * @param {Array<ObjectId>} notifications
 * @param {(null|ObjectId)} Auth
 * @returns {ObjectId} userId
 * @throws Will throw an error if userName not unique
 * @throws Will throw an error if user creation fails
 *
 */
async function createUser(userName, password) {
	// INPUT VALIDATION

	userName = validateUserID(userName, "userName", "createUser");
	userName = userName.trim().toLowerCase();
	password = validatePassword(password, "password", "createUser");
	let skillTags = [];
	let friends = [];
	let achievements = [];
	let notifications = [];

	// check if userName are unique and not an existing user
	let existingUser = await getUserByUsername(userName);
	if (existingUser) {
		throw `User with username ${userName} already exists`;
	}

	// hash the password
	// HASHED IN AUTH
	// const saltRounds = 10;
	// const hashedPassword = await bcrypt.hash(password, saltRounds);
	// create new user
	let newUser = {
		user_name: userName,
		Auth: null,
		gh_info: null,
		skill_tags: skillTags,
		friends: friends,
		friendRequests: [],
		achievements: achievements,
		notifications: notifications
	};

	// time to input into DB
	const userCollection = await users();
	const insertInfo = await userCollection.insertOne(newUser);

	if (!insertInfo.acknowledged || !insertInfo.insertedId) {
		throw "Could not add user to database";
	}

	/**
	 * create authentication for user via authId
	 * upsert into newly created user
	 */
	// throws on failure, so valid object id will be returned
	const authId = await create_auth(insertInfo.insertedId, password);

	// update the user's document
	const update = await userCollection.updateOne(
		{ _id: insertInfo.insertedId },
		{
			$set: { Auth: authId }
		}
	);
	if (!update.acknowledged) {
		throw new Error(`Failed to insert Auth to user document.`);
	}

	// returns the user object
	const newId = insertInfo.insertedId.toString();
	const user = await getUserById(newId);

	// give user initial "welcome" notification
	try {
		await createNotif(
			user._id.toString(),
			"Welcome to GitMatches!",
			"yay :3",
			undefined,
			undefined,
			"GitMatches"
		);
	} catch (e) {
		throw new Error(`Failed to create initial comment ${e}`);
	}

	return user;
}

async function getAllUsers() {
	const userCollection = await users();
	let userList = await userCollection.find({}).toArray(); // {} parameters to find but we're looking for all
	if (!userList) {
		throw "Could not get all users";
	}
	userList = userList.map((element) => {
		element._id = element._id.toString();
		return element;
	});
	return userList;
}

/**
 * grab an indivdual user's tags from the database
 * @param {string} id
 * @returns {Array<string>} skill_tags
 */
async function getUserTags(id) {
	id = idVal(id, "id", "getUserTags");
	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(id) });
	if (user === null) {
		throw "No user with that id";
	}
	// have to convert back to string, servers will do this for us in the future
	user._id = user._id.toString();
	return user.skill_tags;
}

/**
 * update the user's skill tags when they add from resume parser or on the user's edit page
 * @param {string} id
 * @param {Array<string>} skillTags
 * @returns {ObjectId} userId
 *
 * @throws Will throw an error if userId is not found
 */
async function updateUserTags(id, skillTags) {
	id = idVal(id, "id", "updateUserTags");
	skillTags = arrayVal(skillTags);
	let currSkills = await getUserTags(id);
	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(id) });
	if (user === null) {
		throw "No user with that id";
	}
	// add the new skills to the current skills and remove duplicates
	let newSkills = [...currSkills, ...skillTags];
	// remove duplicates
	const uniqueTags = [...new Set(newSkills)];
	// update the user in the database
	const updatedUser = {
		skill_tags: uniqueTags
	};

	const updateInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: updatedUser },
		{ returnDocument: "after" }
	);
	if (!updateInfo) {
		throw "could not update user successfully";
	}
	updateInfo._id = updateInfo._id.toString();
	return updateInfo;
}

/**
 * Replaces the user's skill tags with the provided tags.
 * @param {string} id - The ID of the user whose tags are to be updated.
 * @param {Array<string>} skillTags - The new set of skill tags to replace the user's current tags.
 * @returns {ObjectId} userId - The ID of the updated user.
 * @throws Will throw an error if the user ID is not found or if the update fails.
 */
async function setUserTags(id, skillTags) {
	id = idVal(id, "id", "setUserTags");
	skillTags = arrayVal(skillTags, "skillTags", "setUserTags");

	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(id) });
	if (user === null) {
		throw "No user with that id";
	}

	// Update the user's skill tags in the database
	const updatedUser = {
		skill_tags: skillTags.map((tag) => tag.trim()) // Ensure all tags are trimmed
	};

	const updateInfo = await userCollection.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: updatedUser },
		{ returnDocument: "after" }
	);

	if (!updateInfo) {
		throw "Could not update user successfully";
	}

	updateInfo._id = updateInfo._id.toString();
	return updateInfo;
}

async function getUserById(id) {
	id = idVal(id, "id", "getUserById");
	// get a reference to the collection
	const userCollection = await users();

	const user = await userCollection.findOne({ _id: new ObjectId(id) }); // new ObjectId(id) converts the string to ObjectId
	if (user === null) {
		throw `No user with id ${id}`;
	}
	// have to convert back to string, servers will do this for us in the future
	user._id = user._id.toString();
	return user;
}

/**
 *
 * @param {ObjectId} id
 * @returns {(Object|null)} user
 */
async function getUserById_ObjectId(id) {
	validObjectId(id);
	const usersc = await users();

	const user = await usersc.findOne({ _id: id });
	if (!user) {
		return null;
	} else {
		return user;
	}
}

/**
 * get user document by username.
 * return null if not found
 * @param {string} username
 */
async function getUserByUsername(username) {
	const usersc = await users();
	const user = await usersc.findOne({ user_name: username });
	if (!user) {
		return null;
	} else {
		return user;
	}
}

/**
 * This adds friends to a user's friends list
 * @param {string} id
 * @param {string} friendId
 * @returns {ObjectId} userId
 */
async function addFriend(u1id, u2id) {
	let u1 = await getUserById(u1id);
	let u2 = await getUserById(u2id);

	if(await user_has_friend_request(u1, u2)) {
		throw new Error(`User has pending friend request.`);
	}

	idVal(u1._id);
	idVal(u2._id);

	const usersc = await users();

	// add friend to user
	let friend_add = await usersc.updateOne({_id: new ObjectId(u1._id)}, {$push: {"friends": {
		_id: new ObjectId(),
		id: u2._id,
		name: u2.user_name
	}}});
	if(!friend_add.acknowledged) {
		throw new Error(`Failed to insert friend.`);
	}
	const updatedUserDoc = await usersc.findOne({_id: new ObjectId(u1._id)});
	await addAchievement(u1._id, "friends", updatedUserDoc.friends.length);

	// add friend to requester
	let requester_add = await usersc.updateOne({_id: new ObjectId(u2._id)}, {$push: {"friends": {
		_id: new ObjectId(),
		id: u1._id,
		name: u1.user_name
	}}});
	if(!requester_add.acknowledged) {
		throw new Error(`Failed to insert friend to requester.`);
	}
	const updatedRequesterDoc = await usersc.findOne({_id: new ObjectId(u2._id)});
	await addAchievement(u2._id, "friends", updatedRequesterDoc.friends.length);

	return await getUserById(u1._id);
}

/**
 * This function removes a friend from a user's friends list
 * @param {string} id
 * @param {string} friendIdToRemove
 * @returns {ObjectId} userId
 */
async function removeFriend(u1id, u2id) {
	let u1 = await getUserById(u1id);
	let u2 = await getUserById(u2id);

	const usersc = await users();

	// get friend object
	let ex;
	console.log(u1.friends, u2.friends);
	for(const friend of u1.friends) {
		if(friend.id === u2._id) {
			ex = friend; // </3
		}
	}
	if(!ex) {
		throw new Error(`Could not find friend.`);
	}

	// remove friend from user
	let remove_fr = await usersc.updateOne({_id: new ObjectId(u1._id)}, {$pull: {"friends": {"_id": ex._id}}});
	if(!remove_fr.acknowledged) {
		throw new Error(`Could not remove friend from user.`);
	}

	// remove user from ex's friends
	let remove_ex = await usersc.updateOne({_id: new ObjectId(ex.id)}, {$pull: {"friends": {"id": u1._id}}});
	if(!remove_ex.acknowledged) {
		throw new Error(`Failed to remove user from friend friends`);
	}

	return await getUserById(u1._id);
}
/**
 * This function removes a user by its ID and any friends
 * @param {ObjectId} id
 * @returns
 */
async function removeUser(removalId) {
	removalId = idVal(removalId, "id", "removeUser");
	let temp = removalId;

	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(removalId) });
	if (user === null) {
		throw new Error("No user with that id");
	}

	// iterate through the user's friends and remove them from their friends list
	const allUsers = await getAllUsers();
	for (let i = 0; i < allUsers.length; i++) {
		let currUser = allUsers[i];
		// console.log("Pre removal:")
		// console.log(currUser);
		// call removeFriend for each currUser, passing in the id of the user to be removed
		try {
			let toRemoveInFriends = false;
			for (const friend of currUser.friends) {
				if (friend.id === removalId) {
					toRemoveInFriends = true;
					break;
				}
			}
			if (!toRemoveInFriends) {
				throw new Error("User is not a friend");
			}
			// remove the friend from the user's friends list
			const updatedUser = {
				$pull: { friends: {"id": removalId} }
			};
			const updateInfo = await userCollection.updateOne(
				{ _id: new ObjectId(currUser._id.toString()) },
				updatedUser
			);
			if (updateInfo.modifiedCount === 0)
				throw `Could not remove friend with id of ${removalId}`;
		} catch (e) {
			console.log(`Error removing friend ${currUser._id}: ${e}`);
		}
		// console.log("Post removal:")
		// console.log(currUser);
	}
	// remove the user from the database
	const deletionInfo = await userCollection.deleteOne({
		_id: new ObjectId(removalId)
	});
	return `user with ${temp} has been successfully deleted!`;
}

/**
 * This function updates a user by its ID
 * for friends, achievements, skills, etc.
 * @param {string} id
 * @param {Object} updateData
 * @returns {ObjectId} userId
 * @throws {Error} if user is not found
 * @throws {Error} if update fails
 */
async function updateUser(id, updateData) {
	id = idVal(id, "id", "updateUser");
	const userCollection = await users();
	const updateInfo = await userCollection.updateOne(
		{ _id: new ObjectId(id) },
		{ $set: updateData }
	);
	if (updateInfo.modifiedCount === 0)
		throw `Could not update user with id of ${id}`;
	// return the updated user
	return await getUserById(id);
}

/**
 * Adds an achievement to a user's achievements list
 * @param {string} id ID of user to update
 * @param {string} category achievement category
 * @param {number} val number associated with the achievement
 * @returns id
 */
async function addAchievement(id, category, val) {
	id = idVal(id, "id", "addAchievement");
	category = stringVal(category, "category", "addAchievement");
	val = numberVal(val, "val", "addAchievement");
	const user = await getUserById(id);
	if (!user || !user.achievements) {
		throw new Error("User not found or does not have achievements.");
	}
	if (!ACHIEVEMENTS[category]) {
		throw new Error(`Invalid category: ${category}`);
	}

	for (let achievement of ACHIEVEMENTS[category]) {
		if (
			!user.achievements.includes(achievement.name) &&
			val >= achievement.value
		) {
			user.achievements.push(achievement.name);
			await updateUser(id, { achievements: user.achievements });
			await createNotif(
				id,
				`Achievement Unlocked: ${achievement.name}`,
				`${achievement.description}`,
				undefined,
				undefined,
				"GitMatches"
			);
			for (let friend of user.friends) {
				await createNotif(
					friend.id.toString(),
					`${user.user_name} unlocked an achievement: ${achievement.name}`,
					`${achievement.description}`,
					undefined,
					undefined,
					"GitMatches"
				);
			}
		}
	}

	return id;
}

/**
 * Returns the achievement objects for a user
 * @param {string} id user ID
 * @returns Array<Achievement object>
 */
async function getAllAchievements(id) {
	id = idVal(id, "id", "getAllAchievements");
	const user = await getUserById(id);
	if (!user || !user.achievements) {
		throw new Error("User not found or does not have achievements.");
	}
	let achievements = [];
	for (let achievement of user.achievements) {
		if (ACHIEVEMENTS[achievement]) {
			achievements.push(getAchievementByName(achievement));
		} else throw new Error(`Invalid achievement: ${achievement}`);
	}
	return achievements;
}

/**
 * Returns the achievement names for a user
 * @param {*} id used IF
 * @returns Array<string>
 */
async function getAllAchievementNames(id) {
	id = idVal(id, "id", "getAllAchievementNames");
	const user = await getUserById(id);
	if (!user || !user.achievements) {
		throw new Error("User not found or does not have achievements.");
	}
	let achievements = [];
	for (let achievement of user.achievements) {
		if (ACHIEVEMENTS[achievement]) {
			achievements.push(achievement);
		} else throw new Error(`Invalid achievement: ${achievement}`);
	}
	return achievements;
}

/**
 * Gets the number of entries in the users collection
 * @returns {number} The total number of users in the collection
 */
async function getUserCount() {
	const userCollection = await users();
	const count = await userCollection.countDocuments();
	return count;
}

/**
 * Gets the top n tags across all users
 * @param {number} n number of tags to return
 * @returns {Array<String>} Array<string> of top n tags
 */
async function getTopUserTags(n = 3) {
	n = numberVal(n, "n", "getTopUserTags");
	const users = await getAllUsers();
	const tagCount = {};
	for (let user of users) {
		for (let tag of user.skill_tags) {
			if (tagCount[tag]) tagCount[tag]++;
			else tagCount[tag] = 1;
		}
	}
	const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);
	const topTags = sortedTags.slice(0, n);
	return topTags
}

/**
 * Check if requester has a pending request in requestees friend requests
 * @param {User} requester 
 * @param {User} requestee 
 * @returns {boolean}
 */
async function user_has_friend_request(requester, requestee) {
	for(const req of requestee.friendRequests) {
		if(req.requester === requester._id) {
			return true;
		}
	}

	return false;
}

/**
 * 
 * @param {User} requester 
 * @param {User} requestee 
 * @returns {FriendRequest}
 */
async function create_friend_request(requester, requestee) {
	if(await user_has_friend_request(requester, requestee)) {
		throw new Error(`User has pending friend request.`);
	}

	idVal(requester._id);
	idVal(requestee._id);

	const usersc = await users();
	let request = {
		_id: new ObjectId(),
		name: requester.user_name,
		requester: requester._id
	};

	let upsert = await usersc.updateOne({_id: new ObjectId(requestee._id)}, {$push: {"friendRequests": request}});
	if(!upsert.acknowledged) {
		throw new Error(`Failed to create friend request`);
	}

	// create notification for requestee
	await createNotif(
		requestee._id,
		`${requester.user_name} wants to be your friend.`,
		"yay :3",
		null,
		null,
		"GitMatches System",
		true,
		false,
		requester._id,
		null,
		true,
		null,
		request._id.toString()
	);

	return request;
}

/**
 * return true if users are friends
 * @param {User} u1 
 * @param {User} u2
 * @returns {boolean} 
 */
async function users_are_friends(u1, u2) {
	let u1friendu2 = false;
	let u2friendu1 = false;

	idVal(u1._id);
	idVal(u2._id);

	for(const friend of u1.friends) {
		if(friend.id === u2._id) {
			u1friendu2 = true;
		}
	}

	for(const friend of u2.friends) {
		if(friend.id === u1._id) {
			u2friendu1 = true;
		}
	}

	return (u1friendu2 && u2friendu1);
}

/**
 * friend request approve action
 * @param {User} user 
 * @param {string} request_id 
 * @returns {void}
 */
async function approve_friend_request(user, request_id) {
	// add requestee to user friends and remove request
	// add user to requester friends
	// send requestee the acceptance notification
	idVal(user._id);
	idVal(request_id);

	let request;
	for(const req of user.friendRequests) {
		if(req._id.toString() === request_id) {
			request = req;
		}
	}
	if(!request) {
		throw new Error(`Friend request not found.`);
	}

	const usersc = await users();

	// add friend to user
	let friend_add = await usersc.updateOne({_id: new ObjectId(user._id)}, {$push: {"friends": {
		_id: new ObjectId(),
		id: request.requester,
		name: request.name
	}}});
	if(!friend_add.acknowledged) {
		throw new Error(`Failed to insert friend.`);
	}
	const updatedUserDoc = await usersc.findOne({_id: new ObjectId(user._id)});
	await addAchievement(user._id, "friends", updatedUserDoc.friends.length);

	// add friend to requester
	let requester_add = await usersc.updateOne({_id: new ObjectId(request.requester)}, {$push: {"friends": {
		_id: new ObjectId(),
		id: user._id,
		name: user.user_name
	}}});
	if(!requester_add.acknowledged) {
		throw new Error(`Failed to insert friend to requester.`);
	}
	const updatedRequesterDoc = await usersc.findOne({_id: new ObjectId(request.requester)});
	await addAchievement(request.requester, "friends", updatedRequesterDoc.friends.length);

	// remove friend request object from user
	let remove_request = await usersc.updateOne({_id: new ObjectId(user._id)}, {$pull: {"friendRequests": {"_id": new ObjectId(request_id)}}});
	if(!remove_request) {
		throw new Error(`Failed to remove friend request from user.`);
	}

	// send requester notification
	await createNotif(
		request.requester,
		`${user.user_name} has accepted your friend request!`,
		"yippeee ^w^",
		null,null,
		"GitMatches System",
		true,
		false,
		user._id,
		null,
		false,
		null,
		request_id
	);

	return;
}

/**
 * 
 * @param {User} user 
 * @param {User} request_id 
 * @returns {void}
 */
async function deny_friend_request(user, request_id) {
	// remove friend request document from user
	// send notif to requester
	idVal(user._id);
	idVal(request_id);

	let request;
	for(const req of user.friendRequests) {
		if(req._id.toString() === request_id) {
			request = req;
		}
	}
	if(!request) {
		throw new Error(`Friend request not found.`);
	}

	const usersc = await users();

	let remove_request = await usersc.updateOne({_id: new ObjectId(user._id)}, {$pull: {"friendRequests": new ObjectId(request_id)}});
	if(!remove_request.acknowledged) {
		throw new Error(`Failed to remove friend request from user.`);
	}

	// send notif to requester
	await createNotif(
		request.requester,
		`${user.user_name} denied your friend request :(`,
		"aw TwT",
		null,
		null,
		"GitMatches System",
		false,
		null,
		user._id,
		null,
		false,
		null,
		request_id
	);

	return;
}

/**
 * 
 * @param {User} user 
 * @param {string} friend_id 
 * @return {void}
 */
async function remove_friend(user, friend_id) {
	// remove friend from user friends
	// remove user from ex's friends
	// send notif to ex
	idVal(user._id);
	idVal(friend_id);

	const usersc = await users();

	// get friend object
	let ex;
	for(const friend of user.friends) {
		if(friend.id === friend_id) {
			ex = friend; // </3
		}
	}
	if(!ex) {
		throw new Error(`Could not find friend.`);
	}

	// remove friend from user
	let remove_fr = await usersc.updateOne({_id: new ObjectId(user._id)}, {$pull: {"friends": {"_id": ex._id}}});
	if(!remove_fr.acknowledged) {
		throw new Error(`Could not remove friend from user.`);
	}

	// remove user from ex's friends
	let remove_ex = await usersc.updateOne({_id: new ObjectId(ex.id)}, {$pull: {"friends": {"id": user._id}}});
	if(!remove_ex.acknowledged) {
		throw new Error(`Failed to remove user from friend friends`);
	}

	// send notif
	await createNotif(
		ex.id,
		`${user.user_name} broke up with you </3`,
		`Y'all aint friends no more. TwT`,
		null,
		null,
		"GitMatches System",
		false,
		false,
		user._id,
		null,
		false,
		null
	);
}

/**
 * 
 * @param {User} user 
 * @param {string} request_id 
 * @returns {(null|FriendRequest)}
 */
async function get_friend_request(user, request_id) {
	for(const req of user.friendRequests) {
		if(req._id.toString() === request_id) {
			return req;
		}
	}

	return null;
}
/**
 * Gets the number of pending notifications for a user and formats it as a string for navbar display
 * @param {string} userId user ID
 * @returns {string} The number of pending notifications, formatted as a navbar string
 * @throws if userId is not found
 */
async function pendingNotifs(userId) {
	userId = idVal(userId, "userId", "pendingNotifs");
	const user = await getUserById(userId);
	if (!user || !user.notifications) {
		throw new Error("User not found or does not have notifications.");
	}
	let pending = 0;
	for (let notif of user.notifications) {
		if (!notif.resolved) {
			pending++;
		}
	}

	if (pending ===0) {
		return "";
	} else if (pending > 9) {
		return " (9+)";
	}
	return ` (${pending})`;

}

export {
	createUser,
	getAllUsers,
	getUserById,
	getUserByUsername,
	removeUser,
	removeFriend,
	updateUser,
	updateUserTags,
	getUserTags,
	create_auth,
	addFriend,
	getUserById_ObjectId,
	addAchievement,
	getAllAchievements,
	getAllAchievementNames,
	getUserCount,
	getTopUserTags,
	setUserTags,
	users_are_friends,
	create_friend_request,
	approve_friend_request,
	deny_friend_request,
	remove_friend,
	user_has_friend_request,
	get_friend_request,
	pendingNotifs
};
