import { Component, ElementRef, Input, OnInit, ViewChild, inject, Inject, TemplateRef, EventEmitter, AfterViewInit, ChangeDetectorRef, QueryList, OnDestroy, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import { MenuItem } from 'primeng/api';
import { EditClassModel } from 'src/root/interfaces/class/editClassModel';
import { ClassService } from 'src/root/service/class.service';
import { PostService } from 'src/root/service/post.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UploadImage } from 'src/root/interfaces/post/uploadImage';
import { UploadVideo } from 'src/root/interfaces/post/uploadVideo';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { PostTypeEnum } from 'src/root/Enums/postTypeEnum';
import { BsModalRef, BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/api';

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription } from 'rxjs';

import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { progressResponse } from 'src/root/service/signalr.service';
import { stringify } from 'querystring';
import { FileStorageService } from 'src/root/service/fileStorage';
import { AutoComplete } from 'primeng/autocomplete';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { postProgressNotification, postUploadOnBlob, reelUploadOnBlob } from '../root.component';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from 'src/root/service/notification.service';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { AzureBlobStorageService } from 'src/root/service/blobStorage.service';
export const addPostResponse = new Subject<{}>();
import { v4 as uuidv4 } from 'uuid';
import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { Constant } from 'src/root/interfaces/constant';
import { UploadTypeEnum } from 'src/root/Enums/uploadTypeEnum';

export const createPost = new Subject<{
  postToUpload: any;
  uploadVideoUrlList: any;
  type: any
}>();


export const createReel = new Subject<{
  postToUpload: any;
  uploadVideoUrlList: any;
}>();

export const createLive = new Subject<{
  postToUpload: any;
  uploadVideoUrlList: any;
}>();

@Component({
  selector: 'create-post',
  templateUrl: 'createPost.component.html',
  styleUrls: ['createPost.component.css'],
  providers: [MessageService]
})

export class CreatePostComponent implements OnInit, OnDestroy {

  @Input() isOpenModal!: boolean;
  @Input() classId!: any;
  @Input() courseId!: string;
  @Input() userId!: any;
  @ViewChild('openModal') openModal!: ElementRef;
  @ViewChild('openFirst') openFirst!: ElementRef;
  @ViewChild('addAttachmentModal') addAttachmentModal!: ElementRef;
  @ViewChild('closeMainModal') closeMainModal!: ElementRef;
  @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;
  @ViewChild('closePostM') closePostM!: ElementRef;
  @ViewChild('openAttachmentModal') openAttachmentModals!: ElementRef;
  @ViewChild('autoComplete', { static: false }) autoComplete!: AutoComplete;
  @ViewChild('templatefirst') templatefirst!: TemplateRef<any>;
  @ViewChild('videoPlayer') videoPlayers!: QueryList<ElementRef>;

  private _postService;
  private _fileStorageService;
  private _notificationService;
  // private _blobStorageService;
  isSubmitted: boolean = false;
  isTagsValid: boolean = true;
  isAttachmentsValid: boolean = true;

  tags!: string;
  tagLists!: string[];
  initialTagList!: string[];

  parentDetails: any;
  disabled: boolean = true;

  createPostForm!: FormGroup;
  createLiveForm!: FormGroup;
  createReelForm!: FormGroup;
  postToUpload = new FormData();

  imageToUpload = new FormData();
  images: string[] = [];
  uploadImage: any[] = [];
  imageObject!: UploadImage;

  videoToUpload = new FormData();
  videos: any[] = [];
  uploadVideo: any[] = [];
  uploadReels: any[] = [];
  videoObject!: UploadVideo;

  attachmentToUpload = new FormData();
  attachment: any[] = [];
  initialAttachment: any[] = [];
  reel: any;
  uploadReel!: any;
  isDataLoaded: boolean = false;
  scheduleTime!: Date;
  currentDate!: string;
  loadingIcon: boolean = false;

  initialState: any;
  schoolId: any;
  videoThumbnails: any[] = [];

  listOfObject: any[] = [];

  public event: EventEmitter<any> = new EventEmitter();
  attachmentModalRef!: BsModalRef;
  tagModalRef!: BsModalRef;
  private progressSubscription!: Subscription;
  progressBarValue: number = 0;
  fileCount: number = 1;
  progressFileName!: string;
  filesLength!: number;
  totalFilesLength!: number;
  isOpenReelsTab: boolean = false;
  tagCountExceeded: boolean = false;
  reelsTagLists!: string[];
  fileStorageAttachments: any;
  fileAttachmentsForm!: FormGroup;
  filteredFileAttachments!: any[];
  uploadFromFileStorage!: any[];
  isShowingProgressBar!: boolean;
  minDate: any;
  isMicroPhoneOpen: boolean = true;
  scheduleVideoRequired: boolean = false;
  thumbnailRequired: boolean = false;
  isThumbnailUpload: boolean = false;
  isVideoUpload: boolean = false;
  from!: any;
  isLiveTabopen: boolean = false;
  isVideoDurationExceed: boolean = false;
  editPostId!: string;
  editPostDetails: any;
  loginUserId!: string;
  isEditPost: boolean = false;

  uploadImageUrls: any[] = [];
  uploadVideoUrls: any[] = [];
  attachmentUrls: any[] = [];
  createPostSubscription!: Subscription;
  createReelSubscription!: Subscription;
  createLiveSubscription!: Subscription;
  selectedVideoFromLibrary:any;
  type:string = "";
  isCreatePost:boolean = true;
  isCreateReel:boolean = false;


  

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();


  constructor(public postService: PostService, private bsModalRef: BsModalRef, private notificationService: NotificationService, private translateService: TranslateService, private datePipe: DatePipe, private router: Router, private domSanitizer: DomSanitizer, fileStorageService: FileStorageService, public messageService: MessageService, private bsModalService: BsModalService, public options: ModalOptions, private fb: FormBuilder, private http: HttpClient, private cd: ChangeDetectorRef) {
    this._postService = postService;
    this._fileStorageService = fileStorageService;
    this._notificationService = notificationService;
    // this._blobStorageService = blobStorageService;
  }

  profileShare:any=false;
  forReel:boolean=false;
  forPost:boolean=false
  ngOnInit(): void {
    debugger
    this.isOwnerOrNot();
    var initialValue = this.options.initialState;
    this.selectedVideoFromLibrary  = initialValue?.selectedVideoFromLibrary;

    if (this.editPostId != undefined) {
      this._postService.getPostById(this.editPostId).subscribe((response) => {
        debugger
        this.editPostDetails = response;
        this.isEditPost = true;
        // if(this.editPostDetails?.postType == 1){
        //   this.isCreatePost = false;
        // }
        // if(this.editPostDetails?.postType == 3){
        //   this.isCreateReel = false;
        // }
        if(initialValue?.type=="reel"){
          this.forReel = true;
          this.forPost = false;
          this.initializeEditReelForm(this.editPostDetails.postAttachments[0].fileThumbnail);
          this.isOpenReelsTab = true;
        } else{
          this.forPost = true;
          this.forReel = false;
          this.initializeEditPostForm();
        }
      });
    }
    // else{
    //   this.isCreatePost = true;
    //   this.isCreateReel = true;
    // }
    this.from = initialValue?.from;
    this.profileShare = initialValue?.isShareProfile;
    var isLiveTabopen = initialValue?.isLiveTabOpen;
    if (isLiveTabopen == true) {
      this.isLiveTabopen = true;
    }

    if (initialValue?.from == "school") {
      this.schoolId = initialValue.schoolId;
      this._postService.getSchool(this.schoolId).subscribe((response) => {
        this.parentDetails = response;
        this.isDataLoaded = true;
        if (initialValue?.isShareProfile) {
          let shareProfileData = {
            title: response.schoolName,
            bodyTest: "Here!",
          }
          this.profileShared(shareProfileData, response.avatar)
        }

        if(this.selectedVideoFromLibrary != undefined){
          debugger
          this.isVideoUpload = true;
          this.videoObject.videoUrl = this.selectedVideoFromLibrary.fileThumbnail;
          this.videoObject.name = this.selectedVideoFromLibrary.fileName;
          this.uploadVideo.push(this.videoObject);
        }
      });
    }


    if (initialValue?.from == "class") {
      this.classId = initialValue.classId;
      this._postService.getClass(this.classId).subscribe((response) => {
        this.parentDetails = response;
        if (initialValue?.isShareProfile) {
          let shareProfileData = {
            title: response.className,
            bodyTest: "Here!"
          }
          this.profileShared(shareProfileData, response.avatar)
        }
        if(this.selectedVideoFromLibrary != undefined){
          debugger
          this.isVideoUpload = true;
          this.videoObject.videoUrl = this.selectedVideoFromLibrary.fileThumbnail;
          this.videoObject.name = this.selectedVideoFromLibrary.fileName;
          this.uploadVideo.push(this.videoObject);
        }
      });

    }

    if (initialValue?.from == "user") {
      this.userId = initialValue.userId;
      this._postService.getUser(this.userId).subscribe((response) => {
        debugger
        this.parentDetails = response;

      });

    }

    if (initialValue?.from == "course") {
      this._postService.getCourse(this.courseId).subscribe((response) => {
        this.parentDetails = response;
        if (initialValue?.isShareProfile) {
          let shareProfileData = {
            title: response.courseName,
            bodyTest: "Here!"
          }
          this.profileShared(shareProfileData, response.avatar)
        }
      });

    }

    this.createPostForm = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      bodyText: this.fb.control('', [Validators.required]),
      scheduleTime: this.fb.control('')
    });

    this.createLiveForm = this.fb.group({
      title: this.fb.control('', [Validators.required]),
      bodyText: this.fb.control('', [Validators.required]),
      // coverLetter: this.fb.control('',[Validators.required]),
      commentPerMinute: this.fb.control('0'),
      scheduleTime: this.fb.control('')
      // discuss which more fields we need to add there

    })

    this.createReelForm = this.fb.group({
      scheduleTime: this.fb.control(''),
      reelsVideo: this.fb.control([], [Validators.required]),
      title: this.fb.control('', [Validators.required]),
    })

    this.fileAttachmentsForm = this.fb.group({
      fileAttachments: this.fb.control([])
    });

    this._fileStorageService.getFileStorageAttachments().subscribe((response) => {
      this.fileStorageAttachments = response;
    });

    this.tagLists = [];
    this.reelsTagLists = [];
    this.initialTagList = [];
    this.uploadFromFileStorage = [];
    this.uploadVideoUrlList = [];

    this.initializeImageObject();
    this.initializeVideoObject();
    this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

    this.progressSubscription = progressResponse.subscribe(response => {
      this.progressBarValue = response.progressCount;
      this.filesLength = this.images.length + this.videos.length + this.attachment.length;
      if (this.progressBarValue == 100 && this.filesLength != this.fileCount) {
        this.fileCount += 1;
      }
      this.progressFileName = response.fileName;
      this.cd.detectChanges();
    });

    createReel.subscribe(postResponse => {
      debugger
      this.postToUpload.append('blobUrlsJson', JSON.stringify(postResponse.uploadVideoUrlList));
      this._postService.createPost(this.postToUpload).subscribe((response: any) => {
        debugger
        this.isSubmitted = false;
        this.loadingIcon = false;
        this.messageService.add({ severity: 'success', summary: 'Success', life: 3000, detail: 'Reel created successfully' });
        addPostResponse.next({ response });
        this.postToUpload = new FormData();
        var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
        var notificationContent = translatedMessage;
        this.uploadVideoUrlList = [];
        this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, response, response.reelId).subscribe((response) => {
        });
        this.close();
        this.ngOnInit();
      });
    });

    createLive.subscribe(postResponse => {
      debugger
      this.postToUpload.append('blobUrlsJson', JSON.stringify(postResponse.uploadVideoUrlList));
      this._postService.createPost(this.postToUpload).subscribe((response: any) => {
        debugger
        this.isSubmitted = false;
        this.loadingIcon = false;
        //addPostResponse.next({response});
        this.postToUpload = new FormData();
        this.close();
        this.uploadVideoUrlList = [];
        if (this.videos.length != 0) {
          var translatedMessage = this.translateService.instant('VideoReadyToStream');
          var notificationContent = translatedMessage;
          var chatType = this.from == "user" ? 1 : this.from == "school" ? 3 : this.from == "class" ? 4 : undefined;
          this._notificationService.initializeNotificationViewModel(this.loginUserId, NotificationType.PostUploaded, notificationContent, this.loginUserId, response.id, response.postType, response, null, chatType).subscribe((response) => {
          });
        }
        else {
          if (!response.isPostSchedule) {
            this.router.navigate(
              [`liveStream`, response.id, this.from]
            );
          }
        }
      });
    });


    createPost.subscribe(postResponse => {
      debugger
      this.close();
      this.isSubmitted = false;
      this.loadingIcon = false;
      // this.postToUpload.append('blobUrlsJson', JSON.stringify(postResponse.uploadVideoUrlList));
      // if(postResponse.type == 1 ){
      // this._postService.createPost(this.postToUpload).subscribe((response:any) => {
      //   debugger
      //   this.close();
      //   this.onClose.emit(response);
      //   this.isSubmitted=false;
      //   this.loadingIcon = false;
      //   addPostResponse.next({response});
      //   this.postToUpload = new FormData();
      //   if(this.videos.length != 0 || this.attachment.length != 0){
      //     var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
      //     var notificationContent = translatedMessage;
      //     this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,null).subscribe((response) => {
      //     });
      //   }
      //     });

      //}
    });


    // this.createReelSubscription = createReels.subscribe(postResponse => {
    //   debugger
    //   // this.postToUpload.append('blobUrlsJson', JSON.stringify(postResponse.uploadVideoUrlList));
    //   // this._postService.createPost(this.postToUpload).subscribe((response:any) => {
    //   //   debugger
    //   //   this.isSubmitted=false;
    //   //   this.loadingIcon = false;
    //   //   this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel created successfully'});
    //   //   addPostResponse.next({response});
    //   //   this.postToUpload = new FormData();
    //   //   var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
    //   //   var notificationContent = translatedMessage;
    //   //   this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,response.reelId).subscribe((response) => {
    //   //   });
    //   //   this.close();
    //   //   this.ngOnInit();
    //   // });
    // });

    this.cd.detectChanges();
    var modal = document.getElementById('create-post');
    window.onclick = (event) => {
      if (event.target == modal) {
        if (modal != null) {
          this.bsModalService.hide();
        }
      }
    }



    //  onModalClick(event: MouseEvent) {
    //   var a = document.querySelector('.modal-backdrop');
    //   if(a != null){

    //    a.addEventListener('click', () => {
    //     this.bsModalService.hide();
    //   });
    // }

    // // Check if the click event target is the modal element or one of its child elements
    // if (!(event.target instanceof Element) || !event.target.closest('.modal-content')) {
    //   // Close the modal using the hide method provided by BsModalRef
    //   this.bsModalRef.hide();
    // }
  }

  currectTagLists:any;
  initializeEditPostForm() {
    this.createPostForm = this.fb.group({
      title: this.fb.control(this.editPostDetails.title, [Validators.required]),
      bodyText: this.fb.control(this.editPostDetails.description, [Validators.required]),
      scheduleTime: this.fb.control(this.editPostDetails.dateTime)
    });
    this.createPostForm.updateValueAndValidity();

    //this.tagLists = this.editPostDetails.postTags;

    this.tagLists = this.editPostDetails.postTags.map((tagObj: { postTagValue: any; }) => tagObj.postTagValue);

    // if(this.tagLists[0] != '[]'){
      this.currectTagLists = [...this.tagLists]
      try {
        this.currectTagLists = this.parseTheTags(this.currectTagLists)
        this.tagLists = this.currectTagLists
      } catch { }
    // }

    // this.editPostDetails.postAttachments
    // .filter((attachment: { fileType: number; }) => attachment.fileType === 3)
    // .forEach((attachment: { fileUrl: any; fileName: any; }) => {
    //   let attachmentForEdit = attachment

    //   this.attachment.push(attachmentForEdit);
    // })
    

    this.editPostDetails.postAttachments
      .filter((attachment: { fileType: number; }) => attachment.fileType === 1)
      .forEach((attachment: { fileUrl: any; fileName: any; }) => {
        debugger
        const imageObject = {
          imageUrl: attachment.fileUrl,
          name: attachment.fileName
        };
        var imageBlobobject = {
          id: uuidv4(),
          blobUrl: attachment.fileUrl,
          fileType: UploadTypeEnum.Image,
          blobName: attachment.fileName
        }
        this.uploadVideoUrlList.push(imageBlobobject);
        this.uploadImageUrls.push(imageObject);
        this.cd.detectChanges();
        // this.uploadImage.push(imageObject);
      });

    this.editPostDetails.postAttachments
      .filter((attachment: { fileType: number; }) => attachment.fileType === 2)
      .forEach((attachment: { fileThumbnail: any; fileName: any; fileUrl: any }) => {
        debugger
        const imageObject = {
          videoUrl: attachment.fileThumbnail,
          name: attachment.fileName
        };
        var videoBlobobject = {
          id: uuidv4(),
          blobUrl: attachment.fileUrl,
          fileType: UploadTypeEnum.Video,
          blobName: attachment.fileName
        }
        this.uploadVideoUrlList.push(videoBlobobject);

        this.uploadVideoUrls.push(imageObject);
        // this.uploadVideo.push(imageObject);
      });

    this.editPostDetails.postAttachments
      .filter((attachment: { fileType: number; }) => attachment.fileType === 3)
      .forEach((attachment: { fileUrl: any; fileName: any; }) => {
        debugger
        const imageObject = {
          name: attachment.fileName
        };
        var attachmentBlobobject = {
          id: uuidv4(),
          blobUrl: attachment.fileUrl,
          fileType: UploadTypeEnum.Attachment,
          blobName: attachment.fileName
        }
        this.uploadVideoUrlList.push(attachmentBlobobject);
        this.attachmentUrls.push(imageObject);
        // this.attachment.push(imageObject);
      });

      this.uploadImage = this.editPostDetails.postAttachments
    .filter((attachment: { fileType: number; }) => attachment.fileType === 1)
    .map((attachment: { fileUrl: any; }) => attachment.fileUrl);




  }

  ngOnDestroy() {
    debugger;
    if (this.createPostSubscription) {
      this.createPostSubscription.unsubscribe();
    }
    if (this.createReelSubscription) {
      this.createReelSubscription.unsubscribe();
    }
    if (this.createLiveSubscription) {
      this.createLiveSubscription.unsubscribe();
    }
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  initializeImageObject() {
    this.imageObject = {
      imageUrl: '',
      name: ''
    };

  }

  initializeVideoObject() {
    this.videoObject = {
      videoUrl: '',
      name: '',
      type: ''
    };

  }

  handleImageInput(event: any) {
    debugger
    var selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      this.images.push(selectedFiles[i]);
      const reader = new FileReader();
      reader.onload = ((fileIndex) => {
        return () => {
          debugger
          const imageUrl = reader.result?.toString();
          const imageName = selectedFiles[fileIndex].name;
          const imageObject = { imageUrl, name: imageName };
          this.uploadImage.push(imageObject);
        };
      })(i);
      reader.readAsDataURL(selectedFiles[i]);
    }
    this.thumbnailRequired = false;
    this.isThumbnailUpload = true;
  }

  handleImageInput2(file: any) {
    debugger
    this.images.push(file);
    const reader = new FileReader();

    reader.onload = () => {
      const imageUrl = reader.result as string;
      const imageName = file.name;
      const imageObject = { imageUrl, name: imageName };
      this.uploadImage.push(imageObject);

      this.thumbnailRequired = false;
      this.isThumbnailUpload = true;
    };

    reader.readAsDataURL(file);
  }

  handleVideoInput2(file: any) {
    debugger
    this.videos.push(file);
    const videoUrl = URL.createObjectURL(file);
    this.getVideoThumbnail(videoUrl, file.name, (thumbnailUrl) => {
      debugger
      this.videoObject.videoUrl = thumbnailUrl;
      this.videoObject.name = file.name;
      this.videoObject.type = file.type;
      this.uploadVideo.push(this.videoObject);
      this.initializeVideoObject();
    });
    this.scheduleVideoRequired = false;
    this.isVideoUpload = true;
  }


  removeUploadImage(image: any) {
    debugger
    const blobUrlIndex = this.uploadVideoUrlList.findIndex((item: any) => item.blobName === image.name);
    if (blobUrlIndex > -1) {
      this.uploadVideoUrlList.splice(blobUrlIndex, 1);
    }

    const index = this.images.findIndex((item: any) => item.name === image.name);
    if (index > -1) {
      this.images.splice(index, 1);
    }

    const imageIndex = this.uploadImage.findIndex((item: any) => item.name === image.name);
    if (imageIndex > -1) {
      this.uploadImage.splice(imageIndex, 1);
    }

    const imageUrlIndex = this.uploadImageUrls.findIndex((item: any) => item.name === image.name);
    if (imageUrlIndex > -1) {
      this.uploadImageUrls.splice(imageUrlIndex, 1);
    }

    this.isThumbnailUpload = false;
  }

  handleVideoInput(event: any) {
    var selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      this.videos.push(selectedFiles[i]);
      const file = selectedFiles[i];
      const videoUrl = URL.createObjectURL(file);
      this.getVideoThumbnail(videoUrl, file.name, (thumbnailUrl) => {
        debugger
        this.videoObject.videoUrl = thumbnailUrl;
        this.videoObject.name = file.name;
        this.videoObject.type = file.type;
        this.uploadVideo.push(this.videoObject);
        this.initializeVideoObject();
      });
    }
    this.scheduleVideoRequired = false;
    this.isVideoUpload = true;
  }

  getVideoThumbnail(videoUrl: string, fileName: string, callback: (thumbnailUrl: string) => void) {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;
    video.addEventListener('loadedmetadata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      video.addEventListener('seeked', () => {
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL();

        this.saveCanvasToFile(canvas, fileName);
        callback(thumbnailUrl);
      });
      video.currentTime = 0;
    });
  }

  async saveCanvasToFile(canvas: HTMLCanvasElement, fileName: string) {
    const blob = await this.canvasToBlob(canvas);

    let lastSlashIndex = blob.type.lastIndexOf("/");
    if (lastSlashIndex !== -1) {
      var thumbnailType = blob.type.substring(lastSlashIndex + 1);
    }


    let lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex !== -1) {
      fileName = fileName.substring(0, lastDotIndex + 1);
    }

    fileName = fileName + thumbnailType;

    const file = new File([blob], fileName, { type: blob.type });
    this.videoThumbnails.push(file);
  }

  canvasToBlob(canvas: HTMLCanvasElement): Promise<any> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      });
    });
  }

  removeUploadVideo(video: any) {
    const blobUrlIndex = this.uploadVideoUrlList.findIndex((item: any) => item.blobName === video.name);
    if (blobUrlIndex > -1) {
      this.uploadVideoUrlList.splice(blobUrlIndex, 1);
    }

    const index = this.videos.findIndex((item: any) => item.name === video.name);
    if (index > -1) {
      this.videos.splice(index, 1);
    }

    const imageIndex = this.uploadVideo.findIndex((item: any) => item.name === video.name);
    if (imageIndex > -1) {
      this.uploadVideo.splice(imageIndex, 1);
    }

    const videoUrlIndex = this.uploadVideoUrls.findIndex((item: any) => item.name === video.name);
    if (videoUrlIndex > -1) {
      this.uploadVideoUrls.splice(videoUrlIndex, 1);
    }
    this.isVideoUpload = false;
  }

  handleAttachmentInput(event: any) {
    var selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      this.initialAttachment.push(selectedFiles[i]);
    }
  }

  handleAttachmentInput2(file: any) {
    debugger
    this.attachment.push(file);
  }

  removeAttachment(attachment: any) {
    const blobUrlIndex = this.uploadVideoUrlList.findIndex((item: any) => item.blobName === attachment.name);
    if (blobUrlIndex > -1) {
      this.uploadVideoUrlList.splice(blobUrlIndex, 1);
    }

    const attachmentIndex = this.attachment.findIndex((item) => item.name === attachment.name);
    if (attachmentIndex > -1) {
      this.attachment.splice(attachmentIndex, 1);
    }

    const initialAttachmentIndex = this.initialAttachment.findIndex((item) => item.fileName === attachment.fileName);
    if (initialAttachmentIndex > -1) {
      this.initialAttachment.splice(initialAttachmentIndex, 1);
    }

    const fileAttachmentIndex = this.uploadFromFileStorage.findIndex((item) => item.fileName === attachment.fileName);
    if (fileAttachmentIndex > -1) {
      this.uploadFromFileStorage.splice(fileAttachmentIndex, 1);
    }

    const fileAttachmentUrlIndex = this.attachmentUrls.findIndex((item) => item.fileName === attachment.fileName);
    if (fileAttachmentUrlIndex > -1) {
      this.attachmentUrls.splice(fileAttachmentUrlIndex, 1);
    }
    this.cd.detectChanges();

      //const input = this.autocomplete.nativeElement;

      //const input = this.autoComplete.inputEL.nativeElement;

      // this.autocomplete.inputEL.nativeElement.blur();


    // const unselectedFile = event.value;
    // const selectedFiles = this.formGroup.get('fileAttachments').value.filter((file: any) => file !== unselectedFile);
    // this.formGroup.get('fileAttachments').setValue(selectedFiles);


  }

  deselectAutocomplete() {
    this.cd.detectChanges();
    const input = this.autoComplete.inputEL.nativeElement;
    input.blur();
    this.autoComplete.onModelChange([]);
    this.autoComplete.hide();
  }

  handleReels(event: any) {
    debugger
    // this.postToUpload.append('uploadVideos', event.target.files[0]);
    this.reel = event.target.files[0];
    const videoUrl = URL.createObjectURL(this.reel);
    this.getVideoThumbnail(videoUrl, this.reel.name, (thumbnailUrl) => {
      this.videoObject.videoUrl = thumbnailUrl;
      this.videoObject.name = this.reel.name;
      this.videoObject.type = this.reel.type;
      this.uploadReel = this.videoObject;
      this.initializeVideoObject();
    });
    this.validateVideoDuration(videoUrl, this.reel);

  }

  validateVideoDuration(videoUrl: string, reel: File) {
    const videoElement = document.createElement('video');
    videoElement.src = videoUrl;

    videoElement.addEventListener('loadedmetadata', () => {
      debugger
      if (videoElement.duration > 180) {
        this.isVideoDurationExceed = true;
        // Video duration is greater than 3 minutes
        // Handle the validation logic here
        console.log('Video duration exceeds 3 minutes');
        // Reset the input value to clear the selected file
        // const inputElement: HTMLInputElement = document.querySelector('input[type="file"]');
        // if (inputElement) {
        //   inputElement.value = '';
        // }
      } else {
        this.isVideoDurationExceed = false;
      }
    });
  }

  removeUploadReel(uploadReel: any) {
    this.postToUpload.set('uploadVideos', '');
    this.uploadReel = null;
    this.isVideoDurationExceed = false;
    const blobUrlIndex = this.uploadVideoUrlList.findIndex((item: any) => item.blobName === uploadReel.name);
    if (blobUrlIndex > -1) {
      this.uploadVideoUrlList.splice(blobUrlIndex, 1);
    }
    if(this.uploadVideoUrlList.length == 0){
      this.createReelForm.get('reelsVideo')?.setValue('');
    }
    
  }

  uploadPromises!: any[];
  blobVideoThumbnails: any[] = [];
  async savePost() {
    debugger

    if (this.userId == undefined) {
      this.createPostForm.get('title')?.setValidators([Validators.required]);
    } else {
      this.createPostForm.get('title')?.clearValidators();
    }

    this.createPostForm.get('title')?.updateValueAndValidity();
    // this.uploadVideoUrlList = [];
    this.isSubmitted = true;
    if (!this.createPostForm.valid) {
      return;
    }

    if (this.scheduleTime != undefined) {
      if (this.scheduleTime < new Date()) {
        this.createPostForm.setErrors({ unauthenticated: true });
        return;
      }
      else {
        debugger
        const date = new Date(this.scheduleTime);
        this.postToUpload.append('dateTime', date.toISOString());
        console.log(date.toISOString());
      }
    }

    if (this.videos.length == 0 && this.attachment.length == 0) {
      this.loadingIcon = true;
    }
    else {
      this.loadingIcon = true;
      setTimeout(() => {
        debugger
        this.close();
        this.loadingIcon = false;
        postProgressNotification.next({ from: Constant.Post });
      }, 3000);
    }

    // for edit post

    if (this.isEditPost) {
      this.postToUpload.append('Id', this.editPostDetails.id);
      this.postToUpload.append('UploadImagesUrls', JSON.stringify(this.uploadImageUrls));
      this.postToUpload.append('UploadVideosUrls', JSON.stringify(this.uploadVideoUrls));
      this.postToUpload.append('UploadAttachmentsUrls', JSON.stringify(this.attachmentUrls));
    }

    if(this.profileShare){
      this.postToUpload.append('SharedProfileUrl', window.location.href)
    }

    this.totalFilesLength = this.images.length + this.videos.length + this.attachment.length;
    // for images
    // for(var i=0; i<this.images.length; i++){
    //   this.postToUpload.append('uploadImages', this.images[i]);
    // }

    const combinedFiles = [...this.videos, ...this.images, ...this.attachment, ... this.videoThumbnails];

    // const uploadPromises = combinedFiles.map((file) => {
    //   if (this.videos.includes(file)) {
    //     return this.uploadVideosOnBlob(file, UploadTypeEnum.Video);
    //   }
    //   if(this.images.includes(file)){
    //     return this.uploadVideosOnBlob(file, UploadTypeEnum.Image);
    //   }
    //   if(this.videoThumbnails.includes(file)){
    //     return this.uploadVideosOnBlob(file, UploadTypeEnum.Thumbnail);
    //   }
    //   else {
    //     return this.uploadVideosOnBlob(file, UploadTypeEnum.Attachment);
    //   }

    // });

    // await Promise.all(uploadPromises);


    // for (let i = 0; i < this.uploadVideoUrlList.length; i++) {
    //   debugger
    //   const uploadVideo = this.uploadVideoUrlList[i];

    //   for (const blobVideo of this.blobVideoThumbnails) {
    //     if (uploadVideo.blobName === blobVideo.blobName) {
    //       uploadVideo.thumbnailUrl = blobVideo.blobUrl;
    //       break;
    //     }
    //   }
    // }

    // const uploadPromises = this.videos.map((file) => this.uploadVideosOnBlob(file,UploadTypeEnum.Video));
    // await Promise.all(uploadPromises);

    // const uploadImagePromises = this.images.map((file:any) => this.uploadVideosOnBlob(file,UploadTypeEnum.Image));
    // await Promise.all(uploadImagePromises);

    // const uploadAttachmentPromises = this.attachment.map((file:any) => this.uploadVideosOnBlob(file,UploadTypeEnum.Attachment));
    // await Promise.all(uploadAttachmentPromises);
    // for videoes
    // for(var i=0; i<this.videos.length; i++){
    //   this.postToUpload.append('uploadVideos', this.videos[i]);
    //   // await this.uploadVideosOnBlob(this.videos[i]);
    // }

    // for(var i=0; i<this.videoThumbnails.length; i++){
    //   this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
    // }

    // // for attachments
    // for(var i=0; i<this.attachment.length; i++){
    //   this.postToUpload.append('uploadAttachments', this.attachment[i]);
    // }

    // this.postToUpload.append('blobUrlsJson', JSON.stringify(this.uploadVideoUrlList))

    var post = this.createPostForm.value;
    this.postFrom();

    this.postToUpload.append('title', post.title);
    this.postToUpload.append('description', post.bodyText);
    this.postToUpload.append('postType', PostTypeEnum.Post.toString());

    if (this.uploadFromFileStorage != undefined) {
      this.postToUpload.append('UploadFromFileStorage', JSON.stringify(this.uploadFromFileStorage));
    }
    // if(post.scheduleTime != undefined){
    //   const dateUtc = new Date(post.scheduleTime);
    //   const localTime = dateUtc.toLocaleString();
    //   this.postToUpload.append('dateTime',localTime);
    // }
    this.postToUpload.append('postTags', JSON.stringify(this.tagLists))

    postUploadOnBlob.next({ postToUpload: this.postToUpload, combineFiles: combinedFiles, videos: this.videos, images: this.images, attachment: this.attachment, type: 1, reel: null, uploadedUrls: this.uploadVideoUrlList, videoThumbnails: this.videoThumbnails, checkLimitSchoolId: this.postCheckForLimitSchoolId });

    // this._postService.createPost(this.postToUpload).subscribe((response:any) => {
    //   debugger
    //   this.close();
    //   this.onClose.emit(response);
    //   this.isSubmitted=false;
    //   this.loadingIcon = false;
    //   addPostResponse.next({response});
    //   this.postToUpload = new FormData();
    //   if(this.videos.length != 0 || this.attachment.length != 0){
    //     var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
    //     var notificationContent = translatedMessage;
    //     this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,null).subscribe((response) => {
    //     });
    //   }
    //     });

  }

  postCheckForLimitSchoolId:any;
  postFrom() {
    debugger
    if(this.profileShare){
      this.appendData(this.loginUserId, this.loginUserId, this.loginUserId, PostAuthorTypeEnum.User.toString());
    }
    else{
      if (this.schoolId != undefined) {
        this.appendData(this.schoolId, this.schoolId, '', PostAuthorTypeEnum.School.toString());
        this.postCheckForLimitSchoolId = this.schoolId;
      }
      if (this.classId != undefined) {
        this.appendData('', this.classId, this.parentDetails.school.schoolId, PostAuthorTypeEnum.Class.toString());
        this.postCheckForLimitSchoolId = this.parentDetails.school.schoolId
      }
  
      if (this.userId != undefined) {
        this.appendData(this.userId, this.userId, this.userId, PostAuthorTypeEnum.User.toString());
      }
  
      if (this.courseId != undefined) {
        if (this.parentDetails?.isConvertable) {
          this.appendData('', this.courseId, this.parentDetails.school.schoolId, PostAuthorTypeEnum.Class.toString());
          this.postCheckForLimitSchoolId = this.parentDetails.school.schoolId
        }
        else {
          this.appendData('', this.courseId, this.parentDetails.school.schoolId, PostAuthorTypeEnum.Course.toString());
          this.postCheckForLimitSchoolId = this.parentDetails.school.schoolId
        }
      }
    }
  }

  appendData(authorId: string, parentId: string, ownerId: string, postAuthorType: string) {
    // this.postToUpload.append('authorId', authorId);
    debugger
    this.postToUpload.append('parentId', parentId);
    // this.postToUpload.append('ownerId', ownerId);
    this.postToUpload.append('postAuthorType', postAuthorType);
    // this.postToUpload.append('postTags', JSON.stringify(this.tagLists))

  }

  async saveReels() {
    debugger
    // this.uploadVideoUrlList = [];
    this.isSubmitted = true;
    this.isShowingProgressBar = true;
    if (this.isVideoDurationExceed) {
      return;
    }

    if (!this.createReelForm.valid) {
      this.isShowingProgressBar = false;
      return;
    }

    if (this.scheduleTime != undefined) {
      if (this.scheduleTime < new Date()) {
        this.createReelForm.setErrors({ unauthenticated: true });
        return;
      }
    }


    this.loadingIcon = true;
    setTimeout(() => {
      this.close();
      this.loadingIcon = false;
      postProgressNotification.next({ from: Constant.Post });
    }, 3000);

    var reel = this.createReelForm.value;
    this.postFrom();
    // for(var i=0; i<this.videoThumbnails.length; i++){
    //   this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
    // }

    //  await this.uploadVideosOnBlob(this.reel,UploadTypeEnum.Video);
    // this.postToUpload.append('blobUrlsJson', JSON.stringify(this.uploadVideoUrlList))
    this.postToUpload.append('postType', PostTypeEnum.Reel.toString());
    if (reel.scheduleTime != undefined) {
      this.postToUpload.append('dateTime', reel.scheduleTime.toISOString());
    }

    this.postToUpload.append('title', reel.title);
    this.postToUpload.append('postTags', JSON.stringify(this.reelsTagLists))

    if(this.reel != undefined){
      this.videos.push(this.reel);
    }
    if(this.forReel){
      this.postToUpload.append('Id', this.editPostDetails.id);
    }
    var combinedFiles = [...this.videos, ... this.videoThumbnails];

    // reelUploadOnBlob.next({postToUpload:this.postToUpload,reel:this.reel});
    postUploadOnBlob.next({ postToUpload: this.postToUpload, combineFiles: combinedFiles, videos: this.videos, images: null, attachment: null, type: 2, reel: this.reel, uploadedUrls: this.uploadVideoUrlList, videoThumbnails: this.videoThumbnails, checkLimitSchoolId: this.postCheckForLimitSchoolId });
    // this._postService.createPost(this.postToUpload).subscribe((response:any) => {
    //   debugger
    //   this.isSubmitted=false;
    //   this.loadingIcon = false;
    //   this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel created successfully'});
    //   addPostResponse.next({response});
    //   this.postToUpload = new FormData();
    //   var translatedMessage = this.translateService.instant('PostReadyToViewMessage');
    //   var notificationContent = translatedMessage;
    //   this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,response.reelId).subscribe((response) => {
    //   });
    //   this.close();
    //   this.ngOnInit();
    // });

  }

  removeTags(tag: any) {
    if (this.isOpenReelsTab) {
      const reelsTagIndex = this.reelsTagLists.findIndex((item) => item === tag);
      if (reelsTagIndex > -1) {
        this.reelsTagLists.splice(reelsTagIndex, 1);
      }
    }
    else {
      const tagIndex = this.tagLists.findIndex((item) => item === tag);
      if (tagIndex > -1) {
        this.tagLists.splice(tagIndex, 1);
      }
    }
  }

  removeInitialTags(tag: any) {
    const tagIndex = this.initialTagList.findIndex((item) => item === tag);
    if (tagIndex > -1) {
      this.initialTagList.splice(tagIndex, 1);
      var tagCount = this.tagLists.length + this.initialTagList.length;
      if (tagCount > 7) {
        this.tagCountExceeded = true;
        return;
      }
      else {
        this.tagCountExceeded = false;
      }
    }
  }

  isValidTags() {
    if (this.initialTagList == undefined || this.initialTagList.length == 0) {
      this.isTagsValid = false;
      return;
    }

    var tagCount = this.tagLists.length + this.initialTagList.length;
    if (tagCount > 7) {
      this.tagCountExceeded = true;
      return;
    }
    if (this.isOpenReelsTab) {
      this.reelsTagLists = [...this.reelsTagLists, ...this.initialTagList];
    }
    else {
      this.tagLists = [...this.tagLists, ...this.initialTagList];
    }
    this.isTagsValid = true;
    this.closeTagsModal();
  }

  private openFirstModal(): void {
    this.openFirst.nativeElement.click();
  }

  onInputChange() {
    if (this.tags.length > 10) {
      this.tags = this.tags.slice(0, 10);
    }
  }

  onEnter(tags: any) {
    const isBlank = /^\s*$/.test(tags);
    if (isBlank) {
      return;
    }

    tags = tags.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
    var tagLists = [...this.tagLists, ...this.initialTagList];
    if (tagLists.includes(tags)) {
      this.tags = '';
      return;
    }
    this.initialTagList.push(tags);
    this.tags = '';
    var tagCount = this.tagLists.length + this.initialTagList.length;
    this.isTagsValid = true;
    if (tagCount > 7) {
      this.tagCountExceeded = true;
      return;
    }
    else {
      this.tagCountExceeded = false;
    }
  }

  openAttachmentModal() {
    this.addAttachmentModal.nativeElement.click();
  }

  close(): void {
    this.bsModalService.hide();
  }

  show() {
    this.bsModalService.show(this.templatefirst);
    this.createPostModal.show();
  }

  hide() {
    this.addAttachmentModal.nativeElement.click();
  }

  openAttachment() {
    this.bsModalService.hide();
    this.addAttachmentModal.nativeElement.click();

  }

  AttachmentModalOpen(template: TemplateRef<any>) {
    this.uploadFromFileStorage = [];
    this.fileAttachmentsForm.setValue({
      fileAttachments: [],
    });
    this.initialAttachment = [];
    this.attachmentModalRef = this.bsModalService.show(template);
  }

  closeAttachmentModal() {
    this.attachmentModalRef.hide();
  }

  closeTagsModal() {
    this.tagModalRef.hide();
  }

  openTagModal(template: TemplateRef<any>) {
    this.initialTagList = [];
    this.tagCountExceeded = false;
    this.isTagsValid = true;
    this.tagModalRef = this.bsModalService.show(template);
  }

  isValidAttachments() {
    if (this.uploadFromFileStorage.length == 0 && (this.initialAttachment == undefined || this.initialAttachment.length == 0)) {
      this.isAttachmentsValid = false;
      return;
    }

    this.attachment = [...this.attachment, ...this.initialAttachment];
    this.isAttachmentsValid = true;
    this.closeAttachmentModal();
  }

  reelsTab() {
    this.totalFilesLength = 0;
    this.isOpenReelsTab = true;
  }

  postTab() {
    this.isOpenReelsTab = false;
  }

  captureAttachmentUrl(event: any) {
    var fileStorageAttachment = {
      fileName: event.fileName,
      fileUrl: event.fileUrl
    }

    this.uploadFromFileStorage.push(fileStorageAttachment);
    this.initialAttachment.push(fileStorageAttachment);
    this.isAttachmentsValid = true;
  }

  removeFileAttachment(event: any) {
    const attachmentIndex = this.uploadFromFileStorage.findIndex((item) => item.fileName === event.fileName);
    if (attachmentIndex > -1) {
      this.uploadFromFileStorage.splice(attachmentIndex, 1);
    }

    const attachmentInitialIndex = this.initialAttachment.findIndex((item) => item.fileName === event.fileName);
    if (attachmentInitialIndex > -1) {
      this.initialAttachment.splice(attachmentInitialIndex, 1);
    }
  }

  filterFileAttachments(event: any) {
    var fileStorageAttachments: any[] = this.fileStorageAttachments;
    fileStorageAttachments = fileStorageAttachments.filter(x => !this.uploadFromFileStorage.find(y => y.fileName == x.fileName));
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < fileStorageAttachments.length; i++) {
      let attachment = fileStorageAttachments[i];
      if (attachment.fileName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(attachment);
      }
    }
    this.filteredFileAttachments = filtered;
  }

  liveStream() {
    debugger
    this.uploadVideoUrlList = [];
    this.isSubmitted = true;

    if (this.scheduleTime != undefined) {
      if (this.scheduleTime < new Date()) {
        this.createPostForm.setErrors({ unauthenticated: true });
        return;
      }
      else {
        const date = new Date(this.scheduleTime);
        this.postToUpload.append('dateTime', date.toISOString());
      }
    }

    if (this.scheduleTime != undefined) {
      if (this.scheduleTime < new Date()) {
        this.createLiveForm.setErrors({ unauthenticated: true });
        return;
      }
      else {
        const date = new Date(this.scheduleTime);
        this.postToUpload.append('dateTime', date.toISOString());
      }
      if (this.videos.length == 0) {
        this.scheduleVideoRequired = true;
        return;
      }
    }

    if (this.images.length < 1) {
      this.thumbnailRequired = true;
      return;
    }

    if (!this.createLiveForm.valid) {
      return;
    }

    // for videoes
    // for(var i=0; i<this.videos.length; i++){
    //   this.postToUpload.append('uploadVideos', this.videos[i]);
    // }

    // for(var i=0; i<this.videoThumbnails.length; i++){
    //   this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
    // }

    if(this.selectedVideoFromLibrary == undefined){
    if (this.videos.length == 0) {
      this.loadingIcon = true;
    }
    else {
      this.loadingIcon = true;
      setTimeout(() => {
        this.close();
        this.loadingIcon = false;
        postProgressNotification.next({ from: Constant.Post });
      }, 3000);
    }
    
  }

    var post = this.createLiveForm.value;
    this.postFrom();

    this.postToUpload.append('title', post.title);
    this.postToUpload.append('description', post.bodyText);
    // this.postToUpload.append('coverLetter', post.coverLetter);
    this.postToUpload.append('postType', PostTypeEnum.Stream.toString());
    this.postToUpload.append('postTags', JSON.stringify(this.tagLists));
    this.postToUpload.append('commentsPerMinute', post.commentPerMinute);
    this.postToUpload.append('isMicroPhoneOpen', this.isMicroPhoneOpen.toString());


    // for (var i = 0; i < this.images.length; i++) {
    //   this.postToUpload.append('uploadImages', this.images[i]);
    // }

    if(this.selectedVideoFromLibrary == undefined){
    const combinedFiles = [...this.videos, ...this.images];
    postUploadOnBlob.next({ postToUpload: this.postToUpload, combineFiles: combinedFiles, videos: this.videos, images: this.images, attachment: null, type: 3, reel: null, uploadedUrls: [], checkLimitSchoolId: this.postCheckForLimitSchoolId });
    }

    if(this.selectedVideoFromLibrary != undefined){
      this.loadingIcon = true;
        this.saveLiveStream(this.selectedVideoFromLibrary);
    }
    //   this._postService.createPost(this.postToUpload).subscribe((response:any) => {
    //     debugger
    //     this.isSubmitted=false;
    //     this.loadingIcon = false;
    //     //addPostResponse.next({response});
    //     this.postToUpload = new FormData();
    //     this.close();
    //     if(this.videos.length != 0){
    //     var translatedMessage = this.translateService.instant('VideoReadyToStream');
    //     var notificationContent = translatedMessage;
    //     var chatType = this.from == "user" ? 1 :this.from == "school" ? 3 : this.from == "class" ? 4 : undefined;
    //     this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,null,chatType).subscribe((response) => {
    //     });
    //    }
    //   else{
    //     // const fullNameIndex = response.streamUrl.indexOf('fullName='); // find the index of "fullName="
    //     // const newUrl = response.streamUrl.slice(fullNameIndex);
    //     // here we need to send schoolId/classId if stream from those.
    //     if(!response.isPostSchedule){
    //     this.router.navigate(
    //         [`liveStream`,response.id,this.from]
    //         // { state: { stream: {streamUrl: response.streamUrl, userId:this.userId, meetingId: post.title,from:"user"} } });

    //     // }
    //     );

    //   }
    // }
    //     });

  }

  saveLiveStream(selectedVideoFromLibrary:any){
    debugger
    var prefix = "videos";
    const id = uuidv4();
    const blobName = `${prefix}/${id.toString()}${selectedVideoFromLibrary.fileName.substring(selectedVideoFromLibrary.fileName.lastIndexOf('.'))}`;
    var uploadVideoObject = 
    {
      id: id,
      blobUrl:selectedVideoFromLibrary.fileUrl,
      blobName:blobName,
      fileType:2,
      fileThumbnail:selectedVideoFromLibrary.fileThumbnail
    }

    var uploadVideo = [];
    uploadVideo.push(uploadVideoObject);
    this.postToUpload.set('blobUrlsJson', JSON.stringify(uploadVideo));

      this._postService.createPost(this.postToUpload).subscribe((response:any) => {
        debugger
        this.isSubmitted=false;
        this.loadingIcon = false;
        //addPostResponse.next({response});
        this.postToUpload = new FormData();
        this.close();
      this.router.navigate(
        [`liveStream`,response.id,this.from]
    );
        
        // if(this.videos.length != 0){
        // var translatedMessage = this.translateService.instant('VideoReadyToStream');
        // var notificationContent = translatedMessage;
        // var chatType = this.from == "user" ? 1 :this.from == "school" ? 3 : this.from == "class" ? 4 : undefined;
        // this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.PostUploaded,notificationContent,this.loginUserId,response.id,response.postType,response,null,chatType).subscribe((response) => {
        // });
      //  }
    //   else{
    //     // const fullNameIndex = response.streamUrl.indexOf('fullName='); // find the index of "fullName="
    //     // const newUrl = response.streamUrl.slice(fullNameIndex);
    //     // here we need to send schoolId/classId if stream from those.
    //     if(!response.isPostSchedule){
    //     this.router.navigate(
    //         [`liveStream`,response.id,this.from]
    //         // { state: { stream: {streamUrl: response.streamUrl, userId:this.userId, meetingId: post.title,from:"user"} } });

    //     // }
    //     );

    //   }
    // }
        });
  }

  openMicroPhone() {
    this.isMicroPhoneOpen = !this.isMicroPhoneOpen;
  }

  isOwnerOrNot() {
    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.loginUserId = decodedJwtData.jti;
    }
  }


  @ViewChild('fileInput') fileInput!: ElementRef;
  handleFileInput(event: any) {
    var files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file: File = files.item(i)!;
        if (file.type.startsWith('image/')) {
          this.handleImageInput2(file);
        } else if (file.type.startsWith('video/')) {
          this.handleVideoInput2(file);
        }
        else if (file.type.startsWith('application/pdf')) {
          this.handleAttachmentInput2(file);
        }
      }
    }
    this.fileInput.nativeElement.value = '';
  }

  uploadVideoUrlList: any[] = [];

  public async uploadVideosOnBlob(file: File, fileType: number) {
    debugger

    // Replace with your SAS token or connection string
    const sasToken = Constant.SASToken;
    var prefix = "attachments";
    if (fileType == UploadTypeEnum.Image)
      prefix = "images";
    else if (fileType == UploadTypeEnum.Video)
      prefix = "videos";
    const id = uuidv4();
    const blobName = `${prefix}/${id.toString()}${file.name.substring(file.name.lastIndexOf('.'))}`;
    var containerName = Constant.ContainerName;
    const blobStorageName = Constant.blobStorageName;
    var containerClient = new BlobServiceClient(`https://${blobStorageName}.blob.core.windows.net?${sasToken}`)
      .getContainerClient("userposts");

    await this.uploadBlobTest(file, blobName, containerClient)
      .then((response) => {
        debugger
        var uploadVideoObject =
        {
          id: id,
          blobUrl: response.blobUrl,
          blobName: blobName,
          fileType: fileType
        }
        //   if(fileType != UploadTypeEnum.Thumbnail){
        //   this.uploadVideoUrlList.push(uploadVideoObject);
        //   }
        //  else{
        this.blobVideoThumbnails = this.uploadVideoUrlList;
        //  }


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

      return { success: true, message: 'File uploaded successfully', blobUrl: blobUrl };
    } catch (error) {
      console.error('Error uploading file:', error);

      return { success: false, message: 'Error uploading file: ' + error };
    }
  }

  characterCount: number = 0;
  updateCharacterCount() {
    debugger
    const titleControl = this.createPostForm.get('title');
    if (titleControl?.value.length > 45) {
      titleControl?.setValue(titleControl.value.slice(0, 45));
    }
  }



  profileShared(initialValue:any, thumbnailUrl:any){
    debugger
    this.createPostForm = this.fb.group({
      title: this.fb.control(initialValue?.title, [Validators.required]),
      bodyText: this.fb.control(initialValue?.bodyTest, [Validators.required]),
      scheduleTime: this.fb.control(Date.now())
    });
    const imageObject = {
      imageUrl: thumbnailUrl
    };
    if(thumbnailUrl != null){
    var imageBlobobject = {
      id: uuidv4(),
      blobUrl: thumbnailUrl,
      fileType: UploadTypeEnum.Image,
      blobName: initialValue.title
    }
    this.uploadVideoUrlList.push(imageBlobobject);
  }
    this.uploadImageUrls.push(imageObject);
  }


  parseTheTags(tags: any) {
    for (let index = 0; index < tags.length; index++) {
      const element = tags[index]
      try {
        var reelsTags = JSON.parse(element);
      }
      catch { }
      return reelsTags
    }
  }


  initializeEditReelForm(thumbnailUrl?:any) {
    debugger
    this.isOpenReelsTab = true;
    this.createReelForm = this.fb.group({
      title: this.fb.control(this.editPostDetails.title, [Validators.required]),
      reelsVideo: this.fb.control(this.editPostDetails.postAttachments[0].fileUrl, [Validators.required]),
      scheduleTime: this.fb.control(this.editPostDetails.dateTime)
    });

    this.createReelForm.updateValueAndValidity();
    this.reelsTagLists = this.editPostDetails.postTags.map((tagObj: { postTagValue: any; }) => tagObj.postTagValue);
    this.currectTagLists = [...this.reelsTagLists]
    try {
      this.currectTagLists = this.parseTheTags(this.currectTagLists)
      this.reelsTagLists = this.currectTagLists
    } 
    catch { }
    this.videoObject.videoUrl = thumbnailUrl;
    this.videoObject.name = this.editPostDetails.postAttachments[0].fileName;
    this.videoObject.type = this.editPostDetails.postAttachments[0].fileType;
    this.uploadReel = this.videoObject;


    var imageBlobobject = {
      id: uuidv4(),
      blobUrl: this.editPostDetails.postAttachments[0].fileUrl,
      fileType: UploadTypeEnum.Image,
      blobName: this.editPostDetails.postAttachments[0].fileName,
      FileThumbnail: this.editPostDetails.postAttachments[0].fileThumbnail
    }
    this.uploadVideoUrlList.push(imageBlobobject);
    this.initializeVideoObject();
    this.cd.detectChanges();


  }

}



