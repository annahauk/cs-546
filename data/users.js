import {users} from '../config/mongoCollections.js' // imported to reference that collection
import {ObjectId} from 'mongodb';
import bcrypt from 'bcrypt';

// helper imports
import { stringVal, arrayVal, idVal, validatePassword, validateUserID} from '../helpers.js'
import { create_auth } from '../src/lib/auth.js';


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
    notifications: Array<ObjectId> References to the Notification collection
}
*/


/**
 * Creates a new user
 * @param {string} userName
 * @param {string} password
 * @param {string} githubProfile
 * @param {Array<string>} skillTags
 * @param {Array<ObjectId>} friends
 * @param {Array<string>} achievements
 * @param {Array<ObjectId>} notifications
 * @returns {ObjectId} userId
 * @throws Will throw an error if userName not unique
 * @throws Will throw an error if user creation fails
 *
 */ 
async function createUser(userName, password){
    // INPUT VALIDATION

    userName = validateUserID(userName, 'userName', 'createUser');
    password = validatePassword(password, 'password', 'createUser');
    let githubProfile = "";
    let skillTags = [];
    let friends = [];
    let achievements = ["Welcome!"];
    let notifications = [];

    // check if userName are unique and not an existing user
    let existingUser = await getUserByUsername(userName);
    if (existingUser) {
        throw `User with username ${userName} already exists`;
    }

    // hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // create new user
    let newUser = {
        user_name: userName,
        password: hashedPassword,
        Auth: undefined,
        github_profile: githubProfile,
        skill_tags: skillTags,
        friends: friends,
        achievements: achievements,
        notifications: notifications
    }

    // time to input into DB
    const userCollection = await users();
    const insertInfo = await userCollection.insertOne(newUser);

    if (!insertInfo.acknowledged || !insertInfo.insertedId){
      throw 'Could not add user to database';
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
    if(!update.acknowledged) {
      throw new Error(`Failed to insert Auth to user document.`);
    }
    
    // returns the user object
    const newId = insertInfo.insertedId.toString();
    const user = await getUserById(newId);
    return user;
};


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

/**
 * grab an indivdual user's tags from the database
 * @param {string} id
 * @returns {Array<string>} skill_tags
 */
async function getUserTags(id){
  id = idVal(id, 'id', 'getUserTags');
  const userCollection = await users();
  const user = await userCollection.findOne({_id: new ObjectId(id)});
  if (user === null){
    throw 'No user with that id';
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
async function updateUserTags(id, skillTags){
  id = idVal(id, 'id', 'updateUserTags');
  skillTags = arrayVal(skillTags);
  let currSkills = await getUserTags(id);
  const userCollection = await users();
  const user = await userCollection.findOne({_id: new ObjectId(id)});
  if (user === null){
    throw 'No user with that id';
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
    {_id: new ObjectId(id)},
    {$set: updatedUser},
    {returnDocument: 'after'}
  );
  if (!updateInfo){
    throw 'could not update user successfully';
  }
  updateInfo._id = updateInfo._id.toString();
  return updateInfo;
}

async function getUserById(id){
    id = idVal(id, 'id', 'getUserById');
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

/**
 * get user document by username. 
 * return null if not found
 * @param {string} username
 */
async function getUserByUsername(username) {
  const usersc = await users();
  const user = await usersc.findOne({"user_name": username});
  if(!user) {
    return null;
  } else {
    return user;
  }
}

// maybe don't need
async function removeUser(id){
    id = idVal(id, 'id', 'removeUser');
    const userCollection = await users();
    const deletionInfo = await userCollection.findOneAndDelete({_id: new ObjectId(id)});
    // Deletes but returns the object that was deleted
    if (!deletionInfo){ // number of documents affected
      throw `Could not delete user with id of ${id}`;
    }
    return `${deletionInfo.title} has been successfully deleted!`;
};

/**
 * This function updates a user by its ID
 * for friends, achievements, skills, etc.
 * @param {string} id 
 * @param {Object} updateData
 * @returns {ObjectId} userId
 * @throws {Error} if user is not found
 * @throws {Error} if update fails
 */
async function updateUser(id, updateData){
  id = idVal(id, 'id', 'updateUser');
  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    {_id: new ObjectId(id)},
    {$set: updateData}
  );
  if (updateInfo.modifiedCount === 0) throw `Could not update user with id of ${id}`;
  return id;
}


export {createUser, getAllUsers, getUserById, getUserByUsername, removeUser, updateUser, updateUserTags, getUserTags, create_auth};