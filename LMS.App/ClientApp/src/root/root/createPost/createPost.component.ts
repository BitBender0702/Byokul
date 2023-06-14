import { Component, ElementRef, Input, OnInit, ViewChild, inject, Inject, TemplateRef, EventEmitter, AfterViewInit, ChangeDetectorRef, QueryList, OnDestroy, Output } from '@angular/core';
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
import { FileStorageService } from 'src/root/service/fileStorage';
import { AutoComplete } from 'primeng/autocomplete';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
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
  @ViewChild('autoComplete', { static: false }) autoComplete!: AutoComplete;
  @ViewChild('templatefirst') templatefirst!:  TemplateRef<any>;
  @ViewChild('videoPlayer') videoPlayers!: QueryList<ElementRef>;

  private _postService;
  private _fileStorageService;
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
  isOpenReelsTab:boolean = false;
  tagCountExceeded:boolean = false;
  reelsTagLists!: string[];
  fileStorageAttachments:any;
  fileAttachmentsForm!:FormGroup;
  filteredFileAttachments!: any[];
  uploadFromFileStorage!:any[];
  isShowingProgressBar!:boolean;
  minDate:any;
  isMicroPhoneOpen:boolean = true;
  scheduleVideoRequired: boolean = false;
  thumbnailRequired: boolean = false;
  isThumbnailUpload: boolean = false;
  isVideoUpload: boolean = false;
  from!:any;

  @Output() onClose: EventEmitter<any> = new EventEmitter<any>();


  constructor(private bsModalRef: BsModalRef,private datePipe: DatePipe,private router: Router,private domSanitizer: DomSanitizer,fileStorageService:FileStorageService, public messageService:MessageService,private bsModalService: BsModalService,public options: ModalOptions,private fb: FormBuilder,postService: PostService,private http: HttpClient,private cd: ChangeDetectorRef) {
    this._postService = postService;
    this._fileStorageService = fileStorageService;
  }

  ngOnInit(): void {
    debugger
    var initialValue = this.options.initialState;
    this.from = initialValue?.from;
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
      title: this.fb.control('',[Validators.required]),
      bodyText: this.fb.control('',[Validators.required]),
      // coverLetter: this.fb.control('',[Validators.required]),
      commentPerMinute: this.fb.control('0'),
      scheduleTime: this.fb.control('')
      // discuss which more fields we need to add there

    })

    this.createReelForm = this.fb.group({
      scheduleTime: this.fb.control(''),
      reelsVideo:this.fb.control([],[Validators.required]),
      title: this.fb.control('',[Validators.required]),
    })

    this.fileAttachmentsForm = this.fb.group({
      fileAttachments:this.fb.control([])
    });

    this._fileStorageService.getFileStorageAttachments().subscribe((response) => {
      this.fileStorageAttachments = response;
    });

    this.tagLists = [];
    this.reelsTagLists = [];
    this.initialTagList = [];
    this.uploadFromFileStorage = [];

    this.initializeImageObject();
    this.initializeVideoObject();
    this.minDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');

     this.progressSubscription = progressResponse.subscribe(response => {
      this.progressBarValue = response.progressCount;
      this.filesLength = this.images.length + this.videos.length + this.attachment.length;
      if(this.progressBarValue == 100 && this.filesLength != this.fileCount){
         this.fileCount += 1;
      }
      this.progressFileName = response.fileName;
      this.cd.detectChanges();
    });

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
    var selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      this.images.push(selectedFiles[i]);
      const reader = new FileReader();
      reader.onload = ((fileIndex) => {
        return () => {
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

   removeUploadImage(image:any){
    const index = this.images.findIndex((item:any) => item.name === image.name);
        if (index > -1) {
          this.images.splice(index, 1);
        }

        const imageIndex = this.uploadImage.findIndex((item:any) => item.name === image.name);
        if (imageIndex > -1) {
          this.uploadImage.splice(imageIndex, 1);
        }

        this.isThumbnailUpload = false;
   }

handleVideoInput(event: any) {
  var selectedFiles = event.target.files;
  for (let i = 0; i < selectedFiles.length; i++) {
    this.videos.push(selectedFiles[i]);
    const file = selectedFiles[i];
    const videoUrl = URL.createObjectURL(file);
    this.getVideoThumbnail(videoUrl,file.name, (thumbnailUrl) => {
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
      this.isVideoUpload = false;
 }

 handleAttachmentInput(event: any) {
  debugger
  var selectedFiles = event.target.files;
  for (let i = 0; i < selectedFiles.length; i++) {
    this.initialAttachment.push(selectedFiles[i]);
  }
 }

 removeAttachment(attachment:any){
  debugger
  const attachmentIndex = this.attachment.findIndex((item) => item.name ===attachment.name);
  if (attachmentIndex > -1) {
    this.attachment.splice(attachmentIndex, 1);
  }

  const initialAttachmentIndex = this.initialAttachment.findIndex((item) => item.fileName ===attachment.fileName);
  if (initialAttachmentIndex > -1) {
    this.initialAttachment.splice(initialAttachmentIndex, 1);

  const fileAttachmentIndex = this.uploadFromFileStorage.findIndex((item) => item.fileName ===attachment.fileName);
  if (fileAttachmentIndex > -1) {
    this.uploadFromFileStorage.splice(fileAttachmentIndex, 1);
  }
    this.cd.detectChanges();

    //const input = this.autocomplete.nativeElement;

    //const input = this.autoComplete.inputEL.nativeElement;

    // this.autocomplete.inputEL.nativeElement.blur();

  }


  // const unselectedFile = event.value;
  // const selectedFiles = this.formGroup.get('fileAttachments').value.filter((file: any) => file !== unselectedFile);
  // this.formGroup.get('fileAttachments').setValue(selectedFiles);


 }

 deselectAutocomplete() {
  debugger
  this.cd.detectChanges();
  const input = this.autoComplete.inputEL.nativeElement;
  input.blur();
  this.autoComplete.onModelChange([]);
  this.autoComplete.hide();
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
      else{
        this.postToUpload.append('scheduleTime', JSON.stringify(this.scheduleTime));
      }
    }
    this.loadingIcon = true;
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

    if(this.uploadFromFileStorage != undefined){
    this.postToUpload.append('UploadFromFileStorage', JSON.stringify(this.uploadFromFileStorage));
    }
    if(post.scheduleTime != undefined){
      this.postToUpload.append('dateTime',post.scheduleTime.toISOString());
    }
    this.postToUpload.append('postTags', JSON.stringify(this.tagLists))
    this._postService.createPost(this.postToUpload).subscribe((response:any) => {  
      this.close();
      this.onClose.emit(response);
      this.isSubmitted=false;
      this.loadingIcon = false;
      addPostResponse.next({response}); 
      this.postToUpload = new FormData();
      // this.ngOnInit();
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
      // this.postToUpload.append('postTags', JSON.stringify(this.tagLists))

   }

   saveReels(){
    this.isSubmitted = true;
    this.isShowingProgressBar = true;
    if (!this.createReelForm.valid) {
      this.isShowingProgressBar = false;
      return;
    }

    if(this.scheduleTime != undefined){
      if(this.scheduleTime < new Date()){
        this.createReelForm.setErrors({ unauthenticated: true });
        return;
     }
    }
    this.loadingIcon = true;
    var reel =this.createReelForm.value;
    this.postFrom();
    for(var i=0; i<this.videoThumbnails.length; i++){
      this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
    }
    this.postToUpload.append('postType', PostTypeEnum.Reel.toString());
    if(reel.scheduleTime != undefined){
    this.postToUpload.append('dateTime', reel.scheduleTime.toISOString());
    }

    this.postToUpload.append('title', reel.title);
    this.postToUpload.append('postTags', JSON.stringify(this.reelsTagLists))

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
    debugger
    if(this.isOpenReelsTab){
      const reelsTagIndex = this.reelsTagLists.findIndex((item) => item ===tag);
      if (reelsTagIndex > -1) {
        this.reelsTagLists.splice(reelsTagIndex, 1);
      }
    }
    else{
    const tagIndex = this.tagLists.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.tagLists.splice(tagIndex, 1);
    }       
  }
  }

   removeInitialTags(tag:any){
    const tagIndex = this.initialTagList.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.initialTagList.splice(tagIndex, 1);
      var tagCount = this.tagLists.length + this.initialTagList.length;
      if(tagCount > 7){
        this.tagCountExceeded = true;
        return; 
      }
      else{
        this.tagCountExceeded = false;
      }
    }
   }

   isValidTags(){
    if(this.initialTagList == undefined || this.initialTagList.length == 0){
      this.isTagsValid = false;
      return;
    }

    var tagCount = this.tagLists.length + this.initialTagList.length;
    if(tagCount > 7){
      this.tagCountExceeded = true;
      return; 
    }
    if(this.isOpenReelsTab){
      this.reelsTagLists = [ ...this.reelsTagLists, ...this.initialTagList];
    }
    else{
      this.tagLists = [ ...this.tagLists, ...this.initialTagList];
    }
    this.isTagsValid = true;
    this.closeTagsModal();
   }

  private openFirstModal(): void {
    this.openFirst.nativeElement.click();
  }

  onInputChange() {
    debugger
    if (this.tags.length > 10) {
      this.tags = this.tags.slice(0, 10);
    }
  }

  onEnter(tags:any) {
    const isBlank = /^\s*$/.test(tags);
    if(isBlank){
      return;
    }

    tags = tags.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
    var tagLists = [ ...this.tagLists, ...this.initialTagList];
    if(tagLists.includes(tags)){
      this.tags = '';
      return;
    }
    this.initialTagList.push(tags);
    this.tags = '';
    var tagCount = this.tagLists.length + this.initialTagList.length;
    this.isTagsValid = true;
    if(tagCount > 7){
      this.tagCountExceeded = true;
      return; 
    }
    else{
      this.tagCountExceeded = false;
    }
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
    this.uploadFromFileStorage = [];
    this.fileAttachmentsForm.setValue({
      fileAttachments: [],
    });
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
    this.tagCountExceeded = false;
    this.isTagsValid = true;
    this.tagModalRef = this.bsModalService.show(template);
  }

  isValidAttachments(){
    debugger
   if(this.uploadFromFileStorage.length == 0 && (this.initialAttachment == undefined || this.initialAttachment.length == 0)){
    this.isAttachmentsValid = false;
      return;
   }

   this.attachment = [ ...this.attachment, ...this.initialAttachment];
   this.isAttachmentsValid = true;
    this.closeAttachmentModal();
   }

   reelsTab(){
    this.totalFilesLength = 0;
    this.isOpenReelsTab = true;
   }

   postTab(){
    this.isOpenReelsTab = false;
   }

   captureAttachmentUrl(event:any){
    debugger
    var fileStorageAttachment = {
      fileName:event.fileName,
      fileUrl:event.fileUrl
    }

    this.uploadFromFileStorage.push(fileStorageAttachment);
    this.initialAttachment.push(fileStorageAttachment);
    this.isAttachmentsValid = true;
   }

   removeFileAttachment(event:any){
    debugger
    const attachmentIndex = this.uploadFromFileStorage.findIndex((item) => item.fileName === event.fileName);
    if (attachmentIndex > -1) {
       this.uploadFromFileStorage.splice(attachmentIndex, 1);
    }

    const attachmentInitialIndex = this.initialAttachment.findIndex((item) => item.fileName === event.fileName);
    if (attachmentInitialIndex > -1) {
      this.initialAttachment.splice(attachmentInitialIndex, 1);
   }
   }

   filterFileAttachments(event:any){
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

   liveStream(){
    debugger
    this.isSubmitted=true;

    if(this.scheduleTime != undefined){
      if(this.scheduleTime < new Date()){
        this.createLiveForm.setErrors({ unauthenticated: true });
        return;
      }
      if(this.videos.length == 0){
        this.scheduleVideoRequired = true;
        return;
      }
    }

    if(this.images.length < 1){
      this.thumbnailRequired = true;
      return;
    }

    if (!this.createLiveForm.valid) {
      return;
    }

        // for videoes
        for(var i=0; i<this.videos.length; i++){
          this.postToUpload.append('uploadVideos', this.videos[i]);
        }

        for(var i=0; i<this.videoThumbnails.length; i++){
          this.postToUpload.append('uploadVideosThumbnail', this.videoThumbnails[i]);
        }

    this.loadingIcon = true;
    var post =this.createLiveForm.value;
    this.postFrom();

    this.postToUpload.append('title', post.title);
    this.postToUpload.append('description', post.bodyText);
    // this.postToUpload.append('coverLetter', post.coverLetter);
    this.postToUpload.append('postType', PostTypeEnum.Stream.toString());
    this.postToUpload.append('postTags', JSON.stringify(this.tagLists));
    this.postToUpload.append('commentsPerMinute', post.commentPerMinute);
    this.postToUpload.append('isMicroPhoneOpen', this.isMicroPhoneOpen.toString());

    
    for(var i=0; i<this.images.length; i++){
      this.postToUpload.append('uploadImages', this.images[i]);
    }

    this._postService.createPost(this.postToUpload).subscribe((response:any) => { 
      debugger
      this.isSubmitted=false;
      this.loadingIcon = false;
      //addPostResponse.next({response}); 
      this.postToUpload = new FormData();
      this.close();
      // const fullNameIndex = response.streamUrl.indexOf('fullName='); // find the index of "fullName="
      // const newUrl = response.streamUrl.slice(fullNameIndex);
      // here we need to send schoolId/classId if stream from those.
      this.router.navigate(
          [`liveStream`,response.id,this.from]
          // { state: { stream: {streamUrl: response.streamUrl, userId:this.userId, meetingId: post.title,from:"user"} } });

      // }
      );
      });

}

openMicroPhone(){
  this.isMicroPhoneOpen = !this.isMicroPhoneOpen;
}
}

   

