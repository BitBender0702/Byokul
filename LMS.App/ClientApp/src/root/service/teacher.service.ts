import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AddTeacherViewModel } from "../interfaces/teacher/addTeacherViewModel";


@Injectable({providedIn: 'root'})

export class TeacherService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
  constructor(private router: Router, private http: HttpClient) {
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    getAllPermissions(): Observable<any> {
        return this.http.get(`${this.apiUrl}/teachers/getAllPermissions`);
    }

    addTeacher(addTeacherViewModel:AddTeacherViewModel): Observable<any> {
        return this.http.post(`${this.apiUrl}/teachers/addTeacher`, addTeacherViewModel);
    }

}