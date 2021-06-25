// app/app.component.ts
import { Component, ViewEncapsulation } from "@angular/core";
import { GridOptions } from "@ag-grid-community/all-modules";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: [ 'app.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class AppComponent {
	title : string = "Financial Alchemy";

	constructor(
		private matIconRegistry:MatIconRegistry,
		private domSanitzer:DomSanitizer ) {
			
		//var comment = "Create a controller to orchestrate everything...it's a small application." ;
		//console.log( comment ) ;
		this.matIconRegistry.addSvgIcon(
			'company_logo',
			this.domSanitzer.bypassSecurityTrustResourceUrl('assets/icons/LOB-PrivateWealth-horizontal.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'company_logo2',
			this.domSanitzer.bypassSecurityTrustResourceUrl('assets/icons/liveoak-primarylogo-full-color.svg')
		);
		this.matIconRegistry.addSvgIcon(
			'angular',
			this.domSanitzer.bypassSecurityTrustResourceUrl('assets/icons/angular.svg')
		);
	}

	ngOnInit(): void {
  	}

	ngOnDestroy(): void {
	}
}