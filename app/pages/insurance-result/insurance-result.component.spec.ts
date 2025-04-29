import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsuranceResultComponent } from './insurance-result.component';

describe('InsuranceResultComponent', () => {
  let component: InsuranceResultComponent;
  let fixture: ComponentFixture<InsuranceResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsuranceResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuranceResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
