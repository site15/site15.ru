import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { MainComponent } from "./main.component";

const routes: Route[] = [
  {
    path: "",
    component: MainComponent,
  },
  {
    path: "contact-types",
    loadChildren: () =>
      import("./contact-type/contact-type.module").then(
        (m) => m.ContactTypeModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
