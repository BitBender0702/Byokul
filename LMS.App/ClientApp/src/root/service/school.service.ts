import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { FollowUnfollow } from "../interfaces/FollowUnfollow";


@Injectable({providedIn: 'root'})

export class SchoolService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private http: HttpClient) { 
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    createSchool(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/school/saveNewSchool`, credentials,{headers: this.headers});
    }

    editSchool(credentials:any): Observable<any> {
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.post(`${this.apiUrl}/school/updateSchool`, credentials,{headers: this.headers});
    }

    getDefaultLogo():Observable<any>{
        return this.http.get(`${this.apiUrl}/school/defaultLogoList`,{headers: this.headers});
    }

    getCountryList():Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getCountries`,{headers: this.headers});
    }

    getSpecializationList():Observable<any>{
        return this.http.get(`${this.apiUrl}/school/specializationList`,{headers: this.headers});
    }

    getLanguageList():Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.get(`${this.apiUrl}/school/languageList`,{headers: this.headers});
    }

    getSchoolById(schoolName:string):Observable<any>{
        debugger
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        const encodedSchoolName = encodeURIComponent(schoolName);
        const params = new HttpParams().set('schoolName', encodedSchoolName);
        return this.http.get(`${this.apiUrl}/school/getSchoolByName`,{headers: this.headers, params: params});
    }

    saveSchoolFollower(followUnfollowUser:FollowUnfollow):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/followUnfollowSchool`,followUnfollowUser,{headers: this.headers});
    }

    getSchoolEditDetails(schoolId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getSchoolEditDetails` + '?schoolId=' + schoolId,{headers: this.headers});
    }

    getAccessibility():Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.get(`${this.apiUrl}/class/getAccessibility`,{headers: this.headers});
    }

    saveSchoolLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/saveSchoolLanguages`,addLanguages,{headers: this.headers});
    }

    deleteSchoolLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/deleteSchoolLanguage`,deletelanguages,{headers: this.headers});
    }

    getAllTeachers():Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.get(`${this.apiUrl}/teachers/getAllTeachers`,{headers: this.headers});
    }

    saveSchoolTeachers(addTeachers:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/saveSchoolTeachers`,addTeachers,{headers: this.headers});
    }

    deleteSchoolTeacher(deleteTeacher:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/deleteSchoolTeacher`,deleteTeacher,{headers: this.headers});
    }

    saveSchoolCertificates(addCertificates:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/saveSchoolCertificates`,addCertificates,{headers: this.headers});
    }

    
    deleteSchoolCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/deleteSchoolCertificate`,deleteCertificate,{headers: this.headers});
    }

    getSchoolFollowers(schoolId:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/school/schoolFollowers`, {params:queryParams,headers: this.headers})
    }

    isSchoolNameExist(schoolName:string){
        return this.http.get(`${this.apiUrl}/school/isSchoolNameExist` + '?schoolName=' + schoolName,{headers: this.headers});
    }

    getSchoolByName(schoolName:any):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.get(`${this.apiUrl}/school/getSchoolByName` + '?schoolName=' + schoolName,{headers: this.headers});
    }

    getSchoolClassCourseList(schoolId:any,pageNumber:number):Observable<any>{
        // return this.http.get(`${this.apiUrl}/school/getSchoolClassCourse` + '?schoolId=' + schoolId);
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/school/getSchoolClassCourse`, {params:queryParams,headers: this.headers});
    }

    getSchoolClassesList(schoolId:any,pageNumber:number):Observable<any>{
        // return this.http.get(`${this.apiUrl}/school/getSchoolClassCourse` + '?schoolId=' + schoolId);
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/school/getSchoolClasses`, {params:queryParams,headers: this.headers});
    }

    getSchoolCoursesList(schoolId:any,pageNumber:number):Observable<any>{
        // return this.http.get(`${this.apiUrl}/school/getSchoolClassCourse` + '?schoolId=' + schoolId);
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/school/getSchoolCourses`, {params:queryParams,headers: this.headers});
    }

    pinUnpinClassCourse(id:string,type:string,isPinned:boolean): Observable<any> {
        let queryParams = new HttpParams().append("id",id).append("type",type).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/school/pinUnpinClassCourse`,null, {params:queryParams,headers: this.headers});
    }

    deleteClass(classId:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/class/deleteClassById` + '?classId=' + classId,'',{headers: this.headers});
    }

    deleteCourse(courseId:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/course/deleteCourseById` + '?courseId=' + courseId,'',{headers: this.headers});
    }

    likeUnlikeClassCourse(likeUnlikeClassCourse:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/likeUnlikeClassCourse`, likeUnlikeClassCourse,{headers: this.headers});
    }

    getUserAllSchools(userId:string): Observable<any> {
        return this.http.get(`${this.apiUrl}/school/getUserAllSchools`+ '?userId=' + userId,{headers: this.headers});
    }

    getSchool(schoolId:any):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId,{headers: this.headers});

    }

    getPostsBySchoolId(schoolId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/school/getPostsBySchool`, {params:queryParams,headers: this.headers});
    }

    getReelsBySchoolId(schoolId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/school/getReelsBySchool`, {params:queryParams,headers: this.headers});
    }

    getSchoolsClassCourse(schoolIds:any):Observable<any>{
        let queryParams = new HttpParams().append("schoolIds",schoolIds);
        return this.http.get(`${this.apiUrl}/school/getSchoolsClassCourse`, {params:queryParams,headers: this.headers});
    }

    saveClassCourse(id:string,userId:string,type:number): Observable<any> {
        let queryParams = new HttpParams().append("userId",userId).append("id",id).append("type",type);
        return this.http.post(`${this.apiUrl}/school/saveClassCourse`,null, {params:queryParams,headers: this.headers});
    }

    getSavedClassCourse(userId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber);
        return this.http.post(`${this.apiUrl}/school/getSavedClassCourse`,null, {params:queryParams,headers: this.headers});
    }

    deleteSchool(schoolId:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/school/deleteSchoolById` + '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    restoreSchool(schoolId:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/school/restoreSchoolById` + '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    enableDisableSchool(schoolId:string):Observable<any>{
        debugger
        return this.http.post(`${this.apiUrl}/school/enableDisableSchool`+ '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    banFollower(followerId:any,schoolId:string): Observable<any> {
        let queryParams = new HttpParams().append("followerId",followerId).append("schoolId",schoolId);
        return this.http.post(`${this.apiUrl}/school/banFollower`,null, {params:queryParams,headers: this.headers});
    }

    schoolsGlobalSearch(searchString:string,pageNumber:number,pageSize:number){
        let queryParams = new HttpParams().append("searchString",searchString).append("pageNumber",pageNumber).append("pageSize",pageSize);
        return this.http.get(`${this.apiUrl}/school/schoolsGlobalSearch`, {params:queryParams,headers: this.headers}
        );
    }

    GetSliderReelsBySchoolId(schoolId:string,postId:string,scrollType:number){
        debugger
        let queryParams = new HttpParams().append("schoolId",schoolId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/school/getSliderReelsBySchoolId`, {params:queryParams,headers: this.headers}
        );
    }

    getAllSchoolFollowers(schoolId:string):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/school/getAllSchoolFollowers`, {params:queryParams,headers: this.headers})
    }

    getSchoolClassCourseForOfficials(schoolId:string):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/school/getSchoolClassCourseList`, {params:queryParams,headers: this.headers});
    }

    getClassListBySchoolId(schoolId:string):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId);
        return this.http.get(`${this.apiUrl}/school/getClassListBySchoolId`, {params:queryParams,headers: this.headers})
    }

    isAvailableStorageSpace(schoolId:string,filesSizeInGb:number):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId).append("filesSizeInGigabyte",filesSizeInGb);
        return this.http.get(`${this.apiUrl}/school/isAvailableStorageSpace`, {params:queryParams,headers: this.headers})
    }


    // getBannedUser(schoolId:string):Observable<any>{
    //     let queryParams = new HttpParams().append("schoolId",schoolId);
    //     return this.http.get(`${this.apiUrl}/school/getBannedUser`, {params:queryParams,headers: this.headers})
    // }

    getBannedUser(schoolId:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("schoolId",schoolId).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/school/getBannedUser`, {params:queryParams,headers: this.headers})
    }

    unBanFollower(followerId:any,schoolId:string): Observable<any> {
        let queryParams = new HttpParams().append("followerId",followerId).append("schoolId",schoolId);
        return this.http.post(`${this.apiUrl}/school/unBanFollower`,null, {params:queryParams,headers: this.headers});
    }

}
