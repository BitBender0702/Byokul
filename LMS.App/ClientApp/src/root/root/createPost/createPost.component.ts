import { Component, ElementRef, Input, OnInit, ViewChild, inject, Inject, TemplateRef, EventEmitter } from '@angular/core';
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
import { Calendar } from 'primeng/calendar';
import { Subject } from 'rxjs';

export const addPostResponse =new Subject<{}>();  


@Component({
  selector: 'create-post',
  templateUrl: 'createPost.component.html',
  styleUrls: ['createPost.component.css'],
  providers: [MessageService]
})

export class CreatePostComponent implements OnInit {

  @Input() isOpenModal!:boolean;
  // @Input() schoolId!:string;

  @Input() classId!:any;
  @Input() courseId!:string;
  @Input() userId!:any;


  @ViewChild('openModal') openModal!: ElementRef;
  // @ViewChild('closeTagModal') TagModal!: ElementRef;
  // @ViewChild('openCreatePostModal') CreatePostModal!: ElementRef;

  @ViewChild('openFirst') openFirst!: ElementRef;

  @ViewChild('addAttachmentModal') addAttachmentModal!: ElementRef;

  @ViewChild('closeMainModal') closeMainModal!: ElementRef;


  
  @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;
  // @ViewChild('createPostModal') public createPostModal!:ModalDirective;

  @ViewChild('closePostM') closePostM!: ElementRef;

  
  @ViewChild('openAttachmentModal') openAttachmentModals!: ElementRef;

  @ViewChild('templatefirst') templatefirst!:  TemplateRef<any>;





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
  videos:string[] = [];
  uploadVideo:any[] = [];
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

  public event: EventEmitter<any> = new EventEmitter();

  @ViewChild("calendar", { static: false }) private calendar!: Calendar;

  attachmentModalRef!: BsModalRef;
  tagModalRef!: BsModalRef;


  // @ViewChild('createPostModal', { static: true }) modal!: any;



  
  constructor(private domSanitizer: DomSanitizer,public messageService:MessageService,private bsModalService: BsModalService,public options: ModalOptions,private fb: FormBuilder,postService: PostService,private http: HttpClient) {
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
      name: ''
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
    const reader = new FileReader();
    reader.onload = (_event) => { 
      this.videoObject.videoUrl = _event.target?.result;
      this.videoObject.name = event.target.files[0].name;
        this.uploadVideo.push(this.videoObject); 
        this.initializeVideoObject();
    }
    reader.readAsDataURL(event.target.files[0]); 
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
  const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadReel = _event.target?.result; 
        this.uploadReel = this.domSanitizer.bypassSecurityTrustUrl(this.uploadReel);
    }
    reader.readAsDataURL(event.target.files[0]); 
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

  this.loadingIcon = true;
    // for images
    for(var i=0; i<this.images.length; i++){
      this.postToUpload.append('uploadImages', this.images[i]);
    }

    // for videoes
    for(var i=0; i<this.videos.length; i++){
      this.postToUpload.append('uploadVideos', this.videos[i]);
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
      debugger
      this.isSubmitted=false;
      this.loadingIcon = false;
      this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'Post created successfully'});
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
      // condition
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

    this.loadingIcon = true;
    var reel =this.createReelForm.value;
    this.postFrom();
    this.postToUpload.append('postType', PostTypeEnum.Reel.toString());
    if(reel.scheduleTime != undefined){
    this.postToUpload.append('dateTime', reel.scheduleTime.toISOString());
    }

    this._postService.createPost(this.postToUpload).subscribe((response:any) => {
      debugger
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
    //this.addAttachmentModal.nativeElement.click();
  }

  // for ngx
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

}

   

