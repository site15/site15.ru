import { ChangeDetectionStrategy, Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../environments/environment";

@Component({
  selector: "site15-root",
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  hello$ = this.http.get<{ message: string }>(`${environment.api}/hello`);
  db$ = this.http.get(`${environment.api}/db`);
  constructor(private http: HttpClient) {}
}
