import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NewMeetingComponent } from '../root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from '../root/bigBlueButton/joinMeeting/joinMeeting.component';
import { CreateSchoolComponent } from '../root/school/createSchool/createSchool.component';
import { VideoPlayerComponent } from '../root/videoPlayer/video-player.component';
import { EditSchoolComponent } from '../root/school/editSchool/editSchool.component';
import { SharedModule } from '../root/sharedModule/shared.module';
import { CreateClassComponent } from '../root/class/createClass/createClass.component';
import { CreateCourseComponent } from '../root/course/createCourse/createCourse.component';
import { SchoolProfileComponent } from '../root/school/schoolProfile/schoolProfile.component';
import { SchoolResolverService } from '../service/school-resolver.service';
import { MyEarningsComponent } from '../root/myEarnings/myEarnings.component';
import { UserProfileComponent } from '../root/user/userProfile/userProfile.component';
import { ClassProfileComponent } from '../root/class/classProfile/classProfile.component';
import { UserFollowersComponent } from '../root/user/userFollowers/userFollowers.component';
import { SchoolFollowersComponent } from '../root/school/schoolFollowers/schoolFollowers.component';
import { ReelsViewComponent } from '../root/reels/reelsView.component';

import { ChatComponent } from '../root/chat/chat.component';
import { UrlRoutesComponent } from './urlRoutes.component';


// const routes: Routes = [
//   {
//     path: '',
//     redirectTo:':schoolName'
//   },
  
//   {
//     path: ':schoolName',component:SchoolProfileComponent
//   },

// ];


@NgModule({
  declarations: [UrlRoutesComponent],
  imports: [
    SharedModule,
    CommonModule,
    RouterModule.forChild([{
        path: '',
        component: UrlRoutesComponent,
        children: [
          // {
          //   path: '',
          //   redirectTo:'school/:schoolName'
          // },   
          {
            path: ':schoolName',component:SchoolProfileComponent
         },
         {
          path: ':schoolName/:className',component:ClassProfileComponent
       },



  
    ]}]),
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  exports:[RouterModule]
 
  
  
})
export class UrlRoutesModule {}
