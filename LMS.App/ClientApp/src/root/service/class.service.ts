import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class ClassService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    createClass(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/saveNewClass`, credentials,{headers: this.headers});
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/languageList`,{headers: this.headers});
    }

    getAllStudents():Observable<any>{
        return this.http.get(`${this.apiUrl}/students/getAllStudents`,{headers: this.headers});
    }

    getAllTeachers():Observable<any>{
        return this.http.get(`${this.apiUrl}/teachers/getAllTeachers`,{headers: this.headers});
    }

    getDisciplines():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getDisciplines`,{headers: this.headers});
    }

    getServiceType():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getServiceType`,{headers: this.headers});
    }

    getAccessibility():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getAccessibility`,{headers: this.headers});
    }

    getClassById(className:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getClassById` + '?className=' + className,{headers: this.headers});
    }

    getClassEditDetails(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getClassEditDetails` + '?classId=' + classId,{headers: this.headers});

    }

    saveClassLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassLanguages`,addLanguages,{headers: this.headers});
    }

    deleteClassLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/deleteClassLanguage`,deletelanguages,{headers: this.headers});
    }

    saveClassTeachers(addTeachers:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassTeachers`,addTeachers,{headers: this.headers});
    }

    deleteClassTeacher(deleteTeacher:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/deleteClassTeacher`,deleteTeacher,{headers: this.headers});
    }

    deleteClassCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/deleteClassCertificate`,deleteCertificate,{headers: this.headers});
    }

    saveClassCertificates(addCertificates:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassCertificates`,addCertificates,{headers: this.headers});
    }

    editClass(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/updateClass`, credentials,{headers: this.headers});
    }

    getAllSchools(): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getAllSchools`,{headers: this.headers});
    }

    getSelectedSchool(schoolId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId,{headers: this.headers});
    }

    getClassByName(className:any,schoolName:any):Observable<any>{
        let queryParams = new HttpParams().append("className",className).append("schoolName",schoolName);
        return this.http.get(`${this.apiUrl}/class/getClassByName`, {params:queryParams,headers: this.headers});
    }

    isClassNameExist(className:string){
        return this.http.get(`${this.apiUrl}/class/isClassNameExist` + '?className=' + className,{headers: this.headers});
    }

    convertToCourse(className:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/convertToCourse` + '?className=' + className,'',{headers: this.headers});
    }

    classView(classView:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/classView`, classView,{headers: this.headers});
    }

    getClass(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getBasicClassInfo` + '?classId=' + classId,{headers: this.headers});

    }

    getPostsByClassId(classId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("classId",classId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/class/getPostsByClass`, {params:queryParams,headers: this.headers});
    }

    getReelsByClassId(classId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("classId",classId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/class/getReelsByClass`, {params:queryParams,headers: this.headers});
    }

    getClassFilters(userId:string,schoolId:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/class/getClassFilters`, {params:queryParams,headers: this.headers});
    }

    saveClassFilters(classFiltersList:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassFilters`,classFiltersList, {headers: this.headers});
      }

      getClassInfoForCertificate(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getClassInfoForCertificate` + '?classId=' + classId,{headers: this.headers});
    }

    deleteClass(classId:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/deleteClassById` + '?classId=' + classId,'',{headers: this.headers});
    }

    enableDisableClass(classId:string):Observable<any>{
        debugger
        return this.http.post(`${this.apiUrl}/class/enableDisableClass`+ '?classId=' + classId,'',{headers: this.headers});
    }

}
