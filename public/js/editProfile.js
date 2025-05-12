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

function validateProjectData(data) {
	// Validate title
	if (
		!data.title ||
		typeof data.title !== "string" ||
		data.title.trim().length === 0
	) {
		throw new Error("Title is required and must be a non-empty string.");
	}

	// Validate content
	if (
		!data.content ||
		typeof data.content !== "string" ||
		data.content.trim().length === 0
	) {
		throw new Error("Content is required and must be a non-empty string.");
	}

	// Validate repoLink
	if (
		!data.repoLink ||
		typeof data.repoLink !== "string" ||
		!/^https?:\/\/.+/.test(data.repoLink.trim())
	) {
		throw new Error("A valid repository link is required.");
	}

	// Validate status
	if (!["active", "completed"].includes(data.status)) {
		throw new Error("Status must be either 'active' or 'completed'.");
	}

	// Validate topic_tags
	if (data.topic_tags) {
		if (typeof data.topic_tags === "string") {
			// Convert single tag to an array
			data.topic_tags = [data.topic_tags];
		}
		if (
			!Array.isArray(data.topic_tags) ||
			data.topic_tags.some(
				(tag) => typeof tag !== "string" || tag.trim().length === 0
			)
		) {
			throw new Error("Topic tags must be an array of non-empty strings.");
		}
	}
}

