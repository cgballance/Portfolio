import { Injectable } from '@angular/core';
import { packEnclose } from 'd3-hierarchy';
import { NGEventHubService } from '../ngevent-hub.service';
import { Position } from '../model/Position';
import { Security } from '../model/Security';
import * as helpers from '../helpers'

@Injectable({
  providedIn: 'root'
})

export class PortfolioService {
  private positions: Position[] ;
  private vpositions: Position[] ;
  private needsVirtualUpdate: boolean ;

  public constructor(
    private _ngEventHubService: NGEventHubService) {
    this.loadInitialPortfolio();
  }

  getPositions(): Position[] {
    return this.positions;
  }

  /**
   * Virtual positions are composed of all underlying positions of ETFs and Mutual Funds into their constituent contributions.
   * This is useful for looking at diversification and whether or not it is useful for adding positions of these types of assets, when
   * one already has similar investments.  It is also useful to see, at a glance, what sectors/stocks a given instrument contains.  
   */
  getVirtualPositions(): Position[] {
    if( this.needsVirtualUpdate === true ) {
      this.vpositions = [] ;
      this.positions.forEach( p => {
        if( p.secType === 'EQ' || p.secType === 'MMF' ) {
          this.vpositions.push(p);
        } else {
            var constituents:Position[]  = this.getAllocations( p ) ;
            constituents.forEach( constituent => {
              this.vpositions.push(constituent);
            }) ;
        }
      } ) ;
      this.needsVirtualUpdate = false;
    }
    return this.vpositions ;
  }

  getAllocations( p:Position ): Position[] {
    var ps:Position[] = [] ;

    if( p.symbol === 'SP500' ) {
      
    }

    return ps ;
  }

  addPositions(newPositions: Position[]): string {
    var allowedAdditions: Position[] = [];
    var rval: string = '';
    newPositions.forEach(p => {
      var skip: boolean = false;
      this.positions.forEach(position => {
        if (position.securityId === p.securityId) {
          skip = true;
          rval += p.description + '(' + p.symbol + ') already exists in portfolio.\n';
        }
      });
      if (skip === false) {
        this.positions.push(p);
        allowedAdditions.push(p);
      }
    });
    if (allowedAdditions.length > 0) {
      this.needsVirtualUpdate = true;
      this.updatePositions() ;
      this._ngEventHubService.PortfolioAddEvent.emit(newPositions);
    }

    return rval;
  }

  updatePosition( position: Position) {
    // replace in positions
    this.updatePositions() ;
    this.needsVirtualUpdate = true ;
  }

  loadInitialPortfolio(): void {
    this.positions = [];

    var p: Position;

    p = new Position();
    p.securityId = '1';
    p.symbol = 'MF1';
    p.description = 'Mutual Fund 1';
    p.secType = 'MF';
    p.px = 1.00;
    p.qty = 300000;
    p.value = 300000.00;
    p.costPx = 1.00;
    p.costValue = 254550.00;
    this.positions.push(p);

    p = new Position();
    p.securityId = '2',
      p.symbol = 'MMF1',
      p.description = 'Money Market Fund 1',
      p.secType = 'MM',
      p.qty = 155000,
      p.px = 1.00,
      p.value = 155000.00,
      p.costPx = 1.00,
      p.costValue = 14800.00,
      this.positions.push(p);

      this.updatePositions() ;

    return;
  }

  updatePositions():void {
    var total:number = 0 ;
    this.positions.forEach( p => { total += p.value; }) ;
    this.positions.forEach( p => {
      p.pct = (p.value / total) * 100.00 ;
    }) ;
    this.needsVirtualUpdate = true ;
  }
}
