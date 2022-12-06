import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { environment } from "../environments/environment";

@Component({
  selector: "site15-main",
  template: `<div style="text-align: center!important">
    <h1>Welcome to site15!</h1>
    <img
      width="450"
      src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png"
    />
    <div>Message: {{ hello$ | async | json }}</div>
    <div>DB: {{ db$ | async | json }}</div>
    <a routerLink="./contact-types">contact-types</a>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {
  hello$ = this.http.get<{ message: string }>(`${environment.api}/hello`);
  db$ = this.http.get(`${environment.api}/db`);
  constructor(private http: HttpClient) {}
}
