import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { IContactTypes } from "../../../shared/models/contact-types.model";
import { ContactTypesService } from "../../contact-types.service";

@Component({
  selector: "site15-contact-types",
  templateUrl: "./contact-types.component.html",
  styleUrls: ["./contact-types.component.scss"],
})
export class ContactTypesComponent {
  contactTypes$!: Observable<IContactTypes[]>;

  constructor(private contactTypesService: ContactTypesService) {}
}
