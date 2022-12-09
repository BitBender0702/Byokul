import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NewMeetingComponent } from '../root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from '../root/bigBlueButton/joinMeeting/joinMeeting.component';
import { UserHomeComponent } from './pages/userHome/userHome.component';
import { CreateSchoolComponent } from '../root/school/createSchool/createSchool.component';
import { VideoPlayerComponent } from '../root/videoPlayer/video-player.component';
import { EditSchoolComponent } from '../root/school/editSchool/editSchool.component';
import { SharedModule } from '../root/sharedModule/shared.module';
import { CreateClassComponent } from '../root/class/createClass/createClass.component';
import { CreateCourseComponent } from '../root/course/createCourse/createCourse.component';
import { SchoolProfileComponent } from '../root/school/schoolProfile/schoolProfile.component';
import { SchoolResolverService } from '../service/school-resolver.service';
import { MyEarningsComponent } from '../root/myEarnings/myEarnings.component';
import { LandingComponent } from './user-auth/component/landing/landing.component';
import { UserProfileComponent } from '../root/user/userProfile/userProfile.component';
import { ClassProfileComponent } from '../root/class/classProfile/classProfile.component';


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
    path: 'createSchool',component:CreateSchoolComponent
  },
  {
    path: 'schoolProfile/:schoolId',component:SchoolProfileComponent
  },

  {
    path: 'classProfile/:classId',component:ClassProfileComponent
  },

  {
    path: 'myEarnings',component:MyEarningsComponent
  },

  {
    path: 'userProfile/:userId',component:UserProfileComponent
  },
  {
    path: 'createClass/:id',component:CreateClassComponent
  },
  {
    path: 'createClass',component:CreateClassComponent
  },
  {
    path: 'createCourse/:id',component:CreateCourseComponent
  },
  {
    path: 'createCourse',component:CreateCourseComponent
  },
  {
    path: 'editSchool',component:EditSchoolComponent
  },
  {
    path: 'videoPlayer',component:VideoPlayerComponent
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
export class UserModule { }
