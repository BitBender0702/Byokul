export interface AuthenticatedResponse{
    token: string;
    errorMessage:string; 
    userPermissions:any[];
  }