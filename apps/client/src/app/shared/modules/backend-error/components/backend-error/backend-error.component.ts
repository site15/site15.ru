import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Input,
  OnDestroy,
} from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { TuiAlertService, TuiNotification } from "@taiga-ui/core";

import { IBackendErrorResponse } from "../../interfaces/backend-error.interface";

@UntilDestroy()
@Component({
  selector: "site15-backend-error",
  template: "",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackendErrorComponent {
  @Input() set backendErrors(response: IBackendErrorResponse) {
    this.handleError(response).pipe(untilDestroyed(this)).subscribe();
  }

  constructor(
    @Inject(TuiAlertService)
    private alertService: TuiAlertService
  ) {}

  private handleError(response: IBackendErrorResponse) {
    const { error, status } = response;

    if (status === 400) {
      const validationErrors = Object.values(error.description);
      const detail = validationErrors.map((err) => {
        return `${Object.values(err.constraints)}`;
      });

      return this.alertService.open("Validation failed", {
        status: TuiNotification.Error,
        data: detail.join(""),
      });
    }

    if (error.status === 500) {
      return this.alertService.open("Server error", {
        status: TuiNotification.Error,
      });
    }

    return this.alertService.open("Some error", {
      status: TuiNotification.Error,
    });
  }
}
