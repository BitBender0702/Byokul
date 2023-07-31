import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({providedIn: 'root'})

export class CourseService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    createCourse(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/saveNewCourse`, credentials,{headers: this.headers});
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/course/languageList`,{headers: this.headers});
    }

    getAllStudents():Observable<any>{
        return this.http.get(`${this.apiUrl}/students/getAllStudents`,{headers: this.headers});
    }

    getAllTeachers():Observable<any>{
        return this.http.get(`${this.apiUrl}/teachers/getAllTeachers`,{headers: this.headers});
    }

    getDisciplines():Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getDisciplines`,{headers: this.headers});
    }

    getServiceType():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getServiceType`,{headers: this.headers});
    }

    getAccessibility():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getAccessibility`,{headers: this.headers});
    }

    getAllSchools(): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getAllSchools`,{headers: this.headers});
    }

    getSelectedSchool(schoolId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId,{headers: this.headers});
    }

    getCourseById(courseName:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getCourseByName` + '?courseName=' + courseName,{headers: this.headers});
    }

    saveCourseLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseLanguages`,addLanguages,{headers: this.headers});
    }

    saveCourseTeachers(addTeachers:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseTeachers`,addTeachers,{headers: this.headers});
    }

    deleteCourseLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/deleteCourseLanguage`,deletelanguages,{headers: this.headers});
    }

    deleteCourseTeacher(deleteTeacher:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/deleteCourseTeacher`,deleteTeacher,{headers: this.headers});
    }

    deleteCourseCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/deleteCourseCertificate`,deleteCertificate,{headers: this.headers});
    }

    saveCourseCertificates(addCertificates:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseCertificates`,addCertificates,{headers: this.headers});
    }

    convertToClass(courseName:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/convertToClass` + '?courseName=' + courseName,'',{headers: this.headers});
    }

    getCourseByName(courseName:any,schoolName:any):Observable<any>{
        let queryParams = new HttpParams().append("courseName",courseName).append("schoolName",schoolName);
        return this.http.get(`${this.apiUrl}/course/getCourseByName`, {params:queryParams,headers: this.headers});
    }
    isCourseNameExist(courseName:string){
        return this.http.get(`${this.apiUrl}/course/isCourseNameExist` + '?courseName=' + courseName,{headers: this.headers});
    }

    editCourse(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/updateCourse`, credentials,{headers: this.headers});
    }

    courseView(courseView:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/courseView`, courseView,{headers: this.headers});
    }

    getCourse(courseId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getBasicCourseInfo` + '?courseId=' + courseId,{headers: this.headers});

    }

    getPostsByCourseId(courseId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("courseId",courseId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/course/getPostsByCourse`, {params:queryParams,headers: this.headers});
    }

    getReelsByCourseId(courseId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("courseId",courseId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/course/getReelsByCourse`, {params:queryParams,headers: this.headers});
    }

    getCourseFilters(userId:string,schoolId:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/course/getCourseFilters`, {params:queryParams,headers: this.headers});
    }

    saveCourseFilters(courseFiltersList:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/course/saveCourseFilters`,courseFiltersList, {headers: this.headers});         
      }

      getCourseInfoForCertificate(courseId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getCourseInfoForCertificate` + '?courseId=' + courseId,{headers: this.headers});
    }

    deleteCourse(courseId:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/deleteCourseById` + '?courseId=' + courseId,'',{headers: this.headers});
    }

    enableDisableCourse(courseId:string):Observable<any>{
        debugger
        return this.http.post(`${this.apiUrl}/course/enableDisableCourse`+ '?courseId=' + courseId,'',{headers: this.headers});
    }

    GetSliderReelsByCourseId(courseId:string,postId:string,scrollType:number){
        debugger
        let queryParams = new HttpParams().append("courseId",courseId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/course/getSliderReelsByCourseId`, {params:queryParams,headers: this.headers}
        );
    }

    enableDisableComments(courseId:string,isHideComments:boolean):Observable<any>{
        let queryParams = new HttpParams().append("courseId",courseId).append("isHideComments",isHideComments);
        return this.http.post(`${this.apiUrl}/course/enableDisableComments`,null, {params:queryParams,headers: this.headers});
    }
}
