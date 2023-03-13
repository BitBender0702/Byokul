import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SaveStudentCertificate } from "../interfaces/student/saveStudentCertificate";

@Injectable({providedIn: 'root'})

export class StudentService{
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }

    saveStudentCertificates(saveStudentCertificates:SaveStudentCertificate): Observable<any> {
        return this.http.post(`${this.apiUrl}/students/uploadStudentCertificates`, saveStudentCertificates);
    }
}
