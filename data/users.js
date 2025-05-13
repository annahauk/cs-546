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
async function addFriend(id, friendId) {
	id = idVal(id, "id", "addFriend");
	friendId = idVal(friendId, "friendId", "addFriend");

	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(id) });
	if (user === null) {
		throw "No user with that id";
	}
	// check if the friend is already in the user's friends list
	if (user.friends.includes(friendId)) {
		throw "User is already a friend";
	}
	// add the friend to the user's friends list
	const updatedUser = {
		$push: { friends: new ObjectId(friendId) }
	};
	const updateInfo = await userCollection.updateOne(
		{ _id: new ObjectId(id) },
		updatedUser
	);
	if (updateInfo.modifiedCount === 0)
		throw `Could not add friend with id of ${friendId}`;
	await addAchievement(id, "friends", updatedUser.friends.length);

	return await getUserById(id);
}

/**
 * This function removes a friend from a user's friends list
 * @param {string} id
 * @param {string} friendIdToRemove
 * @returns {ObjectId} userId
 */
async function removeFriend(id, friendIdToRemove) {
	id = idVal(id, "id", "removeFriend");
	friendIdToRemove = idVal(
		friendIdToRemove,
		"friendIdToRemove",
		"removeFriend"
	);

	const userCollection = await users();
	const user = await userCollection.findOne({ _id: new ObjectId(id) });
	if (user === null) {
		throw new Error("No user with that id");
	}
	// check if the friend is in the user's friends list
	let toRemoveInFriends = false;
	// if (!user.friends.includes(friendIdToRemove)){
	//   throw 'User is not a friend';
	// }
	for (const friend of user.friends) {
		if (friend.toString() === friendIdToRemove.toString()) {
			toRemoveInFriends = true;
			break;
		}
	}
	if (!toRemoveInFriends) {
		throw new Error("User is not a friend");
	}
	// remove the friend from the user's friends list
	const updatedUser = {
		$pull: { friends: new ObjectId(friendIdToRemove) }
	};
	const updateInfo = await userCollection.updateOne(
		{ _id: new ObjectId(id) },
		updatedUser
	);
	if (updateInfo.modifiedCount === 0)
		throw `Could not remove friend with id of ${friendIdToRemove}`;

	return await getUserById(id);
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
				if (friend.toString() === removalId) {
					toRemoveInFriends = true;
					break;
				}
			}
			if (!toRemoveInFriends) {
				throw new Error("User is not a friend");
			}
			// remove the friend from the user's friends list
			const updatedUser = {
				$pull: { friends: new ObjectId(removalId) }
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
			await updateUser(id, { achievements: user.achievements.push(achievement.name) });
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
					friend.toString(),
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
	pendingNotifs
};
