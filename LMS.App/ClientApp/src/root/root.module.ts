import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './root/root.component';
import { ResetPasswordComponent } from './root/sharedModule/reset-password.component';
import { NewMeetingComponent } from './root/bigBlueButton/newMeeting/newMeeting.component';
import { JoinMeetingComponent } from './root/bigBlueButton/joinMeeting/joinMeeting.component';
import { CreateSchoolComponent } from './root/school/createSchool/createSchool.component';
import { SchoolProfileComponent } from './root/school/schoolProfile/schoolProfile.component';
import { EditSchoolComponent } from './root/school/editSchool/editSchool.component';
import { ClassProfileComponent } from './root/class/classProfile/classProfile.component';
import { UserProfileComponent } from './root/user/userProfile/userProfile.component';


import {MultiSelectModule} from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VideoPlayerComponent } from './root/videoPlayer/video-player.component';


import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { MultilingualComponent } from './root/sharedModule/Multilingual/multilingual.component';

import { SideBarComponent } from './user-template/side-bar/side-bar.component';
import { CreatePostComponent } from './root/createPost/createPost.component';

import {StepsModule} from 'primeng/steps';
import { ToastModule } from "primeng/toast";
import { CreateClassComponent } from './root/class/createClass/createClass.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CreateCourseComponent } from './root/course/createCourse/createCourse.component';
import { SharedModule } from './root/sharedModule/shared.module';

import { PreloadAllModules } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { MyEarningsComponent } from './root/myEarnings/myEarnings.component';
import { ReelsViewComponent } from './root/reels/reelsView.component';
import { BlockUIModule } from 'ng-block-ui';
import { ChipsModule } from 'primeng/chips';

import { MatDialogModule } from '@angular/material/dialog';
import { UserFollowersComponent } from './root/user/userFollowers/userFollowers.component';
import { SchoolFollowersComponent } from './root/school/schoolFollowers/schoolFollowers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ModalModule } from 'ngx-bootstrap/modal';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CalendarModule } from 'primeng/calendar';

import { ChatComponent } from './root/chat/chat.component';
import { AdminModule } from './admin/admin.module';
import { PostViewComponent } from './root/postView/postView.component';
import { CourseProfileComponent } from './root/course/courseProfile/courseProfile.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { UserFeedComponent } from './root/userFeed/userFeed.component';
import { ClassCourseModalComponent } from './root/ClassCourseModal/classCourseModal.component';
import { PaymentComponent } from './root/payment/payment.component';


const routes: Routes = [

  {
    path: '',
    redirectTo: 'user',
    pathMatch: 'full',
  },
  {
    path: 'user',data: { preload: true },
    loadChildren: () => import('./userModule/user.module')
      .then(m => m.UserModule)
  },
  {
    path: 'administration',data: { preload: true },
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
  },
  {
    path: 'profile',data: { preload: true },
    loadChildren: () => import('./root/urlRoutes.module')
      .then(m => m.UrlRoutesModule)
  }


];

@NgModule({
  declarations: [
    RootComponent,
    ResetPasswordComponent,
    NewMeetingComponent,
    JoinMeetingComponent,
    CreateSchoolComponent,
    SchoolProfileComponent,
    CreateClassComponent,
    CreateCourseComponent,
    EditSchoolComponent,
    SideBarComponent,
    CreatePostComponent,
    VideoPlayerComponent,
    MyEarningsComponent,
    ClassProfileComponent,
    CourseProfileComponent,
    UserProfileComponent,
    UserFeedComponent,
    ReelsViewComponent,
    UserFollowersComponent,
    SchoolFollowersComponent,
    PostViewComponent,
    ClassCourseModalComponent,
    ChatComponent,
    PaymentComponent

  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    BrowserAnimationsModule,
    ButtonModule,
    StepsModule,
    ToastModule,
    AutoCompleteModule,
    BlockUIModule.forRoot(),
    ButtonModule,
    ChipsModule,
    MatDialogModule,
    ModalModule.forRoot(),
    CalendarModule,
    CarouselModule,
    TranslateModule.forRoot({
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),

    [RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules
    })
  ],
    
  ],

  exports: [RouterModule,SharedModule,ModalModule],
  providers: [],
  bootstrap: [RootComponent]
})
export class RootModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
