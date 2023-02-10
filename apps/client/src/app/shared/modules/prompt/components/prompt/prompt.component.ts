import { ChangeDetectionStrategy, Component, Inject } from "@angular/core";
import { TuiDialog } from "@taiga-ui/cdk";

import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";

import { IPromptOptions } from "../../interface/prompt-options.interface";

@Component({
  selector: "site15-prompt",
  templateUrl: "./prompt.component.html",
  styleUrls: ["./prompt.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptComponent {
  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    public readonly context: TuiDialog<IPromptOptions, boolean>
  ) {}

  onClick(response: boolean): void {
    this.context.completeWith(response);
  }
}
