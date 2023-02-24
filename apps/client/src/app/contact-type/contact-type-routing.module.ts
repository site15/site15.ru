import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";

import { ContactTypeListComponent } from "./components/contact-type-list/contact-type-list.component";

const routes: Route[] = [{ path: "", component: ContactTypeListComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContactTypeRoutingModule {}
