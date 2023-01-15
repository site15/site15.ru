import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { TuiButtonModule } from "@taiga-ui/core";

import { PolymorpheusModule } from "@tinkoff/ng-polymorpheus";
import { PromptComponent } from "./components/prompt/prompt.component";

@NgModule({
  declarations: [PromptComponent],
  imports: [CommonModule, PolymorpheusModule, TuiButtonModule],
  exports: [PromptComponent],
})
export class PromptModule {}
