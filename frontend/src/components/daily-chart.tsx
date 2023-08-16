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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DailyChartProps {
  dates: string[];
  manualData: number[];
  databaseData: number[];
}

export const DailyChart: React.FC<DailyChartProps> = ({
  dates,
  manualData,
  databaseData,
}) => {
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

  const data = {
    labels: dates,
    datasets: [
      {
        label: "Manual Data",
        data: manualData,
        // orange background color
        backgroundColor: "rgb(255, 159, 64)",
      },
      {
        label: "Database Data",
        data: databaseData,
        // green background color
        backgroundColor: "rgb(75, 192, 192)",
      },
    ],
  };
  return <Bar options={options} data={data} />;
};
