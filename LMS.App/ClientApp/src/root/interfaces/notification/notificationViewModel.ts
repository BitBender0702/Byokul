export interface NotificationViewModel
{
    id:string,
    userId:string,
    actionDoneBy:string,
    avatar:string,
    isRead:boolean,
    notificationContent:string,
    notificationType:NotificationType,
    postId?:string | null,
    postType?:number,
    post?:any,
    reelId?:string | null,
    chatType?:number | null,
    chatTypeId?:string| null,
    meetingId?:string | null,
    followersIds?:string[] | null

}

export enum NotificationType{
    Likes = 1,
    Followings = 2,
    StatusChanges = 3,
    LectureStart = 4,
    Messages = 5,
    AssignTeacher = 6,
    CertificateSent = 7,
    Transaction = 8,
    Report = 9
}