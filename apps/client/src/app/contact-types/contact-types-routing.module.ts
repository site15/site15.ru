import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

import { ContactTypesComponent } from "./components/contact-types/contact-types.component";

const routes: Route[] = [{ path: "", component: ContactTypesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactTypesRoutingModule {}
