import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable, Subject } from "rxjs";
import { environment } from "src/environments/environment";
import { FollowUnfollow } from "../interfaces/FollowUnfollow";
import { ReportFollowerViewModel } from "../interfaces/user/reportFollowerViewModel";
import { PostAuthorTypeEnum } from "../Enums/postAuthorTypeEnum";


@Injectable({providedIn: 'root'})

export class UserService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
  constructor(private router: Router, private http: HttpClient) {
    this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    getSidebarInfo(token?:string):Observable<any>{
        this.token = localStorage.getItem("jwt")?? '';
        if(this.token == "" || undefined){
            this.headers = new HttpHeaders().set("Authorization", "Bearer " + token);
        }
        else{
            this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
        }
        return this.http.get(`${this.apiUrl}/userdashboard/dashboardDetails`,{
            headers: this.headers
          });
    }

    getUserById(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getUser` + '?userId=' + userId, {headers: this.headers});
    }

    getLanguageList():Observable<any>{
        return this.http.get(`${this.apiUrl}/class/languageList`,{
            headers: this.headers
          });
    }

    saveUserLanguages(addLanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/saveUserLanguages`,addLanguages,{headers: this.headers});
    }

    deleteUserLanguage(deletelanguages:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/deleteUserLanguage`,deletelanguages,{headers: this.headers});
    }

    saveUserFollower(followUnfollowUser:FollowUnfollow):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/followUnfollowUser`,followUnfollowUser,{headers: this.headers});
    }

    getUserEditDetails(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getUserEditDetails` + '?userId=' + userId,{headers: this.headers});
    }

    editUser(credentials:any): Observable<any> {
        return this.http.post(`${this.apiUrl}/users/updateUser`, credentials,{headers: this.headers});
    }

    getUserFollowers(userId:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/users/userFollowers`, {params:queryParams,headers: this.headers})
    }

    getUserFollowings(userId:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/users/userFollowings`, {params:queryParams,headers: this.headers})
    }

    banFollower(followerId:any,userId:string): Observable<any> {
        let queryParams = new HttpParams().append("followerId",followerId).append("userId",userId);
        return this.http.post(`${this.apiUrl}/users/banFollower`,null, {params:queryParams,headers: this.headers});
    }

    getUser(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getBasicUserInfo` + '?userId=' + userId, {headers: this.headers});

    }

    getMyFeed(postType:number,pageNumber:number,searchString:string):Observable<any>{
        //return this.http.get(`${this.apiUrl}/users/myFeed`);
        let queryParams = new HttpParams().append("postType",postType).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/users/myFeed`, {params:queryParams, headers: this.headers});

    }

    getGlobalFeed(postType:number, pageNumber:number,searchString:string):Observable<any>{
        //return this.http.get(`${this.apiUrl}/users/globalFeed`);
        let queryParams = new HttpParams().append("postType",postType).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/users/globalFeed`, {params:queryParams, headers: this.headers});

    }

    saveUserPreference(preferenceString:string): Observable<any> {
        debugger
        return this.http.post(`${this.apiUrl}/users/saveUserPreference` + '?preferenceString=' + preferenceString,'',{headers: this.headers});
    }

    shareDataSubject = new Subject<any>(); //Decalring new RxJs Subject
 
     sendDataToOtherComponent(userId:string){
      this.shareDataSubject.next(userId);
     }

     getPostsByUserId(userId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/users/getPostsByUserId`, {params:queryParams,headers: this.headers});
    }

    getReelsByUserId(userId:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/users/getReelsByUserId`, {params:queryParams,headers: this.headers});
    }

    getNotificationSettings(userId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/notifications/getNotificationSettings` + '?userId=' + userId, {headers: this.headers});
    }

    getFollowersNotificationSettings(followersIds:any):Observable<any>{
        debugger
        return this.http.get(`${this.apiUrl}/notifications/getFollowersNotificationSettings` + '?followersIds=' + followersIds, {headers: this.headers});
    }
    
    getCertificatePdf(certificateName:string,from:number){
        let queryParams = new HttpParams().append("certificateName",certificateName).append("from",from);
        return this.http.get(`${this.apiUrl}/users/getCertificatePdf`, {params:queryParams,headers: this.headers}
        );
        

        
    }

    getUserByEmail(email:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getUserByEmail` + '?email=' + email, {headers: this.headers});
    }

    getCountryList():Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getCountries`,{headers: this.headers});
    }

    getCityList(countryName:string):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/getCities` + '?countryName=' + countryName,'',{headers: this.headers});
    }   

    getStateList(countryName:string):Observable<any>{
        debugger
        return this.http.post(`${this.apiUrl}/users/getStates` + '?countryName=' + countryName,'',{headers: this.headers});
    }   

    deleteSchoolTeacher(schoolId:string):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/deleteSchoolTeacher` + '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    deleteSchoolStudent(schoolId:string):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/deleteSchoolStudent` + '?schoolId=' + schoolId,'',{headers: this.headers});
    }

    reportFollower(reportFollowerViewModel:ReportFollowerViewModel):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/reportFollower`,reportFollowerViewModel,{headers: this.headers});
    }

    globalSearch(searchString:string,pageNumber:number,pageSize:number){
        let queryParams = new HttpParams().append("searchString",searchString).append("pageNumber",pageNumber).append("pageSize",pageSize);
        return this.http.get(`${this.apiUrl}/users/globalSearch`, {params:queryParams,headers: this.headers}
        );
        

        
    }

    usersGlobalSearch(searchString:string,pageNumber:number,pageSize:number){
        let queryParams = new HttpParams().append("searchString",searchString).append("pageNumber",pageNumber).append("pageSize",pageSize);
        return this.http.get(`${this.apiUrl}/users/usersGlobalSearch`, {params:queryParams,headers: this.headers}
        ); 
    }

    saveUserCertificates(addCertificates:any):Observable<any>{
        debugger
        for(var pair in addCertificates.entries())
        {
            console.log(pair[0]);
            console.log(pair[1]);
        }
        return this.http.post(`${this.apiUrl}/users/saveUserCertificates`,addCertificates,{headers: this.headers});
    }

    deleteUserCertificate(deleteCertificate:any):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/deleteUserCertificate`,deleteCertificate,{headers: this.headers});
    }

    isFollowerBan(userId:string,followerId:string){
        let queryParams = new HttpParams().append("userId",userId).append("followerId",followerId);
        return this.http.get(`${this.apiUrl}/users/isFollowerBan`, {params:queryParams,headers: this.headers}
        );
    }
        
    GetSliderReelsByUserId(userId:string,postId:string,scrollType:number){
        debugger
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/users/getSliderReelsByUserId`, {params:queryParams,headers: this.headers}
        );
    }

    getMyFeedSliderReels(userId:string,postId:string,scrollType:number){
        debugger
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/users/getMyFeedSliderReels`, {params:queryParams,headers: this.headers}
        );
    }

    getGlobalFeedSliderReels(userId:string,postId:string,scrollType:number){
        debugger
        let queryParams = new HttpParams().append("userId",userId).append("postId",postId).append("scrollType",scrollType);
        return this.http.get(`${this.apiUrl}/users/getGlobalFeedSliderReels`, {params:queryParams,headers: this.headers}
        );
    }

    
    getUserPermissions(userId:string):Observable<any>{
        debugger
        return this.http.get(`${this.apiUrl}/users/getUserPermissions` + '?userId=' + userId,{headers: this.headers});
    }

    getBlobSasToken():Observable<any>{
        return this.http.get(`${this.apiUrl}/users/getBlobSasToken`,{headers: this.headers});
    }

    checkAllNotificationSettings(userId:string):Observable<any>{
        return this.http.post(`${this.apiUrl}/users/checkAllNotificationSettings`+ '?userId=' + userId,'',{headers: this.headers});
    }



    getUserBannedFollowers(userId:string,pageNumber:number,searchString:string):Observable<any>{
        let queryParams = new HttpParams().append("userId",userId).append("pageNumber",pageNumber).append("searchString",searchString);
        return this.http.get(`${this.apiUrl}/users/getUserBannedFollowers`, {params:queryParams,headers: this.headers})
    }


    unBanFollower(followerId:any,userId:string): Observable<any> {
        let queryParams = new HttpParams().append("followerId",followerId).append("userId",userId);
        return this.http.post(`${this.apiUrl}/users/unBanFollower`,null, {params:queryParams,headers: this.headers});
    }

    isUserBanned(userId:string,id:string, from: PostAuthorTypeEnum): Observable<any> {
        debugger;
        let queryParams = new HttpParams().append("userId",userId).append("id",id).append("from",from);
        return this.http.post(`${this.apiUrl}/users/isUserBanned`,null, {params:queryParams,headers: this.headers});
    }

}
