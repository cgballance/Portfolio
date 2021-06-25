import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { GridApi, GridOptions, RowDropZoneParams, RowNode, RowSelectedEvent } from "@ag-grid-community/all-modules";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { CsvExportModule } from '@ag-grid-community/csv-export';
import { MatDialog } from '@angular/material/dialog' ;
import { RepositionScrollStrategy } from "@angular/cdk/overlay";
import { NGEventHubService} from '../../ngevent-hub.service' 
import * as helpers from '../../helpers'
import { Security } from '../../model/Security' ;

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-mutualfundchooser',
	templateUrl: './mutualfundchooser.component.html',
	styleUrls: [ './mutualfundchooser.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class MutualFundChooserComponent implements OnInit, OnDestroy {
	public gridOptions:GridOptions;
	public rowData:any[];
	public columnDefs:any[];
	public modules: any[] = [ClientSideRowModelModule, CsvExportModule];
	public rowNode: RowNode;

	constructor( 
		private _ngEventHubService: NGEventHubService,
		private dialog: MatDialog  ) {
		this.gridOptions = <GridOptions>{
			headerHeight:25,
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
				this.loadFunds();
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
		];
		this.rowData = [];
	}

  	ngOnInit(): void {
  	}

  	ngOnDestroy(): void {
	}

	onSelectionChanged(event: any): void {
		var sels: RowNode[] = this.gridOptions.api.getSelectedNodes();
		this._ngEventHubService.MutualFundSelectionEvent.emit( sels ) ;
	}
	//
	// DISABLED THIS EVENT DUE TO IT BEING CALLED FOR EACH ROW IN A MULTI-SELECTION!
	// 
	onRowSelected(event: RowSelectedEvent): void {
		var sels: RowNode[] = this.gridOptions.api.getSelectedNodes();
		this._ngEventHubService.MutualFundSelectionEvent.emit( sels ) ;
	}

	private async loadFunds() {
		this.rowData = [
			{
				securityId: '1',
				secType: 'MF',
				symbol: 'MF1',
				description: 'Some Mutual Fund',
				px: 0.00
			}
		];
		this.gridOptions.api.setRowData(this.rowData);
	}
	
	showDataTransferDialog( security: Security, me: MouseEvent ): void {
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
			security: security,
			mouseEvent: me,
			ctx: this,
		}
		helpers.showMessage( d, this.dialog, "Confirmation", msg, options ) ;
	}

	commitDataTransfer(): void {
		var what: any = this;
		what.ctx._ngEventHubService.PortfolioDropEvent.emit( what.security ) ;
	}
}
