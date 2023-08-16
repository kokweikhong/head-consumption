import React from "react";
import { useForm } from "react-hook-form";
import { ReadDatabaseDataFromExcel } from "../../wailsjs/go/main/App";
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

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IDatabaseFormValues>({
    defaultValues: {
      excelFile: "",
      sheet: "",
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
        data.year
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
        <Label>Select Database Excel File :</Label>
        <div className="flex gap-2 items-center">
          <Input
            {...register("excelFile", {
              required: true,
            })}
          />
          <Button
            type="button"
            onClick={async () => {
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

        <div>
          <Label>Select Sheet :</Label>
          <Select onValueChange={(e) => setValue("sheet", e)}>
            <SelectTrigger className="w-[180px]">
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

        <div className="flex gap-2 items-center">
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
