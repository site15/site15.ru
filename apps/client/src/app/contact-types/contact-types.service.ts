import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, of } from "rxjs";
import { environment } from "../../environments/environment";
import { IContactTypes } from "../shared/models/contact-types.model";
import { IContactTypesResponse } from "./interfaces/contact-types-response.interface";

@Injectable()
export class ContactTypesService {
  constructor(private http: HttpClient) {}

  getAllContactTypes() {
    const url = `${environment.api}/contact-type`;

    return this.http.get<IContactTypes[]>(url).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }
  getContactTypeById(id: number) {
    const url = `${environment.api}/contact-type/${id}`;

    return this.http.get<IContactTypes>(url).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }

  createContactType(data: IContactTypes) {
    const url = `${environment.api}/contact-type`;

    return this.http.post<IContactTypes>(url, data).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }

  deleteContactType(id: number) {
    const url = `${environment.api}/contact-type/${id}`;
    console.log("delete metho");

    return this.http.delete(url).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }

  updateContactType(data: IContactTypes) {
    const { id } = data;
    const url = `${environment.api}/contact-type/${id}`;

    return this.http.put(url, data).pipe(
      catchError((err) => {
        throw err;
      })
    );
  }
}
