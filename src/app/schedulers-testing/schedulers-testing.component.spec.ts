import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SchedulersTestingComponent } from './schedulers-testing.component';
import {asyncScheduler, scheduled, VirtualTimeScheduler} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {timeRange} from 'rxjs-toolbox';
import {TestScheduler} from 'rxjs/testing';

interface User {
  userId: number;
  firstName: string;
  lastName: string;
}

describe('SchedulersTestingComponent', () => {
  let component: SchedulersTestingComponent;
  let fixture: ComponentFixture<SchedulersTestingComponent>;
  let mockHttp: any;

  beforeEach(async () => {
    mockHttp = {get: () => scheduled([{userId: 12, firstName: 'Yosemite', lastName: 'Sam'}], asyncScheduler)}
    await TestBed.configureTestingModule({
      declarations: [ SchedulersTestingComponent ],
      providers: [
        {provide: HttpClient, useValue: mockHttp}
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SchedulersTestingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should emit 3 values', () => {
    const mockedComp = new SchedulersTestingComponent(mockHttp);
    const result: string[] = [];
    const expectedResult = ['1Hi👋', '2Hi👋', '3Hi👋'];

    mockedComp.addHi().subscribe((val: string) => result.push(val));

    expect(result).toEqual(expectedResult);
  });

  // 1. Fake time with jasmin done() callback:
  it ('should emit 3 values', (done) => {
    const mockedComp = new SchedulersTestingComponent(mockHttp);
    const values$ = mockedComp.addHiAsap();
    const result: string[] = [];
    values$.subscribe({
      next: value => {
        result.push(value);
      },
      complete: () => {
        expect(result).toEqual(['1Hi👋', '2Hi👋', '3Hi👋']);
        done();
      }
    });
  });

  it('should get user data 3 times (with jasmine done() callback)', (done) => {
    const mockedComp = new SchedulersTestingComponent(mockHttp);
    const userData$ = mockedComp.getUserData(12, 0.01);
    const result: User[] = [];

    userData$.subscribe({
      next: (value: any) => {
        result.push(value);
      },
      complete: () => {
        expect(result).toEqual([{
          userId: 12, firstName: 'Yosemite', lastName: 'Sam'
        }, {
          userId: 12, firstName: 'Yosemite', lastName: 'Sam'
        }, {
          userId: 12, firstName: 'Yosemite', lastName: 'Sam'
        }]);
        done();
      }
    });
  });

  // 2. VirtualTimeScheduler:
  it('should get user data 3 times (with VirtualTimeScheduler)', () => {
    const scheduler = new VirtualTimeScheduler();
    mockHttp = {get: () => scheduled([{userId: 12, firstName: 'Yosemite', lastName: 'Sam'}], scheduler)}
    const mockedComp = new SchedulersTestingComponent(mockHttp);
    const userData$ = mockedComp.getUserDataAsyncScheduler(12, 0.01, scheduler);  
    const result: User[] = [];
    

    userData$.subscribe({
      next: (value: any) => {
        result.push(value);
      }
    });

    scheduler.flush();
    expect(result).toEqual([{
      userId: 12, firstName: 'Yosemite', lastName: 'Sam'
    }, {
      userId: 12, firstName: 'Yosemite', lastName: 'Sam'
    }, {
      userId: 12, firstName: 'Yosemite', lastName: 'Sam'
    }]);
  });

  // 3. Angular fakeAsync function:
  it('should call this.http.get and get result', fakeAsync(() => {
    const input$ = timeRange([
      {value: {target: {value: 'aaa'}}, delay: 100},
      {value: {target: {value: 'aaab'}}, delay: 500},
      {value: {target: {value: 'aaabc'}}, delay: 2500},
    ], true);

    const result: {}[] = [];
    mockHttp = {get: () => scheduled(['someValue'], asyncScheduler)};
    const mockedComp = new SchedulersTestingComponent(mockHttp);
    const searchResults$ = mockedComp.getSearchResult(input$);

    searchResults$.subscribe({
      next: (value) => {
        result.push(value);
      }
    });

    tick(3500);

    expect(result).toEqual(['someValue', 'someValue']);
  }));

  // TestScheduler
  it('should getUserData 3 times (use TestScheduler as VirtualTimeScheduler)', () => {
    const assertion = (actual: object, expected: object) => {
      expect(actual).toEqual(expected);
    };
    const scheduler = new TestScheduler(assertion);
    mockHttp = {get: () => scheduled([{userId: 12, firstName: 'Yosemite', lastName: 'Sam'}], scheduler)}
    const mockedComp = new SchedulersTestingComponent(mockHttp);
    const userData$ = mockedComp.getUserDataAsyncScheduler(12, 0.01, scheduler);  
    // as the maxFrame of TestScheduler is 750ms we must add the following line
    scheduler.maxFrames = Number.POSITIVE_INFINITY;


    const result: User[] = [];

    userData$.subscribe({
      next: (value: any) => {
        result.push(value);
      }
    });

    scheduler.flush();
    expect(result).toEqual([{
      userId: 12, firstName: 'Yosemite', lastName: 'Sam'
    }, {
      userId: 12, firstName: 'Yosemite', lastName: 'Sam'
    }, {
      userId: 12, firstName: 'Yosemite', lastName: 'Sam'
    }]);
  });
});
