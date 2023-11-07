import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AddTeacherViewModel } from "../interfaces/teacher/addTeacherViewModel";
import { AddOfficialViewModel } from "../interfaces/teacher/addOfficialViewModel";


@Injectable({providedIn: 'root'})

export class TeacherService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    getAllPermissions(): Observable<any> {
        return this.http.get(`${this.apiUrl}/teachers/getAllPermissions`,{headers: this.headers});
    }

    addTeacher(addTeacherViewModel:AddTeacherViewModel): Observable<any> {
        return this.http.post(`${this.apiUrl}/teachers/addTeacher`, addTeacherViewModel,{headers: this.headers});
    }

    addOfficial(addTeacherViewModel:AddOfficialViewModel): Observable<any> {
        return this.http.post(`${this.apiUrl}/teachers/addTeacher`, addTeacherViewModel,{headers: this.headers});
    }

    updateOfficial(addTeacherViewModel:AddOfficialViewModel): Observable<any> {
        return this.http.post(`${this.apiUrl}/teachers/updateTeacher`, addTeacherViewModel,{headers: this.headers});
    }

    getClassTeachers(classId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/teachers/getClassTeachers`+ '?classId=' + classId,{headers: this.headers});
    }

    getCourseTeachers(courseId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/teachers/getCourseTeachers`+ '?courseId=' + courseId,{headers: this.headers});
    }

    getTeacherPermissions(userId:string, schoolId:string): Observable<any> {
        let queryParams = new HttpParams().append("userId",userId).append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/teachers/getTeacherPermissions`, {params:queryParams,headers: this.headers})
    }
}