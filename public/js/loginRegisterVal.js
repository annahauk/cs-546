import { validatePassword, validateUserID } from "../../helpers.js";

// Registration form validation:
let signupForm = document.getElementById("signup-form");
if (signupForm) {
	console.log("Signup form exists");
	signupForm.addEventListener("submit", (event) => {
		console.log("Signup submitted");
		// Get inputs
		let firstNameInput = document.getElementById("firstName");
		let lastNameInput = document.getElementById("lastName");
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
			// Check firstName
			let firstName = firstNameInput.value;
			if (!firstName) {
				missingFields.push("First Name");
			}
			// Check lastName
			let lastName = lastNameInput.value;
			if (!lastName) {
				missingFields.push("Last Name");
			}
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
			// Check firstName
			try {
				firstName = validateNamePart(firstName, "firstName", functionName);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
			// Check lastName
			try {
				lastName = validateNamePart(lastName, "lastName", functionName);
			} catch (e) {
				errors.push(stripErrorPrefix(e));
			}
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
