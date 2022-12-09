import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
 
import { ClassService } from './class.service';
 
@Injectable({
  providedIn: 'root'
})
export class SchoolResolverService implements Resolve<any> {
  constructor(private classes: ClassService) {}
  resolve(route: ActivatedRouteSnapshot): Observable<any> {


    console.log('Called Get Product in resolver...', route);
    return this.classes.getAccessibility().pipe(
      catchError(error => {
        return of('No data');
      })
    );

    
  }

  
}