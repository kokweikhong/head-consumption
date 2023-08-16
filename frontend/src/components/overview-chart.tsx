import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { PlotData } from "@/App";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface OverviewChartProps {
  plotData: PlotData;
}

export const OverviewChart: React.FC<OverviewChartProps> = ({ plotData }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Monthly Headconsumption Overview",
      },
    },
  };

  // labels from plotData data object keys
  const labels = Object.keys(plotData.data);

  const data = {
    labels,
    datasets: [
      {
        label: "Manual Data",
        // loop labels and place the correct index and sum the value
        // plotData.data[label].reduce is not a function
        data: labels.map((label) =>
          plotData.data[label].manualQty.reduce((a, b) => a + b, 0)
        ),
        // blue color
        backgroundColor: "rgb(54, 162, 235)",
      },
      {
        label: "Database Data",
        // loop labels and place the correct index and sum the value
        data: labels.map((label) =>
          plotData.data[label].databaseQty.reduce((a, b) => a + b, 0)
        ),
        // purple color
        backgroundColor: "rgb(153, 102, 255)",
      },
    ],
  };
  return <Bar options={options} data={data} />;
};
