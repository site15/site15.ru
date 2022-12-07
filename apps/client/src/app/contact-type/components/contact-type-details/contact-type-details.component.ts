import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { IContactType } from "../../../shared/models/contact-type.model";
import { ContactTypeService } from "../../contact-type.service";

@Component({
  selector: "site15-contact-type-details",
  templateUrl: "./contact-type-details.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTypeDetailsComponent implements OnInit {
  contactType!: IContactType;

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private contactTypeService: ContactTypeService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  onSubmit() {
    console.log(this.form.value);
  }

  private initializeForm() {
    this.form = this.fb.group({
      name: ["", Validators.required],
      title: ["", Validators.required],
      titleRu: ["", Validators.required],
    });
  }
}
