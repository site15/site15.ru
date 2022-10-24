import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";

@NgModule({
  imports: [CommonModule],
  exports: [InputTextModule, PasswordModule, ButtonModule],
})
export class SharedUiModule {}
