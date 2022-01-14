import { Injectable } from '@angular/core';
import * as Excel from 'exceljs';

@Injectable({
	providedIn: 'root'
})
export class ExcelParserService {

	constructor() { }

	async parse(excelFile: File) {
		let pr = await this.loadExcelFile(excelFile);
		let groups: Excel.Row[][] = [];
		let prev: Excel.Row[] = [];

		pr.getRows(0, pr.rowCount)?.forEach(r => {

			let cells = r.cellCount;
			if (cells == 0) {
				if (prev.length) {
					groups.push(prev);
					prev = [];
				}
			} else {
				prev.push(r);
			}
		})

		if (prev.length) {
			groups.push(prev);
		}

		return this.convert(groups);
	}

	private convert(groups: Excel.Row[][]): ProjectInfo[] {
		let projects: ProjectInfo[] = [];

		for (let group of groups) {
			// Get project name
			let proj: ProjectInfo = {
				name: group[0].getCell(1).value as string,
				taks: []
			}
			projects.push(proj);

			// Find tasks
			// i = 1 to skip column rows
			// -1 to skip summary
			for (let i = 2; i < group.length - 1; i++) {
				let x = group[i];
				let task: ProjectTask = {
					name: x.getCell(1).value as string,
					arbetadTid: x.getCell(2).value as number,
					debiterbarTid: x.getCell(3).value as number,
					debiteringsGrad1: x.getCell(4).value as number
				}
				proj.taks.push(task);
			}
		}

		return projects;
	}

	private async loadExcelFile(excelFile: File): Promise<Excel.Worksheet> {
		let workbook = new Excel.Workbook();
		let buffer = await excelFile.arrayBuffer();
		return (await workbook.xlsx.load(buffer)).getWorksheet("Projektrapport");
	}
}
export interface ProjectInfo {
	name: string;
	taks: ProjectTask[];
}
export interface ProjectTask {
	name: string;
	arbetadTid: number;
	debiterbarTid: number;
	debiteringsGrad1: number;
}