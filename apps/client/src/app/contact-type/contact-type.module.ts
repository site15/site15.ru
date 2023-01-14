import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import {
  TuiButtonModule,
  TuiHostedDropdownModule,
  TuiLoaderModule,
  TuiTextfieldControllerModule,
} from "@taiga-ui/core";
import { TuiInputModule } from "@taiga-ui/kit";
import { TuiLetModule } from "@taiga-ui/cdk";
import {
  TuiReorderModule,
  TuiTableModule,
  TuiTablePaginationModule,
} from "@taiga-ui/addon-table";

import { ContactTypeListComponent } from "./components/contact-type-list/contact-type-list.component";
import { ContactTypeService } from "./contact-type.service";
import { ContactTypeRoutingModule } from "./contact-type-routing.module";
import { BackendErrorModule } from "../shared/modules/backend-error/backend-error.module";
import { ContactTypeDetailsComponent } from "./components/contact-type-details/contact-type-details.component";

@NgModule({
  declarations: [ContactTypeListComponent, ContactTypeDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    ContactTypeRoutingModule,
    BackendErrorModule,

    TuiTableModule,
    TuiTextfieldControllerModule,
    TuiLoaderModule,
    TuiHostedDropdownModule,
    TuiReorderModule,
    TuiButtonModule,
    TuiTablePaginationModule,
    TuiLetModule,
    TuiInputModule,
  ],
  providers: [ContactTypeService],
})
export class ContactTypeModule {}
