import { ClassPermissionViewModel } from "./classPermissionViewModel";
import { CoursePermissionViewModel } from "./coursePermissionViewModel";
import { SchoolPermissionViewModel } from "./schoolPermissionViewModel";

export interface PermissionViewModel
{
    schoolPermissions:SchoolPermissionViewModel[];
    classPermissions:ClassPermissionViewModel[];
    coursePermissions:CoursePermissionViewModel[];
}
