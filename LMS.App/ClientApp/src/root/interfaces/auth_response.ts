export interface AuthenticatedResponse{
  result: string,
    token: string;
    errorMessage:string; 
    userPermissions:any[];
    userId:string;
  }