//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.

import { ObjectId } from "mongodb";
/**
 * Validates that the input is a non-empty string.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The trimmed string if valid.
 */
function stringVal(val, varName = "value", funcName = "stringVal") {
	if (typeof val !== "string" || val.trim().length === 0) {
		throw `Error in ${funcName}: ${varName} must be a non-empty string.`;
	}
	return val.trim();
}

/**
 * Validates that the input contains only letters and numbers.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The validated string if valid.
 */
function onlylettersandnumbers(val, varName = "value", funcName = "onlylettersandnumbers") {
	if (!/^[a-zA-Z0-9]+$/.test(val)) {
		throw `Error in ${funcName}: ${varName} must contain only letters and numbers.`;
	}
	return val;
}

/**
 * Validates that the input contains only letters.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The validated string if valid.
 */
function onlyletters(val, varName = "value", funcName = "onlyletters") {
	if (!/^[a-zA-Z]+$/.test(val)) {
		throw `Error in ${funcName}: ${varName} must contain only letters.`;
	}
	return val;
}

/**
 * Validates that the input is a non-empty array with string elements.
 * @param {Array} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {Array} - The validated array if valid.
 */
function arrayVal(val, varName = "value", funcName = "arrayVal") {
	if (!Array.isArray(val) || val.length === 0) {
		throw `Error in ${funcName}: ${varName} must be a non-empty array.`;
	}
	for (const item of val) {
		if (typeof item !== "string" || item.trim().length === 0) {
			throw `Error in ${funcName}: ${varName} must contain only non-empty strings.`;
		}
	}
	return val;
}

/**
 * Validates that the input is a valid ObjectId string.
 * @param {string} val - The value to validate.
 * @param {string} varName - The variable name for error messages.
 * @param {string} funcName - The function name for error messages.
 * @returns {string} - The validated ObjectId string if valid.
 */
function idVal(val, varName = "value", funcName = "idVal") {
	if (typeof val !== "string" || val.trim().length === 0) {
		throw `Error in ${funcName}: ${varName} must be a non-empty string.`;
	}
	if (!ObjectId.isValid(val)) {
		throw `Error in ${funcName}: ${varName} is not a valid ObjectId.`;
	}
	return val.trim();
}

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
	stringVal,
	onlylettersandnumbers,
	onlyletters,
	arrayVal,
	idVal,
	validatePassword,
	validateUserID,
	validateArray
};
