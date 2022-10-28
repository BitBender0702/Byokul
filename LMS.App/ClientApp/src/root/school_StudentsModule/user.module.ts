import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NewMeetingComponent } from '../root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from '../root/bigBlueButton/joinMeeting/joinMeeting.component';
import { UserHomeComponent } from './pages/userHome/userHome.component';
import { CreateSchoolComponent } from '../root/createSchool/createSchool.component';
import { VideoPlayerComponent } from '../root/videoPlayer/video-player.component';

@NgModule({
  declarations: [UserHomeComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
          {
            path: '',
            redirectTo:'auth'
          },
          {
            path: 'auth',
            loadChildren: () => import('./user-auth.module')
              .then(m => m.UserAuthModule),
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
            path: 'videoPlayer',component:VideoPlayerComponent
          },
    ]),
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
 
  
  
})
export class UserModule { }
