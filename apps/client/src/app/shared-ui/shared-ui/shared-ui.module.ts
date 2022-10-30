import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TableModule } from "primeng/table";
import { ToolbarModule } from "primeng/toolbar";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
@NgModule({
  declarations: [],
  imports: [CommonModule],
  exports: [
    TableModule,
    ToolbarModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
  ],
})
export class SharedUiModule {}
