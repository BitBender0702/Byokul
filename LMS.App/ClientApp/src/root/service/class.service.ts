import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class ClassService{
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    createClass(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/saveNewClass`, credentials);
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/languageList`);
    }

    getAllStudents():Observable<any>{
        return this.http.get(`${this.apiUrl}/students/getAllStudents`);
    }

    getAllTeachers():Observable<any>{
        return this.http.get(`${this.apiUrl}/teachers/getAllTeachers`);
    }

    getDisciplines():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getDisciplines`);
    }

    getServiceType():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getServiceType`);
    }

    getAccessibility():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getAccessibility`);
    }

    getClassById(className:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getClassById` + '?className=' + className);
    }

    getClassEditDetails(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getClassEditDetails` + '?classId=' + classId);

    }

    saveClassLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassLanguages`,addLanguages);
    }

    deleteClassLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/deleteClassLanguage`,deletelanguages);
    }

    saveClassTeachers(addTeachers:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassTeachers`,addTeachers);
    }

    deleteClassTeacher(deleteTeacher:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/deleteClassTeacher`,deleteTeacher);
    }

    deleteClassCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/deleteClassCertificate`,deleteCertificate);
    }

    saveClassCertificates(addCertificates:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/saveClassCertificates`,addCertificates);
    }

    editClass(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/updateClass`, credentials);
    }

    getAllSchools(): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getAllSchools`);
    }

    getSelectedSchool(schoolId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId);
    }

    getClassByName(className:any,schoolName:any):Observable<any>{
        let queryParams = new HttpParams().append("className",className).append("schoolName",schoolName);
        return this.http.get(`${this.apiUrl}/class/getClassByName`, {params:queryParams});
    }

    isClassNameExist(className:string){
        return this.http.get(`${this.apiUrl}/class/isClassNameExist` + '?className=' + className);
    }

    convertToCourse(className:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/convertToCourse` + '?className=' + className,'');
    }

    classView(classView:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/class/classView`, classView);
    }

    getClass(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getBasicClassInfo` + '?classId=' + classId);

    }

}
