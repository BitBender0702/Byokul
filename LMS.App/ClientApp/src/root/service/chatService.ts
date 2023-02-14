import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SaveChatAttachment } from "../interfaces/chat/saveChatAttachment";
import { FileUploadResult } from "../interfaces/chat/uploadFiles";

@Injectable({providedIn: 'root'})

export class ChatService{
    token:string = localStorage.getItem("jwt")?? '';
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
        this.headers = new HttpHeaders().set("Authorization", "Bearer " + this.token);
    }
    
    getChatHead(senderId:string,receiverId:string,chatType:number): Observable<any> {
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType);
        return this.http.get(`${this.apiUrl}/users/getChatHead`, {params:queryParams,headers: this.headers});
    }

    saveSentMessage(formData:any){
        return this.http.post(`${this.apiUrl}/users/saveSentMssage`, formData,{headers: this.headers});

    }

    saveChatAttachments(saveChatAttachments:any) : Observable<FileUploadResult>{
        
        return this.http.post<FileUploadResult>(`${this.apiUrl}/users/saveChatAttachments`, saveChatAttachments,{headers: this.headers});

    }

    removeChatAttachment(fileUrl:string) : Observable<any>{
        
        return this.http.post(`${this.apiUrl}/chats/removeChatAttachment` + '?fileUrl=' + fileUrl,'',{headers: this.headers});

    }

    getAllChatUsers(senderId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/chats/getAllChatUsers` + '?senderId=' + senderId,{headers: this.headers});

    }

    getUsersChat(senderId:string,receiverId:string,chatType:number,pageSize:number,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType).append("pageSize",pageSize).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/chats/GetUsersChat`, {params:queryParams,headers: this.headers});

    }

    pinUnpinChat(senderId:string,receiverId:string,chatType:number): Observable<any> {
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType);
        return this.http.post(`${this.apiUrl}/chats/setUserPinned`,null, {params:queryParams,headers: this.headers});
    }

    removeUnreadMessageCount(senderId:string,receiverId:string,chatType:number): Observable<any> {
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType);
        return this.http.post(`${this.apiUrl}/chats/removeUnreadMessageCount`,null, {params:queryParams,headers: this.headers});
    }

    getComments(id:string,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("id",id).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/chats/getComments`, {params:queryParams,headers: this.headers});
    }
}