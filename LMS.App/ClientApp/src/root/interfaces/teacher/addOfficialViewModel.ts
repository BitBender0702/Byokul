import { PermissionViewModel } from "../permission/permissionViewModel";

export interface AddOfficialViewModel
{
    userId: string;
    schoolId: string;
    permissions:PermissionViewModel;
    isAllSchoolSelected:boolean;
    isAllClassSelected:boolean;
    isAllCourseSelected:boolean;
    ownerId:string;

}
