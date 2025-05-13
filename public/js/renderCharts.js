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
            type: 'pie',
            marker: {
                colors: [
                    '#a0e7f2',
                    '#f2a5a0',
                    '#a0f2af',
                    '#f2a0ed'
                ]
            }
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
            plot(JSON.parse(userTagsChart.dataset.chartData), "User", "userTagsChart");
            plot(JSON.parse(postTagsChart.dataset.chartData), "Post", "postTagsChart");
        } catch (error) {
            console.error("Error parsing chart data:", error);
        }
    }
});