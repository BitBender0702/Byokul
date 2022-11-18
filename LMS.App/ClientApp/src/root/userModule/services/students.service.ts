import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { JoinMeetingModel } from "src/root/interfaces/bigBlueButton/joinMeeting";
import { NewMeetingModel } from "src/root/interfaces/bigBlueButton/newMeeting";

@Injectable({providedIn: 'root'})

export class StudentsService{
    private headers!: HttpHeaders;

    get apiUrl(): string {
        return environment.apiUrl;
    }

    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }

    private addPointUrlForRegister: string = 'http://localhost:5220/students/getStudents';
    getStudents(): Observable<any> {
        return this.http.get(`${this.addPointUrlForRegister}`);
    }

    createMeeting(credentials:NewMeetingModel): Observable<any> {
        return this.http.post(`${this.apiUrl}/bigBlueButton/create`,credentials,{'headers':this.headers});
    }

    joinMeeting(credentials:JoinMeetingModel): Observable<any> {
        return this.http.post(`${this.apiUrl}/bigBlueButton/join`,credentials,{'headers':this.headers});
    }

}
