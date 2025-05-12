//Export the following functions using ES6 Syntax
import {users, projectPosts} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb';

import {createUser,getAllUsers, getUserById, getUserByUsername, removeUser, removeFriend, updateUser, updateUserTags, getUserTags, create_auth, addFriend, getUserById_ObjectId} from './users.js'; 
import {idVal, stringVal} from '../helpers.js'

/* Schema
{
  _id: ObjectId
  ownerId: ObjectId,         Reference to the user who owns this notification
  title: String,             The title of the notification
  content: String,
  resolved: Boolean,         Whether the notification has been resolved
  time: String,              The time the notification was created
  referencePost: ObjectId,   Reference to the related post, if applicable
  referenceComment: ObjectId Reference to the related comment, if applicable
  origin: String             The origin of the notification (e.g., "post", "comment", etc.)
  acceptedFriend: Boolean | null,        A boolean to accept or reject a friend request
  acceptedProject: Boolean | null        A boolean to accept or reject a project request
  senderId: ObjectId | null,        Reference to the user who sent the notification
  projectId: ObjectId | null,        Reference to the project for project requests
}

Notifs from:
- liking post
- commenting on post
- friend request
- project marking
- achievements
- project requests to join
*/

/**
 * This function creates a new notification for a user.
 * @param {string} ownerId 
 * @param {String} title
 * @param {string} content 
 * @param {string} referencePost 
 * @param {string} referenceComment 
 * @param {string} origin -- where the notification is coming from
 * @param {boolean} acceptedFriend -- whether the notification is accepting or rejecting a friend request
 * @param {boolean} acceptedProject -- whether the notification is for accepting or rejecting a project request
 * @param {string} senderId -- the user who sent the notification(used for friend requests)
 * @param {string} projectId -- the project id for project requests
 * @param {(null|boolean)} requiresApproval -- mark notification as an application (will show approve/deny buttons and a text field in notification)
 * @param {string} referenceApplication -- the referance application if requiresApproval is true
 * @returns 
 */

async function createNotif(ownerId, title, content, referencePost=null, referenceComment = null, origin, acceptedFriend = null, acceptedProject = null, senderId = null, projectId = null, requiresApproval = null, referenceApplication = null) {
  // INPUT VALIDATION
  ownerId = idVal(ownerId, 'ownerId', 'createNotif');
  title = stringVal(title, 'title', 'createNotif');
  content = stringVal(content, 'content', 'createNotif');
  origin = stringVal(origin, 'origin', 'createNotif');

  if (referencePost) {
    referencePost = idVal(referencePost);
  }

  if (referenceComment) {
    referenceComment = idVal(referenceComment);
  }
  if(referenceApplication) {
    referenceApplication = idVal(referenceApplication);
  }
  if (acceptedFriend) {
    if (typeof acceptedFriend !== 'boolean') {
      throw 'acceptedFriend must be a boolean';
    }
  }
  if (acceptedProject) {
    if (typeof acceptedProject !== 'boolean') {
      throw 'acceptedProject must be a boolean';
    }
  }
  if(requiresApproval) {
    if(typeof requiresApproval !== 'boolean') {
      throw 'requiresApproval must be a boolean';
    }
    if(typeof referenceApplication === "undefined") {
      throw 'requiresApproval passed without referenceApplication'
    }
    if(typeof referencePost === "undefined") {
      throw 'requiresApproval passed without referencePost'
    }
  }
  if (senderId) {
    senderId = idVal(senderId, 'senderId', 'createNotif');
  }

  if (projectId) {
    projectId = idVal(projectId, 'projectId', 'createNotif');
  }

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(ownerId) });
  if (!user) throw 'User not found';

  // Store the time and day the notification was created
  let notifTime = new Date();
  let notifDate = `${notifTime.getFullYear()}-${(notifTime.getMonth() + 1).toString().padStart(2, '0')}-${notifTime.getDate().toString().padStart(2, '0')} ${notifTime.getHours().toString().padStart(2, '0')}:${notifTime.getMinutes().toString().padStart(2, '0')}:${notifTime.getSeconds().toString().padStart(2, '0')}`;
  // console.log('Notification created at:', notifDate);
  let resolved = false;

  // Create the notification object
  let newNotif = {
    _id: new ObjectId(), // Generate a new ObjectId for the notification
    ownerId: ownerId, // Reference to the user who owns this notification
    origin: origin, // The origin of the notification (e.g., "post", "comment", etc.)
    title: title, // The title of the notification
    content: content, // The content of the notification
    resolved: resolved, // Default to false when created
    time: notifDate, // The time the notification was created
    referencePost: referencePost, // Reference to the related post, if applicable
    referenceComment: referenceComment, // Reference to the related comment, if applicable,
    referenceApplication: referenceApplication, // Reference to related application, if applicable,
    acceptedFriend: acceptedFriend, // A boolean to accept or reject a friend request
    acceptedProject: acceptedProject, // A boolean to accept or reject a project request
    requiresApproval: requiresApproval, // boolean to indicate if notification is an application (or not),
    senderId: senderId, // Reference to the user who sent the notification
    projectId: projectId // Reference to the project for project requests
  };

  // Add the notification to the user's notifications array
  const userUpdate = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(ownerId) },
    { $push: { notifications: newNotif } }, // Add the new notification to the notifications array
    { returnDocument: 'after' }
  );

  if (!userUpdate) throw 'Could not add notification to user';
  
  // Check if the notification was added successfully
  const notificationAdded = userUpdate.notifications.some((notif) => notif._id.toString() === newNotif._id.toString());
  if (!notificationAdded) throw 'Notification not added to user';

  // return the new notification object
  const newId = newNotif._id.toString();
  const notification = await getNotif(newId);
  return notification;
}


