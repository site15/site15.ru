import { Injectable, Provider } from "@angular/core";
import { AbstractTuiDialogService, TUI_DIALOGS } from "@taiga-ui/cdk";
import { PolymorpheusComponent } from "@tinkoff/ng-polymorpheus";

import { PromptComponent } from "./components/prompt.component";
import { IPromptOptions } from "./interface/prompt-options.interface";

@Injectable({
  providedIn: `root`,
})
export class PromptService extends AbstractTuiDialogService<
  IPromptOptions,
  boolean
> {
  defaultOptions = {
    heading: `Are you sure?`,
    buttons: [`Yes`, `No`],
  } as const;
  component = new PolymorpheusComponent(PromptComponent);
}

export const PROMPT_PROVIDER: Provider = {
  provide: TUI_DIALOGS,
  useExisting: PromptService,
  multi: true,
};
