import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { GridOptions, RowDropZoneParams, RowNode } from "@ag-grid-community/all-modules";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MatDialog } from '@angular/material/dialog' ;
import { NGEventHubService} from '../../ngevent-hub.service' 
import * as helpers from '../../helpers'
import { Security } from '../../model/Security' ;

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-etfchooser',
	templateUrl: './etfchooser.component.html',
	styleUrls: [ './etfchooser.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ETFChooserComponent implements OnInit, OnDestroy {
	public gridOptions:GridOptions;
	public rowData:any[];
	public columnDefs:any[];
	public modules: any[] = [ClientSideRowModelModule, CsvExportModule];
	public rowNode: RowNode;

	constructor( 
		private _ngEventHubService: NGEventHubService,
		private dialog: MatDialog  ) {
		this.gridOptions = <GridOptions>{
			headerHeight:30,
			rowHeight:30,
			defaultColDef: {
				sortable: true,
				resizable: true,
				filter: 'agTextColumnFilter',
			},
			statusBar: {
				statusPanels: [
					{
						statusPanel: 'agTotalRowCountComponent',
						align: 'left',
					}
				]
			},
			onGridReady: event => {
				this.loadETFs();
				const targetContainer:any = document.querySelector('#portfolioTable');
				const dropZoneParams:RowDropZoneParams = {
					getContainer: () => targetContainer,
					onDragStop: params => {
						this.showDataTransferDialog( params.node.data, params.event ) ;
					}
				} ;
				this.gridOptions.api.addRowDropZone(dropZoneParams);
			}
		};
		this.columnDefs = [
			{headerName: "Security Id", field: "securityId", hide: true},
			{headerName: "Symbol", field: "symbol", width: 125, rowDrag: true},
			{headerName: "Description", field: "description", width: 150 },
			{headerName: "Company", field: "company", width: 125 },
		];
		this.rowData = [];
	}

  	ngOnInit(): void {
  	}

  	ngOnDestroy(): void {
	}

	onSelectionChanged(event: any): void {
		var sels: RowNode[] = this.gridOptions.api.getSelectedNodes();
		this._ngEventHubService.ETFSelectionEvent.emit( sels ) ;
	}

	//
	// DISABLED THIS EVENT DUE TO IT BEING CALLED FOR EACH ROW IN A MULTI-SELECTION!
	// 
	onRowSelected(event): void {
		var sels: RowNode[] = this.gridOptions.api.getSelectedNodes();
		this._ngEventHubService.ETFSelectionEvent.emit( sels ) ;
	}

	private async loadETFs() {
		var nyseUrl = 'https://datahub.io/core/nyse-other-listings/r/1.json' ;
		this.getJson(nyseUrl).then(data => {
			data.sort(function(a, b){return a['CQS Symbol'].localeCompare(b['CQS Symbol'])});
			var mydata: any[] = [] ;
			data.forEach( r => {
				if( r.ETF === 'Y' ) {
					r.secType = 'ETF';
					r.symbol = r['CQS Symbol'] ;
					r.description = r['Security Name'] ;
					r.company = r['Company Name'] ;
					r.exchange = r['Exchange'] ;
					r.securityId =  r.symbol;
					r.px = 0.00;
					mydata.push(r);
				}
			}) ;
			this.rowData = mydata;
			this.gridOptions.api.setRowData(this.rowData);
		} ) ;
	}

	private async getJson(url: string): Promise<any> {
		let response = await fetch(url, {
			headers: {
				Accept: 'application/json'
			},
			method: 'GET',
			mode: 'cors'
		});
		let data = await response.json();
		return data;
	}
	
	showDataTransferDialog( security:Security, me: MouseEvent): void {
		var options:any = [
			{
				'callback': this.commitDataTransfer,
				'text': "Yes",
			},
			{
				'callback': function(){},
				'text': "No",
			}
		] ;
		let msg = "Add: " + security.description + '(' + security.symbol + ')?';
		var d = {
			stock: security,
			mouseEvent: me,
			ctx: this
		}
		helpers.showMessage( d, this.dialog, "Confirmation", msg, options ) ;
	}

	commitDataTransfer(): void {
		var what: any = this;
		what.ctx._ngEventHubService.PortfolioDropEvent.emit( what.stock ) ;
	}
}
