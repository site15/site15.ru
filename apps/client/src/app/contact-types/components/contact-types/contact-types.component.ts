import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { IContactTypes } from "../../../shared/models/contact-types.model";
import { ContactTypesService } from "../../contact-types.service";

@Component({
  selector: "site15-contact-types",
  templateUrl: "./contact-types.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypesComponent implements OnInit {
  contactTypes$!: Observable<IContactTypes[]>;
  contactType!: IContactTypes;
  contactTypesDialog!: boolean;

  editing!: boolean;

  constructor(private contactTypesService: ContactTypesService) {}

  ngOnInit(): void {
    this.contactTypes$ = this.contactTypesService.getAllContactTypes();
  }

  hideDialog() {
    this.contactTypesDialog = false;
  }

  openNew() {
    this.contactType = {} as IContactTypes;
    this.contactTypesDialog = true;
    this.editing = false;
  }

  deleteContactType(id: number) {
    this.contactTypesService.deleteContactType(id);
  }

  createContactType(ct: IContactTypes) {
    this.contactTypesService.createContactType(ct);
    this.contactTypesDialog = false;
  }

  editContactType(ct: IContactTypes) {
    this.contactType = { ...ct };
    this.contactTypesDialog = true;
    this.editing = true;
  }

  saveContactType(ct: IContactTypes) {
    this.contactTypesService.updateContactType(ct);
    this.contactTypesDialog = false;
  }
}
