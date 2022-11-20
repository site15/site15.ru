import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { BehaviorSubject, tap } from "rxjs";

import { IContactTypes } from "../../../shared/models/contact-types.model";
import { ContactTypesService } from "../../contact-types.service";

@UntilDestroy()
@Component({
  selector: "site15-contact-types",
  templateUrl: "./contact-types.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypesComponent implements OnInit {
  contactTypes$ = new BehaviorSubject<IContactTypes[]>([]);
  contactType!: IContactTypes;
  contactTypesDialog!: boolean;

  /* UI property */
  editing!: boolean;

  constructor(private contactTypesService: ContactTypesService) {}

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
        }),
        untilDestroyed(this)
      )
      .subscribe();
    this.contactTypesDialog = false;
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
          this.contactTypesDialog = false;
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
    this.editing = false;
  }

  editContactType(ct: IContactTypes) {
    this.contactType = { ...ct };
    this.contactTypesDialog = true;
    this.editing = true;
  }
}
