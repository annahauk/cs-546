document.addEventListener("DOMContentLoaded", () => {
	const commentForm = document.querySelector("form[action$='/join']");
	const commentTextarea = commentForm.querySelector("textarea[name='text']");
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
			if (commentText && commentText.length > 200) {
				errorElement.hidden = false;
				errorElement.textContent = "Comment cannot exceed 200 characters.";
				return;
			}
            commentForm.submit();
		});
	}
});
