import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { catchError, of, Subject, tap, throwError } from "rxjs";

import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";

import { IContactType } from "../../../shared/models/contact-type.model";
import { ContactTypeService } from "../../contact-type.service";
import { IBackendErrorResponse } from "../../../shared/modules/backend-error/interfaces/backend-error.interface";

@UntilDestroy()
@Component({
  selector: "site15-contact-type-details",
  templateUrl: "./contact-type-details.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypeDetailsComponent implements OnInit {
  backendErrorsResponse$ = new Subject<IBackendErrorResponse>();

  contactType!: IContactType;
  form!: FormGroup;

  /**
   * UI prop
   */
  isEditing!: boolean;

  constructor(
    private fb: FormBuilder,
    private contactTypeService: ContactTypeService,
    private dynamicDialogRef: DynamicDialogRef,
    private dynamicDialogConfig: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.initializeValues();
    this.initializeForm();
  }

  onSubmit() {
    this.isEditing
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
          this.dynamicDialogRef.close(item);
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
          this.dynamicDialogRef.close(item);
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
    this.form = this.fb.group({
      name: [this.contactType?.name || "", Validators.required],
      title: [this.contactType?.title || "", Validators.required],
      title_ru: [this.contactType?.title_ru || "", Validators.required],
    });
  }

  private initializeValues() {
    const { contactType, isEditing } = this.dynamicDialogConfig.data;

    this.contactType = contactType;
    this.isEditing = isEditing;
  }
}
