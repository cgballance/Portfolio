import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

/**
 * @title Dialog with header, scrollable content and actions
 */
@Component({
  selector: 'optioned-message-dialog-body',
  templateUrl: './OptionedMessageDialogBody.component.html',
  styleUrls: ['./OptionedMessageDialogBody.component.scss']
})

export class OptionedMessageDialogBody {
  constructor(
      public dialogRef: MatDialogRef<OptionedMessageDialogBody>,
      @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit() {
    //this.filterData = this.data;
    //const rightMostPos = window.innerWidth - Number(this.filterData.left);
    //this.dialogRef.updatePosition({ top: `${this.filterData.top}px`,
    //right: `${rightMostPos}px`});
  }

  close() {
    this.dialogRef.close();
  }
}
