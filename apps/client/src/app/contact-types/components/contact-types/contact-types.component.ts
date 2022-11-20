import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Subject, tap } from "rxjs";

import { IContactTypes } from "../../../shared/models/contact-types.model";
import { ContactTypesService } from "../../contact-types.service";

@UntilDestroy()
@Component({
  selector: "site15-contact-types",
  templateUrl: "./contact-types.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypesComponent implements OnInit {
  contactTypes$ = new Subject<IContactTypes[]>();
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
        tap((items) => this.contactTypes$.next(items)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  deleteContactType(id: number) {
    this.contactTypesService
      .deleteContactType(id)
      .pipe(
        tap(() => {
          this.getContactTypes();
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  createContactType(ct: IContactTypes) {
    this.contactTypesService
      .createContactType(ct)
      .pipe(
        tap(() => {
          this.getContactTypes();
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
          this.getContactTypes();
        }),
        untilDestroyed(this)
      )
      .subscribe();
    this.contactTypesDialog = false;
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
