import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NewMeetingComponent } from '../root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from '../root/bigBlueButton/joinMeeting/joinMeeting.component';
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
    path: 'joinMeeting/:meetingId',component:JoinMeetingComponent
  },
  {
    path: 'createSchool',component:CreateSchoolComponent, canActivate: [AuthGuard]
  },
  // {
  //   path: 'chat',component:ChatComponent
  // },
  {
    path: 'chats',component:ChatComponent
  },
  {
    path: 'notifications',component:NotificationsComponent
  },
  {
    path: 'createCertificate/:from/:id',component:GenerateCertificateComponent
  },
  {
    path: 'schoolProfile/:schoolId',component:SchoolProfileComponent
  },
  {
    path: 'classProfile/:classId',component:ClassProfileComponent
  },
  {
    path: 'school/:schoolName/:className',component:ClassProfileComponent
  },
  {
    path: 'courseProfile/:courseId',component:CourseProfileComponent
  },
  {
    path: 'myEarnings',component:MyEarningsComponent
  },
  {
    path: 'earnings',component:EarningsComponent
  },
  {
    path: 'userProfile/:userId',component:UserProfileComponent
  },
  {
    path: 'userFeed',component:UserFeedComponent
  },
  {
    path: 'userFollowers/:userId',component:UserFollowersComponent
  },
  {
    path: 'schoolFollowers/:schoolId',component:SchoolFollowersComponent
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
    path: 'videoPlayer',component:VideoPlayerComponent
  },
  {
    path: 'reels/:id',component:ReelsViewComponent
  },
  {
    path: 'addTeacher/:userId',component:AddTeacherComponent
  },
  {
    path: 'post/:id',component:PostViewComponent
  },
  {
    path: 'fileStorage/:id/:type',component:FileStorageComponent
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
