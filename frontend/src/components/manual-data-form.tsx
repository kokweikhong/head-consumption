import React from "react";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { FolderOpen } from "lucide-react";

import { ReadManualDataFromExcel } from "../../wailsjs/go/main/App";

import {
  handleBrowseExcelFile,
  handleGetExcelSheets,
  handleOpenMessageDialog,
} from "@/lib/browse";

import { useForm } from "react-hook-form";

interface ManualFormDataProps {
  manualExcelFile: string;
  manualExcelSheets: string[];
  selectedManualExcelSheets: string[];
  month: number;
  year: number;
}

interface ManualDataFormProps {
  manualData: any[];
  setManualData: React.Dispatch<React.SetStateAction<any[]>>;
}

export const ManualDataForm: React.FC<ManualDataFormProps> = ({
  manualData,
  setManualData,
}) => {
  const [manualFormData, setManualFormData] =
    React.useState<ManualFormDataProps>({
      manualExcelFile: "",
      manualExcelSheets: [],
      selectedManualExcelSheets: [],
      month: 0,
      year: 0,
    });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ManualFormDataProps>({ defaultValues: manualFormData });

  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log(data.selectedManualExcelSheets);
      const res = await ReadManualDataFromExcel(
        data.manualExcelFile,
        data.selectedManualExcelSheets,
        data.month,
        2023
      );
      console.log(res);
      setManualData(res);
      await handleOpenMessageDialog({
        messageType: "info",
        title: "Read Manual Data From Excel",
        message: "Read Manual Data From Excel Success",
      });
    } catch (error) {
      console.log(error);
      await handleOpenMessageDialog({
        messageType: "error",
        title: "Read Manual Data From Excel",
        message: `${error}`,
      });
    }
  });
  return (
    <form onSubmit={onSubmit}>
      <Badge
        variant={`${manualData.length < 1 ? "destructive" : "default"}`}
        className="my-4"
      >
        {manualData && manualData.length > 0 ? "data exist" : "data not exist"}
      </Badge>
      <div className="flex flex-col gap-2">
        <Label>Select Manual Excel File :</Label>
        <div className="flex gap-2 items-center">
          <Input
            value={manualFormData.manualExcelFile}
            {...register("manualExcelFile", {
              required: true,
            })}
          />
          <Button
            type="button"
            onClick={async () => {
              const filePath = await handleBrowseExcelFile();
              const sheets = await handleGetExcelSheets(filePath);
              setValue("manualExcelFile", filePath);
              setValue("manualExcelSheets", sheets);
              setManualFormData({
                ...manualFormData,
                manualExcelFile: filePath,
                manualExcelSheets: sheets,
              });
            }}
          >
            <FolderOpen size={18} />
          </Button>
        </div>
        <div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                <span>
                  <span>Select Manual Excel Sheets : </span>
                  <span>
                    <Badge>
                      {manualFormData.selectedManualExcelSheets.length}
                    </Badge>
                    <span> / </span>
                    <Badge>{manualFormData.manualExcelSheets.length}</Badge>
                  </span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant={"secondary"}
                    onClick={() => {
                      const sheets = manualFormData.manualExcelSheets;
                      setManualFormData({
                        ...manualFormData,
                        selectedManualExcelSheets: sheets,
                      });
                      setValue("selectedManualExcelSheets", sheets);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant={"secondary"}
                    onClick={() => {
                      const sheets: string[] = [];
                      setManualFormData({
                        ...manualFormData,
                        selectedManualExcelSheets: sheets,
                      });
                      setValue("selectedManualExcelSheets", sheets);
                    }}
                  >
                    Reset
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {manualFormData.manualExcelSheets.map((sheet, index) => (
                    <div key={index}>
                      <Label className="flex gap-2">
                        <Checkbox
                          value={sheet}
                          onCheckedChange={(e) => {
                            const checked = e;
                            if (checked) {
                              const sheets = [
                                ...manualFormData.selectedManualExcelSheets,
                                sheet,
                              ];
                              setManualFormData({
                                ...manualFormData,
                                selectedManualExcelSheets: sheets,
                              });
                              setValue("selectedManualExcelSheets", sheets);
                            } else {
                              const sheets =
                                manualFormData.selectedManualExcelSheets.filter(
                                  (s) => s !== sheet
                                );
                              setManualFormData({
                                ...manualFormData,
                                selectedManualExcelSheets: sheets,
                              });
                              setValue("selectedManualExcelSheets", sheets);
                            }
                          }}
                          checked={manualFormData.selectedManualExcelSheets.includes(
                            sheet
                          )}
                        />
                        <span>{sheet}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex gap-2 items-center">
          {/* Years */}
          <div>
            <Label>Year :</Label>
            <Select
              value={String(manualFormData.year)}
              onValueChange={(e) => {
                setValue("year", parseInt(e));
                setManualFormData({
                  ...manualFormData,
                  year: parseInt(e),
                });
              }}
            >
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
          </div>

          {/* Months */}
          <div>
            <Label>Month :</Label>
            <Select
              value={String(manualFormData.month)}
              onValueChange={(e) => {
                setValue("month", parseInt(e));
                setManualFormData({
                  ...manualFormData,
                  month: parseInt(e),
                });
              }}
            >
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
          </div>
        </div>
      </div>

      <div>
        <Button type="submit" className="mt-4">
          <span>Generate Manual Data</span>
        </Button>
      </div>
    </form>
  );
};
