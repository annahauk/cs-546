//Export the following functions using ES6 Syntax
import {users} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb';

import {createUser, getAllUsers, getUserById, removeUser, renameUser} from './users.js'; 
import {stringVal} from '../helpers.js'

/* Schema
{
  _id: ObjectId
  ownerId: ObjectId,         Reference to the user who owns this notification
  seen: Boolean, 
  content: String,
  time: String,              The time the notification was created in the format of "MM/DD/YYYY"
  referencePost: ObjectId,   Reference to the related post, if applicable
  referenceComment: ObjectId Reference to the related comment, if applicable
}
*/

async function createNotif(ownerId, content, referencePost=null, referenceComment = null) {
  // INPUT VALIDATION
  ownerId = stringVal(ownerId);
  ownerId = idVal(ownerId);
  content = stringVal(content);

  if (referencePost) {
    referencePost = stringVal(referencePost);
    referencePost = idVal(referencePost);
  }

  if (referenceComment) {
    referenceComment = stringVal(referenceComment);
    referenceComment = idVal(referenceComment);
  }

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(ownerId) });
  if (!user) throw 'User not found';

  // Store the time the notification was created
  let notifDate = new Date().toLocaleTimeString();

  // Create the notification object
  let newNotif = {
    _id: new ObjectId(), // Generate a new ObjectId for the notification
    ownerId: ownerId, // Reference to the user who owns this notification
    seen: false, // Default to false when created
    content: content, // The content of the notification
    time: notifDate, // The time the notification was created
  };

  // Add referencePost only if it exists
  if (referencePost) {
    newNotif.referencePost = referencePost;
  }
  // Add referenceComment only if it exists
  if (referenceComment) {
    newNotif.referenceComment = referenceComment;
  }
  // Add the notification to the user's notifications array
  const userUpdate = await userCollection.findOneAndUpdate(
    { _id: new ObjectId(ownerId) },
    { $push: { notifications: newNotif } }, // Add the new notification to the notifications array
    { returnDocument: 'after' }
  );
  if (!userUpdate) throw 'Could not add notification to user';
  
  // Check if the notification was added successfully
  const notificationAdded = updatedUser.notifications.find((notif) => notif._id.toString() === newNotif._id.toString());
  if (!notificationAdded) throw 'Notification not added to user';

  // If the notification was added successfully, return it
  return newNotif; // Return the created notification object
}

async function getAllNotifs(ownerId) {
  // INPUT VALIDATION
  ownerId = stringVal(ownerId);
  ownerId = idVal(ownerId);

  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(ownerId) });
  if (!user) throw 'User not found';
  // Check if the user has any notifications
  if (!user.notifications || user.notifications.length === 0) {
    throw 'No notifications found for this user';
  }

  return user.notifications; // Return the user's notifications
};

async function getNotif(){
  // INPUT VALIDATION
  notifId = stringVal(notifId);
  notifId = idVal(notifId);

  const userCollection = await users();
  const user = await userCollection.findOne({ notifications: { $elemMatch: { _id: new ObjectId(notifId) } } });
  if (!user) throw 'Notification not found';

  // Find the notification in the user's notifications array
  const notification = user.notifications.find((notif) => notif._id.toString() === notifId);
  if (!notification) throw 'Notification not found';

  return notification; // Return the found notification
};

// I want to make notifications still viewable after clicked on -- just not bold/highlighted
// we can add a trash button for singular removal
// or a remove all button to remove all notifications
// remove all button will be a separate function
async function removeNotif(notifId){
  // INPUT VALIDATION
  notifId = stringVal(notifId);
  notifId = idVal(notifId);

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

async function removeAllNotif(ownerId){
  // INPUT VALIDATION
  ownerId = stringVal(ownerId);
  ownerId = idVal(ownerId);

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


export { createNotif, getAllNotifs, getNotif, removeNotif, removeAllNotif };
