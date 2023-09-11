import React from "react";
import { set, useForm } from "react-hook-form";
import {
  ReadDatabaseDataFromExcel,
  GetDatabaseDataDateFormat,
} from "../../wailsjs/go/main/App";
import {
  handleBrowseExcelFile,
  handleGetExcelSheets,
  handleOpenMessageDialog,
} from "@/lib/browse";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";

import { FolderOpen } from "lucide-react";

interface IDatabaseFormValues {
  excelFile: string;
  sheet: string;
  timeFormat: string;
  month: number;
  year: number;
}

interface DatabaseFormProps {
  databaseData: any[];
  setDatabaseData: React.Dispatch<React.SetStateAction<any[]>>;
}

export const DatabaseForm: React.FC<DatabaseFormProps> = ({
  databaseData,
  setDatabaseData,
}) => {
  const [sheets, setSheets] = React.useState<string[]>([]);
  const [timeFormat, setTimeFormat] =
    React.useState<string>("select sheet first");
  const timeFormats: { label: string; value: string }[] = [
    { label: "d/m/yy", value: "2/1/06" },
    { label: "d/m/yyyy", value: "2/1/2006" },
    { label: "dd/mm/yy", value: "02/01/06" },
    { label: "dd/mm/yyyy", value: "02/01/2006" },
    { label: "m/d/yy", value: "1/2/06" },
    { label: "mm/dd/yyyy", value: "1/2/2006" },
    { label: "mm/dd/yy", value: "01/02/06" },
    { label: "mm/dd/yyyy", value: "01/02/2006" },

    { label: "m/d/yy hh:mm", value: "1/2/06 15:04" },
    { label: "m/d/yy hh:mm:ss", value: "1/2/06 15:04:05" },
    { label: "m/d/yyyy hh:mm", value: "1/2/2006 15:04" },
    { label: "m/d/yyyy hh:mm:ss", value: "1/2/2006 15:04:05" },
    { label: "mm/dd/yyyy hh:mm", value: "01/02/2006 15:04" },
    { label: "mm/dd/yyyy hh:mm:ss", value: "01/02/2006 15:04:05" },
    { label: "mm/dd/yy hh:mm", value: "01/02/06 15:04" },
    { label: "mm/dd/yy hh:mm:ss", value: "01/02/06 15:04:05" },
    { label: "d/m/yy hh:mm", value: "2/1/06 15:04" },
    { label: "d/m/yy hh:mm:ss", value: "2/1/06 15:04:05" },
    { label: "dd/mm/yy hh:mm", value: "02/01/06 15:04" },
    { label: "dd/mm/yy hh:mm:ss", value: "02/01/06 15:04:05" },
    { label: "dd/mm/yyyy hh:mm", value: "02/01/2006 15:04" },
    { label: "dd/mm/yyyy hh:mm:ss", value: "02/01/2006 15:04:05" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<IDatabaseFormValues>({
    defaultValues: {
      excelFile: "",
      sheet: "",
      timeFormat: "",
      month: 0,
      year: 0,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      const res = await ReadDatabaseDataFromExcel(
        data.excelFile,
        data.sheet,
        data.month,
        data.year,
        data.timeFormat
      );
      setDatabaseData(res);
      console.log(res);
      await handleOpenMessageDialog({
        messageType: "info",
        title: "Read Database Excel File",
        message: "Read Database Excel File Success",
      });
    } catch (error) {
      await handleOpenMessageDialog({
        messageType: "error",
        title: "Read Database Excel File",
        message: `${error}`,
      });
    } finally {
      reset();
    }
  });
  return (
    <form onSubmit={onSubmit}>
      <Badge
        variant={`${
          databaseData === null || databaseData.length < 1
            ? "destructive"
            : "default"
        }`}
        className="my-4"
      >
        {databaseData && databaseData.length > 0
          ? "data exist"
          : "data not exist"}
      </Badge>
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <Label>Select Database Excel File :</Label>
          <div className="flex items-center gap-2">
            <Input
              {...register("excelFile", {
                required: true,
              })}
            />
            <Button
              type="button"
              onClick={async () => {
                reset();
                const filePath = await handleBrowseExcelFile();
                const sheets = await handleGetExcelSheets(filePath);
                setValue("excelFile", filePath);
                setSheets(sheets);
              }}
            >
              <FolderOpen size={18} />
            </Button>
          </div>
          {errors.excelFile && (
            <Badge variant="destructive">This field is required</Badge>
          )}
        </div>

        <div>
          <Label>Select Sheet :</Label>
          <Select
            onValueChange={async (e) => {
              setValue("sheet", e);
              const timeFormat = await GetDatabaseDataDateFormat(
                watch("excelFile"),
                e
              );
              setTimeFormat(timeFormat);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a sheet" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className="h-32">
                <SelectLabel>Sheets</SelectLabel>
                <ScrollArea>
                  {sheets.map((sheet, index) => (
                    <SelectItem key={index} value={sheet}>
                      {sheet}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.sheet && (
            <Badge variant="destructive">This field is required</Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>
            Select Time Format :{" "}
            <Badge className="tracking-wider bg-blue-500 hover:bg-blue-300">
              {timeFormat}
            </Badge>
          </Label>
          <Select onValueChange={(e) => setValue("timeFormat", e)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a time format" />
            </SelectTrigger>
            <SelectContent className="w-full">
              <SelectGroup className="h-32">
                <SelectLabel>Sheets</SelectLabel>
                <ScrollArea>
                  {timeFormats.map(
                    (format, index) =>
                      format.value.length === timeFormat.length && (
                        <SelectItem key={index} value={format.value}>
                          {format.label}
                        </SelectItem>
                      )
                  )}
                </ScrollArea>
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.sheet && (
            <Badge variant="destructive">This field is required</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Years */}
          <div>
            <Label>Year :</Label>
            <Select onValueChange={(e) => setValue("year", parseInt(e))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a year" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="h-32">
                  <SelectLabel>Years</SelectLabel>
                  <ScrollArea>
                    {/* get today year and minus 1 year and add 2 year */}
                    {new Array(4).fill(0).map((_, index) => {
                      const year = new Date().getFullYear() - 1 + index;
                      return (
                        <SelectItem key={index} value={String(year)}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </ScrollArea>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.year && (
              <Badge variant="destructive">This field is required</Badge>
            )}
          </div>

          {/* Months */}
          <div>
            <Label>Month :</Label>
            <Select onValueChange={(e) => setValue("month", parseInt(e))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a month" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup className="h-32">
                  <SelectLabel>Months</SelectLabel>
                  <ScrollArea>
                    <SelectItem value={"1"}>January</SelectItem>
                    <SelectItem value={"2"}>February</SelectItem>
                    <SelectItem value={"3"}>March</SelectItem>
                    <SelectItem value={"4"}>April</SelectItem>
                    <SelectItem value={"5"}>May</SelectItem>
                    <SelectItem value={"6"}>June</SelectItem>
                    <SelectItem value={"7"}>July</SelectItem>
                    <SelectItem value={"8"}>August</SelectItem>
                    <SelectItem value={"9"}>September</SelectItem>
                    <SelectItem value={"10"}>October</SelectItem>
                    <SelectItem value={"11"}>November</SelectItem>
                    <SelectItem value={"12"}>December</SelectItem>
                  </ScrollArea>
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.month && (
              <Badge variant="destructive">This field is required</Badge>
            )}
          </div>
        </div>
      </div>

      <div>
        <Button type="submit" className="mt-4">
          <span>Generate Database Data</span>
        </Button>
      </div>
    </form>
  );
};
