import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IContactType } from "../shared/models/contact-type.model";

@Injectable()
export class ContactTypeService {
  constructor(private http: HttpClient) {}

  getAllContactTypes(): Observable<IContactType[]> {
    const url = `${environment.api}/contact-types`;

    return this.http.get<IContactType[]>(url);
  }
  getContactTypeById(id: number): Observable<IContactType> {
    const url = `${environment.api}/contact-types/${id}`;

    return this.http.get<IContactType>(url);
  }

  createContactType(data: IContactType): Observable<IContactType> {
    const url = `${environment.api}/contact-types`;

    return this.http.post<IContactType>(url, data);
  }

  deleteContactType(id: number) {
    const url = `${environment.api}/contact-types/${id}`;

    return this.http.delete(url);
  }

  updateContactType(data: IContactType): Observable<IContactType> {
    const { id } = data;
    const url = `${environment.api}/contact-types/${id}`;

    return this.http.put<IContactType>(url, data);
  }
}
