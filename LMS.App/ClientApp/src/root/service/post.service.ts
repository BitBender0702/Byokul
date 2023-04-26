import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { LikeUnlikePost } from "../interfaces/post/likeUnlikePost";

@Injectable({providedIn: 'root'})

export class PostService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    getSchool(schoolId:any):Observable<any>{
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId,{headers: this.headers});

    }

    getClass(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getBasicClassInfo` + '?classId=' + classId,{headers: this.headers});

    }

    getUser(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getBasicUserInfo` + '?userId=' + userId,{headers: this.headers});

    }

    getCourse(courseId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getBasicCourseInfo` + '?courseId=' + courseId,{headers: this.headers});

    }

    createPost(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/posts/savePost`, credentials,{headers: this.headers});
    }

    pinUnpinPost(attachmentId:any,isPinned:boolean): Observable<any> {
        let queryParams = new HttpParams().append("attachmentId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinPost`,null, {params:queryParams,headers: this.headers});
    }

    likeUnlikePost(likeUnlikePost:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/posts/likeUnlikePost`, likeUnlikePost,{headers: this.headers});
    }

    postView(postView:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/posts/postView`, postView,{headers: this.headers});

    }

    likeUnlikeComments(commentId:string,isLike:boolean): Observable<any> {
        let queryParams = new HttpParams().append("commentId",commentId).append("isLike",isLike);
        return this.http.post(`${this.apiUrl}/posts/likeUnlikeComment`,null, {params:queryParams,headers: this.headers});
    }

    getPostById(id:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/posts/getPostById` + '?id=' + id,{headers: this.headers});
    }

    enableDisableComments(postId:string,isHideComments:boolean):Observable<any>{
        let queryParams = new HttpParams().append("postId",postId).append("isHideComments",isHideComments);
        return this.http.post(`${this.apiUrl}/posts/enableDisableComments`,null, {params:queryParams,headers: this.headers});
    }

    saveUserSharedPost(userId:string,postId:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId);
        return this.http.post(`${this.apiUrl}/posts/saveUserSharedPost`,null, {params:queryParams,headers: this.headers});
    }

    savePost(postId:string,userId:string): Observable<any> {
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId);
        return this.http.post(`${this.apiUrl}/posts/savePostByUser`,null, {params:queryParams,headers: this.headers});
    }

    getSavedPostsByUser(userId:string,pageNumber:number,type:number):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("type",type);
        return this.http.post(`${this.apiUrl}/posts/getSavedPostsByUser`,null, {params:queryParams,headers: this.headers});
    }

    getSharedPostsByUser(userId:string,pageNumber:number,type:number):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("type",type);
        return this.http.post(`${this.apiUrl}/posts/getSharedPostsByUser`,null, {params:queryParams,headers: this.headers});
    }

    getLikedPostsByUser(userId:string,pageNumber:number,type:number):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("type",type);
        return this.http.post(`${this.apiUrl}/posts/getLikedPostsByUser`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinSavedPost(attachmentId:any,isPinned:boolean): Observable<any> {
        let queryParams = new HttpParams().append("attachmentId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinSavedPost`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinSharedPost(attachmentId:any,isPinned:boolean): Observable<any> {
        let queryParams = new HttpParams().append("attachmentId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinSharedPost`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinLikedPost(attachmentId:any,isPinned:boolean): Observable<any> {
        let queryParams = new HttpParams().append("attachmentId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinLikedPost`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinSavedClassCourse(id:any,isPinned:boolean,type:number): Observable<any> {
        let queryParams = new HttpParams().append("id",id).append("isPinned",isPinned).append("type",type);
        return this.http.post(`${this.apiUrl}/school/pinUnpinSavedClassCourse`,null, {params:queryParams,headers: this.headers});
    }

}