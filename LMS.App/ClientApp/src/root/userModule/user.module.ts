import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NewMeetingComponent } from '../root/bigBlueButton/newMeeting/newMeeting.component';
import { UserHomeComponent } from './pages/userHome/userHome.component';
import { CreateSchoolComponent } from '../root/school/createSchool/createSchool.component';
import { VideoPlayerComponent } from '../root/videoPlayer/video-player.component';
import { SharedModule } from '../root/sharedModule/shared.module';
import { CreateClassComponent } from '../root/class/createClass/createClass.component';
import { CreateCourseComponent } from '../root/course/createCourse/createCourse.component';
import { SchoolProfileComponent } from '../root/school/schoolProfile/schoolProfile.component';
import { SchoolResolverService } from '../service/school-resolver.service';
import { MyEarningsComponent } from '../root/myEarnings/myEarnings.component';
import { LandingComponent } from './user-auth/component/landing/landing.component';
import { UserProfileComponent } from '../root/user/userProfile/userProfile.component';
import { ClassProfileComponent } from '../root/class/classProfile/classProfile.component';
import { UserFollowersComponent } from '../root/user/userFollowers/userFollowers.component';
import { SchoolFollowersComponent } from '../root/school/schoolFollowers/schoolFollowers.component';
import { ReelsViewComponent } from '../root/reels/reelsView.component';

import { ChatComponent } from '../root/chat/chat.component';
import { CourseProfileComponent } from '../root/course/courseProfile/courseProfile.component';
import { UserFeedComponent } from '../root/userFeed/userFeed.component';
import { NotificationsComponent } from '../root/Notifications/notifications.component';
import { GenerateCertificateComponent } from '../root/generateCertificate/generateCertificate.component';
import { AddTeacherComponent } from '../root/teacher/addTeacher.component';
import { PostViewComponent } from '../root/postView/postView.component';
import { AuthGuard } from '../service/auth.guard';
import { EarningsComponent } from '../root/earnings/earnings.component';
import { FileStorageComponent } from '../root/fileStorage/fileStorage.component';
import { UserFollowingsComponent } from '../root/user/userFollowings/userFollowings.component';
import { Subject } from 'rxjs';
import { GlobalSearchComponent } from '../root/globalSearch/globalSearch.component';
import { StudentListComponent } from '../root/students/studentList.componant';
import { ReelsSliderComponent } from '../root/reelsSlider/reelsSlider.component';


const routes: Routes = [
  {
    path: '',
    redirectTo:'landing'
  },
  {
    path: 'auth',
    loadChildren: () => import('./user-auth.module')
      .then(m => m.UserAuthModule),
  },

  {
    path: 'landing',
    component: LandingComponent,
  },
  
  {
    path: 'userHome',component:UserHomeComponent
  },
  {
    path: 'newMeeting',component:NewMeetingComponent
  },
  {
    path: 'createSchool',component:CreateSchoolComponent, canActivate: [AuthGuard]
  },
  {
    path: 'chats',component:ChatComponent, canActivate: [AuthGuard]
  },
  {
    path: 'notifications',component:NotificationsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'createCertificate',component:GenerateCertificateComponent, canActivate: [AuthGuard]
  },
  {
    path: 'schoolProfile/:schoolId',component:SchoolProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'classProfile/:classId',component:ClassProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'school/:schoolName/:className',component:ClassProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'courseProfile/:courseId',component:CourseProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'myEarnings',component:MyEarningsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'earnings',component:EarningsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'userProfile/:userId',component:UserProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: 'userFeed',component:UserFeedComponent, canActivate: [AuthGuard]
  },
  {
    path: 'userFollowers/:userId',component:UserFollowersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'userFollowings/:userId',component:UserFollowingsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'schoolFollowers/:schoolId',component:SchoolFollowersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'createClass/:id',component:CreateClassComponent, canActivate: [AuthGuard]
  },
  {
    path: 'createClass',component:CreateClassComponent, canActivate: [AuthGuard]
  },
  {
    path: 'createCourse/:id',component:CreateCourseComponent, canActivate: [AuthGuard]
  },
  {
    path: 'createCourse',component:CreateCourseComponent, canActivate: [AuthGuard]
  },
  {
    path: 'videoPlayer',component:VideoPlayerComponent, canActivate: [AuthGuard]
  },
  {
    path: 'reels/:id',component:ReelsViewComponent, canActivate: [AuthGuard]
  },
  {
    path: 'reelsView/:id/:from',component:ReelsSliderComponent, canActivate: [AuthGuard]
  },
  {
    path: 'addTeacher/:userId',component:AddTeacherComponent, canActivate: [AuthGuard]
  },
  {
    path: 'post/:id',component:PostViewComponent, canActivate: [AuthGuard]
  },
  {
    path: 'fileStorage/:id/:ownerId/:type',component:FileStorageComponent, canActivate: [AuthGuard]
  },
  {
    path: 'globalSearch/:searchString',component:GlobalSearchComponent, canActivate: [AuthGuard]
  },
  {
    path: 'studentList/:id/:type',component:StudentListComponent, canActivate: [AuthGuard]
  },
];


@NgModule({
  declarations: [UserHomeComponent],
  imports: [
    SharedModule,
    CommonModule,
    [RouterModule.forChild(routes)],
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  exports:[RouterModule]
 
  
  
})
export class UserModule {}
