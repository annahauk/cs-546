document.addEventListener("DOMContentLoaded", async () => {
    const userTagsChart = document.getElementById("userTagsChart");
    if (userTagsChart) {
        try {
            const chartData = JSON.parse(userTagsChart.dataset.chartData);

            let data = [{
                values: chartData.counts,
                labels: chartData.tags,
                type: 'pie'
            }];

            const layout = {
                title: "Top User Tags",
                height: 400,
                width: 500
            };

            Plotly.newPlot('userTagsChart', data, layout);
        } catch (error) {
            console.error("Error parsing chart data:", error);
        }
    }
});