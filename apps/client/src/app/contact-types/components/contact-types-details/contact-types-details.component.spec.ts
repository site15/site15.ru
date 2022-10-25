import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ContactTypesDetailsComponent } from "./contact-types-details.component";

describe("ContactTypesDetailsComponent", () => {
  let component: ContactTypesDetailsComponent;
  let fixture: ComponentFixture<ContactTypesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactTypesDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactTypesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
