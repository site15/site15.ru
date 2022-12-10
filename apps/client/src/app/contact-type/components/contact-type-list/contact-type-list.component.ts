import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";

import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { ConfirmationService } from "primeng/api";
import { DialogService, DynamicDialogRef } from "primeng/dynamicdialog";

import {
  BehaviorSubject,
  catchError,
  of,
  Subject,
  tap,
  throwError,
} from "rxjs";

import { IContactType } from "../../../shared/models/contact-type.model";
import { IBackendErrorResponse } from "../../../shared/modules/backend-error/interfaces/backend-error.interface";
import { ContactTypeService } from "../../contact-type.service";
import { ContactTypeDetailsComponent } from "../contact-type-details/contact-type-details.component";

@UntilDestroy()
@Component({
  selector: "site15-contact-types",
  templateUrl: "./contact-type-list.component.html",
  providers: [ConfirmationService, DialogService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypeListComponent implements OnInit {
  contactTypes$ = new BehaviorSubject<IContactType[]>([]);

  backendErrorsResponse$ = new Subject<IBackendErrorResponse>();

  /* UI property */
  dialogRef!: DynamicDialogRef;

  constructor(
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private contactTypeService: ContactTypeService
  ) {}

  ngOnInit(): void {
    this.getContactTypes();
  }

  getContactTypes() {
    this.contactTypeService
      .getAllContactTypes()
      .pipe(
        tap((items) => {
          this.contactTypes$.next(items);
        }),
        catchError((err) => {
          return this.handleError(err);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  deleteContactType(id: number) {
    this.contactTypeService
      .deleteContactType(id)
      .pipe(
        tap(() => {
          const items = this.contactTypes$
            .getValue()
            .filter((item) => item.id !== id);
          this.contactTypes$.next(items);
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
  /**
   * UI methods
   */

  openNew() {
    this.dialogRef = this.dialogService.open(ContactTypeDetailsComponent, {
      header: "Create contact type",
      width: "360px",
      closable: false,
      data: {
        isEditing: false,
        contactType: {},
        backendErrors: this.backendErrorsResponse$,
      },
    });

    this.dialogRef.onClose
      .pipe(
        tap((item) => {
          if (item) {
            const items = this.contactTypes$.getValue();
            items.push(item);
            this.contactTypes$.next(items);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  editContactType(contactType: IContactType) {
    this.dialogRef = this.dialogService.open(ContactTypeDetailsComponent, {
      header: "Edit the contact type",
      width: "360px",
      closable: false,
      data: {
        isEditing: true,
        contactType,
        backendErrors: this.backendErrorsResponse$,
      },
    });

    this.dialogRef.onClose
      .pipe(
        tap((item) => {
          if (item) {
            const items = this.contactTypes$.getValue();
            const index = items.findIndex(({ id }) => item.id === id);
            items[index] = item;
            this.contactTypes$.next(items);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
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
}
