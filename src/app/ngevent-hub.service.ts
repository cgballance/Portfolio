import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Position } from './model/Position' ;

@Injectable({
  providedIn: 'root'
})
export class NGEventHubService {
  
  //
  // The selection events are generally used to deal with cascading
  // view dependencies.
  //
  ETFSelectionEvent = new EventEmitter() ;
  MutualFundSelectionEvent = new EventEmitter() ;
  StockSelectionEvent = new EventEmitter() ;
  SectorSelectionEvent = new EventEmitter() ;
  PortfolioAddEvent = new EventEmitter<Position[]>() ;
  PortfolioUpdateEvent = new EventEmitter<Position[]>() ;
  PortfolioDeleteEvent = new EventEmitter<Position[]>() ;
  PortfolioDropEvent = new EventEmitter() ;
  
  constructor() {
   }
}
