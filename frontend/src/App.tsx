import React from "react";

import { FormDialog } from "./components/form-dialog";
import { ManualDataForm } from "./components/manual-data-form";
import { DatabaseForm } from "./components/database-form";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "./components/ui/label";
import { Button } from "./components/ui/button";

import { GeneratePlotData } from "../wailsjs/go/main/App";

import { OverviewChart } from "./components/overview-chart";
import { DailyChart } from "./components/daily-chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { ScrollArea } from "./components/ui/scroll-area";

import { handleOpenMessageDialog } from "./lib/browse";

export interface PlotData {
  dates: string[];
  data: {
    [key: string]: {
      headType: string;
      headSurface: string;
      manualQty: number[];
      databaseQty: number[];
    };
  };
}

function App() {
  const [manualData, setManualData] = React.useState<any[]>([]);
  const [databaseData, setDatabaseData] = React.useState<any[]>([]);
  const [plotData, setPlotData] = React.useState<PlotData>();
  const [year, setYear] = React.useState<number>(0);
  const [month, setMonth] = React.useState<number>(0);

  async function handleGeneratePlotData() {
    console.log(month, year);
    try {
      const res = await GeneratePlotData(manualData, databaseData, month, year);
      setPlotData(res);
      await handleOpenMessageDialog({
        messageType: "info",
        title: "Generate Plot Data",
        message: "Plot data generated successfully",
      });
    } catch (err) {
      console.log(err);
      await handleOpenMessageDialog({
        messageType: "error",
        title: "Generate Plot Data",
        message: "Failed to generate plot data",
      });
    }
  }

  return (
    <main className="container">
      <h1 className="text-4xl font-black mb-4">Head Consumption Monitoring</h1>
      <div className="flex gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span>Manual Data Exist : </span>
            <Badge>{manualData.length > 0 ? "Exist" : "Not Exist"}</Badge>
          </div>
          <div>
            <FormDialog
              triggerText="Open Manual Data Form"
              formTitle="Manual Data Form"
            >
              <ManualDataForm
                manualData={manualData}
                setManualData={setManualData}
              />
            </FormDialog>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <span>Database Data Exist : </span>
            <Badge>{databaseData?.length > 0 ? "Exist" : "Not Exist"}</Badge>
          </div>
          <div>
            <FormDialog
              triggerText="Open Database Data Form"
              formTitle="Database Data Form"
            >
              <DatabaseForm
                databaseData={databaseData}
                setDatabaseData={setDatabaseData}
              />
            </FormDialog>
          </div>
        </div>
      </div>
      <Separator className="my-4" />

      {manualData.length > 0 && databaseData.length > 0 && (
        <React.Fragment>
          <div className="flex gap-2 items-center">
            <div>
              <Label>Select Year :</Label>
              <Select
                value={year.toString()}
                onValueChange={(e) => setYear(parseInt(e))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a sheet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="h-32">
                    <SelectLabel>Sheets</SelectLabel>
                    <ScrollArea>
                      {/* years from current - 1 and + 2 */}
                      {Array.from(Array(4).keys()).map((i) => {
                        return (
                          <SelectItem
                            key={i}
                            value={(
                              new Date().getFullYear() -
                              1 +
                              i
                            ).toString()}
                          >
                            {new Date().getFullYear() - 1 + i}
                          </SelectItem>
                        );
                      })}
                    </ScrollArea>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Month :</Label>
              <Select
                value={month.toString()}
                onValueChange={(e) => setMonth(parseInt(e))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a sheet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup className="h-32">
                    <SelectLabel>Sheets</SelectLabel>
                    <ScrollArea>
                      {/* 12 months */}
                      {Array.from(Array(12).keys()).map((i) => {
                        return (
                          <SelectItem key={i} value={(i + 1).toString()}>
                            {/* Convert to english */}
                            {new Date(0, i).toLocaleString("en", {
                              month: "long",
                            })}
                          </SelectItem>
                        );
                      })}
                    </ScrollArea>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="self-end">
              <Button onClick={handleGeneratePlotData}>
                Generate Plot Data
              </Button>
            </div>
          </div>
        </React.Fragment>
      )}
      {plotData && plotData.dates.length > 0 && (
        <React.Fragment>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-1">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Monthly Head Consumption Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <OverviewChart plotData={plotData ?? { dates: [], data: {} }} />
              </CardContent>
            </Card>

            {Object.keys(plotData.data).map((key) => {
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle>{key}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-60">
                    <DailyChart
                      dates={plotData.dates}
                      manualData={plotData.data[key].manualQty}
                      databaseData={plotData.data[key].databaseQty}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </React.Fragment>
      )}
    </main>
  );
}

export default App;
