import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { ToolbarModule } from "primeng/toolbar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmDialogModule } from "primeng/confirmdialog";

import { ContactTypesComponent } from "./components/contact-types/contact-types.component";
import { ContactTypesService } from "./contact-types.service";
import { ContactTypesRoutingModule } from "./contact-types-routing.module";
import { BackendErrorModule } from "../shared/modules/backend-error/backend-error.module";

@NgModule({
  declarations: [ContactTypesComponent],
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ConfirmDialogModule,
    ContactTypesRoutingModule,
    BackendErrorModule,
  ],
  providers: [ContactTypesService],
})
export class ContactTypesModule {}
