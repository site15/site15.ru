import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ContactTypesComponent } from "./contact-types.component";

describe("ContactTypesComponent", () => {
  let component: ContactTypesComponent;
  let fixture: ComponentFixture<ContactTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactTypesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
