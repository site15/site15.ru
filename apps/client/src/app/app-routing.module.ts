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
      import("./contact-types/contact-types.module").then(
        (m) => m.ContactTypesModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
