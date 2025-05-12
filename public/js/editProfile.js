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
});
