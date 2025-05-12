document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("projectcreate-form");
	let errorElement = document.getElementById("error");
	if (form) {
		form.addEventListener("submit", async (e) => {
			errorElement.hidden = true;
			errorElement.innerHTML = "";
			const errors = [];

			// Retrieve form values
			const title = form.title.value.trim();
			const description = form.description.value.trim();
			const repoLink = form.repoLink.value.trim();

			// Retrieve selected tags and languages
			const tags = Array.from(form.tags.options)
				.filter((option) => option.selected)
				.map((option) => option.value);

			const languages = Array.from(form.languages.options)
				.filter((option) => option.selected)
				.map((option) => option.value);

			const combinedTags = [...tags, ...languages];

			// Validate inputs
			if (!title) errors.push("Title is required.");
			if (!description) errors.push("Description is required.");
			if (!repoLink || !/^https?:\/\/.+/.test(repoLink))
				errors.push("A valid repository link is required.");
			if (combinedTags.length === 0)
				errors.push("Please select at least one tag or language.");

			// Display errors if any
			if (errors.length > 0) {
				e.preventDefault();
				errorElement.hidden = false;
				errorElement.innerHTML = errors.join("<br>");
				return;
			}

			// Construct the data object
			const data = {
				title,
				description,
				repoLink,
				combinedTags
			};

			// Submit the form via AJAX
			try {
				const response = await fetch("/projects/projectcreate", {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(data)
				});

				if (response.ok) {
					window.location.href = "/projects";
				} else {
					const error = await response.json();
					errorElement.hidden = false;
					errorElement.innerHTML = error.message || "Failed to create project.";
				}
			} catch (err) {
				errorElement.hidden = false;
				errorElement.innerHTML = "An error occurred. Please try again.";
			}
		});
	}
});
