import { ChatType } from "./chatType";
import { FileUploadResult } from "./uploadFiles";

export interface ChatViewModel {
    chatHeadId:string,
    sender:string,
    receiver:string,
    chatType:number,
    chatTypeId:string | null,
    message:string,
    attachments: FileUploadResult[];

  }

  export interface ChatHeadViewModel
    {
        id:string,
        sender:string,
        receiver:string,
        lastMessage:string,
        unreadMessageCount:number,
        chatType:number,
        chatTypeId:string
    }