/**
 * This function retrieves all notifications for a given user.
 * @param {ObjectId} ownerId 
 * @returns notifications
 */
async function getAllNotifs(ownerId) {
  // INPUT VALIDATION
  ownerId = idVal(ownerId, 'ownerId', 'getAllNotifs');


  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(ownerId) });
  if (!user) throw 'User not found';

  // Check if the user has any notifications
  // if (!user.notifications || user.notifications.length === 0) {
  //   throw 'No notifications found for this user';
  // }

  return user.notifications; // Return the user's notifications
};

/**
 * This function retrieves a specific notification by its ID.
 * @param {string} notifId
 * @returns notification
 */
async function getNotif(notifId) {
  // INPUT VALIDATION
  notifId = idVal(notifId, 'notifId', 'getNotif');

  const userCollection = await users();
  const user = await userCollection.findOne({ notifications: { $elemMatch: { _id: new ObjectId(notifId) } } });
  if (!user) throw 'Notification not found';

  // Find the notification in the user's notifications array
  let notification = user.notifications.find((notif) => notif._id.toString() === notifId);
  if (!notification) throw 'Notification not found';
  notification._id = notification._id.toString(); // Convert ObjectId to string for consistency

  // console.log("notification:", notification);
  return notification; // Return the found notification
};

/**
 * This function removes a notification by its ID.
 * @param {ObjectId} notifId 
 * @returns updated User Obj
 */
async function removeNotif(notifId){
  // INPUT VALIDATION
  notifId = idVal(notifId, 'notifId', 'removeNotif');

  const userCollection = await users();
  const user = await userCollection.findOne({ notifications: { $elemMatch: { _id: new ObjectId(notifId) } } });
  if (!user) throw 'Notification not found';

  // Remove the notification from the user's notifications array
  const updatedUser = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(user._id) },
    { $pull: { notifications: { _id: new ObjectId(notifId) } } }, // Remove the notification with the given notifId
    { returnDocument: 'after' }
  );
  if (!updatedUser) throw 'Could not remove notification from user';

  return updatedUser; // Return the updated user object
};

/**
 * This function removes all notifications for a given user.
 * @param {ObjectId} ownerId 
 * @returns updated User Obj
 */
async function removeAllNotif(ownerId){
  // INPUT VALIDATION
  ownerId = idVal(ownerId, 'ownerId', 'removeAllNotif');

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(ownerId) });
  if (!user) throw 'User not found';

  // Remove all notifications from the user's notifications array
  const updatedUser = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(ownerId) },
    { $set: { notifications: [] } }, // Set the notifications array to an empty array
    { returnDocument: 'after' }
  );
  if (!updatedUser) throw 'Could not remove notifications from user';

  return updatedUser; // Return the updated user object
}

