// app/app.module.ts
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AgGridModule } from "@ag-grid-community/angular";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core' ;
import { NgxMatDatetimePickerModule, NgxMatNativeDateModule, NgxMatTimepickerModule } from '@angular-material-components/datetime-picker';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule} from '@angular/material/select';
import { HttpClientModule } from '@angular/common/http';

// application
import { AppComponent } from "./app.component";
import { EquitiesComponent } from "./equities/equities.component";
import { MutualFundChooserComponent } from "./equities/mutualfundchooser/mutualfundchooser.component";
import { ETFChooserComponent } from "./equities/etfchooser/etfchooser.component";
import { StockChooserComponent } from "./equities/stockchooser/stockchooser.component";
import { PortfolioComponent } from "./portfolio/portfolio.component";
import { ConstituentsComponent } from "./constituents/constituents.component";
import { OptionedMessageDialogBody } from './dialog/OptionedMessageDialogBody.component';
import { NGEventHubService } from './ngevent-hub.service' ;
import { PortfolioService } from './portfolio/portfolio.service' ;

@NgModule({
	imports: [
		BrowserModule,
		AgGridModule.withComponents([]),
		MatExpansionModule,
		MatInputModule,
		MatButtonModule,
		MatRadioModule,
		MatCheckboxModule,
		MatTabsModule,
		MatDatepickerModule, MatNativeDateModule,
		NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule,
		BrowserAnimationsModule,
		FormsModule,
		MatIconModule,
		MatCardModule,
		MatToolbarModule,
		ReactiveFormsModule,
		MatDialogModule,
		MatSelectModule,
		HttpClientModule
	],
	declarations: [
		AppComponent,
		EquitiesComponent,
		MutualFundChooserComponent,
		StockChooserComponent,
		ETFChooserComponent,
		PortfolioComponent,
		ConstituentsComponent,
		OptionedMessageDialogBody
	],
	entryComponents: [OptionedMessageDialogBody],
	providers: [NGEventHubService,PortfolioService],
	bootstrap: [AppComponent]
})

export class AppModule {
}
