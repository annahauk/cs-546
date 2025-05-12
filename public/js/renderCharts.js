document.addEventListener("DOMContentLoaded", async () => {
    function plot(chartData={tags: "Test", counts: [1]}, name="", id="") {
        /*chartData = {
            tags: ["JavaScript", "Python", "Java", "C++", "Ruby"],
            counts: [10, 20, 15, 5, 8]
        };
        console.log("Chart Data:", chartData);*/
        let data = [{
            values: chartData.counts,
            labels: chartData.tags,
            type: 'pie'
        }];

        const layout = {
            title: `Top ${name} Tags`,
            height: 400,
            width: 500
        };

        Plotly.newPlot(id, data, layout);
    };
    const userTagsChart = document.getElementById("userTagsChart");
    const postTagsChart = document.getElementById("postTagsChart");
    if (userTagsChart && postTagsChart) {
        try {
            plot(userTagsChart.dataset.userChartData, "User", "userTagsChart");
            plot(postTagsChart.dataset.postChartData, "Post", "postTagsChart");
        } catch (error) {
            console.error("Error parsing chart data:", error);
        }
    }
});