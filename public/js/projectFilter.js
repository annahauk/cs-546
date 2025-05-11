$(document).ready(function () {
	// Realized that the buttons were finnicky, so now making it so that the filter button can't be clicked if no filters are activated
	const filterButton = $("#filterSelection-form button[type='submit']");

	// Function to check if any filters are selected
	function updateFilterButtonState() {
		const searchInput = $('input[name="search"]').val().trim();
		const tagsChecked = $("#tags").val() && $("#tags").val().length > 0;
		const languagesChecked =
			$("#languages").val() && $("#languages").val().length > 0;
		const statusSelected = $("#status").val() !== "";

		// Enable the button if any filter is selected, otherwise disable it
		if (searchInput || tagsChecked || languagesChecked || statusSelected) {
			filterButton.prop("disabled", false);
		} else {
			filterButton.prop("disabled", true);
		}
	}

	// Attach event listeners to form inputs to monitor changes
	$('input[name="search"]').on("input", updateFilterButtonState);
	$("#tags").on("change", updateFilterButtonState);
	$("#languages").on("change", updateFilterButtonState);
	$("#status").on("change", updateFilterButtonState);

	// Initialize the button state on page load
	updateFilterButtonState();

	// Attach a submit event listener to the form
	$("#filterSelection-form").on("submit", function (event) {
		// Prevent the default form submission
		event.preventDefault();

		// Validate inputs
		const searchInput = $('input[name="search"]').val().trim();
		if (
			searchInput.length > 0 &&
			!/^[a-zA-Z0-9\s\-#@!&()_+.,]+$/.test(searchInput)
		) {
			alert("Search input contains invalid characters.");
			return;
		}

		// Manually construct the data object from form inputs
		const formData = {
			search: $('input[name="search"]').val().trim(),
			tags: $("#tags").val(),
			languages: $("#languages").val(),
			status: $("#status").val(),
			reset: false
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
				// Update filter button state
				updateFilterButtonState();
			})
			.catch(function (error) {
				console.error("Error fetching filtered projects:", error);
				alert(
					"An error occurred while fetching the filtered projects. Please try again."
				);
			});
	});

	// Reset Filters Button Functionality
	$("#resetFilters").on("click", function () {
		// Reset the form fields
		$("#filterSelection-form")[0].reset();
		const formData = {
			search: "",
			tags: [],
			languages: [],
			status: "",
			reset: true
		};
		// Fetch all projects by sending an empty filter request
		$.ajax({
			url: "/projects",
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			// Send an empty object to fetch all projects
			data: JSON.stringify(formData)
		})
			.then(function (response) {
				// Update the projects area with all projects
				$(".projectsArea").html(response);
				// Update filter button state
				updateFilterButtonState();
			})
			.catch(function (error) {
				console.error("Error resetting filters:", error);
				alert(
					"An error occurred while resetting the filters. Please try again."
				);
			});
	});
});
