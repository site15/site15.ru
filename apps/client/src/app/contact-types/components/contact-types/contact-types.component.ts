import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { ConfirmationService } from "primeng/api";
import { BehaviorSubject, catchError, Subject, tap, throwError } from "rxjs";

import { IContactTypes } from "../../../shared/models/contact-types.model";
import { IBackendError } from "../../../shared/modules/backend-error/interfaces/backend-error.interface";
import { ContactTypesService } from "../../contact-types.service";

@UntilDestroy()
@Component({
  selector: "site15-contact-types",
  templateUrl: "./contact-types.component.html",
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypesComponent implements OnInit {
  contactTypes$ = new BehaviorSubject<IContactTypes[]>([]);
  contactType!: IContactTypes;
  contactTypesDialog!: boolean;

  backendErrors$ = new Subject<IBackendError>();

  /* UI property */
  isEditing!: boolean;
  isInvalid!: boolean;

  constructor(
    private confirmationService: ConfirmationService,
    private contactTypesService: ContactTypesService
  ) {}

  ngOnInit(): void {
    this.getContactTypes();
  }

  getContactTypes() {
    this.contactTypesService
      .getAllContactTypes()
      .pipe(
        tap((items) => {
          this.contactTypes$.next(items);
        }),
        catchError(({ error }) => {
          this.backendErrors$.next(error);
          return throwError(() => new Error(JSON.stringify(error)));
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  deleteContactType(id: number) {
    this.contactTypesService
      .deleteContactType(id)
      .pipe(
        tap(() => {
          const items = this.contactTypes$
            .getValue()
            .filter((item) => item.id !== id);
          this.contactTypes$.next(items);
        }),
        catchError(({ error }) => {
          this.backendErrors$.next(error);
          return throwError(() => new Error(JSON.stringify(error)));
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  createContactType(ct: IContactTypes) {
    this.contactTypesService
      .createContactType(ct)
      .pipe(
        tap((item) => {
          const items = this.contactTypes$.getValue();
          items.push(item);
          this.contactTypes$.next(items);
          this.hideDialog();
        }),
        catchError(({ error }) => {
          this.backendErrors$.next(error);
          console.log(error);

          return throwError(() => new Error(JSON.stringify(error)));
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  saveContactType(ct: IContactTypes) {
    this.contactTypesService
      .updateContactType(ct)
      .pipe(
        tap(() => {
          const items = this.contactTypes$.getValue();
          const index = items.findIndex(({ id }) => ct.id === id);
          items[index] = ct;
          this.contactTypes$.next(items);
          this.hideDialog();
        }),
        catchError(({ error }) => {
          this.backendErrors$.next(error);
          return throwError(() => new Error(JSON.stringify(error)));
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  /**
   * UI methods
   */

  hideDialog() {
    this.contactTypesDialog = false;
  }

  openNew() {
    this.contactType = {} as IContactTypes;
    this.contactTypesDialog = true;
    this.isEditing = false;
  }

  editContactType(ct: IContactTypes) {
    this.contactType = { ...ct };
    this.contactTypesDialog = true;
    this.isEditing = true;
  }

  confirmDeleting(id: number) {
    this.confirmationService.confirm({
      message: "Are you sure that you want to proceed?",
      header: "WARNING",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.deleteContactType(id);
      },
    });
  }

  refresh() {
    location.reload();
  }

  disableBtn() {
    return (
      !this.contactType?.name ||
      !this.contactType?.title ||
      !this.contactType?.title_ru ||
      false
    );
  }
}
