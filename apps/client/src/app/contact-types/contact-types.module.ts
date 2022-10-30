import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ContactTypesComponent } from "./components/contact-types/contact-types.component";
import { ContactTypesDetailsComponent } from "./components/contact-types-details/contact-types-details.component";
import { Route, RouterModule } from "@angular/router";
import { HeaderModule } from "../shared/header/header.module";
import { SharedUiModule } from "../shared-ui/shared-ui/shared-ui.module";
import { ContactTypesService } from "./contact-types.service";
import { FormsModule } from "@angular/forms";

const routes: Route[] = [
  { path: "contact-types", component: ContactTypesComponent },
  { path: "contact-types/:id", component: ContactTypesDetailsComponent },
];

@NgModule({
  declarations: [ContactTypesComponent, ContactTypesDetailsComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    HeaderModule,
    SharedUiModule,
  ],
  providers: [ContactTypesService],
})
export class ContactTypesModule {}
