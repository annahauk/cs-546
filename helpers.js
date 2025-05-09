//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.

import moment from "moment";
import { ObjectId } from "mongodb";

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
	if (!Array.isArray(array)) {
		throw new Error(`Not an array.`);
	}

	for (const item of array) {
		if (!validator(item)) {
			throw new Error(`Array failed validation.`);
		}
	}

	return true;
}

function validObjectId(objid) {
	if (!ObjectId.isValid(objid)) {
		throw new Error(`Invalid ObjectId.`);
	}
	return true;
}

// Zak: Copied over helper functions from labs
/**
 * Validates a username string according to the following rules:
 * - Must be a non-empty string (not just spaces)
 * - Length must be between 5 and 10 characters (inclusive)
 * - Can only contain letters (A-Z, a-z) and numbers (0-9)
 * Throws an error with a descriptive message if validation fails.
 * @param {string} val - The username to validate
 * @param {string} varName - The variable name for error messages
 * @param {string} funcName - The function name for error messages
 * @returns {string} - The trimmed, validated username
 */
const validateUserID = (val, varName, funcName) => {
	if (!val || typeof val !== "string" || val.trim() === "") {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" does not exist or is all spaces"
		);
	}
	// Trim inputs!
	val = val.trim();
	// Check length
	if (val.length < 5 || val.length > 10) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must be at least 5 characters and no more than 10 characters"
		);
	}
	// Check that it contains only charactesr or positive whole numbers
	if (!/^[A-Za-z0-9]+$/.test(val)) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain only letters or positive whole numbers"
		);
	}
	return val;
};

/**
 * Validates a password string according to the following rules:
 * - Must be a non-empty string (not just spaces)
 * - Must not contain any spaces
 * - Must be at least 8 characters long
 * - Must contain at least one uppercase letter
 * - Must contain at least one number
 * - Must contain at least one special character (not a letter, number, or space)
 * Throws an error with a descriptive message if validation fails.
 * @param {string} val - The password to validate
 * @param {string} varName - The variable name for error messages
 * @param {string} funcName - The function name for error messages
 * @returns {string} - The validated password
 */
const validatePassword = (val, varName, funcName) => {
	if (!val || typeof val !== "string" || val.trim() === "") {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must be a non-empty string and cannot consist of only spaces"
		);
	}
	// Check there are no spaces in password
	if (/\s/.test(val)) {
		throw (
			"Error in " + funcName + ": " + varName + " must not contain any spaces"
		);
	}
	// Check length
	if (val.length < 8) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must be at least 8 characters long"
		);
	}
	// Check that there is at least one uppercase letter
	if (!/[A-Z]/.test(val)) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain at least one uppercase letter"
		);
	}
	// Check there is at least one number
	if (!/[0-9]/.test(val)) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain at least one number"
		);
	}
	// Check there are no spaces in password
	if (/\s/.test(val)) {
		throw (
			"Error in " + funcName + ": " + varName + " must not contain any spaces"
		);
	}
	// Check there is at least one special character
	let hasSpecialCharacter = false;
	for (let i = 0; i < val.length; i++) {
		const char = val[i];
		// Check if the character is not a letter, number, or space
		if (!/[A-Za-z0-9\s]/.test(char)) {
			hasSpecialCharacter = true;
			break;
		}
	}
	if (!hasSpecialCharacter) {
		throw (
			"Error in " +
			funcName +
			": " +
			varName +
			" must contain at least one special character"
		);
	}
	return val;
};

export {
	exists,
	stringVal,
	onlylettersandnumbers,
	onlyletters,
	arrayVal,
	genreVal,
	nameVal,
	idVal,
	spaceChecking,
	dateVal,
	validateRuntime,
	validObjectId,
	validateUsername,
	validatePassword
};
