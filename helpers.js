//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.

import moment from 'moment';
import { ObjectId } from 'mongodb';

function stringVal(str, name) {
    if (name === undefined) name = 'stringVal';
    if (!str) throw `${name} is not defined`;
    if (typeof str !== 'string'){
        throw `${str} is not a string for ${name}`;
    }
    str = str.trim();
    if (str.length === 0){
        throw `${str} is empty spaces`;
    }
    return str;
};

// to check if just letters a-z, A-Z and numbers
function onlylettersandnumbers(str, name) {
    if (name === undefined) name = 'onlylettersandnumbers';
    str = stringVal(str, name);
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (
            !(charCode >= 48 && charCode <= 57) &&  // '0' to '9'
            !(charCode >= 65 && charCode <= 90) &&  // 'A' to 'Z'
            !(charCode >= 97 && charCode <= 122) && // 'a' to 'z'
            !(charCode === 32)                      // space
        ) {
            throw 'String must contain only letters and numbers for ' + name;
        }
    }
    return str;
}

// to check if just letters a-z and A-Z
function onlyletters(str, name){
    if (name === undefined) name = 'onlyletters';
    str = stringVal(str, name);
    for (let i = 0; i < str.length; i++) {
        const charCode = str.charCodeAt(i);
        if (
            !(charCode >= 65 && charCode <= 90) &&  // 'A' to 'Z'
            !(charCode >= 97 && charCode <= 122) && // 'a' to 'z'
            !(charCode === 32)                      // space
        ) {
            throw 'String must contain only letters and numbers for ' + name;
        }
    }
    return str;
};

// check if arraytype, empty, each elem = string, each elem not empty
// trims the string element
function arrayVal(arr, name) {
    if (name === undefined) name = 'arrayVal';
    if (!arr || !Array.isArray(arr)) throw 'You must provide an array for ' + name;
    if (arr.length === 0) throw 'Array cannot be empty for ' + name;
    for (let i in arr) {
        if (typeof arr[i] !== 'string' || arr[i].trim().length === 0){
            throw 'One or more elements is not a string or is an empty string in ' + name;
        }
        arr[i] = arr[i].trim();
    }
    return arr;
};

function idVal(id, name){
    if (name === undefined) name = 'idVal';
    if (!id) throw 'You must provide an id to search for in ' + name;
    if (typeof id !== 'string') throw 'Id must be a string';
    if (id.trim().length === 0)
        throw 'Id cannot be an empty string or just spaces for ' + name;
    id = id.trim();
    // have to check if this is a valid id
    if (!ObjectId.isValid(id)) throw 'invalid object ID';
    
    return id;
};

/**
 * Returns boolean if every item in array conforms to validator function
 * throws otherwise
 * @param {*} array 
 * @param {*} type 
 */
function validateArray(array, validator) {
    if(!Array.isArray(array)) {
        throw new Error(`Not an array.`);
    }

    for(const item of array) {
        if(!validator(item)) {
            throw new Error(`Array failed validation.`);
        }
    }

    return true;
}

function validObjectId(objid) {
    if(!ObjectId.isValid(objid)) {
        throw new Error(`Invalid ObjectId.`);
    }
    return true;
}

function usernameVal(username) {
    if (!username) throw 'You must provide a username';
    if (typeof username !== 'string') throw 'username must be a string';

    username = username.toLowerCase();
    if (username.length < 5) throw 'username must have at least 5 characters';
    if (username.length > 10) throw 'username must have at most 10 characters';

    // only letters or positive whole numbers
    for (let i = 0; i < username.length; i++) {
        const charCode = username.charCodeAt(i);
        if (
        !(charCode >= 48 && charCode <= 57) &&  // '0' to '9'
        !(charCode >= 97 && charCode <= 122) // 'a' to 'z'
        ){
        throw 'username must contain only letters and numbers';
        }
    }
    return username;
}

// using lab 10 requirements for username/pass
/*
userId should be a valid string (no strings with just spaces) and should be at least 5 characters long with a max of 10 characters.
The only valid characters should be letters or positive whole numbers. If it fails any of those conditions, you will throw an error.

The userId should be case-insensitive. So "PHILL", "phill", "Phill" should be treated as the same userId. 

For the password, it must be a valid string (no strings with just spaces and no spaces but can be any other character including
     special characters) and should be a minimum of 8 characters long. If it fails any of those conditions, you will throw an error. 
     The constraints for password will be: There needs to be at least one uppercase character, there has to be at least one number 
     and there has to be at least one special character:  for example:  
     Not valid: test123, test123$, foobar, tS12$ Valid: Test123$, FooBar123*, HorsePull748*%
*/


function passwordVal(password) {
    if (!password) throw 'You must provide a password';
    if (typeof password !== 'string') {
        throw 'password must be a string';
      }
    password = password.trim();
    if (password.length < 8) throw 'password must be at least 8 characters long';
    if (password.length > 20) throw 'password must be at most 20 characters long';

    let uppercase = false;
    let number = false;
    let specialChar = false;
    for (let i = 0; i < password.length; i++) {
        const charCode = password.charCodeAt(i);
        if (
          !(charCode >= 33 && charCode <= 126) // all printable characters
        ){
          throw 'password must contain only letters and numbers, no spaces';
        }
        if (charCode >= 65 && charCode <= 90) { // 'A' to 'Z'
          uppercase = true;
        }
        if (charCode >= 48 && charCode <= 57) { // '0' to '9'
          number = true;
        }
        // we can include numbers and letters in our range since we already checked for them
        // and if one of those are false, it will error anyway
        if ((charCode >= 33 && charCode <= 96 ) || (charCode >= 122 && charCode <= 126)) { // special characters
          specialChar = true;
        }
      }
      if (!uppercase || !number || !specialChar) {
        throw 'password must contain at least one uppercase letter, one number and one special character';
      }
    return password;
}



function nameVal(name) {
    // letters only (no spaces, no strings with just spaces, should not contain numbers) and should be at least 2 characters long with a max of 20 characters.
    if (!name) throw 'You must provide a name';
    if (typeof name !== 'string') throw 'Name must be a string';
    name = name.trim();
    if (name.length === 0) throw 'Name cannot be an empty string or just spaces';
    if (name.length < 2) throw 'Name must be at least 2 characters long';
    if (name.length > 20) throw 'Name must be at most 20 characters long';
    // check if just letters a-z, A-Z
    name = onlyletters(name);
    return name;
}


function date(){
    const date = new Date();
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return formattedDate;
}

function time(){
    const time = new Date();
    // Get the time in AM/PM format
    const formattedTime = moment(time).format('hh:mmA');
    return formattedTime;
}

export {stringVal, onlylettersandnumbers, onlyletters, arrayVal, idVal, validObjectId, time, date, usernameVal, passwordVal, nameVal, validateArray};