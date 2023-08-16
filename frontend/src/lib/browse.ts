import {
  OpenMessageDialog,
  BrowseExcelFile,
  GetExcelSheets,
} from "../../wailsjs/go/main/App";

export async function handleOpenMessageDialog({
  messageType,
  title,
  message,
}: {
  messageType: "info" | "warning" | "error";
  title: string;
  message: string;
}) {
  await OpenMessageDialog(messageType, title, message);
}

export const handleBrowseExcelFile = async (): Promise<string> => {
  const title = "Read Excel File";
  try {
    const filePath = await BrowseExcelFile();
    await handleOpenMessageDialog({
      messageType: "info",
      title: title,
      message: `Successfully read excel file from ${filePath}`,
    });
    return filePath;
  } catch (error) {
    await handleOpenMessageDialog({
      messageType: "error",
      title: title,
      message: `Failed to read excel file. ${error}`,
    });
    return "";
  }
};

export const handleGetExcelSheets = async (
  filePath: string
): Promise<string[]> => {
  try {
    const sheets = await GetExcelSheets(filePath);
    return sheets;
  } catch (error) {
    console.error(error);
    return [];
  }
};
