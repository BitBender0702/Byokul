export interface CommentViewModel {
    id:string,
    userId:string,
    content:string,
    groupName:string,
    userAvatar:string,
    createdOn?:Date,
    userName?:string;
    gender?: string | null
  }