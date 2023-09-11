package main

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/gommon/log"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/xuri/excelize/v2"
	"golang.org/x/exp/slices"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) BrowseExcelFile() (string, error) {
	return runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Excel File",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Excel Files (*.xlsx;*.xlsm;*.xls)",
				Pattern:     "*.xlsx;*.xlsm;*.xls",
			},
		},
	})
}

func (a *App) BrowseDirectory() (string, error) {
	return runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Select Directory",
	})
}

func (a *App) OpenMessageDialog(status, title, message string) (string, error) {
	statusType := runtime.DialogType(status)
	return runtime.MessageDialog(a.ctx, runtime.MessageDialogOptions{
		Type:    statusType,
		Title:   title,
		Message: message,
	})
}

func (a *App) GetExcelSheets(excelFile string) ([]string, error) {
	file, err := excelize.OpenFile(excelFile)
	if err != nil {
		return nil, err
	}
	return file.GetSheetList(), nil
}

type HeadConsumptionData struct {
	Date        string `json:"date"`
	Shift       string `json:"shift"`
	HeadType    string `json:"headType"`
	HeadSurface string `json:"headSurface"`
	Quantity    int    `json:"quantity"`
	Type        string `json:"type"`
}

func (a *App) ReadManualDataFromExcel(excelFile string, sheets []string, month, year int) ([]*HeadConsumptionData, error) {
	file, err := excelize.OpenFile(excelFile)
	if err != nil {
		return nil, err
	}
	var (
		datas         []*HeadConsumptionData
		data          *HeadConsumptionData
		headUsageCols = []string{"H", "L"}
		rowNumbers    = []int{6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17}
	)

	for _, sheet := range sheets {
		for _, rowNumber := range rowNumbers {

			for _, headUsageCol := range headUsageCols {
				isHeadUsage, _ := file.GetCellValue(sheet, fmt.Sprintf("%s5", headUsageCol))
				if !strings.Contains(strings.ToLower(isHeadUsage), "usage") {
					continue
				}

				data = new(HeadConsumptionData)

				switch headUsageCol {
				case "H":
					data.Shift = "Day"
				case "L":
					data.Shift = "Night"
				}
				quantity, _ := file.GetCellValue(sheet, fmt.Sprintf("%s%d", headUsageCol, rowNumber))
				data.Quantity, _ = strconv.Atoi(quantity)
				if data.Quantity < 1 {
					continue
				}
				switch rowNumber {
				case 6:
					data.HeadType = "AHEAD - TEK"
					data.HeadSurface = "3122"
				case 7:
					data.HeadType = "AHEAD - TEK"
					data.HeadSurface = "3125"
				case 8, 9:
					data.HeadType = "FEMTO"
				case 10, 11:
					data.HeadType = "DFH"
				case 12, 13:
					data.HeadType = "HFH TIGER 3"
				case 14, 15:
					data.HeadType = "WDB WWH"
				case 16, 17:
					data.HeadType = "PMR6 PIH"
				}
				data.Date = fmt.Sprintf("%s-%02d-%02d", sheet, month, year)
				if data.HeadSurface == "" {
					data.HeadSurface, _ = file.GetCellValue(sheet, fmt.Sprintf("D%d", rowNumber))
				}
				data.Type = "manual"
				datas = append(datas, data)
				fmt.Println(data)
			}
		}

	}
	fmt.Println(datas)
	return datas, nil
}

func (a *App) GetDatabaseDataDateFormat(excelFile, sheet string) (string, error) {
	file, err := excelize.OpenFile(excelFile)
	if err != nil {
		return "", err
	}
	date, err := file.GetCellValue(sheet, "A3")
	if err != nil {
		return "", err
	}
	return date, nil
}

