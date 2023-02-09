import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core"; 
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { SaveChatAttachment } from "../interfaces/chat/saveChatAttachment";
import { FileUploadResult } from "../interfaces/chat/uploadFiles";

@Injectable({providedIn: 'root'})

export class ChatService{
    private headers!: HttpHeaders;
    get apiUrl(): string {
        return environment.apiUrl;
      }
    constructor(private router: Router, private http: HttpClient) { 
        this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'});
    }
    
    getChatHead(senderId:string,receiverId:string,chatType:number): Observable<any> {
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType);
        return this.http.get(`${this.apiUrl}/users/getChatHead`, {params:queryParams});
    }

    saveSentMessage(formData:any){
        return this.http.post(`${this.apiUrl}/users/saveSentMssage`, formData);

    }

    saveChatAttachments(saveChatAttachments:any) : Observable<FileUploadResult>{
        
        return this.http.post<FileUploadResult>(`${this.apiUrl}/users/saveChatAttachments`, saveChatAttachments);

    }

    removeChatAttachment(fileUrl:string) : Observable<any>{
        
        return this.http.post(`${this.apiUrl}/chats/removeChatAttachment` + '?fileUrl=' + fileUrl,'');

    }

    getAllChatUsers(senderId:string):Observable<any>{
        return this.http.get(`${this.apiUrl}/chats/getAllChatUsers` + '?senderId=' + senderId);

    }

    getUsersChat(senderId:string,receiverId:string,chatType:number,pageSize:number,pageNumber:number):Observable<any>{
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType).append("pageSize",pageSize).append("pageNumber",pageNumber);
        return this.http.get(`${this.apiUrl}/chats/GetUsersChat`, {params:queryParams});

    }

    pinUnpinChat(senderId:string,receiverId:string,chatType:number): Observable<any> {
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType);
        return this.http.post(`${this.apiUrl}/chats/setUserPinned`,null, {params:queryParams});
    }

    removeUnreadMessageCount(senderId:string,receiverId:string,chatType:number): Observable<any> {
        let queryParams = new HttpParams().append("senderId",senderId).append("receiverId",receiverId).append("chatType",chatType);
        return this.http.post(`${this.apiUrl}/chats/removeUnreadMessageCount`,null, {params:queryParams});
    }
}