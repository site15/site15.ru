import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IContactTypes } from "../shared/models/contact-types.model";

@Injectable()
export class ContactTypesService {
  constructor(private http: HttpClient) {}

  getAllContactTypes(): Observable<IContactTypes[]> {
    const url = `${environment.api}/contact-type`;

    return this.http.get<IContactTypes[]>(url);
  }
  getContactTypeById(id: number): Observable<IContactTypes> {
    const url = `${environment.api}/contact-type/${id}`;

    return this.http.get<IContactTypes>(url);
  }

  createContactType(data: IContactTypes): Observable<IContactTypes> {
    const url = `${environment.api}/contact-type`;

    return this.http.post<IContactTypes>(url, data);
  }

  deleteContactType(id: number) {
    const url = `${environment.api}/contact-type/${id}`;
    console.log("delete metho");

    return this.http.delete(url);
  }

  updateContactType(data: IContactTypes) {
    const { id } = data;
    const url = `${environment.api}/contact-type/${id}`;

    return this.http.put(url, data);
  }
}
