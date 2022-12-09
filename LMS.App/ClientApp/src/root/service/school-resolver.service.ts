import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
 
import { SchoolService } from './school.service';
 
@Injectable({
  providedIn: 'root'
})
export class SchoolResolverService implements Resolve<any> {
  constructor(private school: SchoolService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<any> {


    console.log('Called Get Product in resolver...', route);
    return this.school.getSchoolById('C65DDBF5-42F5-496D-CFF7-08DA9CA1C8A0').pipe(
      catchError(error => {
        return of('No data');
      })
    );

    
  }

  
}