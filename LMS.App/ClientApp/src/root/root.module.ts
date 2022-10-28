import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RootComponent } from './root/root.component';
import { ResetPasswordComponent } from './root/sharedModule/reset-password.component';
import { NewMeetingComponent } from './root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from './root/bigBlueButton/joinMeeting/joinMeeting.component';
import { CreateSchoolComponent } from './root/createSchool/createSchool.component';



import {MultiSelectModule} from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {StepsModule} from 'primeng/steps';
import { VideoPlayerComponent } from './root/videoPlayer/video-player.component';

@NgModule({
  declarations: [
    RootComponent,
    ResetPasswordComponent,
    NewMeetingComponent,
    JoinMeetingComponent,
    CreateSchoolComponent,

    VideoPlayerComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    BrowserAnimationsModule,
    ButtonModule,
    StepsModule,
    RouterModule.forRoot([
          {
            path: 'user',
            loadChildren: () => import('./school_StudentsModule/user.module')
              .then(m => m.UserModule),
          },
          {
            path: '',
            redirectTo: 'user',
            pathMatch: 'full',
          },
    ]),
  ],
  providers: [],
  bootstrap: [RootComponent]
})
export class RootModule { }
