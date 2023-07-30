import { Component, ContentChild, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { SignalrService } from '../service/signalr.service';
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


export const postProgressNotification = new Subject();  
export const postUploadOnBlob = new Subject<{
  postToUpload:any,
  combineFiles:any,
  videos:any,
  images:any,
  attachment:any,
  type:any,
  reel:any
}>();

export const reelUploadOnBlob = new Subject<{
  postToUpload:any,
  reel:any
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
  postProgressSubscription!:Subscription;
  postUploadOnBlobSubscription!:Subscription;
  reelUploadOnBlobSubscription!:Subscription;
  addPostSubscription!: Subscription;

  private _postService;

  constructor(injector: Injector, private signalRService: SignalrService,public messageService:MessageService,private translateService: TranslateService, private meta: Meta,authService: AuthService,private router: Router,private route: ActivatedRoute,postService:PostService) { 
    super(injector);
    this._postService = postService;
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        event.urlAfterRedirects = event.urlAfterRedirects.split('/').slice(0, 3).join('/');
        if(event.urlAfterRedirects.includes("/user/userProfile")){
          const existingTag = this.meta.getTag('content="noindex,nofollow"');
          if (!existingTag) {
            this.meta.addTag({ name: 'robots', content: 'noindex,nofollow' });
          }
        }

        if(event.urlAfterRedirects.includes("/profile/school") || event.urlAfterRedirects.includes("/profile/school") || event.urlAfterRedirects.includes("/profile/class") || event.urlAfterRedirects.includes("/profile/course")){
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

   authService.loginState$.asObservable().subscribe(x => { this.displaySideBar = x;});
   authService.loginAdminState$.asObservable().subscribe(x => { this.displayAdminSideBar = x;});
  }

  ngOnInit(): void {
    this.connectSignalR();
    this.meta.updateTag({ property: 'og:title', content: "test" });
    this.meta.updateTag({ property: 'og:type', content: "profile" });
    this.meta.updateTag({ property: 'og:description', content: "description" });
    // this.meta.addTag({ property: 'og:image', content: "../../assets/images/logo.svg" });
    this.meta.updateTag({ property: 'og:url', content: "byokul.com" });

    if(!this.postProgressSubscription){
      this.postProgressSubscription = postProgressNotification.subscribe(response => {
        const translatedMessage = this.translateService.instant('PostProgressMessage');
        const translatedSummary = this.translateService.instant('Info');
        this.messageService.add({severity:'info', summary:translatedSummary,life: 3000, detail:translatedMessage});
      })
    }

    if(!this.postUploadOnBlobSubscription){
      this.postUploadOnBlobSubscription = postUploadOnBlob.subscribe(async (response) => {
        debugger
        this.uploadVideoUrlList = [];
        if(response.type == 1){
        const uploadPromises = response.combineFiles.map((file:any) => {
          if (response.videos.includes(file)) {
            return this.uploadVideosOnBlob(file, UploadTypeEnum.Video);
          } 
          if(response.images.includes(file)){
            return this.uploadVideosOnBlob(file, UploadTypeEnum.Image);
          }
          if(response.attachment.includes(file)) {
            return this.uploadVideosOnBlob(file, UploadTypeEnum.Attachment);
          }
          return "";
          
        });
        
        await Promise.all(uploadPromises);
        // this.createPostRef.createPostResponse({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList,type:1});
        createPost.next({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList,type:1});
        response.postToUpload.append('blobUrlsJson', JSON.stringify(this.uploadVideoUrlList));
        this._postService.createPost(response.postToUpload).subscribe((response:any) => {
          debugger
          // this.close();
          // this.onClose.emit(response);
          // this.isSubmitted=false;
          // this.loadingIcon = false;
          addPostResponse.next({response});
          // this.postToUpload = new FormData();
          // if(this.videos.length != 0 || this.attachment.length != 0){
          //   var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
          //   var notificationContent = translatedMessage;
          //   this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,null).subscribe((response) => {
          //   });
          // }
            });
  
        
        
      }
      if(response.type == 2){
        await this.uploadVideosOnBlob(response.reel,UploadTypeEnum.Video);
        createReel.next({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList});
      }

      if(response.type == 3){
        const uploadPromises = response.combineFiles.map((file:any) => {
          if (response.videos.includes(file)) {
            return this.uploadVideosOnBlob(file, UploadTypeEnum.Video);
          } 
          if (response.images.includes(file)){
            return this.uploadVideosOnBlob(file, UploadTypeEnum.Image);
          }
          return "";
        });
        
        await Promise.all(uploadPromises);
        createLive.next({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList});
      }
      })
    }

    if(!this.addPostSubscription){
      this.addPostSubscription = addPostResponse.subscribe((postResponse:any) => {
        debugger
         // this.loadingIcon = true;
         if(postResponse.response.postType == 1){
           var translatedMessage = this.translateService.instant('PostCreatedSuccessfully');
         }
         else if(postResponse.response.postType == 3){
           var translatedMessage = this.translateService.instant('ReelCreatedSuccessfully');
         }
         else{
           var translatedMessage = this.translateService.instant('PostUpdatedSuccessfully');
         }
       const translatedSummary = this.translateService.instant('Success');
       this.messageService.add({severity: 'success',summary: translatedSummary,life: 3000,detail: translatedMessage,}); 
        })
      }

    // if(!this.reelUploadOnBlobSubscription){
    //   this.reelUploadOnBlobSubscription = reelUploadOnBlob.subscribe(async (response) => {
    //     debugger
    //     await this.uploadVideosOnBlob(response.reel,UploadTypeEnum.Video);
    //     createPost.next({postToUpload:response.postToUpload,uploadVideoUrlList:this.uploadVideoUrlList,type:2});
    //   })
    // }

    // here if language not selected in local storage we add english by default in local storage
    var selectedLang = localStorage.getItem('selectedLanguage');
    if(selectedLang == null || selectedLang == ""){
      this.translate.use("en");
    }
  }

  ngOnDestroy(): void {
    if(this.postProgressSubscription){
      this.postProgressSubscription.unsubscribe();
    }
    if(this.postUploadOnBlobSubscription){
      this.postUploadOnBlobSubscription.unsubscribe();
    }
    if(this.reelUploadOnBlobSubscription){
      this.reelUploadOnBlobSubscription.unsubscribe();
    }
    if(this.addPostSubscription){
      this.addPostSubscription.unsubscribe();
    }
  }
  connectSignalR() : void {
    let token = localStorage.getItem("jwt"); 
    if(!token)
      return;
    this.signalRService.initializeConnection(token);
    this.signalRService.startConnection();
     setTimeout(() => {
             this.signalRService.askServerListener();
           }, 500);
  }

  getUserRoles(token:string): any{
    let jwtData = token.split('.')[1]
    let decodedJwtJsonData = window.atob(jwtData)
    let decodedJwtData = JSON.parse(decodedJwtJsonData)
    return decodedJwtData;
  }

  public async uploadVideosOnBlob(file: File, fileType:number) {
    debugger
    
    // Replace with your SAS token or connection string
    const sasToken = Constant.SASToken;
    var prefix = "attachments";
    if(fileType == UploadTypeEnum.Image)
    prefix = "images";
    else if(fileType == UploadTypeEnum.Video)
    prefix = "videos";
    const id = uuidv4();
    const blobName = `${prefix}/${id.toString()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    var containerName = Constant.ContainerName;
    const blobStorageName =  Constant.blobStorageName;
    var containerClient =  new BlobServiceClient(`https://${blobStorageName}.blob.core.windows.net?${sasToken}`)
    .getContainerClient("userposts");
  
    await this.uploadBlobTest(file, blobName, containerClient)
    .then((response) => {
      debugger
      var uploadVideoObject = 
      {
        id: id,
        blobUrl:response.blobUrl,
        blobName:blobName,
        fileType:fileType
      }
      this.uploadVideoUrlList.push(uploadVideoObject);
    })
    .catch((error) => {
      console.error(error);
    });
  
  }

  private async uploadBlobTest(content: Blob, name: string, client: ContainerClient) {
    debugger
    try {
    let blockBlobClient = client.getBlockBlobClient(name);
    // blockBlobClient.uploadData(content, { blobHTTPHeaders: { blobContentType: content.type } })
  
    await blockBlobClient.uploadData(content, { blobHTTPHeaders: { blobContentType: content.type } });
    let parts = blockBlobClient.url.split("?");
    let blobUrl = parts[0];
      console.log('File uploaded successfully.');
  
      return { success: true, message: 'File uploaded successfully',blobUrl: blobUrl };
    } catch (error) {
      console.error('Error uploading file:', error);
  
      return { success: false, message: 'Error uploading file: ' + error };
    }
  }
}
