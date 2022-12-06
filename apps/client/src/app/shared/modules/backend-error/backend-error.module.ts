import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ToastModule } from "primeng/toast";

import { BackendErrorComponent } from "./components/backend-error/backend-error.component";

@NgModule({
  declarations: [BackendErrorComponent],
  imports: [CommonModule, ToastModule],
  exports: [BackendErrorComponent],
})
export class BackendErrorModule {}
