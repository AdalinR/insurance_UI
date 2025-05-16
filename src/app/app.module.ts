import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ComponentPaletteComponent } from './components/component-palette/component-palette.component';
import { PropertiesPanelComponent } from './components/properties-panel/properties-panel.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TemplateBuilderComponent } from './components/template-builder/template-builder.component';
import { TemplateCanvasComponent } from './components/template-canvas/template-canvas.component';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './pages/layout/layout.component';
import { NgChartsModule } from 'ng2-charts';
import { MatTabsModule } from '@angular/material/tabs';
import { ElementDetailsDialogComponent } from './components/element-details-dialog/element-details-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SidebarComponent,
    LayoutComponent,
    TemplateBuilderComponent,
    // ElementDetailsDialogComponent
    // ComponentPaletteComponent,
    // PropertiesPanelComponent,
    // TemplateCanvasComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DragDropModule,
    AppRoutingModule,
    NgChartsModule,
    MatTabsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ElementDetailsDialogComponent,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }