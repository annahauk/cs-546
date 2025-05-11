document.addEventListener("DOMContentLoaded", () => {
	const commentForm = document.querySelector("form[action$='/comments']");
	const commentTextarea = commentForm.querySelector("textarea[name='comment']");
	const projectId = commentForm.getAttribute("action").split("/")[2]; // Extract project ID from the form action
	const errorElement = document.createElement("p");
	errorElement.style.color = "red";
	errorElement.hidden = true;
	commentForm.appendChild(errorElement);

	if (commentForm) {
		commentForm.addEventListener("submit", async (e) => {
			e.preventDefault();
			errorElement.hidden = true;
			errorElement.textContent = "";

			// Validate the comment input
			const commentText = commentTextarea.value.trim();
			if (!commentText) {
				errorElement.hidden = false;
				errorElement.textContent = "Comment cannot be empty.";
				return;
			}
			if (commentText.length > 500) {
				errorElement.hidden = false;
				errorElement.textContent = "Comment cannot exceed 500 characters.";
				return;
			}

			// Construct the data object
			const data = { comment: commentText };

			// Send the comment via AJAX
			try {
				const response = await fetch(`/projects/${projectId}/comments`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					},
					body: JSON.stringify(data)
				});

				if (response.ok) {
					const updatedComments = await response.text();
					// Update the comments section with the new comments
					const commentsList = document.querySelector("ul");
					commentsList.outerHTML = updatedComments;
					commentTextarea.value = ""; // Clear the textarea
				} else {
					const error = await response.json();
					errorElement.hidden = false;
					errorElement.textContent = error.message || "Failed to post comment.";
				}
			} catch (err) {
				errorElement.hidden = false;
				errorElement.textContent = "An error occurred. Please try again.";
			}
		});
	}
});
