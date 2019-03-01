import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { devicePage } from './device.page';

describe('devicePage', () => {
  let component: devicePage;
  let fixture: ComponentFixture<devicePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ devicePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(devicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
