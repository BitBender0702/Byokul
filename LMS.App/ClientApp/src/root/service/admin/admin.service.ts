import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BanUnbanSchools } from "src/root/interfaces/admin/banUnbanSchools";
import { BanUnbanUsers } from "src/root/interfaces/admin/banUnbanUser";
import { EnableDisableClassCourse } from "src/root/interfaces/admin/enableDisableClassCourse";
import { VerifySchools } from "src/root/interfaces/admin/verifySchools";
import { VerifyUsers } from "src/root/interfaces/admin/verifyUser";

@Injectable({providedIn: 'root'})

export class AdminService{

    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }

    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }

    getRegUsers():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getRegisteredUsers`);
    }

    banUnbanUser(banUser:BanUnbanUsers):Observable<any>{
        return this.http.post(`${this.apiUrl}/admins/banUser`,banUser);
    }

    verifyUser(verifyUser:VerifyUsers):Observable<any>{
        return this.http.post(`${this.apiUrl}/admins/verifyUser`,verifyUser);
    }

    getRegSchools():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getRegisteredSchools`);
    }

    banUnbanSchool(banSchool:BanUnbanSchools):Observable<any>{
        return this.http.post(`${this.apiUrl}/admins/banSchool`,banSchool);
    }

    varifySchool(verifySchool:VerifySchools):Observable<any>{
        return this.http.post(`${this.apiUrl}/admins/varifySchool`, verifySchool);
    }

    getRegClasses():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getRegisteredClasses`);
    }

    enableDisableClass(enableClass:EnableDisableClassCourse):Observable<any>{
        return this.http.post(`${this.apiUrl}/admins/disableClass`,enableClass);
    }

    getRegCourses():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getRegisteredCourses`);
    }

    enableDisableCourse(enableCourse:EnableDisableClassCourse):Observable<any>{
        return this.http.post(`${this.apiUrl}/admins/disableCourse`,enableCourse);
    }

    getDashboardDetails():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getDashboardDetails`);
    }

    getAllClassCourseTransactions():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getAllClassCourseTransactions`);
    }

    getAllSchoolTransactions():Observable<any>{
        return this.http.get(`${this.apiUrl}/admins/getAllSchoolTransactions`);
    }





}