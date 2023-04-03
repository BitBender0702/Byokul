import { Component, ElementRef, Input, OnInit, ViewChild, inject, Inject, TemplateRef, EventEmitter, AfterViewInit, ChangeDetectorRef, QueryList, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
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
export const addPostResponse =new Subject<{}>();  


@Component({
  selector: 'create-post',
  templateUrl: 'createPost.component.html',
  styleUrls: ['createPost.component.css'],
  providers: [MessageService]
})

export class CreatePostComponent implements OnInit,OnDestroy {

  @Input() isOpenModal!:boolean;
  @Input() classId!:any;
  @Input() courseId!:string;
  @Input() userId!:any;
  @ViewChild('openModal') openModal!: ElementRef;
  @ViewChild('openFirst') openFirst!: ElementRef;
  @ViewChild('addAttachmentModal') addAttachmentModal!: ElementRef;
  @ViewChild('closeMainModal') closeMainModal!: ElementRef;
  @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;
  @ViewChild('closePostM') closePostM!: ElementRef;
  @ViewChild('openAttachmentModal') openAttachmentModals!: ElementRef;
  @ViewChild('templatefirst') templatefirst!:  TemplateRef<any>;
  @ViewChild('videoPlayer') videoPlayers!: QueryList<ElementRef>;

  private _postService;
  isSubmitted: boolean = false;
  isTagsValid: boolean = true;
  isAttachmentsValid: boolean = true;

  tags!:string;
  tagLists!: string[];
  initialTagList!: string[];

  parentDetails:any;
  disabled:boolean = true;

  createPostForm!:FormGroup;
  createLiveForm!:FormGroup;
  createReelForm!:FormGroup;
  postToUpload = new FormData();

  imageToUpload= new FormData();
  images:string[] = [];
  uploadImage:any[] = [];
  imageObject!:UploadImage;

  videoToUpload= new FormData();
  videos:any[] = [];
  uploadVideo:any[] = [];
  uploadReels:any[] = [];
  videoObject!:UploadVideo;

  attachmentToUpload= new FormData();
  attachment:any[] = [];
  initialAttachment:any[] = [];
  reel:any;
  uploadReel!:any;
  isDataLoaded:boolean = false;
  scheduleTime!:Date;
  currentDate!:string;
  loadingIcon:boolean = false;

  initialState:any;
  schoolId:any;
  videoThumbnails:any[] = [];

  listOfObject:any[] = [];

  public event: EventEmitter<any> = new EventEmitter();
  attachmentModalRef!: BsModalRef;
  tagModalRef!: BsModalRef;
  private progressSubscription!: Subscription;
  progressBarValue:number = 0;
  fileCount:number = 1;
  progressFileName!:string;
  filesLength!:number;
  totalFilesLength!:number;


  constructor(private domSanitizer: DomSanitizer,public messageService:MessageService,private bsModalService: BsModalService,public options: ModalOptions,private fb: FormBuilder,postService: PostService,private http: HttpClient,private cd: ChangeDetectorRef) {
    this._postService = postService;
  }

  ngOnInit(): void {
    var initialValue = this.options.initialState;
    if(initialValue?.from == "school"){
    this.schoolId = initialValue.schoolId;
    this._postService.getSchool(this.schoolId).subscribe((response) => {
      this.parentDetails = response;
      this.isDataLoaded = true;
    });
   }

   if(initialValue?.from == "class"){
    this.classId = initialValue.classId;
    this._postService.getClass(this.classId).subscribe((response) => {
      this.parentDetails = response;
     
    });

   }

   if(initialValue?.from == "user"){
    this.userId = initialValue.userId;
    this._postService.getUser(this.userId).subscribe((response) => {
      this.parentDetails = response;
     
    });

   }

   if(initialValue?.from == "course"){
    this._postService.getCourse(this.courseId).subscribe((response) => {
      this.parentDetails = response;
     
    });

   }

    this.createPostForm = this.fb.group({
      title: this.fb.control('',[Validators.required]),
      bodyText: this.fb.control('',[Validators.required]),
      scheduleTime: this.fb.control('')
    });

    this.createLiveForm = this.fb.group({
      title: this.fb.control(''),
      bodyText: this.fb.control(''),
      coverLetter: this.fb.control('')

    })

    this.createReelForm = this.fb.group({
      scheduleTime: this.fb.control(''),
      reelsVideo:this.fb.control([],[Validators.required])
    })

    this.tagLists = [];
    this.initialTagList = [];

    this.initializeImageObject();
    this.initializeVideoObject();

     this.progressSubscription = progressResponse.subscribe(response => {
      this.progressBarValue = response.progressCount;
      this.filesLength = this.images.length + this.videos.length + this.attachment.length;
      if(this.progressBarValue == 100 && this.filesLength != this.fileCount){
         this.fileCount += 1;
      }
      this.progressFileName = response.fileName;
      this.cd.detectChanges();
    });

   }

   ngOnDestroy() {
    this.progressSubscription.unsubscribe();
  }

   initializeImageObject(){
    this.imageObject = {
      imageUrl: '',
      name: ''
     };

   }

   initializeVideoObject(){
    this.videoObject = {
      videoUrl: '',
      name: '',
      type:''
     };

   }


   handleImageInput(event: any) {
      this.images.push(event.target.files[0]);
      const reader = new FileReader();
      reader.onload = (_event) => { 
        this.imageObject.imageUrl = _event.target?.result;
        this.imageObject.name = event.target.files[0].name;
          this.uploadImage.push(this.imageObject); 
          this.initializeImageObject();
      }
      reader.readAsDataURL(event.target.files[0]); 
   }

   removeUploadImage(image:any){
    const index = this.images.findIndex((item:any) => item.name === image.name);
        if (index > -1) {
          this.images.splice(index, 1);
        }

        const imageIndex = this.uploadImage.findIndex((item:any) => item.name === image.name);
        if (imageIndex > -1) {
          this.uploadImage.splice(imageIndex, 1);
        }

   }

handleVideoInput(event: any) {
  this.videos.push(event.target.files[0]);
  const file = event.target.files[0];
  const videoUrl = URL.createObjectURL(file);
  this.getVideoThumbnail(videoUrl,file.name, (thumbnailUrl) => {
    this.videoObject.videoUrl = thumbnailUrl;
    this.videoObject.name = file.name;
    this.videoObject.type = file.type;
    this.uploadVideo.push(this.videoObject); 
    this.initializeVideoObject();
  });
}

getVideoThumbnail(videoUrl: string,fileName:string, callback: (thumbnailUrl: string) => void) {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.src = videoUrl;
  video.currentTime = 4;
  video.addEventListener('loadedmetadata', () => {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    video.addEventListener('seeked', () => {
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailUrl = canvas.toDataURL();

  this.saveCanvasToFile(canvas,fileName);
      callback(thumbnailUrl);
    });
    video.currentTime = 4;
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

 removeUploadVideo(video:any){
  const index = this.videos.findIndex((item:any) => item.name === video.name);
      if (index > -1) {
        this.videos.splice(index, 1);
      }

      const imageIndex = this.uploadVideo.findIndex((item:any) => item.name === video.name);
      if (imageIndex > -1) {
        this.uploadVideo.splice(imageIndex, 1);
      }

 }

 handleAttachmentInput(event: any) {
    this.initialAttachment.push(event.target.files[0]);
 }

 removeAttachment(attachment:any){
  const attachmentIndex = this.attachment.findIndex((item) => item.name ===attachment.name);
  if (attachmentIndex > -1) {
    this.attachment.splice(attachmentIndex, 1);
  }


 }

 handleReels(event:any){
  this.postToUpload.append('uploadVideos', event.target.files[0]);
  this.reel = event.target.files[0];
  const videoUrl = URL.createObjectURL(this.reel);
  this.getVideoThumbnail(videoUrl,this.reel.name, (thumbnailUrl) => {
    this.videoObject.videoUrl = thumbnailUrl;
    this.videoObject.name = this.reel.name;
    this.videoObject.type = this.reel.type;
    this.uploadReel = this.videoObject; 
    this.initializeVideoObject();
  });
 }

 removeUploadReel(uploadReel:any){
  this.postToUpload.set('uploadVideos','');
  this.uploadReel = null; 

 }

   savePost(){
    this.isSubmitted=true;
    if (!this.createPostForm.valid) {
      return;
    }

    if(this.scheduleTime != undefined){
     if(this.scheduleTime < new Date()){
       this.createPostForm.setErrors({ unauthenticated: true });
       return;

    }
  }

  this.totalFilesLength = this.images.length + this.videos.length + this.attachment.length;
    // for images
    for(var i=0; i<this.images.length; i++){
      this.postToUpload.append('uploadImages', this.images[i]);
    }

    // for videoes
    for(var i=0; i<this.videos.length; i++){
      this.postToUpload.append('uploadVideos', this.videos[i]);
    }

    for(var i=0; i<this.videoThumbnails.length; i++){
      this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
    }

    // for attachments
    for(var i=0; i<this.attachment.length; i++){
      this.postToUpload.append('uploadAttachments', this.attachment[i]);
    }

    var post =this.createPostForm.value;
    this.postFrom();

    this.postToUpload.append('title', post.title);
    this.postToUpload.append('description', post.bodyText);
    this.postToUpload.append('postType', PostTypeEnum.Post.toString());
    if(post.scheduleTime != undefined){
      this.postToUpload.append('dateTime',post.scheduleTime.toISOString());
    }



    this._postService.createPost(this.postToUpload).subscribe((response:any) => {  
      
      this.isSubmitted=false;
      this.loadingIcon = false;
      addPostResponse.next({response}); 
      this.postToUpload = new FormData();
      this.close();
      this.ngOnInit();
    });
   }

   postFrom(){
    if(this.schoolId!= undefined){
      this.appendData(this.schoolId,this.schoolId,'',PostAuthorTypeEnum.School.toString());
    }
    if(this.classId!= undefined){
      this.appendData('',this.classId,this.parentDetails.school.schoolId,PostAuthorTypeEnum.Class.toString());
    }

    if(this.userId!= undefined){
      this.appendData(this.userId,this.userId,this.userId,PostAuthorTypeEnum.User.toString());
    }

    if(this.courseId!= undefined){
      if(this.parentDetails?.isConvertable){
        this.appendData('',this.courseId,this.parentDetails.school.schoolId,PostAuthorTypeEnum.Class.toString());
      }
      else{
      this.appendData('',this.courseId,this.parentDetails.school.schoolId,PostAuthorTypeEnum.Course.toString());
      }
    }
   }

   appendData(authorId:string, parentId:string, ownerId:string, postAuthorType:string){
      this.postToUpload.append('authorId', authorId);
      this.postToUpload.append('parentId', parentId);
      this.postToUpload.append('ownerId', ownerId);
      this.postToUpload.append('postAuthorType', postAuthorType);
      this.postToUpload.append('postTags', JSON.stringify(this.tagLists))

   }

   saveReels(){
    this.isSubmitted = true;
    if (!this.createReelForm.valid) {
      return;
    }

    if(this.scheduleTime != undefined){
      if(this.scheduleTime < new Date()){
        this.createReelForm.setErrors({ unauthenticated: true });
        return;
     }
    }

    var reel =this.createReelForm.value;
    this.postFrom();
    for(var i=0; i<this.videoThumbnails.length; i++){
      this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
    }
    this.postToUpload.append('postType', PostTypeEnum.Reel.toString());
    if(reel.scheduleTime != undefined){
    this.postToUpload.append('dateTime', reel.scheduleTime.toISOString());
    }

    this._postService.createPost(this.postToUpload).subscribe((response:any) => {
      
      this.isSubmitted=false;
      this.loadingIcon = false;
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Reel created successfully'});
      addPostResponse.next({response}); 
      this.postToUpload = new FormData();
      this.close();
      this.ngOnInit();
    });

   }

   removeTags(tag:any){
    const tagIndex = this.tagLists.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.tagLists.splice(tagIndex, 1);
    }
   }

   removeInitialTags(tag:any){
    const tagIndex = this.initialTagList.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.initialTagList.splice(tagIndex, 1);
    }
   }

   isValidTags(){
    if(this.initialTagList == undefined || this.initialTagList.length == 0){
      this.isTagsValid = false;
      return;
    }
    this.tagLists = [ ...this.tagLists, ...this.initialTagList];
    this.isTagsValid = true;
    this.closeTagsModal();
   }

  private openFirstModal(): void {
    this.openFirst.nativeElement.click();
  }

  onEnter(tags:any) {
    this.initialTagList.push(tags);
    this.tags = '';
  }

  openAttachmentModal(){
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

   openAttachment(){
    this.bsModalService.hide();
    this.addAttachmentModal.nativeElement.click();

   }

   AttachmentModalOpen(template: TemplateRef<any>) {
    this.initialAttachment = [];
    this.attachmentModalRef = this.bsModalService.show(template);
  }

  closeAttachmentModal(){
    this.attachmentModalRef.hide();
  }

  closeTagsModal(){
    this.tagModalRef.hide();
  }

  openTagModal(template: TemplateRef<any>) {
    this.initialTagList = [];
    this.tagModalRef = this.bsModalService.show(template);
  }

  isValidAttachments(){
   if(this.initialAttachment == undefined || this.initialAttachment.length == 0){
    this.isAttachmentsValid = false;
      return;
   }

   this.attachment = [ ...this.attachment, ...this.initialAttachment];
   this.isAttachmentsValid = true;
    this.closeAttachmentModal();
   }

   reelsTab(){
    this.totalFilesLength = 0;
   }

}

   

