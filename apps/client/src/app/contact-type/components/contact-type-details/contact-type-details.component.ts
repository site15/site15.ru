import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { DynamicFormBuilder, DynamicFormGroup } from "ngx-dynamic-form-builder";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { TuiDialogContext } from "@taiga-ui/core";
import { POLYMORPHEUS_CONTEXT } from "@tinkoff/ng-polymorpheus";

import { catchError, of, Subject, tap, throwError } from "rxjs";

import {
  ContactType,
  IContactType,
} from "../../../shared/models/contact-type.model";
import { ContactTypeService } from "../../contact-type.service";
import { IBackendErrorResponse } from "../../../shared/modules/backend-error/interfaces/backend-error.interface";

@UntilDestroy()
@Component({
  selector: "site15-contact-type-details",
  templateUrl: "./contact-type-details.component.html",
  styles: [
    `
      .error-fields {
        display: flex;
        flex-direction: column;
        color: #ff0000;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypeDetailsComponent implements OnInit {
  backendErrorsResponse$!: Subject<IBackendErrorResponse>;

  contactType!: IContactType;
  form!: DynamicFormGroup<IContactType>;

  private fb = new DynamicFormBuilder();

  constructor(
    @Inject(POLYMORPHEUS_CONTEXT)
    private readonly context: TuiDialogContext<
      IContactType | null,
      {
        contactType: IContactType;
        backendErrors: Subject<IBackendErrorResponse>;
      }
    >,

    private contactTypeService: ContactTypeService
  ) {}

  ngOnInit(): void {
    this.initializeValues();
    this.initializeForm();
  }

  onSubmit() {
    this.context.label === "Edit"
      ? this.saveContactType({
          id: this.contactType.id,
          ...this.form.value,
        })
      : this.createContactType(this.form.value);
  }

  createContactType(ct: IContactType) {
    this.contactTypeService
      .createContactType(ct)
      .pipe(
        tap((item) => {
          this.context.completeWith(item);
        }),
        catchError((err) => {
          return this.handleError(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  saveContactType(ct: IContactType) {
    this.contactTypeService
      .updateContactType(ct)
      .pipe(
        tap((item) => {
          this.context.completeWith(item);
        }),
        catchError((err) => {
          return this.handleError(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private handleError(err: IBackendErrorResponse) {
    const { error, status } = err;

    this.backendErrorsResponse$.next(err);

    if (status === 400) {
      return of([]);
    }

    return throwError(() => new Error(JSON.stringify(error)));
  }

  private initializeForm() {
    this.form = this.fb.rootFormGroup(ContactType, {
      name: this.contactType?.name || "",
      title: this.contactType?.title || "",
      title_ru: this.contactType?.title_ru || "",
    });
  }

  private initializeValues() {
    const { contactType, backendErrors } = this.context.data;
    this.contactType = contactType;
    this.backendErrorsResponse$ = backendErrors;
  }

  /**
   * UI methods
   */

  closeDialog() {
    this.context.completeWith(null);
  }
}
