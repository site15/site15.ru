import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AuthService } from "./auth.service";
import { SignInComponent } from "./components/sign-in/sign-in.component";
import { SharedUiModule } from "../shared-ui/shared-ui.module";
import { Route, RouterModule } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";

const routes: Route[] = [{ path: "sign-in", component: SignInComponent }];

@NgModule({
  declarations: [SignInComponent],
  imports: [
    CommonModule,
    SharedUiModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
  ],
  providers: [AuthService],
})
export class AuthModule {}
