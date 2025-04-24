import {users} from '../config/mongoCollections.js' // imported to reference that collection
import {ObjectId} from 'mongodb';

// helper imports
import {stringVal, arrayVal} from '../helpers.js'
import { create_auth } from '../src/lib/auth.js';
// Do not forget, for any input that is a string (even if that string is in an array, or as a value of a property in an object), you must TRIM all string input using the trim function for ALL functions!

/*
schema
{
    _id: ObjectId, 
    first_name: string,         Required 
    last_name: string,          Required
    user_name: string,          Required, unique (case sensitive???)
    password: string,           Required, Hashed password
    email: string,              Required, unique (case sensitive? Idk how emails are)
    Auth: ObjectId,             Reference to the Auth collection, generated  when user is created
    github_profile: string,     URL to the user's GitHub profile, generated when user is created --> where is this link coming from????
    skill_tags: Array<string>,  List of skills, e.g., ["Web Dev", "JavaScript"]
    friends: Array<ObjectId>,   References to other user documents in the collection
    achievements: Array<String>, 
    notifications: Array<ObjectId> References to the Notification collection
}
*/

// come back
async function createUser(firstName, lastName, userName, password, email, githubProfile, skillTags, friends, achievements, notifications){
    // INPUT VALIDATION
    // COME BACK TO FIX HELPERS BASED ON THE NEED FOR THE SCHEMA
    firstName = stringVal(firstName);
    lastName = stringVal(lastName);
    userName = stringVal(userName);
    email = stringVal(email);
    authId = undefined; // created in update
    githubProfile = stringVal(githubProfile);
    skillTags = arrayVal(skillTags);
    friends = arrayVal(friends);
    achievements = arrayVal(achievements);
    notifications = arrayVal(notifications);

    // COME BACK
    // check if userName and email are unique and not an existing user


    // create new user
    let newUser = {
        first_name: firstName,
        last_name: lastName,
        user_name: userName,
        email: email,
        Auth: undefined,
        github_profile: githubProfile,
        skill_tags: skillTags,
        friends: friends,
        achievements: achievements,
        notifications: notifications
    }
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);

    if (!insertInfo.acknowledged || !insertInfo.insertedId){
      throw 'Could not add movie';
    }

    /**
   * create authentication for user via authId
   * upsert into newly created user
   */
    // throws on failure, so valid object id will be returned
    const authId = await create_auth(insertInfo.insertedId, password);

    // update the user's document
    const update = await userCollection.updateOne({_id: insertInfo.insertedId}, {
      "$set": {"Auth": authId}
    })
    if(!update.insertedId) {
      throw new Error(`Failed to insert Auth to user document.`);
    }
    
    // returns the id of the inserted user
    const newId = insertInfo.insertedId.toString();
    const user = await getUserById(newId);
    return user;
};

// Done
async function getAllUsers(){
  const userCollection = await users();
  let userList = await userCollection.find({}).toArray(); // {} parameters to find but we're looking for all
  if (!userList){
    throw 'Could not get all users';
  }
  userList = userList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return userList;
};

// Done
async function getUserById(id){
    id = idVal(id);
    // get a reference to the collection
    const userCollection = await users();

    const user = await userCollection.findOne({_id: new ObjectId(id)}); // new ObjectId(id) converts the string to ObjectId
    if (user === null){
      throw 'No user with that id';
    }
    // have to convert back to string, servers will do this for us in the future
    user._id = user._id.toString();
    return user;
};

// maybe don't need yet
// Done
async function removeUser(id){
    id = idVal(id);
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({_id: new ObjectId(id)});
    // Deletes but returns the object that was deleted
    if (!deletionInfo){ // number of documents affected
      throw `Could not delete user with id of ${id}`;
    }
    return `${deletionInfo.title} has been successfully deleted!`;
};

// Done
async function renameUser(id, newName){
    id = idVal(id);

    newName = stringVal(newName);
    const updatedUser = {
      title: newName,
    };

    const userCollection = await users();
    const updatedInfo = await userCollection.findOneAndUpdate( // returns the object before the update
      {_id: new ObjectId(id)},
      {$set: updatedUser}, // 
      {returnDocument: 'after'} // need to return the updated document instead of the original
    );
    if (!updatedInfo){
      throw 'could not update movie successfully';
    }
    updatedInfo._id = updatedInfo._id.toString();
    return updatedInfo;
  };

export {createUser, getAllUsers, getUserById, removeUser, renameUser};