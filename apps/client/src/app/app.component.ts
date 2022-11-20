import { HttpClient } from "@angular/common/http";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "site15-root",
  templateUrl: "./app.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private http: HttpClient) {}
}
