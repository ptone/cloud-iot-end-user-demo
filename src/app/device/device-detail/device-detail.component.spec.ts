import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { deviceDetailComponent } from './device-detail.component';

describe('deviceDetailComponent', () => {
  let component: deviceDetailComponent;
  let fixture: ComponentFixture<deviceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ deviceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(deviceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
