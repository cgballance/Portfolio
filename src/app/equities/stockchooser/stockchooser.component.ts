import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { GridApi, GridOptions, RowDropZoneParams, RowNode, RowSelectedEvent } from "@ag-grid-community/all-modules";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MatDialog } from '@angular/material/dialog' ;
import { NGEventHubService} from '../../ngevent-hub.service';
import * as helpers from '../../helpers'
import { emit } from "process";
import { Security } from '../../model/Security' ;

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-stockchooser',
	templateUrl: './stockchooser.component.html',
	styleUrls: [ './stockchooser.component.scss'],
	encapsulation: ViewEncapsulation.None
})
 
export class StockChooserComponent implements OnInit, OnDestroy {
	public gridOptions:GridOptions;
	public rowData:any[];
	public columnDefs:any[];
	public modules: any[] = [ClientSideRowModelModule, CsvExportModule];
	public rowNode: RowNode;
	public statusBar: any ;

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
			
			onGridReady: event => {
				this.loadStocks();
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
			{headerName: "Description", field: "description", width: 125},
			{headerName: "Sector", field: "sector", width: 125},
			{headerName: "Market Cap", field: "marketCap", width: 125, valueFormatter: params => {
				return params.value.toLocaleString('en-US', {style:'currency',currency:'USD'});
			}},
		];
		this.rowData = [];
		this.statusBar = {
			statusPanels: [
				{
					statusPanel: 'agTotalRowCountComponent',
					align: 'left',
				}
			]
		}
	}

  	ngOnInit(): void {
  	}

  	ngOnDestroy(): void {
	}

	onSelectionChanged(event: any): void {
		var sels: RowNode[] = this.gridOptions.api.getSelectedNodes();
		this._ngEventHubService.StockSelectionEvent.emit( sels ) ;
	}

	//
	// DISABLED THIS EVENT DUE TO IT BEING CALLED FOR EACH ROW IN A MULTI-SELECTION!
	// 
	onRowSelected(event: RowSelectedEvent): void {
		var sels: RowNode[] = this.gridOptions.api.getSelectedNodes();
		this._ngEventHubService.StockSelectionEvent.emit( sels ) ;
	}

	private async loadStocks() {
		var sp500url = "https://datahub.io/core/s-and-p-500-companies-financials/r/1.json";
		this.getJson(sp500url).then(data => {
			data.sort(function(a, b){return a.Symbol.localeCompare(b.Symbol)});
			
			data.forEach( stock => {
				stock.securityId = stock['Symbol'] ;
				stock.symbol = stock['Symbol'];
				stock.px = stock['Price'];
				stock.name = stock['Name']
				stock.description = stock.name;
				stock.secType = 'EQ';
				stock.sector = stock['Sector'] ;
				stock.marketCap = stock['Market Cap'];
				stock.divYield = stock['Dividend Yield'];
				stock.eps = stock['Earnings/Share'] ;
				// delete some keys to catch any code issues for now...
				delete stock['Price'];
				delete stock['Name'];
				delete stock['Symbol'];
				delete stock['Sector'];
				delete stock['Market Cap'];
				delete stock['Dividend Yield'];
				delete stock['Earnings/Share'];
			}) ;
			this.rowData = data;
		} ) ;
		this.gridOptions.api.setRowData(this.rowData);
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

	clicked(sector: string): void {
		alert("CLICKED " + sector);
	}

	showDataTransferDialog( security:Security, me:MouseEvent ): void {
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
