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

// Registration form validation:
let signupForm = document.getElementById("signup-form");
if (signupForm) {
	console.log("Signup form exists");
	signupForm.addEventListener("submit", (event) => {
		console.log("Signup submitted");
		// Get inputs
		let userIdInput = document.getElementById("userId");
		let passwordInput = document.getElementById("password");
		let confirmPassInput = document.getElementById("confirmPassword");
		let errorElement = document.getElementById("error");
		try {
			// Reset error element
			errorElement.hidden = true;
			// Validate each input checking for errors
			const missingFields = [];
			// First, check each input has value
			// If there is an error, add to error list to then throw to be caught and displayed as error message
			// Check userId
			let userId = userIdInput.value;
			if (!userId) {
				missingFields.push("User ID");
			}
			// Check password
			let password = passwordInput.value;
			if (!password) {
				missingFields.push("Password");
			}
			// Check confirm password
			let confirmPassword = confirmPassInput.value;
			if (!confirmPassword) {
				missingFields.push("Confirm Password");
			}
			// If there is an error, combine into single string to throw and display in the error paragraph
			if (missingFields.length > 0) {
				// Prevent default
				event.preventDefault();
				let errorMessage = "The follow fields are missing:<br>";
				for (let field of missingFields) {
					errorMessage += field + "<br>";
				}
				throw errorMessage;
			}
			// Then, check that the value for each input is valid
			const errors = [];
			let functionName = "register(client)";
			const stripErrorPrefix = (errorMessage) => {
				return errorMessage.replace(/^Error in .*?: /, "");
			};
			// Check userId
			try {
				userId = validateUserID(userId, "userId", functionName);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
			// Check password
			try {
				password = validatePassword(password, "password", functionName);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
			// Check confirm password (valid, === password)
			try {
				confirmPassword = validatePassword(
					password,
					"confirmPassword",
					functionName
				);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
			if (password !== confirmPassword) {
				errors.push("Password and Confirm Password do not match.");
			}
			if (errors.length > 0) {
				// Prevent default
				event.preventDefault();
				let errorMessage = "There were errors in the inputs given:<br>";
				for (let field of errors) {
					errorMessage += field + "<br>";
				}
				throw errorMessage;
			}
			// Otherwise, let it proceed to server! (aka do nothing)
			console.log("Form going through!");
			// signupForm.submit();
		} catch (e) {
			// If there is an error, display it on the page
			errorElement.hidden = false;
			errorElement.innerHTML = e;
			console.error(e);
		}
	});
}

// Login form validation:
let loginForm = document.getElementById("signin-form");
if (loginForm) {
	loginForm.addEventListener("submit", (event) => {
		// Get inputs
		let userIdInput = document.getElementById("userId");
		let passwordInput = document.getElementById("password");
		let errorElement = document.getElementById("error");
		try {
			// Reset error element
			errorElement.hidden = true;
			// Validate each input checking for errors
			const missingFields = [];
			// First, check each input has value
			// If there is an error, add to error list to then throw to be caught and displayed as error message
			// Check userId
			let userId = userIdInput.value;
			if (!userId) {
				missingFields.push("User ID");
			}
			// Check password
			let password = passwordInput.value;
			if (!password) {
				missingFields.push("Password");
			}
			// If there is an error, combine into single string to throw and display in the error paragraph
			if (missingFields.length > 0) {
				// Prevent default
				event.preventDefault();
				let errorMessage = "The follow fields are missing:<br>";
				for (let field of missingFields) {
					errorMessage += field + "<br>";
				}
				throw errorMessage;
			}
			// Then, check that the value for each input is valid
			const errors = [];
			let functionName = "register(client)";
			const stripErrorPrefix = (errorMessage) => {
				return errorMessage.replace(/^Error in .*?: /, "");
			};
			// Check userId
			try {
				userId = validateUserID(userId, "userId", functionName);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
			// Check password
			try {
				password = validatePassword(password, "password", functionName);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
			if (errors.length > 0) {
				// Prevent default
				event.preventDefault();
				let errorMessage = "There were errors in the inputs given:<br>";
				for (let field of errors) {
					errorMessage += field + "<br>";
				}
				throw errorMessage;
			}
			// Otherwise, let it proceed to server! (aka do nothing)
			console.log("Form going through!");
			// loginForm.submit();
		} catch (e) {
			// If there is an error, display it on the page
			errorElement.hidden = false;
			errorElement.innerHTML = e;
			console.error(e);
		}
	});
}
