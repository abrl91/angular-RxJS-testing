import { Component, OnInit } from '@angular/core';
import { debounceTime, delay, distinctUntilChanged, filter, map, repeatWhen, switchMap, take } from 'rxjs/operators'
import { Observable, of, scheduled } from 'rxjs';
import { asapScheduler, asyncScheduler } from 'rxjs';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-schedulers-testing',
  templateUrl: './schedulers-testing.component.html',
  styleUrls: ['./schedulers-testing.component.scss']
})
export class SchedulersTestingComponent implements OnInit {

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.addHi().subscribe((res: string) => console.log(res));
  }

  addHi() {
    return of('1', '2', '3')
     .pipe(
       map((item: string) => item+'Hi👋')
     );
   } // '1Hi👋', '2Hi👋', '3Hi👋'

   addHiAsap() {
    return scheduled(['1', '2', '3'], asapScheduler)
    .pipe(
      map(item => item+'Hi👋')
    );
   }

   getUserData(userId: number, timeInSec: number) {
    return this.httpClient.get(`api/users/${userId}`)
      .pipe(repeatWhen(val => val.pipe(
        delay(timeInSec * 1000),
        take(2),
      )),
    );
  }

  getUserDataAsyncScheduler(userId: number, timeInSec: number, scheduler = asyncScheduler) {
    return this.httpClient.get(`api/users/${userId}`)
      .pipe(repeatWhen(val => val.pipe(
        delay(timeInSec * 1000, scheduler),
        take(2),
      )),
    );
  }

  getSearchResult(input$: Observable<any>, timeout = 500, scheduler = asyncScheduler) {
    return input$.pipe(
      map((event: Event) => (event.target as HTMLInputElement).value),
      filter((text: string) => text.length > 3),
      debounceTime(timeout, scheduler),
      distinctUntilChanged(),
      switchMap((text) => this.httpClient.get(`someUrl?searchParam=${text}`)),
    );
  }

}
