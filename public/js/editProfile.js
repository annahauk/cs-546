// Handle project selection and form display
document.addEventListener("DOMContentLoaded", function () {
	const projectSelector = document.getElementById("projectSelector");
	const projectForms = document.querySelectorAll(".projectForm");

	projectSelector.addEventListener("change", function () {
		const selectedProjectId = this.value;

		// Hide all project forms
		projectForms.forEach((form) => (form.style.display = "none"));

		// Show the selected project form
		const selectedForm = document.getElementById(selectedProjectId);
		if (selectedForm) {
			selectedForm.style.display = "block";
		}
	});
});
