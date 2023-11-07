import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { JoinMeetingModel } from "../interfaces/bigBlueButton/joinMeeting";
import { BigBlueButtonService } from "./bigBlueButton";
import { UserService } from "./user.service";

@Injectable({providedIn: 'root'})

export class PostService{
    token:string = localStorage.getItem("jwt")?? '';
    joinMeetingViewModel!:JoinMeetingModel;
    private _bigBlueButtonService;
    private _userService;
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient, bigBlueButtonService:BigBlueButtonService, userService:UserService) { 
        this._bigBlueButtonService = bigBlueButtonService;
        this._userService = userService;
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    getSchool(schoolId:any):Observable<any>{
        var token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        return this.http.get(`${this.apiUrl}/school/getBasicSchoolInfo` + '?schoolId=' + schoolId,{headers: this.headers});
    }

    getClass(classId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/class/getBasicClassInfo` + '?classId=' + classId,{headers: this.headers});
    }

    getUser(userId:string):Observable<any>{
        var token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        return this.http.get(`${this.apiUrl}/users/getBasicUserInfo` + '?userId=' + userId,{headers: this.headers});
    }

    getCourse(courseId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/course/getBasicCourseInfo` + '?courseId=' + courseId,{headers: this.headers});
    }

    createPost(credentials:any): Observable<any> {
        var token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        return this.http.post(`${this.apiUrl}/posts/uploadPost`, credentials,{headers: this.headers});
    }

    pinUnpinPost(attachmentId:any,isPinned:boolean): Observable<any> {
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("postId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinPost`,null, {params:queryParams,headers: this.headers});
    }

    likeUnlikePost(likeUnlikePost:any):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.post(`${this.apiUrl}/posts/likeUnlikePost`, likeUnlikePost,{headers: this.headers});
    }

    postView(postView:any):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.post(`${this.apiUrl}/posts/postView`, postView,{headers: this.headers});

    }

    likeUnlikeComments(commentId:string,isLike:boolean): Observable<any> {
        let queryParams = new HttpParams().append("commentId",commentId).append("isLike",isLike);
        return this.http.post(`${this.apiUrl}/posts/likeUnlikeComment`,null, {params:queryParams,headers: this.headers});
    }

    getPostById(id:string):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
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
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("type",type);
        return this.http.post(`${this.apiUrl}/posts/getSavedPostsByUser`,null, {params:queryParams,headers: this.headers});
    }

    getSharedPostsByUser(userId:string,pageNumber:number,type:number):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("type",type);
        return this.http.post(`${this.apiUrl}/posts/getSharedPostsByUser`,null, {params:queryParams,headers: this.headers});
    }

    getLikedPostsByUser(userId:string,pageNumber:number,type:number):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("type",type);
        return this.http.post(`${this.apiUrl}/posts/getLikedPostsByUser`,null, {params:queryParams,headers: this.headers});
    }

    GetSavedSliderReelsByUserId(userId:string,postId:string,scrollType:number){
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/posts/getSavedSliderReelsByUserId`, {params:queryParams,headers: this.headers}
        );
    }
    GetSharedSliderReelsByUserId(userId:string,postId:string,scrollType:number){
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/posts/getSharedSliderReelsByUserId`, {params:queryParams,headers: this.headers}
        );
    }
    GetLikedSliderReelsByUserId(userId:string,postId:string,scrollType:number){
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/posts/getLikedSliderReelsByUserId`, {params:queryParams,headers: this.headers}
        );
    }

    pinUnpinSavedPost(attachmentId:any,isPinned:boolean): Observable<any> {
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("postId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinSavedPost`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinSharedPost(attachmentId:any,isPinned:boolean): Observable<any> {
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("attachmentId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinSharedPost`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinLikedPost(attachmentId:any,isPinned:boolean): Observable<any> {
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("postId",attachmentId).append("isPinned",isPinned);
        return this.http.post(`${this.apiUrl}/posts/pinUnpinLikedPost`,null, {params:queryParams,headers: this.headers});
    }

    pinUnpinSavedClassCourse(id:any,isPinned:boolean,type:number): Observable<any> {
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        let queryParams = new HttpParams().append("id",id).append("isPinned",isPinned).append("type",type);
        return this.http.post(`${this.apiUrl}/school/pinUnpinSavedClassCourse`,null, {params:queryParams,headers: this.headers});
    }

    deletePost(id:string):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        return this.http.post(`${this.apiUrl}/posts/deletePost` + '?id=' + id, '',{headers: this.headers});
    }

    joinMeeting(name:string,meetingId:string,postId:string):Observable<any>{
        this.initializeJoinMeetingViewModel();
        this.joinMeetingViewModel.name = name;
        this.joinMeetingViewModel.meetingId = meetingId;
        this._bigBlueButtonService.joinMeeting(this.joinMeetingViewModel).subscribe((response) => {
         const fullNameIndex = response.url.indexOf('fullName='); // find the index of "fullName="
         const newUrl = response.url.slice(fullNameIndex);
         this.router.navigate(
          [`liveStream`,postId,newUrl,false],
          { state: { stream: {streamUrl: response.url, meetingId: meetingId, isOwner:false} } });
      });
      return new Observable<void>();
      }

      openLiveStream(post:any,userId:string):Observable<any>{
      if(post.isLive){
        if(post.createdBy == userId){
         this.router.navigate(
           [`liveStream`,post.id,false]
          );
        }
        else{
         this.initializeJoinMeetingViewModel();
   this._userService.getUser(userId).subscribe((result) => {
   this.joinMeetingViewModel.name = result.firstName + " " + result.lastName;
   var params = new URLSearchParams(post.streamUrl.split('?')[1]);
   this.joinMeetingViewModel.meetingId = params.get('meetingID')?.replace("meetings","")??'';
   this.joinMeetingViewModel.postId = post.id;
   this._bigBlueButtonService.joinMeeting(this.joinMeetingViewModel).subscribe((response) => {
    this.router.navigate(
     [`liveStream`,post.id,false]
    );
   });
        });
     }
   }
   return new Observable<void>();
}
  
      initializeJoinMeetingViewModel(){
        this.joinMeetingViewModel = {
          name:'',
          meetingId:'',
          postId:''
        }
      }

    updateCommentThrottling(postId:string, noOfComments:number):Observable<any>{
      let queryParams = new HttpParams().append("postId",postId).append("noOfComments",noOfComments);
      return this.http.post(`${this.apiUrl}/posts/updateCommentThrottling`,null, {params:queryParams,headers: this.headers});    
    }

    saveStreamAsPost(postId:string):Observable<any>{
      return this.http.post(`${this.apiUrl}/posts/saveStreamAsPost` + '?postId=' + postId, '',{headers: this.headers});
    }

    saveLiveVideoTime(postId:string,videoTotalTime:number,videoLiveTime:number):Observable<any>{
        let queryParams = new HttpParams().append("postId",postId).append("videoTotalTime",videoTotalTime).append("videoLiveTime",videoLiveTime);
        return this.http.post(`${this.apiUrl}/posts/saveLiveVideoTime`,null, {params:queryParams,headers: this.headers});
    }

    enableLiveStream(postId:any):Observable<any>{
        let queryParams = new HttpParams().append("postId",postId);
        return this.http.post(`${this.apiUrl}/posts/enableLiveStream`,null, {params:queryParams,headers: this.headers});
    }

    postsGlobalSearch(searchString:string,pageNumber:number,pageSize:number){
        let queryParams = new HttpParams().append("searchString",searchString).append("pageNumber",pageNumber).append("pageSize",pageSize);
        return this.http.get(`${this.apiUrl}/posts/postsGlobalSearch`, {params:queryParams,headers: this.headers}
        );
    }



}
