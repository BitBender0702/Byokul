import { PermissionViewModel } from "../permission/permissionViewModel";

export interface AddTeacherViewModel
{
    firstName: string;
    lastName:string;
    email:string;
    gender:number;
    permissions:PermissionViewModel;
    isAllSchoolSelected:boolean;
    isAllClassSelected:boolean;
    isAllCourseSelected:boolean;
    ownerId:string;

}