// resolve notifications
/**
 * This will mark notifcaitons as resolved
 * @param {ObjectId} notifId
 * @returns updated notification
 */
async function resolveNotif(notifId) {
  // INPUT VALIDATION
  notifId = idVal(notifId, 'notifId', 'resolveNotif');

  const userCollection = await users();
  const user = await userCollection.findOne({ notifications: { $elemMatch: { _id: new ObjectId(notifId) } } });
  if (!user) throw 'Notification not found';

  // Update the notification to mark it as resolved
  const updatedNotif = await userCollection.findOneAndUpdate(
    { "notifications._id": new ObjectId(notifId) },
    { $set: { "notifications.$.resolved": true } }, // Set the resolved field to true
    { returnDocument: 'after' }
  );
  if (!updatedNotif) throw 'Could not resolve notification';

  return updatedNotif; // Return the updated notification object
}

// add approve func
// if
/** 
 * This function will accept or reject a friend request
 * @param {ObjectId} notifId
 * @param {boolean} acceptedFriend
 * @param {ObjectId} senderId
 * @returns updated notification
 */
async function handleFriend(notifId, acceptedFriend, senderId) {
  // INPUT VALIDATION
  notifId = idVal(notifId, 'notifId', 'acceptedFriend');
  senderId = idVal(senderId, 'senderId', 'acceptedFriend');

  const userCollection = await users();
  const user = await userCollection.findOne({ notifications: { $elemMatch: { _id: new ObjectId(notifId) } } });
  if (!user) throw 'Notification not found';

  // if true, update the user obj with the friend (sender in this case)
  if (acceptedFriend && !user.friends.contains(senderId)) {
    const sender = await userCollection.findOne({ _id: new ObjectId(senderId) });
    if (!sender) throw 'Friend not found';

    // Add the sender as a friend to the user
    const updatedUser = await userCollection.findOneAndUpdate(
      { _id: new ObjectId(user._id) },
      { $addToSet: { friends: senderId } }, // Add the senderId to the user's friends array
      { returnDocument: 'after' }
    );
    if (!updatedUser) throw 'Could not add friend';
  } else if (user.friends.contains(senderId)) {
    // If the sender is already a friend, do not add them again
    throw 'Friend already exists';
  }

  // Update the notification to accept or reject the friend request
  const updatedNotif = await userCollection.findOneAndUpdate(
    { "notifications._id": new ObjectId(notifId) },
    { $set: { "notifications.$.acceptedFriend": acceptedFriend } }, // Set the acceptFriend field to true or false
    { returnDocument: 'after' }
  );
  if (!updatedNotif) throw 'Could not update notification';

  

  return updatedNotif; // Return the updated notification object
}


// add reject func
/**
 * This function will accept or reject a project request
 * @param {ObjectId} notifId
 * @param {boolean} acceptedProject
 * @param {ObjectId} projectId
 * @returns updated notification
 */
async function handleProject(notifId, acceptedProject, projectId) {
  // INPUT VALIDATION
  notifId = idVal(notifId, 'notifId', 'acceptedProject');
  projectId = idVal(projectId, 'projectId', 'acceptedProject');

  const posts = await projectPosts();
  const project = await posts.findOne({ _id: new ObjectId(projectId) });
  if (!project) throw 'Project not found';

  const userCollection = await users();
  const user = await userCollection.findOne({ notifications: { $elemMatch: { _id: new ObjectId(notifId) } } });
  if (!user) throw 'Notification not found';

  // Update the notification to accept or reject the project request
  if(acceptedProject && !project.members.contains(user._id)) {
    const updatedProject = await posts.findOneAndUpdate(
      { _id: new ObjectId(projectId) },
      { $addToSet: { members: user._id } }, // Add the userId to the project's members array
      { returnDocument: 'after' }
    );
    if (!updatedProject) throw 'Could not add member to project';
  }else if (project.members.contains(user._id)) {
    // If the user is already a member, do not add them again
    throw 'Member already exists';
  }

  return updatedNotif; // Return the updated notification object
}

export { createNotif, getAllNotifs, getNotif, removeNotif, removeAllNotif, resolveNotif, handleFriend, handleProject };
