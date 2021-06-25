import { FocusKeyManager } from "@angular/cdk/a11y";
import { Component, OnInit, OnDestroy, ViewEncapsulation } from "@angular/core";
import { MatDialog } from '@angular/material/dialog';
import * as d3 from 'd3';
import { NGEventHubService } from '../ngevent-hub.service'

// or, if using Enterprise features
// import {GridOptions} from "@ag-grid-enterprise/all-modules";

@Component({
	selector: 'app-equities',
	templateUrl: './equities.component.html',
	styleUrls: ['./equities.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class EquitiesComponent implements OnInit, OnDestroy {
	timeHorizon: string = "day";
	marketData: any[];
	sectorData: any[];
	marketSvg: any;
	sectorSvg: any;
	marketRoot: d3.HierarchyNode<any>;
	sectorRoot: d3.HierarchyNode<any>;
	totalMarketCap: number = 0.0;
	sectorMarketCap: number = 0.0;
	height: number;
	width: number;
	margin: any;
	level: number = 0;
	tooltip: any;
	sector: string ;

	constructor(
		private _ngEventHubService: NGEventHubService,
		private dialog: MatDialog) {
	}

	ngOnInit(): void {
		var sp500url = "https://datahub.io/core/s-and-p-500-companies-financials/r/1.json";
		this.getJson(sp500url).then(data => {
			//
			// normalize data model need to work on this. should replace the incoming with an
			// explicitly assigned object.
			//
			data.forEach( stock => {
				stock.symbol = stock['Symbol'];
				stock.px = stock['Price'];
				stock.name = stock['Name']
				stock.description = stock.name;
				stock.securityId = stock['Symbol'] ;
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
			this.marketData = data;
			//
			//
			// from now on, i want to know when the window size changes
			// so i can make sure the svg behaves.
			//
			let f = this.resizeContents.bind(this);
			window.addEventListener( "resize", f );
			this.setComponentSizes() ;

			this.showMarket();

			this.tooltip = d3.select("#treemapholder")
				.append("div")
				.style("opacity", 0)
				.attr("class", "tooltip")
				.style("background-color", "white")
				.style("border", "solid")
				.style("border-width", "1px")
				.style("border-radius", "5px")
				.style("padding", "10px")
				.style("position", "absolute")
				.style("z-index", 3);
		});
	}

	ngOnDestroy(): void {
	}

	private resizeContents() : void {
		this.setComponentSizes() ;
		if( this.level === 0 ) {
			this.drawMarketTreeView() ;
		} else if( this.level === 1 ) {
			this.drawSectorTreeView(this.sector);
		}
	}

	private setComponentSizes() : void {
		this.width = document.getElementById('treemapholder').offsetWidth;
		this.height = document.getElementById('treemapholder').offsetHeight;
		//
		// I do NOT want scrollbars to show up and allow for anything ugly here
		//
		if( this.width > window.innerWidth ) {
			this.width = window.innerWidth ;
		}
		var maxHeightAllowed = window.innerHeight - document.getElementById('timegroup').getBoundingClientRect().top;
		if( this.height > maxHeightAllowed ) {
			this.height = maxHeightAllowed ;
		}

		var timeHorizonHeight = document.getElementById('timegroup').offsetHeight;
		this.height -= timeHorizonHeight;
		// set the dimensions and margins of the graph
		this.margin = { top: 0, right: 2, bottom: 2, left: 2 },
			this.width = this.width - this.margin.left - this.margin.right,
			this.height = this.height - this.margin.top - this.margin.bottom;
	}

	private setTreeDataForMarket(): void {
		this.marketData.forEach(stock => this.totalMarketCap += stock.marketCap);
		var totalMarketCap = this.totalMarketCap; // need the local

		//
		// make a tree.  need to add a root and child level to tie things together.
		//
		this.marketData.push({ symbol: "SP500", sector: "" }); // root
		var sectors: string[] = [
			"Industrials",
			"Health Care",
			"Materials",
			"Financials",
			"Consumer Discretionary",
			"Energy",
			"Consumer Staples",
			"Utilities",
			"Information Technology",
			"Real Estate",
			"Telecommunication Services"
		];
		sectors.forEach(sector => {
			//
			// color is a gradient from red -> green based on
			// (marketcap t1 and t0) / marketcap (pct change)
			//
			var r: number = this.getRndInteger(96, 256);
			var g: number = 256 - r + 96;
			var b: number = 32
			var fill: string = 'rgb(' + r + ',' + g + ',' + b + ')';
			//
			// portfolio fill color ( allows one to see how one's sector picks perform vs. index sector )
			//
			r = this.getRndInteger(96, 256);
			g = 256 - r + 96;
			var portfill: string = 'rgb(' + r + ',' + g + ',' + b + ')';
			this.marketData.push({ symbol: sector, sector: "SP500", fill: fill, portfill: portfill });
		});

		const stratify = d3.stratify()
			.id(function (d: any) { return d.symbol; })
			.parentId(function (d: any) { return d.sector; });

		this.marketRoot = stratify(this.marketData).sum(d => +d['marketCap']);
	}

	private showMarket() : void {
		this.setTreeDataForMarket() ;
		this.drawMarketTreeView() ;
	}

	private showSector(sector: string) : void {
		this.sector = sector ;
		this.setTreeDataForSector(sector);
		this.drawSectorTreeView(sector);
	}

	private setTreeDataForSector(sector: string) : void {
		//
		// copy sp500data to sectordata for this sector's symbols.
		// add in a root, build the svg
		//
		this.sectorData = [];
		this.sectorMarketCap = 0.0;
		this.marketData.forEach(stock => {
			if (stock.sector === sector) {
				this.sectorMarketCap += stock.marketCap;

				//
				// color is a gradient from red -> green based on
				// (marketcap t1 and t0) / marketcap (pct change)
				//
				var r: number = this.getRndInteger(96, 256);
				var g: number = 256 - r + 96;
				var b: number = 32
				var fill: string = 'rgb(' + r + ',' + g + ',' + b + ')';
				stock.fill = fill;
				//
				// portfolio fill color ( allows one to see how one's sector picks perform vs. index sector )
				//
				r = this.getRndInteger(96, 256);
				g = 256 - r + 96;
				var portfill: string = 'rgb(' + r + ',' + g + ',' + b + ')';
				stock.portfill = portfill;

				this.sectorData.push(stock);
			}
		});
		this.sectorData.push({ symbol: sector, sector: "" }); // root
		const stratify = d3.stratify()
			.id(function (d: any) { return d.symbol; })
			.parentId(function (d: any) { return d.sector; });

		this.sectorRoot = stratify(this.sectorData).sum(d => +d['marketCap']);
	}

	private drawSectorTreeView(sector: string) : void {
		document.getElementById("my_dataviz").childNodes.forEach(child => { child.remove(); })
		document.getElementById("nowViewing").innerHTML = sector;
		this.level = 1;
		// variable scope for callbacks in here...
		var sectorMarketCap: number = this.sectorMarketCap;
		var sectordata: any = this.sectorData;
		var eventer: NGEventHubService = this._ngEventHubService;

		this.sectorSvg = d3.select("#my_dataviz").append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + this.margin.left + "," + this.margin.top + ")");

		d3.treemap()
			.size([this.width, this.height])
			.padding(3)
			(this.sectorRoot)

		this.sectorSvg
			.selectAll("rect")
			.data(this.sectorRoot.children)
			.enter()
			.append("rect")
			.attr('x', function (d: any) { return d.x0; })
			.attr('y', function (d: any) { return d.y0; })
			.attr('width', function (d: any) { return d.x1 - d.x0; })
			.attr('height', function (d: any) { return d.y1 - d.y0; })
			.attr('rx', 5)
			.attr('ry', 5)
			.style("stroke", "black")
			.style("stroke-width", 1)
			.style("fill", function (d: any) {
				return d.data.fill;
			})
			.on("click",  (e: MouseEvent, d: any) => { 
				console.log("clicked on symbol: " + d.data.symbol);
				//eventer.StockSelectionEvent.emit( datum.data );
			})
			.on("dblclick", (e: MouseEvent, d: any) => { 
				this.drawMarketTreeView();
			})
			.on("mouseover", (e: MouseEvent, d: any) => { 
				this.handleMouseOver(e,d) ;
			} )
			.on("mouseout", (e: MouseEvent, d: any) => { 
				this.handleMouseOut(e,d) ;
			} )
			.on("mousemove", (e: MouseEvent, d: any) => { 
				this.handleMouseMove(e,d) ;
			} ) ;

		// and to add the text labels
		this.sectorSvg
			.selectAll("text")
			.data(this.sectorRoot.children)
			.enter()
			.append("text")
			.attr("x", function (d: any) { return d.x0 + 5 })    // +10 to adjust position (more right)
			.attr("y", function (d: any) { return d.y0 + 12 })    // +20 to adjust position (lower)
			.text(function (d: any) {
				var sz = (d.value / sectorMarketCap) * 100;
				return d.data.symbol;
			})
			.attr("fill", "black");

		this.addMyEquityHoldings(); // this will be rebuilt often
	}

	private drawMarketTreeView() : void {
		document.getElementById("my_dataviz").childNodes.forEach(child => { child.remove(); });
		document.getElementById("nowViewing").innerHTML = 'S&P 500';
		this.level = 0;

		// variable scope for callbacks in here...
		var totalMarketCap: number = this.totalMarketCap;
		var sp500data: any = this.marketData;
		var eventer: NGEventHubService = this._ngEventHubService;

		this.marketSvg = d3.select("#my_dataviz").append("svg")
			.attr("width", this.width + this.margin.left + this.margin.right)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
			.append("g")
			.attr("transform",
				"translate(" + this.margin.left + "," + this.margin.top + ")");

		d3.treemap()
			.size([this.width, this.height])
			.padding(3)
			(this.marketRoot)

		this.marketSvg
			.selectAll("rect")
			.data(this.marketRoot.children)
			.enter()
			.append("rect")
			.attr('x', function (d: any) { return d.x0; })
			.attr('y', function (d: any) { return d.y0; })
			.attr('width', function (d: any) { return d.x1 - d.x0; })
			.attr('height', function (d: any) { return d.y1 - d.y0; })
			.attr('rx', 5)
			.attr('ry', 5)
			.style("stroke", "black")
			.style("stroke-width", 1)
			.style("fill", function (d: any) {
				return d.data.fill;
			})
			.on("click",  (e: MouseEvent, d: any) => { 
				console.log("clicked on sector: " + d.data.symbol);
				// collect all index components of this sector and emit evt.
				var sectorItems: any[] = [];
				sp500data.forEach(stock => {
					if (stock['marketCap'] !== undefined &&
						stock['sector'] === d.data.symbol) { // leaf items only
						sectorItems.push(stock);
					}
				});
				eventer.SectorSelectionEvent.emit(sectorItems);
			})
			.on("dblclick", (e: MouseEvent, datum: any) => {
				this.showSector(datum.data.symbol);
			})
			.on("mouseover", (e: MouseEvent, d: any) => { 
				this.handleMouseOver(e,d) ;
			} )
			.on("mouseout", (e: MouseEvent, d: any) => { 
				this.handleMouseOut(e,d) ;
			} )
			.on("mousemove", (e: MouseEvent, d: any) => { 
				this.handleMouseMove(e,d) ;
			} ) ;

		// and to add the text labels
		this.marketSvg
			.selectAll("text")
			//.data(root.leaves())
			.data(this.marketRoot.children)
			.enter()
			.append("text")
			.attr("x", function (d: any) { return d.x0 + 5 })    // +10 to adjust position (more right)
			.attr("y", function (d: any) { return d.y0 + 12 })    // +20 to adjust position (lower)
			.text(function (d: any) {
				var sz = (d.value / totalMarketCap) * 100;
				return d.data.symbol + ' - ' + sz.toFixed(2) + '%'
			})
			.attr("fill", "black");

		this.addMyEquityHoldings(); // this will be rebuilt often
	}

	private addMyEquityHoldings() : void {
		//
		// get rid of any existing visuals
		//
		this.marketSvg.selectAll("circle")
			.remove();
		//
		// compute the colorization based on my holdings in a given sector vs time horizon.
		// compute the radius based on pct of my holdings allocated to a given sector.
		//
		// TODO - for now, haven't implemented this....no market data/timeseries to work with.
		//
		var myMarketCap: number;
		var node: d3.HierarchyNode<any>;
		var graphic: any;

		if (this.level === 0) {
			myMarketCap = this.totalMarketCap;
			node = this.marketRoot;
			graphic = this.marketSvg;
		} else if (this.level === 1) {
			myMarketCap = this.sectorMarketCap;
			node = this.sectorRoot;
			graphic = this.sectorSvg;
		}

		graphic
			.selectAll("foobar")
			.data(node.children)
			.enter()
			.append("circle")
			.attr("cx", function (d: any) { return d.x0 + (d.x1 - d.x0) / 2 })
			.attr("cy", function (d: any) { return d.y0 + (d.y1 - d.y0) / 2 })
			.attr("r", function (d: any) {
				// min/max is 3,15
				// apply a linear scale.
				var sz = (d.value / myMarketCap) * 100;
				//console.log("pct is " + sz);

				return sz;
			})
			.style("stroke-width", 1)
			.style("stroke", "black")
			.style("fill", function (d: any) {
				return d.data.portfill;
			})
			.on("click", (e: MouseEvent, d: any) => {
				if (this.level === 0) {
					console.log("clicked on portfolio-in-sector: " + d.data.symbol);
				} else if (this.level === 1) {
					console.log("clicked on portfolio-in-leaf " + d.data.symbol);
				}
			})
			.on("mouseover", (e: MouseEvent, d: any) => { 
				this.handleMouseOver(e,d) ;
			} )
			.on("mouseout", (e: MouseEvent, d: any) => { 
				this.handleMouseOut(e,d) ;
			} )
			.on("mousemove", (e: MouseEvent, d: any) => { 
				this.handleMouseMove(e,d) ;
			} ) ;

	}

	private getRndInteger(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min)) + min;
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

	horizonChanged(evt: any): void {
		console.log("timeHorizon changed to " + this.timeHorizon);
	}

	handleMouseOver(evt: MouseEvent, datum: any): void {
		if( this.level === 0 ) {
			d3.select(".tooltip")
				.style("opacity", 1)
				.html(datum.data.symbol);
		} else {
			d3.select(".tooltip")
				.style("opacity", 1)
				.html(datum.data.symbol + '-' + datum.data.name);
		}
		
		var e: any = evt.target ; // SVGRectElement?
		var style = e.style ;
		style.setProperty('stroke', "red") ;
		style.setProperty('stoke-width', 2 ) ;
	}

	handleMouseOut(evt: MouseEvent, datum: any): void {
		d3.select(".tooltip")
			.style("opacity", 0);
		
		var e: any = evt.target ; // SVGRectElement?
		var style = e.style ;
		style.setProperty('stroke', "black") ;
		style.setProperty('stoke-width', 1 ) ;
	}

	handleMouseMove(evt: MouseEvent, datum: any): void {
		//console.log( "datum " + JSON.stringify(datum.data) ) ;
		// make sure that the tooltip winds up somewhere where it will
		// not cause mouseout for the svg element.  unlike the svg element,
		// the text will not be clipped, as the div is a toplevel component
		// for the page.
		d3.select(".tooltip")
			.style("left", (evt.pageX - 50) + "px")
			.style("top", (evt.pageY - 150) + "px");
	}
}