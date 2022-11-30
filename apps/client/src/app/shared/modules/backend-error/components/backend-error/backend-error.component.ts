import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { MessageService } from "primeng/api";

import { IBackendError } from "../../interfaces/backend-error.interface";

@Component({
  selector: "site15-backend-error",
  template: "<p-toast></p-toast>",
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackendErrorComponent implements OnDestroy {
  @Input() set backendErrors(value: IBackendError) {
    this.errors = value;

    setTimeout(() => {
      this.messageService.add({
        severity: "error",
        summary: this.backendErrors.message,
        detail: JSON.stringify(this.backendErrors["description"]),
      });
    });
  }

  get backendErrors() {
    return this.errors;
  }

  errors!: IBackendError;

  constructor(private messageService: MessageService) {}

  ngOnDestroy(): void {
    this.messageService.clear();
  }
}
