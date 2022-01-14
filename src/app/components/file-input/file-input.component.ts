import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
	selector: 'app-file-input',
	templateUrl: './file-input.component.html',
	styleUrls: ['./file-input.component.scss']
})
export class FileInputComponent implements OnInit {

	@Input() acceptedFileExtensions: string[] = [];
	@Input() control: AbstractControl;
	@Input() multiple: boolean = false;
	@Input() allowAllFiles: boolean = false;

	randomClassId: string
	acceptedFileExtensionsFormatted: string = "";
	dragZoneActive: boolean = false;
	currentFileInfo: string = "";

	get fileIsSet(): boolean {
		return this.control.value != undefined && this.control.value != "";
	}

	private intervalId;

	constructor(
	) { }

	ngOnInit(): void {
		this.randomClassId = "asdasdasds";
		this.initFileExtensions();
		this.runChangeDetection();
	}

	ngAfterViewInit() {

		this.intervalId = setInterval(() => {
			let element = document.getElementsByClassName("wf-file-drop-zone " + this.randomClassId)[0] as HTMLElement;
			if (element) {
				this.initDropzone(element);
				clearInterval(this.intervalId);
			}
		}, 500);
		this.runChangeDetection();
	}

	ngOnDestroy() {
		clearInterval(this.intervalId);
	}

	private initFileExtensions() {
		if (!this.allowAllFiles) {
			if (!this.acceptedFileExtensions || !this.acceptedFileExtensions.length) {
				throw new Error("No accepted file formats set");
			}
			this.acceptedFileExtensions = this.acceptedFileExtensions
				.map(_ => _.replace(".", "").toLowerCase());

			this.acceptedFileExtensionsFormatted = this.acceptedFileExtensions.join(`, `);
			this.runChangeDetection();
		}
	}

	private initDropzone(element: HTMLElement) {
		element.addEventListener("drop", (event) => this.onDrop(event))
		element.addEventListener("dragover", (event) => this.onDragOver(event));
		element.addEventListener("dragleave", (event) => this.onDragLeave(event));
		this.runChangeDetection();
	}

	onManualFileSelect(event: any) {
		let files: FileList = event.target.files;
		this.setFile(files);
		this.runChangeDetection();
	}

	onDrop(event) {
		this.cancelEvent(event);
		this.dragZoneActive = false;
		let files: File[] = [...event.dataTransfer.files];
		if (files && files.length) {
			if (files.length > 1 && !this.multiple) {
				alert("Only one file");
			}
			this.setFile(files);
		}
		this.runChangeDetection();
	}

	private setFile(files: File[] | FileList) {

		let filteredFiles: File[] = [];

		for (let i = 0; i < files.length; i++) {
			let file = files[i];

			// @ts-ignore
			let fileExtension: string = file.name.split(".").pop().toLowerCase();
			if (this.allowAllFiles || this.acceptedFileExtensions.includes(fileExtension)) {
				filteredFiles.push(file);
			} else {
				alert("Invalid format");
			}
		}

		if (!this.multiple && filteredFiles.length > 1)
			filteredFiles.length = 1;

		let currentFileInfo = filteredFiles.map(f => f.name).join("\n");
		if (this.control) {
			this.control.setValue(this.multiple ? filteredFiles : filteredFiles[0]);
		}
		this.currentFileInfo = currentFileInfo;
	}

	onDragOver(event) {
		this.cancelEvent(event);
		this.dragZoneActive = true;
		this.runChangeDetection();
	}

	onDragLeave(event) {
		this.cancelEvent(event);
		this.dragZoneActive = false;
		this.runChangeDetection();
	}

	private cancelEvent(event) {
		event.preventDefault();
		event.stopImmediatePropagation();
		event.stopPropagation();
	}

	private runChangeDetection() {
	}
}
