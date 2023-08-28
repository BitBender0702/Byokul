import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SaveStudentCertificate } from "../interfaces/student/saveStudentCertificate";

@Injectable({providedIn: 'root'})

export class StudentService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }

    saveStudentCertificates(saveStudentCertificates:SaveStudentCertificate): Observable<any> {
        return this.http.post(`${this.apiUrl}/students/uploadStudentCertificates`, saveStudentCertificates,{headers: this.headers});
    }

    getSchoolStudents(id:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("id",id).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/students/getSchoolStudents`, {params:queryParams,headers: this.headers})
    }

    getClassStudents(id:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("id",id).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/students/getClassStudents`, {params:queryParams,headers: this.headers})
    }

    getCourseStudents(id:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("id",id).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/students/getCourseStudents`, {params:queryParams,headers: this.headers})
    }

    isStudentBannedFromClassCourse(studentId:string,from:string,classCourseId:string):Observable<any>{
        let queryParams = new HttpParams().append("studentId",studentId).append("from",from).append("classCourseId",classCourseId);
        return this.http.get(`${this.apiUrl}/students/isStudentBannedFromClassCourse`, {params:queryParams,headers: this.headers})
    }
}
