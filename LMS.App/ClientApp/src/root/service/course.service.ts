import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class CourseService{
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    createCourse(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/saveNewCourse`, credentials);
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/course/languageList`);
    }

    getAllStudents():Observable<any>{
        return this.http.get(`${this.apiUrl}/students/getAllStudents`);
    }

    getAllTeachers():Observable<any>{
        return this.http.get(`${this.apiUrl}/teachers/getAllTeachers`);
    }

    getDisciplines():Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getDisciplines`);
    }

    getServiceType():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getServiceType`);
    }

    getAccessibility():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getAccessibility`);
    }

    getAllSchools(): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getAllSchools`);
    }

    getSelectedSchool(schoolId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId);
    }

    getCourseById(courseName:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getCourseById` + '?courseName=' + courseName);
    }

    saveCourseLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseLanguages`,addLanguages);
    }

    saveCourseTeachers(addTeachers:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseTeachers`,addTeachers);
    }

    deleteCourseLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/deleteCourseLanguage`,deletelanguages);
    }

    deleteCourseTeacher(deleteTeacher:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/deleteCourseTeacher`,deleteTeacher);
    }

    deleteCourseCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/deleteCourseCertificate`,deleteCertificate);
    }

    saveCourseCertificates(addCertificates:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseCertificates`,addCertificates);
    }

    convertToClass(courseName:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/convertToClass` + '?courseName=' + courseName,'');
    }

    getCourseByName(courseName:any,schoolName:any):Observable<any>{
        let queryParams = new HttpParams().append("courseName",courseName).append("schoolName",schoolName);
        return this.http.get(`${this.apiUrl}/course/getCourseByName`, {params:queryParams});
    }

    isCourseNameExist(courseName:string){
        return this.http.get(`${this.apiUrl}/course/isCourseNameExist` + '?courseName=' + courseName);
    }

    editCourse(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/updateCourse`, credentials);
    }

    courseView(courseView:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/courseView`, courseView);
    }

    getCourse(courseId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getBasicCourseInfo` + '?courseId=' + courseId);

    }

    getPostsByCourseId(courseId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("courseId",courseId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/course/getPostsByCourse`, {params:queryParams});
    }

    getReelsByCourseId(courseId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("courseId",courseId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/course/getReelsByCourse`, {params:queryParams});
    }

    getCourseFilters(userId:string,schoolId:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/course/getCourseFilters`, {params:queryParams});
    }

    saveCourseFilters(courseFiltersList:any):Observable<any>{
        debugger
        return this.http.post(`${this.apiUrl}/course/saveCourseFilters`,courseFiltersList, {headers: this.headers});         
      }
}
