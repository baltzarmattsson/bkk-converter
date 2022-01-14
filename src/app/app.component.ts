import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ExcelExporterService } from './excel-exporter/excel-exporter.service';
import { ExcelParserService } from './excel-parser/excel-parser.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	fileControl = new FormControl();

	constructor(
		private excelParser: ExcelParserService,
		private exporter: ExcelExporterService
	) { }

	ngOnInit() {
		this.fileControl.valueChanges.subscribe(async (file: File) => {
			if (file) {
				let res = await this.excelParser.parse(file);
				await this.exporter.export(file.name, res)
			}
		})
	}
}
