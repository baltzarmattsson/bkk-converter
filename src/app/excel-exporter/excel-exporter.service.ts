import { Injectable } from '@angular/core';
import { ProjectInfo } from '../excel-parser/excel-parser.service';
import * as FileSaver from 'file-saver';
import * as Excel from 'exceljs';
const EXCEL_EXTENSION = '.xlsx';
const EXCEL_TYPE =
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;' +
	'charset=UTF-8';

@Injectable({
	providedIn: 'root'
})
export class ExcelExporterService {

	constructor() { }

	async export(originalFileName: string, projects: ProjectInfo[]) {
		let wb = new Excel.Workbook();
		const sheet = wb.addWorksheet("Data");
		sheet.columns = [
			{ header: "Projektnummer", key: "projektnummer", width: 30 },
			{ header: "Projektnamn", key: "namn", width: 30 },
			{ header: "Uppgiftsnamn", key: "uppgift", width: 30 },
			{ header: "Arbetad tid", key: "arb", width: 30 },
			{ header: "Debiterbar tid", key: "deb", width: 30 },
			{ header: "Debiteringsgrad 1", key: "grad", width: 30 },
		]

		projects.forEach(p => {
			p.taks.forEach(task => {
				sheet.addRow([
					p.projectNumber,
					p.projectName,
					task.name,
					task.arbetadTid,
					task.debiterbarTid,
					task.debiteringsGrad1
				])
			})
		})

		this.fitColumnsToContent(wb);
		let data = await wb.xlsx.writeBuffer();
		this.saveAsExcelFile(data, originalFileName);
	}

	private fitColumnsToContent(workBook: Excel.Workbook) {
		let maxColWidth: { [colNumber: number]: number } = {};
		workBook.worksheets.forEach((ws) => {
			ws.columns?.forEach((col) => {
				col.values?.forEach((value) => {
					let colIndex = col.number as number;
					let length = (value + '').length;
					if (
						maxColWidth[colIndex] == undefined ||
						maxColWidth[colIndex] < length
					)
						maxColWidth[colIndex] = length;
				});
			});
		});

		// Magic padding, is affected by font size I guess. Any lower and some numbers turns into #####
		const colPadding = 1;
		workBook.worksheets.forEach((ws) => {
			ws.columns?.forEach((column) => {
				column.width = maxColWidth[column.number as number] + colPadding;
			});
		});
	}

	private saveAsExcelFile(buffer: any, fileName: string) {
		const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
		fileName = this.convertStringToFileFriendlyName(fileName);
		console.log("saving as filename?", fileName);
		FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
	}

	private convertStringToFileFriendlyName(s: string) {
		return s.replace(/[^a-z0-9]/gi, "_").toLocaleLowerCase();
	}
}
