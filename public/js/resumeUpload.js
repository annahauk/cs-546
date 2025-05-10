// Listens for resume upload and will go and make an AJAX request for the resume upload
const form = document.getElementById("resume-form");
if (form) {
	form.addEventListener("submit", async function (event) {
		event.preventDefault();
		const formData = new FormData(form);
		const userId = "{{user.id}}";
		try {
			const response = await fetch(`/profile/${userId}/resume`, {
				method: "POST",
				body: formData
			});
			if (!response.ok) {
				const errorText = await response.text();
				alert("Upload failed: " + errorText);
				return;
			}
			alert("Resume uploaded successfully!");
		} catch (err) {
			alert("An error occurred: " + err.message);
		}
	});
}
