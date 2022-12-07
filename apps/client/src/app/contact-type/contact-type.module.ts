import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule } from "@angular/forms";

import { TableModule } from "primeng/table";
import { ToolbarModule } from "primeng/toolbar";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DynamicDialogModule } from "primeng/dynamicdialog";

import { ContactTypeListComponent } from "./components/contact-type-list/contact-type-list.component";
import { ContactTypeService } from "./contact-type.service";
import { ContactTypeRoutingModule } from "./contact-type-routing.module";
import { BackendErrorModule } from "../shared/modules/backend-error/backend-error.module";
import { ContactTypeDetailsComponent } from "./components/contact-type-details/contact-type-details.component";

@NgModule({
  declarations: [ContactTypeListComponent, ContactTypeDetailsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ToolbarModule,
    DynamicDialogModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ContactTypeRoutingModule,
    BackendErrorModule,
  ],
  providers: [ContactTypeService],
})
export class ContactTypeModule {}
