
import { MatDialog, MatDialogRef, MatDialogConfig, DialogPosition } from '@angular/material/dialog' ;
import { OptionedMessageDialogBody } from "./dialog/OptionedMessageDialogBody.component";	

/* This is a shallow clone */
export function clone( obj: any ) {
    return Object.assign({}, obj);
}

/* This is a shallow copy */
export function copy( target: any, source: any ) {
    return Object.assign(target, source);
}

/* This is a deep equality test */
export function areEqual(object1:any, object2:any) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = object1[key];
    const val2 = object2[key];
    const areObjects = isObject(val1) && isObject(val2);
    if (
      areObjects && !areEqual(val1, val2) ||
      !areObjects && val1 !== val2
    ) {
      return false;
    }
  }

  return true;
}

export function isObject(object) {
  return object != null && typeof object === 'object';
}

export function showMessage(context: any, dialog: MatDialog, title: string, message: string, options?: any) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.data = {
        title: title,
        message: message,
        context: context,
    } ;
    let dialogRef : MatDialogRef<OptionedMessageDialogBody> ;
    if( options !== undefined ) {
      dialogConfig.data.options = options;
    }
    var pos : DialogPosition ;
    if( context.mouseEvent !== undefined ) {
      pos = { 
        top: context.mouseEvent.clientY + 'px',
        left: context.mouseEvent.clientX + 'px'
      }
    } else if( context.elementRect !== undefined ) {
      pos = {
        top: context.elementRect.top + 'px',
        left: context.elementRect.left + 'px'
      }
    }
    dialogRef = dialog.open(OptionedMessageDialogBody, dialogConfig);
    if( pos !== undefined ) {
      dialogRef.updatePosition(pos);
    }

    return dialogRef;
}