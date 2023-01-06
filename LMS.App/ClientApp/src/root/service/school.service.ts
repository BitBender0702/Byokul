import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { FollowUnfollow } from "../interfaces/FollowUnfollow";
import { CreateSchoolModel } from "../interfaces/school/createSchoolModel";


@Injectable({providedIn: 'root'})

export class SchoolService{
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    createSchool(credentials:any): Observable<any> {
        for (var pair of credentials.entries()) {
            console.log(pair[0]+ ', ' + pair[1]); 
        }
        // const headers = { 'content-type': 'application/json'} 
        return this.http.post(`${this.apiUrl}/school/saveNewSchool`, credentials);
    }

    editSchool(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/school/updateSchool`, credentials);
    }

    getDefaultLogo():Observable<any>{
        return this.http.get(`${this.apiUrl}/school/defaultLogoList`);
    }

    getCountryList():Observable<any>{
        return this.http.get(`${this.apiUrl}/users/countryList`);
    }

    getSpecializationList():Observable<any>{
        return this.http.get(`${this.apiUrl}/school/specializationList`);
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/school/languageList`);
    }

    getSchoolById(schoolId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getSchoolById` + '?schoolId=' + schoolId);
    }

    saveSchoolFollower(followUnfollowUser:FollowUnfollow):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/followUnfollowSchool`,followUnfollowUser);
    }

    getSchoolEditDetails(schoolId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getSchoolEditDetails` + '?schoolId=' + schoolId);
    }

    getAccessibility():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getAccessibility`);
    }

    saveSchoolLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/saveSchoolLanguages`,addLanguages);
    }

    deleteSchoolLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/deleteSchoolLanguage`,deletelanguages);
    }

    getAllTeachers():Observable<any>{
        return this.http.get(`${this.apiUrl}/teachers/getAllTeachers`);
    }

    saveSchoolTeachers(addTeachers:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/saveSchoolTeachers`,addTeachers);
    }

    deleteSchoolTeacher(deleteTeacher:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/deleteSchoolTeacher`,deleteTeacher);
    }

    saveSchoolCertificates(addCertificates:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/saveSchoolCertificates`,addCertificates);
    }

    
    deleteSchoolCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/deleteSchoolCertificate`,deleteCertificate);
    }

    getSchoolFollowers(schoolId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/schoolFollowers` + '?schoolId=' + schoolId);
    }

    isSchoolNameExist(schoolName:string){
        return this.http.get(`${this.apiUrl}/school/isSchoolNameExist` + '?schoolName=' + schoolName);
    }

    getSchoolByName(schoolName:any):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getSchoolByName` + '?schoolName=' + schoolName);
    }

    getSchoolClassCourseList(schoolId:any):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getSchoolClassCourse` + '?schoolId=' + schoolId);
    }

    pinUnpinClassCourse(id:string,type:string,isPinned:boolean): Observable<any> {
        let queryParams = new HttpParams().append("id",id).append("type",type).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/school/pinUnpinClassCourse`,null, {params:queryParams});
    }

}
