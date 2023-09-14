import { ChatType } from "./chatType";
import { FileUploadResult } from "./uploadFiles";

export interface ChatViewModel {
    chatHeadId:string | null,
    sender:string,
    receiver:string,
    chatType:number,
    chatTypeId:string | null,
    message:string,
    replyMessageId:string | null,
    replyChatContent:string | null,
    replyMessageType:number | null,
    fileName:string | null,
    fileURL:string | null,
    isForwarded:boolean,
    forwardedFileName:string | null,
    forwardedFileURL:string | null,
    forwardedFileType:number | null,
    attachments: FileUploadResult[];
    schoolId: string | null

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