func (a *App) ReadDatabaseDataFromExcel(excelFile string, sheet string, month, year int, timeFormat string) ([]*HeadConsumptionData, error) {
	fmt.Println(excelFile, sheet, month, year)
	file, err := excelize.OpenFile(excelFile)
	if err != nil {
		return nil, err
	}
	var (
		datas []*HeadConsumptionData
		data  *HeadConsumptionData
	)

	rows, err := file.GetRows(sheet)
	if err != nil {
		return nil, err
	}

	for _, row := range rows {
		if len(row) < 15 {
			continue
		}

		fmt.Printf("date is: %s\n", row[0])
		// check if row[0] is start with number or not
		_, err := strconv.Atoi(row[0][:1])
		if err != nil {
			log.Printf("row[0] is not a date: %s", row[0])
			continue
		}

		if strings.Contains(row[0], "-") {
			row[0] = strings.ReplaceAll(row[0], "-", "/")
		}

		date, err := time.Parse(timeFormat, row[0])
		if err != nil {
			fmt.Printf("error parsing date: %s", err)
			continue
		}

		data = new(HeadConsumptionData)
		switch strings.ToLower(row[18]) {
		case "d":
			data.Shift = "Day"
		case "n":
			data.Shift = "Night"
		}

		if date.Day() == 1 && int(date.Month()) == month+1 && date.Year() == year {
			// get last day of month
			lastDay := time.Date(date.Year(), date.Month(), 0, 0, 0, 0, 0, time.UTC).Day()
			data.Date = fmt.Sprintf("%02d-%02d-%02d", lastDay, month, year)
		}

		data.Date = date.Format("02-01-2006")
		switch true {
		case strings.Contains(strings.ToLower(row[10]), "pmr"):
			data.HeadType = "PMR6 PIH"
		case strings.Contains(strings.ToLower(row[10]), "06pt4e"):
			data.HeadType = "DFH"
		case strings.Contains(strings.ToLower(row[10]), "tiger"):
			data.HeadType = "HFH TIGER 3"
		case strings.Contains(strings.ToLower(row[10]), "3122"):
			data.HeadType = "AHEAD - TEK"
			data.HeadSurface = "3122"
		case strings.Contains(strings.ToLower(row[10]), "(burnish)"):
			data.HeadType = "AHEAD - TEK"
			data.HeadSurface = "3125"
		default:
			data.HeadType = row[10]
		}

		if data.HeadSurface == "" {
			switch true {
			case strings.Contains(strings.ToLower(row[9]), "bot"):
				data.HeadSurface = "Bot"
			case strings.Contains(strings.ToLower(row[9]), "top"):
				data.HeadSurface = "Top"
			}
		}
		data.Quantity, _ = strconv.Atoi(row[14])
		data.Type = "database"
		datas = append(datas, data)
		fmt.Println(row[0], data)
	}
	return datas, nil
}

type HeadConsumptionPlotData struct {
	Dates []string                     `json:"dates"`
	Data  map[string]*headTypePlotData `json:"data"`
}

type headTypePlotData struct {
	HeadType         string `json:"headType"`
	HeadSurface      string `json:"headSurface"`
	ManualQty        []int  `json:"manualQty"`
	DatabaseQty      []int  `json:"databaseQty"`
	ManualDayQty     []int  `json:"manualDayQty"`
	DatabaseDayQty   []int  `json:"databaseDayQty"`
	ManualNightQty   []int  `json:"manualNightQty"`
	DatabaseNightQty []int  `json:"databaseNightQty"`
}

func (a *App) GeneratePlotData(manualData []*HeadConsumptionData, databaseData []*HeadConsumptionData, month, year int) *HeadConsumptionPlotData {
	var (
		// plotDatas                   []*HeadConsumptionPlotData
		plotData                    = &HeadConsumptionPlotData{}
		combinedHeadConsumptionData []*HeadConsumptionData
	)

	combinedHeadConsumptionData = append(combinedHeadConsumptionData, manualData...)
	combinedHeadConsumptionData = append(combinedHeadConsumptionData, databaseData...)

	for _, data := range combinedHeadConsumptionData {
		fmt.Println(data)
	}

	// get last day of month
	lastDay := time.Date(year, time.Month(month+1), 0, 0, 0, 0, 0, time.UTC).Day()

	plotData.Data = make(map[string]*headTypePlotData)

	for i := 1; i <= lastDay; i++ { // loop through days
		plotData.Dates = append(plotData.Dates, fmt.Sprintf("%02d-%02d-%d", i, month, year))
	}

	for _, data := range combinedHeadConsumptionData {
		index := slices.Index(plotData.Dates, data.Date)

		if index == -1 {
			continue
		}

		if _, ok := plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)]; !ok {
			plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)] = &headTypePlotData{
				HeadType:         data.HeadType,
				HeadSurface:      data.HeadSurface,
				ManualQty:        make([]int, len(plotData.Dates)),
				DatabaseQty:      make([]int, len(plotData.Dates)),
				ManualDayQty:     make([]int, len(plotData.Dates)),
				DatabaseDayQty:   make([]int, len(plotData.Dates)),
				ManualNightQty:   make([]int, len(plotData.Dates)),
				DatabaseNightQty: make([]int, len(plotData.Dates)),
			}
		}

		if data.Type == "manual" {
			plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)].ManualQty[index] += data.Quantity
			if data.Shift == "Day" {
				plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)].ManualDayQty[index] += data.Quantity
			} else {
				plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)].ManualNightQty[index] += data.Quantity
			}
		} else {
			plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)].DatabaseQty[index] += data.Quantity
			if data.Shift == "Day" {
				plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)].DatabaseDayQty[index] += data.Quantity
			} else {
				plotData.Data[fmt.Sprintf("%s (%s)", data.HeadType, data.HeadSurface)].DatabaseNightQty[index] += data.Quantity
			}
		}
	}

	fmt.Println(plotData)

	return plotData
}
