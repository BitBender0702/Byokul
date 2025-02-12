import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './root/root.component';
import { ResetPasswordComponent } from './root/sharedModule/reset-password.component';
import { NewMeetingComponent } from './root/bigBlueButton/newMeeting/newMeeting.component';
import { CreateSchoolComponent } from './root/school/createSchool/createSchool.component';
import { SchoolProfileComponent } from './root/school/schoolProfile/schoolProfile.component';
import { ClassProfileComponent } from './root/class/classProfile/classProfile.component';
import { UserProfileComponent } from './root/user/userProfile/userProfile.component';
import {MultiSelectModule} from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VideoPlayerComponent } from './root/videoPlayer/video-player.component';
import { TranslateLoader,TranslateModule, } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient } from '@angular/common/http';
import { SideBarComponent } from './user-template/side-bar/side-bar.component';
import { CreatePostComponent } from './root/createPost/createPost.component';
import {StepsModule} from 'primeng/steps';
import { ToastModule } from "primeng/toast";
import { CreateClassComponent } from './root/class/createClass/createClass.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CreateCourseComponent } from './root/course/createCourse/createCourse.component';
import { SharedModule } from './root/sharedModule/shared.module';
import { PreloadAllModules } from '@angular/router'; 
import { CommonModule, DatePipe } from '@angular/common';
import { MyEarningsComponent } from './root/myEarnings/myEarnings.component';
import { ReelsViewComponent } from './root/reels/reelsView.component';
import { BlockUIModule } from 'ng-block-ui';
import { ChipsModule } from 'primeng/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { UserFollowersComponent } from './root/user/userFollowers/userFollowers.component';
import { SchoolFollowersComponent } from './root/school/schoolFollowers/schoolFollowers.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CalendarModule } from 'primeng/calendar';
import { ChatComponent } from './root/chat/chat.component';
import { PostViewComponent } from './root/postView/postView.component';
import { CourseProfileComponent } from './root/course/courseProfile/courseProfile.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { UserFeedComponent } from './root/userFeed/userFeed.component';
import { ClassCourseModalComponent } from './root/ClassCourseModal/classCourseModal.component';
import { PaymentComponent } from './root/payment/payment.component';
import { NotificationsComponent } from './root/Notifications/notifications.component';
import { CertificateViewComponent } from './root/certificateView/certificateView.component';
import { PdfViewerModule } from 'ng2-pdf-viewer'; 
import { GenerateCertificateComponent } from './root/generateCertificate/generateCertificate.component';
import { AddTeacherComponent } from './root/teacher/addTeacher.component';
import { SharePostComponent } from './root/sharePost/sharePost.component';
import { EarningsComponent } from './root/earnings/earnings.component';
import { FileStorageComponent } from './root/fileStorage/fileStorage.component';
import { PaginatorModule } from 'primeng/paginator';
import { UserFollowingsComponent } from './root/user/userFollowings/userFollowings.component';
import { LiveStreamComponent } from './root/liveStream/liveStream.component';
import { AuthGuard } from './service/auth.guard';
import { GlobalSearchComponent } from './root/globalSearch/globalSearch.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart'
import { StudentListComponent } from './root/students/studentList.component';
import { ChatVideoComponent } from './root/chatVideo/chatVideo.component';
import { FaqComponent } from './root/faq/faq.component';
import { AboutUsComponent } from './root/aboutUs/aboutUs.component';
import { PrivecyPolicyComponent } from './root/privacyPolicy/privacyPolicy.component';
import { TermsOfServiceComponent } from './root/termsOfService/termsOfService.component';
import { ReelsSliderComponent } from './root/reelsSlider/reelsSlider.component';
import { ContactComponent } from './root/contact/contact.component';
import { DeliveryAndReturnComponent } from './root/DeliveryAndReturn/deliveryAndReturn.component';
import { DSAForSchoolComponent } from './root/DSAForSchool/dsaForSchool.component';
import { DSAForStudentsComponent } from './root/dsaForStudents/dsaForStudents.component';
import { ImageCropperModule } from 'ngx-image-cropper'; 
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import {LazyLoadImageModule} from 'ng-lazyload-image'
import { VideoJsComponent } from './root/videojs/videojs.component';
import { UploadCertificateComponent } from './root/UploadCertificates/uploadCertificate.component';
import { DialogModule } from "primeng/dialog";
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';
import { SchoolVideoLibraryComponent } from './root/schoolVideoLibrary/schoolVideoLibrary.component';
import { AddOfficialComponent } from './root/addOfficial/addOfficial.component';
import { DeleteConfirmationComponent } from './root/delete-confirmation/delete-confirmation.component';
import { DeleteOrDisableComponent } from './root/deleteOrDisableSCC/delete-or-disable.component';
import { ChangeTimeZonePipe } from './ChangeTimeZonePipe';
import { SharedSSCComponent } from './root/sharedSSC/sharedSSCComponent';
import { AppTermsOfServiceComponent } from './root/FlutterStaticPages/TermsOfService/termsOfService.component';
import { AppPrivacyPolicyComponent } from './root/FlutterStaticPages/privacyPolicy/privacyPolicy.component';
import { AppAboutUsComponent } from './root/FlutterStaticPages/aboutUs/aboutUs.component';
import { AppContactComponent } from './root/FlutterStaticPages/contact/contact.component';
import { AppDeliveryAndReturnComponent } from './root/FlutterStaticPages/deliveryAndReturn/deliveryAndReturn.component';
import { AppDsaForStudentsComponent } from './root/FlutterStaticPages/dsaForStudents/dsaForStudents.component';
import { AppDsaForSchoolComponent } from './root/FlutterStaticPages/dsaForSchool/dsaForSchool.component';
import { FreeTrialComponent } from './root/freeTrial/freeTrial.component';
import { PaymentResponseModalComponent } from './root/paymentResponseModal/paymentResponseModal.component';
export const options: Partial<IConfig> = {
  thousandSeparator: "'"
};

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
  },
  {
    path: 'liveStream/:postId/:from',component:LiveStreamComponent, canActivate: [AuthGuard]
  },
  {
    path: 'aboutUs',component:AboutUsComponent
  },
  {
    path: 'faq',component:FaqComponent
  },
  {
    path: 'privacyPolicy',component:PrivecyPolicyComponent
  },
  {
    path: 'termsOfServices',component:TermsOfServiceComponent
  },
  {
    path: 'contact',component:ContactComponent, canActivate: [AuthGuard]
  },
  {
    path: 'deliveryAndReturn',component:DeliveryAndReturnComponent, canActivate: [AuthGuard]
  },
  {
    path: 'distanceSalesAgreementForSchools',component:DSAForSchoolComponent, canActivate: [AuthGuard]
  },
  {
    path: 'distanceSalesAgreementForStudents',component:DSAForStudentsComponent, canActivate: [AuthGuard]
  },
  {
    path: 'appTermsOfService/:lang',component:AppTermsOfServiceComponent
  },
  {
    path: 'appPrivacyPolicy/:lang',component:AppPrivacyPolicyComponent
  },
  {
    path: 'appAboutUs/:lang',component:AppAboutUsComponent
  },
  {
    path: 'appContact/:lang',component:AppContactComponent
  },
  {
    path: 'appDeliveryAndReturn/:lang',component:AppDeliveryAndReturnComponent
  },
  {
    path: 'appDsaForSchool/:lang',component:AppDsaForSchoolComponent
  },
  {
    path: 'appDsaForStudents/:lang',component:AppDsaForStudentsComponent
  },
];

