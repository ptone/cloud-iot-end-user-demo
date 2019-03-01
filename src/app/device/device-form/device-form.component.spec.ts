import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { deviceFormComponent } from './device-form.component';

describe('deviceFormComponent', () => {
  let component: deviceFormComponent;
  let fixture: ComponentFixture<deviceFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ deviceFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(deviceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
