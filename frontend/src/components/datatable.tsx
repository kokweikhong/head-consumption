import { PlotData } from "@/App";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Badge } from "./ui/badge";

export interface DataTableProps {
  data: PlotData;
  shift?: "day" | "night";
}

const DayShiftTableBody: React.FC<
  DataTableProps & { tableHeaders: string[] }
> = ({ data, tableHeaders }) => {
  return (
    <TableBody>
      {data.dates.map((date, idx) => (
        <TableRow key={idx}>
          <TableCell className="sticky left-0 bg-white whitespace-nowrap">
            {date}
          </TableCell>
          {tableHeaders.map((header) => (
            <>
              <TableCell>
                <Badge
                  className={`${
                    data.data[header].manualDayQty[idx] !==
                    data.data[header].databaseDayQty[idx]
                      ? "bg-red-500"
                      : data.data[header].manualDayQty[idx] === 0
                      ? "bg-gray-700"
                      : "bg-green-500"
                  }`}
                >
                  {data.data[header].manualDayQty[idx]}
                </Badge>{" "}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${
                    data.data[header].manualDayQty[idx] !==
                    data.data[header].databaseDayQty[idx]
                      ? "bg-red-500"
                      : data.data[header].databaseDayQty[idx] === 0
                      ? "bg-gray-700"
                      : "bg-green-500"
                  }`}
                >
                  {data.data[header].databaseDayQty[idx]}
                </Badge>
              </TableCell>
            </>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

const NightShiftTableBody: React.FC<
  DataTableProps & { tableHeaders: string[] }
> = ({ data, tableHeaders }) => {
  return (
    <TableBody>
      {data.dates.map((date, idx) => (
        <TableRow key={idx}>
          <TableCell className="sticky left-0 bg-white whitespace-nowrap">
            {date}
          </TableCell>
          {tableHeaders.map((header) => (
            <>
              <TableCell>
                <Badge
                  className={`${
                    data.data[header].manualNightQty[idx] !==
                    data.data[header].databaseNightQty[idx]
                      ? "bg-red-500"
                      : data.data[header].manualNightQty[idx] === 0
                      ? "bg-gray-700"
                      : "bg-green-500"
                  }`}
                >
                  {data.data[header].manualNightQty[idx]}
                </Badge>{" "}
              </TableCell>
              <TableCell>
                <Badge
                  className={`${
                    data.data[header].manualNightQty[idx] !==
                    data.data[header].databaseNightQty[idx]
                      ? "bg-red-500"
                      : data.data[header].databaseNightQty[idx] === 0
                      ? "bg-gray-700"
                      : "bg-green-500"
                  }`}
                >
                  {data.data[header].databaseNightQty[idx]}
                </Badge>
              </TableCell>
            </>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

export const DataTable: React.FC<DataTableProps> = ({ data, shift }) => {
  console.log(data);
  const tableHeaders = Object.keys(data.data);
  console.log(tableHeaders);

  return (
    <div className="h-[500px] overflow-auto relative">
      <Table className="absolute top-0 left-0">
        <TableCaption className="capitalize">{`${shift} Shift Head Consumption Data`}</TableCaption>
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow className="pb-0 bg-white">
            <TableHead className="sticky left-0 z-20 bg-white">Date</TableHead>
            {tableHeaders.map((header) => (
              <TableHead key={header} colSpan={2} className="text-center">
                {header}
              </TableHead>
            ))}
          </TableRow>
          <TableRow className="pt-0 bg-white">
            <TableHead className="sticky left-0 z-20 bg-white"></TableHead>
            {tableHeaders.map((header) => (
              <React.Fragment key={header}>
                <TableHead>Manual</TableHead>
                <TableHead>Database</TableHead>
              </React.Fragment>
            ))}
          </TableRow>
        </TableHeader>
        {shift === "night" ? (
          <NightShiftTableBody data={data} tableHeaders={tableHeaders} />
        ) : (
          <DayShiftTableBody data={data} tableHeaders={tableHeaders} />
        )}
      </Table>
    </div>
  );
};
