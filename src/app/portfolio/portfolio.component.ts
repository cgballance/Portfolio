import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { GridApi, GridOptions, RowNode } from "@ag-grid-community/all-modules";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MatDialog } from '@angular/material/dialog';
import { NGEventHubService } from '../ngevent-hub.service';
import * as EventEmitter from 'events';
import * as helpers from '../helpers'
import { PortfolioService } from './portfolio.service';
import { Position } from '../model/Position';

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-portfolio',
	templateUrl: './portfolio.component.html',
	styleUrls: ['./portfolio.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class PortfolioComponent implements OnInit, OnDestroy {
	public gridOptions: GridOptions;
	public rowData: any[];
	public columnDefs: any[];
	public modules: any[] = [ClientSideRowModelModule, CsvExportModule];
	public rowNode: RowNode;
	public dropEventSub: any;
	public addEventSub: any;
	public updateEventSub: any;
	public deleteEventSub: any;
	public myName: string = "PortfolioComponent";

	constructor(
		private _ngEventHubService: NGEventHubService,
		private _portfolioService: PortfolioService,
		private dialog: MatDialog) {
		this.gridOptions = <GridOptions>{
			headerHeight: 30,
			rowHeight: 30,
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
			onGridReady: event => { this.loadPortfolio(); }
		};
		this.columnDefs = [
			{ headerName: "Security ID", field: "securityId", hide: true },
			{ headerName: "Symbol", field: "symbol", width: 125 },
			{ headerName: "Description", field: "description", width: 125 },
			{
				headerName: "Quantity", field: "qty", width: 125, type: 'numericColumn', cellClass: 'ag-numeric-cell',
				valueFormatter: params => {
					if (params.value === undefined) { return ""; }
					return params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
				},
				editable: true,
				onCellValueChanged: params => {
					params.data.value = params.data.qty * params.data.px ;
					this.gridOptions.api.applyTransaction({
						update: [ params.data ]
					});
					_portfolioService.updatePosition( params.node.data ) ;
				}
			},
			{ headerName: "SecType", field: "secType", width: 125 },
			{
				headerName: "Price", field: "px", width: 125, type: 'numericColumn', cellClass: 'ag-numeric-cell',
				valueFormatter: params => {
					if (params.value === undefined) { return ""; }
					return params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
				},
				editable: true,
				onCellValueChanged: params => {
					params.data.value = params.data.qty * params.data.px ;
					this.gridOptions.api.applyTransaction({
						update: [ params.data ]
					});
					_portfolioService.updatePosition( params.node.data ) ;
				}
			},
			{
				headerName: "Market Value", field: "value", width: 125, type: 'numericColumn', cellClass: 'ag-numeric-cell',
				valueFormatter: params => {
					if (params.value === undefined) { return ""; }
					return params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
				}
			},
			{
				headerName: "Cost Price", field: "costPx", width: 125, type: 'numericColumn', cellClass: 'ag-numeric-cell',
				valueFormatter: params => {
					if (params.value === undefined) { return ""; }
					return params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
				},
				editable: true,
				onCellValueChanged: params => {
					params.data.costValue = params.data.qty * params.data.costPx ;
					this.gridOptions.api.applyTransaction({
						update: [ params.data ]
					});
					_portfolioService.updatePosition( params.node.data ) ;
				}
			},
			{
				headerName: "Cost Value", field: "costValue", width: 125, type: 'numericColumn', cellClass: 'ag-numeric-cell',
				valueFormatter: params => {
					if (params.value === undefined) { return ""; }
					return params.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
				}
			},
			{
				headerName: "Portfolio Pct", field: "pct", width: 125, type: 'numericColumn', cellClass: 'ag-numeric-cell',
				valueFormatter: params => {
					if (params.value === undefined) { return ""; }
					return params.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
				}
			},
		];
		this.rowData = [];
	}

	ngOnInit(): void {
		this.dropEventSub = this._ngEventHubService.PortfolioDropEvent.subscribe(response => {
			var items: Position[] = [];
			if (response instanceof Array) {
				response.forEach((security: any) => {
					var p: Position = new Position();
					p.securityId = security.securityId;
					p.symbol = security.symbol;
					p.description = security.description;
					p.secType = security.secType;
					p.qty = 0;
					p.px = security.px;
					p.value = 0.00;
					p.costPx = 0.00;
					p.costValue = 0.00;
					items.push(p);
				});
			} else {
				var security = response;
				var p: Position = new Position();
				p.securityId = security.securityId;
				p.symbol = security.symbol;
				p.description = security.description;
				p.secType = security.secType;
				p.qty = 0;
				p.px = security.px;
				p.value = 0.00;
				p.costPx = 0.00;
				p.costValue = 0.00;
				items.push(p);
			}
			var rval:string = this._portfolioService.addPositions(items);
			if( rval !== '' ) {
				var location:DOMRect = document.getElementById( "portfolioTable" ).getBoundingClientRect();
				this.showMessageDialog( rval, location ) ;
			}
		});

		this.addEventSub = this._ngEventHubService.PortfolioAddEvent.subscribe(items => {
			this.gridOptions.api.applyTransaction({
				add: items
			});
		});

		this.updateEventSub = this._ngEventHubService.PortfolioUpdateEvent.subscribe(items => {
			this.gridOptions.api.applyTransaction({
				update: items
			});
		});
		this.deleteEventSub = this._ngEventHubService.PortfolioDeleteEvent.subscribe(items => {
			this.gridOptions.api.applyTransaction({
				remove: items
			});
		});
	}

	ngOnDestroy(): void {
		if (this.dropEventSub) {
			this.dropEventSub.unsubscribe();
		}
		if (this.addEventSub) {
			this.addEventSub.unsubscribe();
		}
	}

	onRowSelected(event): void {
		console.log("row " + JSON.stringify(event.node.data) + " selected = " + event.node.selected);
		if (event.node.selected) {
			this.rowNode = event.node;
		}
	}

	private async loadPortfolio() {
		var pos: Position[] = this._portfolioService.getPositions();
		this.rowData = pos;
		this.gridOptions.api.setRowData(this.rowData);
	}

	showMessageDialog( msg:string, location:DOMRect ): void {
		var d:any = {
			elementRect: location
		}
		helpers.showMessage( d, this.dialog, "Portfolio", msg ) ;
	}
}
