import { ChangeDetectorRef, Component, ContentChild, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { SignalrService, notiFyTeacherResponse } from '../service/signalr.service';
import { Meta } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, NavigationExtras, Params, Router } from '@angular/router';
import { Constant } from '../interfaces/constant';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualComponent } from './sharedModule/Multilingual/multilingual.component';
import { CreatePostComponent, addPostResponse, createLive, createPost, createReel } from './createPost/createPost.component';
import { UploadTypeEnum } from '../Enums/uploadTypeEnum';
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { PostService } from '../service/post.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../interfaces/notification/notificationViewModel';
import { FileStorageService } from '../service/fileStorage';
import { fileStorageResponse } from './fileStorage/fileStorage.component';
import { UserService } from '../service/user.service';
import { addTeacherResponse } from './addOfficial/addOfficial.component';
import { VideoLibraryService } from '../service/videoLibrary.service';
import { addVideoInLibraryResponse } from './schoolVideoLibrary/schoolVideoLibrary.component';
import { SchoolService } from '../service/school.service';
import { banUnbanUserProgression } from '../admin/registeredUsers/registeredUsers.component';
import { thumbnailUploadResponse } from './class/createClass/createClass.component';
// import { userPermission } from './class/classProfile/classProfile.component';
export const userPermission = new Subject<{ userPermissions: any }>();

export const deleteReelResponse = new Subject();
export const paymentConfirmDialoge = new Subject<{ response: any }>();
export const postProgressNotification = new Subject<{ from: string }>();
export const postUploadOnBlob = new Subject<{
  postToUpload: any,
  combineFiles: any,
  videos: any,
  images: any,
  attachment: any,
  type: any,
  reel: any,
  uploadedUrls: any[],
  videoThumbnails?: any,
  schoolId?: string,
  checkLimitSchoolId?: string
}>();

export const uploadClassOrCourseThumbail = new Subject<{
   uploadFile:any;
}>();

// export const userPermissions = new Subject();


export const reelUploadOnBlob = new Subject<{
  postToUpload: any,
  reel: any,
  checkLimitSchoolId?: string
}>();
@Component({
  selector: 'root-selector',
  templateUrl: './root.component.html',
  styleUrls: [],
  providers: [MessageService]
})
export class RootComponent extends MultilingualComponent implements OnInit, OnDestroy {
  title = 'app';
  displaySideBar: boolean = false;
  displayAdminSideBar: boolean = false;
  uploadVideoUrlList: any[] = [];
  postProgressSubscription!: Subscription;
  postUploadOnBlobSubscription!: Subscription;
  reelUploadOnBlobSubscription!: Subscription;
  uploadClassCourseThumbSubscription!: Subscription;
  addPostSubscription!: Subscription;
  paymentConfirmSubscription!: Subscription;
  loginUserId: string = "";
  notifyTeacherSubscription!: Subscription;
  schoolId: string = "";
  banUnbanUserSubscription!:Subscription;
  checkLimitSchoolId:any;
  totalUploadFilesSize: number = 0;
  totalUploadFilesSizeLimitCheck: number = 0;
  totalFileSize: number = 0;
  overallProgress: number = 0;
  loadBytes:any = 0;
  progressValue: number = 0;
  @ViewChild('openProgressBar') openProgressBar!: ElementRef;
  @ViewChild('paymentConfirmationBtn') paymentConfirmationBtn!: ElementRef;

  private _postService;
  private _notificationService;
  private _fileStorageService;
  private _userService;
  private _videoLibraryService;
  private _schoolService;
  private _authService;

