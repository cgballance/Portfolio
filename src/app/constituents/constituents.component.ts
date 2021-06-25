import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { GridApi, GridOptions, RowDropZoneParams, RowNode } from "@ag-grid-community/all-modules";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MatDialog } from '@angular/material/dialog' ;
import { NGEventHubService} from '../ngevent-hub.service'
import * as helpers from '../helpers'
import { Security } from '../model/Security' ;

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-constituents',
	templateUrl: './constituents.component.html',
	styleUrls: [ './constituents.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ConstituentsComponent implements OnInit, OnDestroy {
	public gridOptions:GridOptions;
	public rowData:any[];
	public columnDefs:any[];
	public modules: any[] = [ClientSideRowModelModule, CsvExportModule];
	public rowNode: RowNode;
	etfEventSub = null ;
	stockEventSub = null ;
	mfEventSub = null ;
	sectorEventSub = null ;

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
				const targetContainer:any = document.querySelector('#portfolioTable');
				const dropZoneParams:RowDropZoneParams = {
					getContainer: () => targetContainer,
					onDragStop: params => {
						this.showDataTransferDialog( params.node.data, params.event ) ;
					}
				} ;
				this.gridOptions.api.addRowDropZone(dropZoneParams);
			}
		} ;
		this.columnDefs = [
			{headerName: "Security Id", field: "securityId", hide: true},
			{headerName: "Symbol", field: "symbol", width: 125, rowDrag: true},
			{headerName: "Description", field: "description", width: 125},
			{headerName: "SecType", field: "secType", width: 125},
			{headerName: "Source", field: "source", width: 125},
			{headerName: "Sector", field: "sector", width: 125},
			{headerName: "Quantity", field: "qty", width: 125},
			{headerName: "Price", field: "px", width: 125},
			{headerName: "Pct", field: "pct", width: 125},
			{headerName: "Portfolio Pct", field: "portfolioPct", width: 125},
			{headerName: "Cost Basis", field: "cost", width: 125},
		];
		this.rowData = [];
	}

  	ngOnInit(): void {
		this.etfEventSub = this._ngEventHubService.ETFSelectionEvent.subscribe( evt => {
			var d = [];
			evt.forEach( (rowNode:RowNode) => {
				var r:any = rowNode.data ;
				r.name = r.symbol;
				r.source = r.symbol;
				r.sector = r.sector;
				d.push( r ) ;
			} ) ;
			this.rowData = d ;
			this.gridOptions.api.setRowData(d) ;
		}) ;
		this.stockEventSub = this._ngEventHubService.StockSelectionEvent.subscribe( (evt:RowNode[]) => {
			console.log( "STOCK SELECTION # " + evt.length ) ;
				var d = [];
				evt.forEach( (rowNode:RowNode) => {
					var r:any = rowNode.data;
					r.description = r.name;
					r.source = r.symbol;
					r.sector = r.sector;
					d.push( r ) ;
				} ) ;
				var etime = new Date() ;
				d.sort(function(a, b){return a.symbol.localeCompare(b.symbol)});
				this.rowData = d ;
				this.gridOptions.api.setRowData(d) ;
		}) ;
		this.mfEventSub = this._ngEventHubService.MutualFundSelectionEvent.subscribe( evt => {
			var d = [];
			evt.forEach( (rowNode:RowNode) => {
				var r:any = rowNode.data ;
				r.source = r.name ;
				d.push( r ) ;
			} ) ;
			this.rowData = d ;
			this.gridOptions.api.setRowData(d) ;
		}) ;
		this.sectorEventSub = this._ngEventHubService.SectorSelectionEvent.subscribe( (evt:[]) => {
				var d = [];
				evt.forEach( (r:any) => {
					r.description = r.name ;
					r.source = 'SP500' ;
					d.push( r ) ;
				} ) ;
				d.sort(function(a, b){return a.symbol.localeCompare(b.symbol)});
				this.rowData = d ;
				this.gridOptions.api.setRowData(d) ;
		}) ;
  	}

  	ngOnDestroy(): void {
		  if( this.etfEventSub ) {
			  this.etfEventSub.unsubscribe() ;
		  }
		  if( this.stockEventSub ) {
			  this.stockEventSub.unsubscribe() ;
		  }
		  if( this.mfEventSub ) {
			  this.mfEventSub.unsubscribe() ;
		  }
		  if( this.sectorEventSub ) {
			  this.sectorEventSub.unsubscribe() ;
		  }
	}

	onRowSelected(event): void {
		console.log("row " + JSON.stringify(event.node.data) + " selected = " + event.node.selected);
		if( event.node.selected ) {
			this.rowNode = event.node;


		}
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
