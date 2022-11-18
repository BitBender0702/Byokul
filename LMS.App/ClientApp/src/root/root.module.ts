import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { RootComponent } from './root/root.component';
import { ResetPasswordComponent } from './root/sharedModule/reset-password.component';
import { NewMeetingComponent } from './root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from './root/bigBlueButton/joinMeeting/joinMeeting.component';
import { CreateSchoolComponent } from './root/school/createSchool/createSchool.component';
import { EditSchoolComponent } from './root/school/editSchool/editSchool.component';



import {MultiSelectModule} from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VideoPlayerComponent } from './root/videoPlayer/video-player.component';


import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { MultilingualComponent } from './root/sharedModule/Multilingual/multilingual.component';

import { SideBarComponent } from './user-template/side-bar/side-bar.component';

import {StepsModule} from 'primeng/steps';
import { ToastModule } from "primeng/toast";

@NgModule({
  declarations: [
    RootComponent,
    ResetPasswordComponent,
    NewMeetingComponent,
    JoinMeetingComponent,
    CreateSchoolComponent,
    EditSchoolComponent,
    SideBarComponent,
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
    ToastModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),
    RouterModule.forRoot([
          {
            path: 'user',
            loadChildren: () => import('./userModule/user.module')
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

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
