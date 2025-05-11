$(document).ready(function () {
	// Attach a submit event listener to the form
	$("#filterSelection-form").on("submit", function (event) {
		// Prevent the default form submission
		event.preventDefault();

		// Validate inputs
		const searchInput = $('input[name="search"]').val().trim();
		if (searchInput.length > 0 && !/^[a-zA-Z0-9\s]+$/.test(searchInput)) {
			alert("Search input contains invalid characters.");
			return;
		}

		// Manually construct the data object from form inputs
		const formData = {
			search: $('input[name="search"]').val().trim(),
			tags: $('input[name="tags"]:checked')
				.map(function () {
					return this.value;
				})
				.get(),
			language: $("#language").val(),
			status: $("#status").val()
		};

		// Send the AJAX request using POST
		$.ajax({
			url: "/projects",
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			// Send data as JSON in the request body
			data: JSON.stringify(formData)
		})
			.then(function (response) {
				//Server returns the filtered HTML content
				console.log("Response received:", response);
				// Update the projects area with the filtered content
				$(".projectsArea").html(response);
			})
			.catch(function (error) {
				console.error("Error fetching filtered projects:", error);
				alert(
					"An error occurred while fetching the filtered projects. Please try again."
				);
			});
	});
});
