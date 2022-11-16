import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { IContactTypes } from "../shared/models/contact-types.model";

@Injectable()
export class ContactTypesService {
  contactTypes: IContactTypes[] = [
    {
      id: 1,
      name: "first_contact_type",
      title: "first",
      title_ru: "первый",
    },
    {
      id: 2,
      name: "second_contact_type",
      title: "second",
      title_ru: "второй",
    },
    {
      id: 3,
      name: "third_contact_type",
      title: "third",
      title_ru: "третий",
    },
  ];

  getAllContactTypes(): Observable<IContactTypes[]> {
    return of(this.contactTypes);
  }

  getContactTypeById(id: number): Observable<IContactTypes | undefined> {
    return of(this.contactTypes.find((ct) => ct.id === id));
  }

  createContactType(data: IContactTypes): void {
    this.contactTypes.push(data);
  }

  deleteContactType(index: number): void {
    this.contactTypes.splice(index, 1);
  }

  updateContactType(data: IContactTypes): void {
    const indexOfCt = this.contactTypes.findIndex((ct) => ct.id === data.id);

    this.contactTypes.splice(indexOfCt, 1, data);
  }
}
