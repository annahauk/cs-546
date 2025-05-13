document.addEventListener("DOMContentLoaded", async () => {
    function plotChartJS(chartData = { tags: ["Test"], counts: [1] }, name = "", id = "") {
        const container = document.getElementById(id);
        if (!container) return;

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        new Chart(canvas, {
            type: 'pie',
            data: {
                labels: chartData.tags,
                datasets: [{
                    data: chartData.counts,
                    backgroundColor: [
                        '#1A73E8', '#4285F4', '#74A9F9', '#0F5BDC', '#185ABC',
                        '#5B9DF5', '#8A6BF8', '#A178F8', '#B18CF9', '#C29EF9'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `Top ${name} Tags`,
                        font: {
                            size: 18
                        }
                    },
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                const data = tooltipItem.chart.data;
                                const dataset = data.datasets[tooltipItem.datasetIndex];
                                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                                const value = dataset.data[tooltipItem.dataIndex];
                                const percentage = ((value / total) * 100).toFixed(1);
                                const label = data.labels[tooltipItem.dataIndex];
                                return `${label}: ${percentage}% (${value})`;
                            }
                        }
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const total = data.reduce((sum, val) => sum + val, 0);
                            const percentage = (value / total * 100).toFixed(1);
                            return `${percentage}%`;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    const userTagsChart = document.getElementById("userTagsChart");
    const postTagsChart = document.getElementById("postTagsChart");

    if (userTagsChart && postTagsChart) {
        try {
            plotChartJS(JSON.parse(userTagsChart.dataset.chartData), "User", "userTagsChart");
            plotChartJS(JSON.parse(postTagsChart.dataset.chartData), "Post", "postTagsChart");
        } catch (error) {
            console.error("Error parsing chart data:", error);
        }
    }
});