@NgModule({
  declarations: [
    RootComponent,
    ResetPasswordComponent,
    NewMeetingComponent,
    CreateSchoolComponent,
    SchoolProfileComponent,
    CreateClassComponent,
    CreateCourseComponent,
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
    UserFollowingsComponent,
    SchoolFollowersComponent,
    PostViewComponent,
    ClassCourseModalComponent,
    ChatComponent,
    PaymentComponent,
    NotificationsComponent,
    CertificateViewComponent,
    GenerateCertificateComponent,
    AddTeacherComponent,
    SharePostComponent,
    EarningsComponent,
    FileStorageComponent,
    LiveStreamComponent,
    GlobalSearchComponent,
    StudentListComponent,
    ChatVideoComponent,
    AboutUsComponent,
    FaqComponent,
    PrivecyPolicyComponent,
    TermsOfServiceComponent,
    ReelsSliderComponent,
    ContactComponent,
    DeliveryAndReturnComponent,
    DSAForSchoolComponent,
    DSAForStudentsComponent,
    UploadCertificateComponent,
    VideoJsComponent,
    SchoolVideoLibraryComponent,
    AddOfficialComponent,
    DeleteConfirmationComponent,
    DeleteOrDisableComponent,
    ChangeTimeZonePipe,
    SharedSSCComponent,
    AppTermsOfServiceComponent,
    AppPrivacyPolicyComponent,
    AppAboutUsComponent,
    AppContactComponent,
    AppDeliveryAndReturnComponent,
    AppDsaForSchoolComponent,
    AppDsaForStudentsComponent,
    FreeTrialComponent,
    PaymentResponseModalComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
    HttpClientModule,
    FormsModule,
    NgxMaskModule.forRoot(options),
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
    PdfViewerModule,
    PaginatorModule,
    NgbModule,
    PickerModule,
    ImageCropperModule,
    NgxIntlTelInputModule,
    SlickCarouselModule,
    LazyLoadImageModule ,
    DialogModule,
    SidebarModule,
    TooltipModule,
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
  providers: [DatePipe],
  bootstrap: [RootComponent]
})
export class RootModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
