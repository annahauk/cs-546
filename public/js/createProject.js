document.addEventListener("DOMContentLoaded", () => {
	const form = document.getElementById("projectcreate-form");
	let errorElement = document.getElementById("error");
	if (form) {
		form.addEventListener("submit", async (e) => {
			errorElement.hidden = true;
			errorElement.innerHTML = "";
			const errors = [];

			const title = form.title.value.trim();
			const description = form.description.value.trim();
			const repoLink = form.repoLink.value.trim();
			const tags = Array.from(
				document.querySelectorAll('input[name="topic_tags"]:checked')
			).map((cb) => cb.value);

			if (!title) errors.push("Title is required.");
			if (!description) errors.push("Description is required.");
			if (!repoLink || !/^https?:\/\/.+/.test(repoLink))
				errors.push("A valid repository link is required.");
			if (tags.length === 0) errors.push("Please select at least one tag.");

			if (errors.length > 0) {
				e.preventDefault();
				errorElement.hidden = false;
				errorElement.innerHTML = errors.join("<br>");
				return;
			}

			const data = {
				title,
				description,
				repoLink,
				topic_tags: tags
			};

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
