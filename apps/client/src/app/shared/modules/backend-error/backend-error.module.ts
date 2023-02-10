import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { BackendErrorComponent } from "./components/backend-error/backend-error.component";
import { GetErrorByParamPipe } from "./pipes/get-error-by-param.pipe";

@NgModule({
  declarations: [BackendErrorComponent, GetErrorByParamPipe],
  imports: [CommonModule],
  exports: [BackendErrorComponent, GetErrorByParamPipe],
})
export class BackendErrorModule {}