  constructor(injector: Injector, private cd: ChangeDetectorRef,private fileStorageService: FileStorageService, private userService: UserService, private notificationService: NotificationService, private signalRService: SignalrService, public messageService: MessageService, private translateService: TranslateService, private meta: Meta,private authService: AuthService, private router: Router, private route: ActivatedRoute, postService: PostService, videoLibraryService: VideoLibraryService, schoolService: SchoolService) {
    super(injector);
    this._postService = postService;
    this._notificationService = notificationService;
    this._fileStorageService = fileStorageService;
    this._userService = userService;
    this._authService = authService;
    this._videoLibraryService = videoLibraryService;
    this._schoolService = schoolService;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        event.urlAfterRedirects = event.urlAfterRedirects.split('/').slice(0, 3).join('/');
        if (event.urlAfterRedirects.includes("/user/userProfile")) {
          const existingTag = this.meta.getTag('content="noindex,nofollow"');
          if (!existingTag) {
            this.meta.addTag({ name: 'robots', content: 'noindex,nofollow' });
          }
        }

        if (event.urlAfterRedirects.includes("/profile/school") || event.urlAfterRedirects.includes("/profile/school") || event.urlAfterRedirects.includes("/profile/class") || event.urlAfterRedirects.includes("/profile/course")) {
          const existingTag = this.meta.getTag('content="nofollow"');
          if (!existingTag) {
            this.meta.addTag({ name: 'robots', content: 'nofollow' });
          }
        }

        const canonicalUrl = Constant.WwwAppUrl + event.urlAfterRedirects;
        const existingCanonicalTag = this.meta.getTag('name="canonical"');
        if (existingCanonicalTag) {
          this.meta.updateTag({ name: 'canonical', content: canonicalUrl });
        }
        else {
          this.meta.addTag({ name: 'canonical', content: canonicalUrl });
        }
      }
    });
    this._authService.loginState$.asObservable().subscribe(x => { this.displaySideBar = x; });
    this._authService.loginAdminState$.asObservable().subscribe(x => { this.displayAdminSideBar = x; });
  }

  ngOnInit(): void {
    this._authService.redirectAfterTokenExpired();
    this.loginUserInfo();
    this.connectSignalR();
    this.meta.updateTag({ property: 'og:title', content: "test" });
    this.meta.updateTag({ property: 'og:type', content: "profile" });
    this.meta.updateTag({ property: 'og:description', content: "description" });
    // this.meta.addTag({ property: 'og:image', content: "../../assets/images/logo.svg" });
    this.meta.updateTag({ property: 'og:url', content: "byokul.com" });

    if (!this.uploadClassCourseThumbSubscription) {
      this.uploadClassCourseThumbSubscription = uploadClassOrCourseThumbail.subscribe(async (uploadResponse) => {
        debugger
        this._userService.getBlobSasToken().subscribe(async (response: any) => {
          debugger
          this.cd.detectChanges();
          this.loadBytes = 0;
          this.totalFileSize = 0;
          this.overallProgress = 0;
          this.fileUploadProgress = {};
          // this.openProgressBar.nativeElement.click();
          this.totalUploadFilesSize = 0;
          this.uploadVideoUrlList = [];
          this.totalFileSize = uploadResponse.uploadFile.size;
          if(uploadResponse.uploadFile.type.startsWith('image/')) {
            await this.uploadVideosOnBlob(uploadResponse.uploadFile, UploadTypeEnum.Image, response.sasToken,this.totalFileSize,true);
          }
          if (uploadResponse.uploadFile.type.startsWith('video/')) {
            await this.uploadVideosOnBlob(uploadResponse.uploadFile, UploadTypeEnum.Video, response.sasToken,this.totalFileSize,true);
          }
          // await Promise();
          thumbnailUploadResponse.next({thumbnailUrl:this.uploadVideoUrlList[0].blobUrl});
      })
    });
  }
    if (!this.paymentConfirmSubscription) {
      this.paymentConfirmSubscription = deleteReelResponse.subscribe(response => {
        debugger
        const translatedSummary = this.translateService.instant('Success');
        var translatedMessage = this.translateService.instant('ReelDeletedSuccessfully');
        this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
      })
    }

    if(!this.banUnbanUserSubscription){
      this.banUnbanUserSubscription = banUnbanUserProgression.subscribe(response =>{
        this.loginUserInfo();
        if(this.loginUserId == response.userId){
          this.router.navigate([`/user/auth/logout`]);
        }
      })
    }


    if (!this.notifyTeacherSubscription) {
      this.notifyTeacherSubscription = notiFyTeacherResponse.subscribe(response => {
        debugger
        this._userService.getUserPermissions(response.userId).subscribe((response) => {
          debugger
          var userPermissions = JSON.parse(localStorage.getItem('userPermissions') ?? '');
          localStorage.setItem("userPermissions", JSON.stringify(response));
          userPermission.next(userPermissions);
        });
      });
    }

    if (!this.paymentConfirmSubscription) {
      this.paymentConfirmSubscription = paymentConfirmDialoge.subscribe(response => {
        debugger
        this.paymentConfirmationBtn.nativeElement.click();
      })
    }
    if (!this.postProgressSubscription) {
      this.postProgressSubscription = postProgressNotification.subscribe(response => {
        debugger
        if (response.from == Constant.Post) {
          var translatedMessage = this.translateService.instant('PostProgressMessage');
        }
        if (response.from == Constant.FileStorage) {
          var translatedMessage = this.translateService.instant('FileStorageProgressMessage');
        }
        if (response.from == Constant.VideoLibrary) {
          var translatedMessage = this.translateService.instant('VideoLibraryProgressMessage');
        }
        const translatedSummary = this.translateService.instant('Info');
        this.messageService.add({ severity: 'info', summary: translatedSummary, life: 3000, detail: translatedMessage });
      });
    }

    if (!this.postUploadOnBlobSubscription) {
      this.postUploadOnBlobSubscription = postUploadOnBlob.subscribe(async (uploadResponse) => {
        debugger
        // this.cd.detectChanges();
        // this.openProgressBar.nativeElement.click();
        this._userService.getBlobSasToken().subscribe(async (response: any) => {
          debugger
          this.cd.detectChanges();
          this.loadBytes = 0;
          this.totalFileSize = 0;
          this.overallProgress = 0;
          this.fileUploadProgress = {};
          // this.openProgressBar.nativeElement.click();
          this.totalUploadFilesSize = 0;
          if (uploadResponse.schoolId != undefined) {
            this.schoolId = uploadResponse.schoolId;
          }
          if(uploadResponse.checkLimitSchoolId != undefined){
            this.checkLimitSchoolId = uploadResponse.checkLimitSchoolId;
            uploadResponse.combineFiles.forEach((element:any) => {
              this.totalUploadFilesSizeLimitCheck += element.size
            });
          }
          this.uploadVideoUrlList = [];

          uploadResponse.combineFiles.forEach((file: { size: any; }) => {
            debugger;
            this.totalFileSize += file.size;
          });

          if (uploadResponse.type == 1) {
            const uploadPromises = uploadResponse.combineFiles.map((file: any) => {
              if (uploadResponse.videos.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Video, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.images.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Image, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.attachment.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Attachment, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.videoThumbnails.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Thumbnail, response.sasToken,this.totalFileSize);
              }

              return "";

            });

            await Promise.all(uploadPromises);
            // this.createPostRef.createPostResponse({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList,type:1});
            createPost.next({ postToUpload: uploadResponse.postToUpload, uploadVideoUrlList: this.uploadVideoUrlList, type: 1 });
            // var uploadUrls = uploadResponse.uploadedUrls.push(...this.uploadVideoUrlList);
            var uploadUrls = [...uploadResponse.uploadedUrls, ...this.uploadVideoUrlList]
            this.getThumbnailUrl(uploadUrls);
            // var totalThumbnails = uploadUrls.filter(x => x.fileType == UploadTypeEnum.Thumbnail);

            // totalThumbnails.forEach((item:any) => {
            //   debugger
            //   const lastDotIndex = item.blobName.lastIndexOf('.');
            //   const thumbnailName = item.blobName.substring(0, lastDotIndex);
            //   var video = uploadUrls.find(x => x.blobName.substring(0,lastDotIndex) == thumbnailName  && x.fileType == 2);
            //   if(video != null){
            //     video.fileThumbnail = item.blobUrl;
            //     var thumbnailIndex = uploadUrls.findIndex(x => x.id == item.id);
            //     if (thumbnailIndex !== -1) {
            //       uploadUrls.splice(thumbnailIndex, 1);
            //     }
            //   }
            // });

            uploadResponse.postToUpload.append('blobUrlsJson', JSON.stringify(uploadUrls));
            var filesSizeInGb = this.totalUploadFilesSizeLimitCheck / (1024 * 1024 * 1024);
            
            if(this.checkLimitSchoolId != null || this.checkLimitSchoolId != undefined){
              this._schoolService.isAvailableStorageSpace(this.checkLimitSchoolId, filesSizeInGb).subscribe(response => {
                debugger
                if (response.success) {
                  if(response.data.availableSpace < 5 && !response.data.isStorageFullNotification){
                    var translatedMessage = this.translateService.instant('Your school has storage is less than 5%');
                      var notificationContent = translatedMessage;
                      this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.NotifyStorageExceed, notificationContent, this.loginUserId, response.id, response.postType, null, null).subscribe((response) => {
                      });
                  }
                  this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
                    debugger
                    this.totalFileSize = 0;
                    this.overallProgress = 0;
                    if(response.updatedOn==null){
                      var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
                    }
                    else{
                      var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
                    }
                    
                    const translatedSummary = this.translateService.instant('Success');
                    this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage, });
                    addPostResponse.next({ response });
                    if (uploadResponse.videos.length != 0 || uploadResponse.attachment.length != 0) {
                      var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
                      var notificationContent = translatedMessage;
                      if(response.dateTime == null){
                      this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, null).subscribe((response) => {
                      });
                     }
                    }
                  });
                } else{
                  const translatedSummary = this.translateService.instant('Success');
                  const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
                  this.messageService.add({
                    severity: 'success',
                    summary: translatedSummary,
                    life: 3000,
                    detail: translatedMessage,
                  });
                }
              })
            } else{
              this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
                debugger
                if(response.updatedOn==null){
                  var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
                }
                else{
                  var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
                }
                const translatedSummary = this.translateService.instant('Success');
                this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage, });
                addPostResponse.next({ response });
                if (uploadResponse.videos.length != 0 || uploadResponse.attachment.length != 0) {
                  var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
                  var notificationContent = translatedMessage;
                  this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, null).subscribe((response) => {
                  });
                }
              });
            }

            // this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
            //   debugger
            //   var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
            //   const translatedSummary = this.translateService.instant('Success');
            //   this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage, });
            //   addPostResponse.next({ response });
            //   if (uploadResponse.videos.length != 0 || uploadResponse.attachment.length != 0) {
            //     var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
            //     var notificationContent = translatedMessage;
            //     this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, null).subscribe((response) => {
            //     });
            //   }
            // });



          }
          if (uploadResponse.type == 2) {
            // await this.uploadVideosOnBlob(uploadResponse.reel,UploadTypeEnum.Video);
            const uploadPromises = uploadResponse.combineFiles.map((file: any) => {
              if (uploadResponse.videos.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Video, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.videoThumbnails.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Thumbnail, response.sasToken,this.totalFileSize);
              }

              return "";

            });

            await Promise.all(uploadPromises);
            createPost.next({ postToUpload: uploadResponse.postToUpload, uploadVideoUrlList: this.uploadVideoUrlList, type: 1 });
            this.getThumbnailUrl(this.uploadVideoUrlList);
            var uploadUrls = [...uploadResponse.uploadedUrls, ...this.uploadVideoUrlList]
            uploadResponse.postToUpload.append('blobUrlsJson', JSON.stringify(uploadUrls));

            var filesSizeInGb = this.totalUploadFilesSizeLimitCheck / (1024 * 1024 * 1024);
            debugger;
           
            if(this.checkLimitSchoolId != null || this.checkLimitSchoolId != undefined){
              this._schoolService.isAvailableStorageSpace(this.checkLimitSchoolId, filesSizeInGb).subscribe(response => {
                debugger
                if (response.success) {
                  this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
                    debugger
                    this.totalUploadFilesSize = 0;
                    this.overallProgress = 0;
                    // var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
                    if(response.updatedOn==null){
                      var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
                    }
                    else{
                      var translatedMessage = this.translateService.instant('ReelUpdatedSuccessfully');
                    }
                    const translatedSummary = this.translateService.instant('Success');
                    this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage, });
                    // this.isSubmitted=false;
                    // this.loadingIcon = false;
                    // this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel created successfully'});
                    addPostResponse.next({ response });
                    // this.postToUpload = new FormData();
                    var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
                    var notificationContent = translatedMessage;
                    // this.uploadVideoUrlList = [];
                    if(response.dateTime == null){
                    this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, response.reelId).subscribe((response) => {
                    });
                   }
                    // this.close();
                    // this.ngOnInit();
                  });
                } else{
                  const translatedSummary = this.translateService.instant('Success');
                  const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
                  this.messageService.add({
                    severity: 'success',
                    summary: translatedSummary,
                    life: 3000,
                    detail: translatedMessage,
                  });
                }
              })
            } else{
              debugger
              this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
                debugger
                if(response.updatedOn==null){
                  var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
                }
                else{
                  var translatedMessage = this.translateService.instant('ReelUpdatedSuccessfully');
                }
                const translatedSummary = this.translateService.instant('Success');
                this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage, });
                // this.isSubmitted=false;
                // this.loadingIcon = false;
                // this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel created successfully'});
                addPostResponse.next({ response });
                // this.postToUpload = new FormData();
                var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
                var notificationContent = translatedMessage;
                // this.uploadVideoUrlList = [];
                this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, response.reelId).subscribe((response) => {
                });
                // this.close();
                // this.ngOnInit();
              });
            }


            // this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
            //   debugger
            //   var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
            //   const translatedSummary = this.translateService.instant('Success');
            //   this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage, });
            //   // this.isSubmitted=false;
            //   // this.loadingIcon = false;
            //   // this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel created successfully'});
            //   addPostResponse.next({ response });
            //   // this.postToUpload = new FormData();
            //   var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
            //   var notificationContent = translatedMessage;
            //   // this.uploadVideoUrlList = [];
            //   this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, response.reelId).subscribe((response) => {
            //   });
            //   // this.close();
            //   // this.ngOnInit();
            // });



            // createReel.next({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList});
          }

          if (uploadResponse.type == 3) {
            debugger;
            const uploadPromises = uploadResponse.combineFiles.map((file: any) => {
              debugger
              if (uploadResponse.videos.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Video, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.images.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Image, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.videoThumbnails.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Thumbnail, response.sasToken,this.totalFileSize);
              }
              return "";
            });

            await Promise.all(uploadPromises);
            createPost.next({ postToUpload: uploadResponse.postToUpload, uploadVideoUrlList: this.uploadVideoUrlList, type: 1 });
            this.getThumbnailUrl(this.uploadVideoUrlList);
            uploadResponse.postToUpload.append('blobUrlsJson', JSON.stringify(this.uploadVideoUrlList));
            
            this._postService.createPost(uploadResponse.postToUpload).subscribe((response: any) => {
              debugger

              var from = response.postAuthorType == 1 ? "school" : response.postAuthorType == 2 ? "class" : response.postAuthorType == 4 ? "user" : undefined;
              var chatType = from == "user" ? 1 : from == "school" ? 3 : from == "class" ? 4 : undefined;

              // this.isSubmitted=false;
              // this.loadingIcon = false;
              //addPostResponse.next({response});
              // this.postToUpload = new FormData();
              // this.close();
              // this.uploadVideoUrlList = [];
              if (uploadResponse.videos.length != 0) {
                const translatedSummary = this.translateService.instant('Success');
                var translatedMessage = this.translateService.instant('VideoReadyToStream');
                var notificationContent = translatedMessage;
                this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
                //var chatType = this.from == "user" ? 1 :this.from == "school" ? 3 : this.from == "class" ? 4 : undefined;
                if(response.dateTime == null){
                  this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, null, null, chatType,null).subscribe((response) => {
                  });
                }
              }
              else {
                if (!response.isPostSchedule) {
                  this.router.navigate(
                    [`liveStream`, response.id, from]
                  );
                }
              }
            }

            );
          }

          if (uploadResponse.type == 4) {
            const uploadPromises = uploadResponse.combineFiles.map((file: any) => {
              debugger
              this.uploadVideoUrlList = [];
              var index = file.type.indexOf('/');
              if (index > 0) {
                if (file.type.substring(0, index) == Constant.Image) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Image, response.sasToken,this.totalFileSize);
                }
                if (file.type.substring(0, index) == Constant.Video) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Video, response.sasToken,this.totalFileSize);
                }
                if (file.type == Constant.Pdf) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Pdf, response.sasToken,this.totalFileSize);
                }
                if (file.type == Constant.Word || file.type == Constant.ExcelSx) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Word, response.sasToken,this.totalFileSize);
                }
                if (file.type == Constant.Excel) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Excel, response.sasToken,this.totalFileSize);
                }
                if (file.type == Constant.Ppt) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Presentation, response.sasToken,this.totalFileSize);
                }
                if (file.type == Constant.TextFile) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.TextFile, response.sasToken,this.totalFileSize);
                }
              }
              if (file.type == Constant.Ppt) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Presentation, response.sasToken,this.totalFileSize);
              }
              var index = file.name.lastIndexOf('.');
              if (index > 0) {
                if (file.name.substring(index + 1) == Constant.RarFile) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Zip, response.sasToken,this.totalFileSize);
                }
                if (file.name.substring(index + 1) == Constant.ZipFile) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Zip, response.sasToken,this.totalFileSize);
                }
                if (file.name.substring(index + 1) == Constant.Apk) {
                  return this.uploadVideosOnBlob(file, UploadTypeEnum.Apk, response.sasToken,this.totalFileSize);
                }

              }

              return "";
            });

            await Promise.all(uploadPromises);
            this.saveFilesInFileStorge(uploadResponse);

          }

          if (uploadResponse.type == 5) {
            debugger
            // var file = uploadResponse.videos;
            // await this.uploadVideosOnBlob(file, UploadTypeEnum.Video);
            const uploadPromises = uploadResponse.combineFiles.map((file: any) => {
              if (uploadResponse.videos.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Video, response.sasToken,this.totalFileSize);
              }
              if (uploadResponse.videoThumbnails.includes(file)) {
                return this.uploadVideosOnBlob(file, UploadTypeEnum.Thumbnail, response.sasToken,this.totalFileSize);
              }

              return "";

            });

            await Promise.all(uploadPromises);

            this.saveFilesInVideoLibrary(uploadResponse);
          }
        })
      });
    }

    // if(!this.addPostSubscription){
    //   this.addPostSubscription = addPostResponse.subscribe((postResponse:any) => {
    //     debugger
    //      // this.loadingIcon = true;
    //      if(postResponse.response.postType == 1){
    //        var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
    //      }
    //      else if(postResponse.response.postType == 3){
    //        var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
    //      }
    //      else{
    //        var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
    //      }
    //    const translatedSummary = this.translateService.instant('Success');
    //    this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,}); 
    //     })
    //   }

    // if(!this.reelUploadOnBlobSubscription){
    //   this.reelUploadOnBlobSubscription = reelUploadOnBlob.subscribe(async (response) => {
    //     debugger
    //     await this.uploadVideosOnBlob(response.reel,UploadTypeEnum.Video);
    //     createPost.next({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList,type:2});
    //   })
    // }

    // here if language not selected in local storage we add english by default in local storage
    var selectedLang = localStorage.getItem('selectedLanguage');
    if (selectedLang == null || selectedLang == "") {
      this.translate.use("en");
    }
  }


  saveFilesInFileStorge(uploadResponse: any) {
    debugger

    var filesSizeInGb = this.totalUploadFilesSize / (1024 * 1024 * 1024);
    this._schoolService.isAvailableStorageSpace(this.schoolId, filesSizeInGb).subscribe(response => {
      debugger
      if (response.success) {
        if(response.data.availableSpace < 5 && !response.data.isStorageFullNotification){
          var translatedMessage = this.translateService.instant('Your school has storage is less than 5%');
            var notificationContent = translatedMessage;
            this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.NotifyStorageExceed, notificationContent, this.loginUserId, response.id, response.postType, null, null).subscribe((response) => {
            });
        }
        var files = this.uploadVideoUrlList;
        uploadResponse.postToUpload.set('blobUrlsJson', JSON.stringify(files));
        this._fileStorageService.saveFiles(uploadResponse.postToUpload).subscribe(response => {
          debugger
          this.uploadVideoUrlList = [];
          uploadResponse.postToUpload = new FormData();
          fileStorageResponse.next({ fileStorageResponse: response, availableSpace: filesSizeInGb });
          const translatedSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('FilesAddedSuccessfully');
          this.messageService.add({
            severity: 'success',
            summary: translatedSummary,
            life: 3000,
            detail: translatedMessage,
          });

        });
        var translatedMessage = this.translateService.instant('FilesUploadedSuccessfully');
        var notificationContent = translatedMessage;
        this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.FilesUploaded, notificationContent, this.loginUserId, null, 0, null, null).subscribe((response) => {
        });
      }
      else {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
      }
    });

    // var files = this.uploadVideoUrlList;
    // uploadResponse.postToUpload.set('blobUrlsJson', JSON.stringify(files));
    //   this._fileStorageService.saveFiles(uploadResponse.postToUpload).subscribe(response => {
    //     debugger
    //     this.uploadVideoUrlList = [];
    //     uploadResponse.postToUpload = new FormData();
    //     fileStorageResponse.next({fileStorageResponse:response});
    //     this.messageService.add({
    //       severity: 'success',
    //       summary: 'Success',
    //       life: 3000,
    //       detail: 'Files added successfully',
    //     });

    //   });





    //   var translatedMessage = this.translateService.instant('FilesUploadedSuccessfully');
    //   var notificationContent = translatedMessage;
    //   this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.FilesUploaded,notificationContent,this.loginUserId,null,0,null,null).subscribe((response) => {
    //   });
  }

  saveFilesInVideoLibrary(uploadResponse: any) {
    debugger
    var filesSizeInGb = this.totalUploadFilesSize / (1024 * 1024 * 1024);
    this._schoolService.isAvailableStorageSpace(this.schoolId, filesSizeInGb).subscribe(response => {
      debugger
      if (response.success) {
        this.getThumbnailUrl(this.uploadVideoUrlList);
        var files = this.uploadVideoUrlList[0];
        uploadResponse.postToUpload.set('blobUrlsJson', JSON.stringify(files));
        for (var pair of uploadResponse.postToUpload.entries()) {
          console.log(pair[0] + ', ' + pair[1]);
        }
        this._videoLibraryService.saveFile(uploadResponse.postToUpload).subscribe(response => {
          debugger
          uploadResponse.postToUpload = new FormData();
          addVideoInLibraryResponse.next({ addVideoInLibraryResponse: response, availableSpace: filesSizeInGb });
          const translatedSummary = this.translateService.instant('Success');
          const translatedMessage = this.translateService.instant('VideoUploadedSuccessfully');
          this.messageService.add({ severity: 'success', summary: translatedSummary, life: 3000, detail: translatedMessage });
        });

        var translatedMessage = this.translateService.instant('VideoUploadedSuccessfully');
        var notificationContent = translatedMessage;
        this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.FilesUploaded, notificationContent, this.loginUserId, null, 0, null, null).subscribe((response) => {
        });
      }
      else {
        const translatedSummary = this.translateService.instant('Success');
        const translatedMessage = this.translateService.instant('SchoolHasNoStorageSpace');
        this.messageService.add({
          severity: 'success',
          summary: translatedSummary,
          life: 3000,
          detail: translatedMessage,
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.postProgressSubscription) {
      this.postProgressSubscription.unsubscribe();
    }
    if (this.postUploadOnBlobSubscription) {
      this.postUploadOnBlobSubscription.unsubscribe();
    }
    if (this.reelUploadOnBlobSubscription) {
      this.reelUploadOnBlobSubscription.unsubscribe();
    }
    if (this.addPostSubscription) {
      this.addPostSubscription.unsubscribe();
    }
    if (this.paymentConfirmSubscription) {
      this.paymentConfirmSubscription.unsubscribe();
    }
    if (this.banUnbanUserSubscription) {
      this.banUnbanUserSubscription.unsubscribe();
    }
    if (this.uploadClassCourseThumbSubscription) {
      this.uploadClassCourseThumbSubscription.unsubscribe();
    }
  }

  loginUserInfo() {
    var validToken = localStorage.getItem("jwt");
    if (validToken != null) {
      let jwtData = validToken.split('.')[1]
      let decodedJwtJsonData = window.atob(jwtData)
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.loginUserId = decodedJwtData.jti;
    }
  }
  connectSignalR(): void {
    let token = localStorage.getItem("jwt");
    if (!token)
      return;
    this.signalRService.initializeConnection(token);
    this.signalRService.startConnection();
    setTimeout(() => {
      this.signalRService.askServerListener();
    }, 500);
  }

  getUserRoles(token: string): any {
    let jwtData = token.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData)
    return decodedJwtData;
  }

  // calculateCombinedProgress(totalWeights:number) {
  //   // Calculate the combined progress based on the weightage of images and videos
  //   const totalImageWeight = this.imageProgress * (/* weightage for images */);
  //   const totalVideoWeight = this.videoProgress * (/* weightage for videos */);
  //   const totalWeight = totalWeights;
  
  //   // Calculate the combined progress percentage
  //   const combinedProgress = (totalImageWeight + totalVideoWeight) / totalWeight;
  
  //   // Update the combined progress variable
  //   this.combinedProgress = combinedProgress;
  // }

  
  imageProgress:number = 0;
  videoProgress:number = 0;
  combinedProgress:number = 0;

fileUploadProgress: { [key: string]: number } = {};
  public async uploadVideosOnBlob(file: File, fileType: number, token: string, totalFileSize:number,isThumbnail?:boolean) {
    debugger

    var sasToken = "?" + token;
    const id = uuidv4();

    if(isThumbnail){
      var blobName = `${id.toString()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    }
    else{
    var prefix = "attachments";
    if (fileType == UploadTypeEnum.Image)
      prefix = "images";
    if (fileType == UploadTypeEnum.Video)
      prefix = "videos";
    else if (fileType == UploadTypeEnum.Thumbnail)
      prefix = "images"
    var blobName = `${prefix}/${id.toString()}${file.name.substring(file.name.lastIndexOf('.'))}`;    
   }

    var containerName = Constant.ContainerName;
    const blobStorageName = Constant.blobStorageName;
    const cdnHostName = Constant.cdnHostName;
    if(isThumbnail)
    {
      var containerClient = new BlobServiceClient(`${cdnHostName}?${sasToken}`)
      .getContainerClient("classthumbnail");
    }
    else{
      var containerClient = new BlobServiceClient(`${cdnHostName}?${sasToken}`)
      .getContainerClient("userposts");
    }

      const response = await this.uploadToBlob(
        file,
        blobName,
        containerClient,
        file.name,
        totalFileSize,
        (percentage, key) => {
          this.fileUploadProgress[key] = percentage;
          const progressValues = Object.values(this.fileUploadProgress);
          const totalProgress = progressValues.reduce((sum, val) => sum + val, 0);
          if(progressValues.length == 1){
            this.overallProgress = Number((totalProgress / progressValues.length).toFixed(2));
          }
          else{
            this.overallProgress = Number(totalProgress.toFixed(2));
          }
          if(this.overallProgress >= 100){
            setTimeout(() => {
              this.overallProgress = 0;
            }, 5000);
          }
          this.cd.detectChanges();
        }
      );
      
      if (response.success) {
        const uploadVideoObject = {
          id: id,
          blobUrl: response.blobUrl,
          blobName: file.name,
          fileType: fileType,
          fileThumbnail: ""
        };
        this.uploadVideoUrlList.push(uploadVideoObject);
      
        if (this.schoolId != undefined && this.schoolId != "" && fileType != UploadTypeEnum.Thumbnail) {
          this.totalUploadFilesSize += file.size;
        }
      
        console.log('File uploaded successfully.');
      } else {
        console.error(response.message);
      }
  }

  loadedBytes:number = 0;
  percentForLoading:number=0;

  private async uploadToBlob(content: Blob, name: string, client: ContainerClient,fileName: string,
    totalFileSize: number,
    progressCallback: (percentage: number, fileName: string) => void
  ): Promise<{ success: boolean, message: string, blobUrl?: string }> {
    try {
      let blockBlobClient = client.getBlockBlobClient(name);
      const encodedFileName = encodeURIComponent(fileName);
      const blobHTTPHeaders = {
      blobContentType: content.type,
      blobContentDisposition: `attachment; filename="${encodedFileName}"`
      };

      const uploadOptions = {
        blobHTTPHeaders,
        onProgress: (event: any) => {
          // Calculate the percentage progress
          const percentage = (event.loadedBytes / totalFileSize) * 100;
          
          // Call the progressCallback with the percentage and fileKey
          progressCallback(percentage, fileName);
        }
      };

      // const uploadOptions = {
      //   blobHTTPHeaders,
      //   onProgress: (event:any) => {
      //     debugger
      //     // var loadBytes = this.loadBytes;
      //     // this.loadBytes = event.loadedBytes; 
      //     // let newLoadedBytes = event.loadedBytes - this.loadBytes;
      //     // this.loadBytes += newLoadedBytes;
      //     this.loadedBytes += event.loadedBytes - this.loadBytes;
      //     // let x = this.loadBytes
      //     // console.log(x);
      //     this.loadBytes = event.loadedBytes;
         
      //     const percentage = (this.loadedBytes / this.totalFileSize) * 100;
      //     let initialPercentage = percentage;
      //     if(this.percentForLoading != 0){
      //       if(this.percentForLoading > initialPercentage){
      //         debugger;
      //         // const percentage = (this.loadedBytes / this.totalFileSize) * 100;
      //         this.percentForLoading += percentage;
      //       } else{
      //         this.percentForLoading = initialPercentage
      //       }
      //     } else{
      //       this.percentForLoading = initialPercentage
      //     }
          
      //     // this.percentForLoading = initialPercentage
      //     // this.loadBytes = x;
          
      //     // if(percentage < 100){
      //     //   this.overallProgress += percentage;
      //     //   progressCallback(this.overallProgress);
      //     // }
      //     // else{
      //       // progressCallback(this.percentForLoading);
      //     // }
      //   }
      // //   onProgress: (event:any) => {
      // //     // Increment the cumulative bytes loaded with the newly loaded bytes from the current event.
      // //     this.loadedBytes += event.loadedBytes - this.loadBytes;
      
      // //     // Update the loadBytes for the next onProgress call.
      // //     this.loadBytes = event.loadedBytes;
      
      // //     // Calculate the overall percentage.
      // //     const percentage = (this.loadedBytes / this.totalFileSize) * 100;
      
      // //     // Call progressCallback with the overall percentage.
      // //     progressCallback(percentage);
      // // }
      
      // };

      await blockBlobClient.uploadData(content, uploadOptions);
      let parts = blockBlobClient.url.split("?");
      let blobUrl = parts[0];
      console.log('File uploaded successfully.');

      return { success: true, message: 'File uploaded successfully', blobUrl: blobUrl };
    } catch (error) {
      console.error('Error uploading file:', error);

      return { success: false, message: 'Error uploading file: ' + error };
    }
  }

  getThumbnailUrl(uploadUrls: any) {
    var totalThumbnails = uploadUrls.filter((x: { fileType: UploadTypeEnum; }) => x.fileType == UploadTypeEnum.Thumbnail);

    totalThumbnails.forEach((item: any) => {
      debugger
      const lastDotIndex = item.blobName.lastIndexOf('.');
      const thumbnailName = item.blobName.substring(0, lastDotIndex);
      var video = uploadUrls.find((x: { blobName: string; fileType: number; }) => x.blobName.substring(0, lastDotIndex) == thumbnailName && x.fileType == 2);
      if (video != null) {
        video.fileThumbnail = item.blobUrl;
        var thumbnailIndex = uploadUrls.findIndex((x: { id: any; }) => x.id == item.id);
        if (thumbnailIndex !== -1) {
          uploadUrls.splice(thumbnailIndex, 1);
        }
      }
    });
  }

}
