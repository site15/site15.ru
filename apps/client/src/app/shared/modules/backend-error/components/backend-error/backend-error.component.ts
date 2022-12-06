import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from "@angular/core";
import { MessageService } from "primeng/api";

import { IBackendErrorResponse } from "../../interfaces/backend-error.interface";

@Component({
  selector: "site15-backend-error",
  template: "<p-toast></p-toast>",
  providers: [MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackendErrorComponent implements OnDestroy {
  @Input() set backendErrors(response: IBackendErrorResponse) {
    setTimeout(() => {
      this.handleError(response);
    });
  }

  constructor(private messageService: MessageService) {}

  ngOnDestroy(): void {
    this.messageService.clear();
  }

  private handleError(response: IBackendErrorResponse) {
    const { error, status } = response;

    if (status === 400) {
      const validationErrors = Object.values(error.description);
      const detail = validationErrors.map((err) => {
        return `${Object.values(err.constraints)}`;
      });

      this.messageService.add({
        severity: "error",
        summary: error.message,
        detail: detail.join(""),
      });
    }

    if (error.status === 500) {
      this.messageService.add({
        severity: "error",
        summary: error.message,
        detail: "",
      });
    }
  }
}
