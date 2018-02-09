/**
 * @license
 * Copyright © 2017-2018 OSIsoft, LLC. All rights reserved.
 * Use of this source code is governed by the terms in the accompanying LICENSE file.
 */
import { ExampleComponent } from './example.component';
import { TestBed, async, ComponentFixture, inject } from '@angular/core/testing'
import { Component, ViewChild, NO_ERRORS_SCHEMA } from '@angular/core';
import { testOutputPath } from '../../test-utils';

describe('Component: ExampleComponent', function () {

  @Component({
    selector: 'test-app',
    template: `
      <example #exampleComponent
        [fgColor]="fgColor"
        [bkColor]="bkColor"
        [data]="data"
        [pathPrefix]="pathPrefix"
      ></example>
    `
  })
  class TestHostComponent {
    @ViewChild('exampleComponent', { read: ExampleComponent })
    target: ExampleComponent;

    data: any;
    pathPrefix: string;
    fgColor: string = '#123456';
    bkColor: string = '#AA00BB';
  }

  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: ExampleComponent;

  beforeEach(async(() => {

  }));

  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports:      [ ],
      declarations: [ TestHostComponent, ExampleComponent ],
      providers:    [ ],
      schemas:      [ NO_ERRORS_SCHEMA ]
    })
    .overrideComponent(ExampleComponent, {
      // without the override, karma just attempts to load the html from http://localhost:9877/example.component.html
      set: {
        templateUrl: testOutputPath + 'example/example.component.html',
        styleUrls:  [testOutputPath + 'example/example.component.css']
      }
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      host = fixture.componentInstance;
      component = host.target;
      fixture.detectChanges();
    });
  });

   // very basic unit test example
   it('should be defined', () => {
    expect(component).toBeDefined();
  });
});