// Handle project selection and form display
document.addEventListener("DOMContentLoaded", function () {
	const projectSelector = document.getElementById("projectSelector");
	const projectForms = document.querySelectorAll(".projectForm");
	const unsavedChangesWarning = document.getElementById(
		"unsavedChangesWarning"
	);
	const unsavedTagsWarning = document.getElementById("unsavedTagsWarning");
	const tagsDropdown = document.getElementById("tags");
	const resetTagsButton = document.getElementById("resetTagsButton");

	// Initialize Choices.js for the user tags dropdown
	const tagsChoices = new Choices(tagsDropdown, {
		removeItemButton: true,
		placeholder: true,
		placeholderValue: "Select tags"
	});

	// Store the original values of the user tags
	const originalTags = tagsChoices.getValue(true); // Get the initial selected values as an array

	// Add event listener to reset the user tags form
	resetTagsButton.addEventListener("click", () => {
		tagsChoices.setChoiceByValue(originalTags); // Reset the dropdown to the original values
		hasUnsavedTags = false;
		unsavedTagsWarning.hidden = true;
	});

	// Track unsaved changes in the user tags form
	let hasUnsavedTags = false;
	tagsDropdown.addEventListener("change", () => {
		hasUnsavedTags = true;
		unsavedTagsWarning.hidden = false;
	});

	// Track unsaved changes in project forms
	let unsavedProjects = new Set();
	const originalProjectData = {};
	const projectChoices = {};
	// Initialize Choices.js for all project to pic tags dropdowns
	document.querySelectorAll('[id^="topic_tags-"]').forEach((dropdown) => {
		const idPart = dropdown.id.split("-")[1];
		const projectId = `project-${idPart}`; // Form id style

		projectChoices[idPart] = new Choices(dropdown, {
			removeItemButton: true,
			placeholder: true,
			placeholderValue: "Select topic tags"
		});

		originalProjectData[projectId] = {
			...originalProjectData[projectId],
			topicTags: projectChoices[idPart].getValue(true)
		};
	});

	// Store the original values of each project form
	projectForms.forEach((form) => {
		const projectId = form.id;
		const inputs = form.querySelectorAll("input, textarea, select");
		originalProjectData[projectId] = originalProjectData[projectId] || {};

		inputs.forEach((input) => {
			if (input.type === "checkbox" || input.type === "radio") {
				originalProjectData[projectId][input.name] = input.checked;
			} else if (input.multiple) {
				originalProjectData[projectId][input.name] = Array.from(
					input.selectedOptions
				).map((option) => option.value);
			} else {
				originalProjectData[projectId][input.name] = input.value;
			}
		});
	});

	// Add event listeners to reset project forms
	document.querySelectorAll(".resetProjectButton").forEach((button) => {
		button.addEventListener("click", () => {
			const projectId = `project-${button.getAttribute("data-project-id")}`;
			const form = document.getElementById(projectId);
			const inputs = form.querySelectorAll("input, textarea, select");

			const projectData = originalProjectData[projectId];
			if (!projectData) return; // Defensive: if data not found, exit

			// Reset topic tags
			if (projectChoices[projectId.split("project-")[1]]) {
				projectChoices[projectId.split("project-")[1]].setChoiceByValue(
					projectData.topicTags || []
				);
			}

			// Reset other form fields to their original values
			inputs.forEach((input) => {
				if (input.type === "checkbox" || input.type === "radio") {
					input.checked = originalProjectData[projectId][input.name] ?? false;
				} else if (input.multiple) {
					const originalValues =
						originalProjectData[projectId][input.name] ?? [];
					Array.from(input.options).forEach((option) => {
						option.selected = originalValues.includes(option.value);
					});
				} else {
					input.value = originalProjectData[projectId][input.name] ?? "";
				}
			});

			// Remove the project from the unsaved changes list
			const projectTitle = form.querySelector("input[name='title']").value;
			unsavedProjects.delete(projectTitle);
			updateUnsavedChangesWarning();
		});
	});

	// Add event listeners to detect changes in the project forms
	projectForms.forEach((form) => {
		const inputs = form.querySelectorAll("input, textarea, select");
		const projectTitle = form.querySelector("input[name='title']").value;

		inputs.forEach((input) => {
			input.addEventListener("input", () => {
				unsavedProjects.add(projectTitle);
				updateUnsavedChangesWarning();
			});
		});
	});

	// Update the warning message with the list of unsaved projects
	function updateUnsavedChangesWarning() {
		if (unsavedProjects.size > 0) {
			const projectList = Array.from(unsavedProjects).join(", ");
			unsavedChangesWarning.textContent = `You have unsaved changes in the following projects: ${projectList}`;
			unsavedChangesWarning.hidden = false;
		} else {
			unsavedChangesWarning.hidden = true;
		}
	}

	// Handle project selection and form display
	projectSelector.addEventListener("change", function () {
		const selectedProjectId = this.value;

		// Hide all project forms
		projectForms.forEach((form) => {
			form.style.display = "none";
		});

		// Show the selected project form
		const selectedForm = document.getElementById(selectedProjectId);
		if (selectedForm) {
			selectedForm.style.display = "block";
		}
	});

	/* Now, for the actual form submission LOL */
	// First, user tags update form
	const tagsForm = document.getElementById("updateTags-form");

	tagsForm.addEventListener("submit", async (event) => {
		event.preventDefault(); // Prevent the default form submission
		// Get selected tags as an array
		let selectedTags = tagsChoices.getValue(true);
		selectedTags = arrayVal(
			selectedTags,
			"selectedTags",
			"editProfile(client)"
		);
		// Extract user ID from form action
		const userId = tagsForm.action.split("/").slice(-2, -1)[0];

		try {
			const response = await fetch(`/profile/${userId}/updateTags`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ tags: selectedTags })
			});

			if (response.ok) {
				const result = await response.json();
				alert("Tags updated successfully!");
				hasUnsavedTags = false;
				unsavedTagsWarning.hidden = true;
			} else {
				const error = await response.json();
				alert(`Error updating tags: ${error.message}`);
			}
		} catch (error) {
			console.error("Error updating tags:", error);
			alert("An error occurred while updating tags.");
		}
	});

	// Now, project data submission
	document.querySelectorAll(".editProject-form").forEach((form) => {
		form.addEventListener("submit", async (event) => {
			event.preventDefault(); // Prevent the default form submission

			const formData = new FormData(form);
			// Extract project ID from form action
			const projectId = form.action.split("/").slice(-2, -1)[0];
			// Convert FormData to a plain object
			const data = Object.fromEntries(formData.entries());

			try {
				// Validate the data before sending it to the server
				validateProjectData(data);

				const response = await fetch(`/projects/${projectId}/edit`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(data)
				});

				if (response.ok) {
					const result = await response.json();
					alert("Project updated successfully!");
					unsavedProjects.delete(data.title);
					updateUnsavedChangesWarning();
				} else {
					const error = await response.json();
					alert(`Error updating project: ${error.message}`);
				}
			} catch (error) {
				console.error("Validation or submission error:", error);
				alert(error.message || "An error occurred while updating the project.");
			}
		});
	});
});
