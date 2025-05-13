document.addEventListener("DOMContentLoaded", () => {
	const likeButton = document.getElementById("likeButton");
	const likeCountSpan = document.getElementById("likeCount");

	if (likeButton) {
		likeButton.addEventListener("click", async () => {
			const projectId = likeButton.getAttribute("data-project-id");

			try {
				const response = await fetch(`/projects/${projectId}/like`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (!response.ok) {
					throw new Error("Failed to like the project");
				}

				const data = await response.json();
				likeCountSpan.textContent = `${data.likes} Likes`; // Update like count dynamically
			} catch (error) {
				console.error("Error liking the project:", error);
			}
		});
	}
});
