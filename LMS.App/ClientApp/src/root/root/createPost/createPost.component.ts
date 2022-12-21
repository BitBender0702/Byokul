import { Component, ElementRef, Input, OnInit, ViewChild, inject, Inject, TemplateRef } from '@angular/core';
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

import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Calendar } from 'primeng/calendar';

@Component({
  selector: 'create-post',
  templateUrl: 'createPost.component.html',
  styleUrls: ['createPost.component.css'],
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
  reel:any;
  uploadReel!:any;
  isDataLoaded:boolean = false;
  scheduleTime!:Date;
  currentDate!:string;
  loadingIcon:boolean = false;

  initialState:any;
  schoolId:any;

  @ViewChild("calendar", { static: false }) private calendar!: Calendar;

  attachmentModalRef!: BsModalRef;
  tagModalRef!: BsModalRef;


  // @ViewChild('createPostModal', { static: true }) modal!: any;



  
  constructor(private domSanitizer: DomSanitizer,private bsModalService: BsModalService,public options: ModalOptions,private fb: FormBuilder,postService: PostService,private http: HttpClient) {
    this._postService = postService;
  }

  ngOnInit(): void {
    debugger
    // this.bsModalService.show(this.templatefirst);
    this.loadingIcon = true;
    //this.schoolId = this.options.schoolId;
    var initialValue = this.options.initialState;
    // public activeModal: NgbActiveModal in constructor




    if(initialValue?.from == "school"){
    this.schoolId = initialValue.schoolId;
    this._postService.getSchool(this.schoolId).subscribe((response) => {
      debugger
      this.parentDetails = response;
      this.loadingIcon = false;
      this.isDataLoaded = true;
    });
   }

   if(initialValue?.from == "class"){
    this.classId = initialValue.classId;
    this._postService.getClass(this.classId).subscribe((response) => {
      debugger
      this.parentDetails = response;
     
    });

   }

   if(initialValue?.from == "user"){
    this.userId = initialValue.userId;
    this._postService.getUser(this.userId).subscribe((response) => {
      debugger
      this.parentDetails = response;
     
    });

   }

   if(this.courseId != undefined){
    this._postService.getCourse(this.courseId).subscribe((response) => {
      debugger
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

    this.initializeImageObject();
    this.initializeVideoObject();


   }

  //  openModalPopup(){
  //   if(this.isOpenModal){
  //     debugger
  //     //this.CreatePostModal.nativeElement.click();
  //     this.openFirstModal();
        
  //    }
  //  }

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
    debugger
      this.images.push(event.target.files[0]);
      const reader = new FileReader();
      reader.onload = (_event) => { 
        debugger
        this.imageObject.imageUrl = _event.target?.result;
        this.imageObject.name = event.target.files[0].name;
          this.uploadImage.push(this.imageObject); 
          this.initializeImageObject();
      }
      reader.readAsDataURL(event.target.files[0]); 
   }

   removeUploadImage(image:any){
    debugger
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
      debugger
      this.videoObject.videoUrl = _event.target?.result;
      this.videoObject.name = event.target.files[0].name;
        this.uploadVideo.push(this.videoObject); 
        this.initializeVideoObject();
    }
    reader.readAsDataURL(event.target.files[0]); 
 }

 removeUploadVideo(video:any){
  debugger
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
  debugger
    this.attachment.push(event.target.files[0]);
    console.log(this.attachment);
 }

 removeAttachment(attachment:any){
  debugger
  const attachmentIndex = this.attachment.findIndex((item) => item.name ===attachment.name);
  if (attachmentIndex > -1) {
    this.attachment.splice(attachmentIndex, 1);
  }


 }

 handleReels(event:any){
  debugger
  this.postToUpload.append('uploadVideos', event.target.files[0]);
  this.reel = event.target.files[0];
  //this.postToUpload.append("uploadReels", event.target.files[0], event.target.files[0].name);

  const reader = new FileReader();
    reader.onload = (_event) => { 
      debugger
        this.uploadReel = _event.target?.result; 
        this.uploadReel = this.domSanitizer.bypassSecurityTrustUrl(this.uploadReel);
    }
    reader.readAsDataURL(event.target.files[0]); 
 }

 removeUploadReel(uploadReel:any){
  debugger
  this.postToUpload.set('uploadVideos','');
  this.uploadReel = null; 

 }

   savePost(){
    debugger
    this.isSubmitted=true;
    if (!this.createPostForm.valid) {
      return;
    }

    if(this.scheduleTime != undefined){
     if(this.scheduleTime < new Date()){
       debugger
       this.createPostForm.setErrors({ unauthenticated: true });
       return;

    }
  }
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
    this.postToUpload.append('dateTime',post.scheduleTime.toISOString());


    this._postService.createPost(this.postToUpload).subscribe((response:any) => {
      this.isSubmitted=false;
      this.postToUpload = new FormData();
      this.ngOnInit();
    });


   }

   postFrom(){
    debugger
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
      this.appendData('',this.courseId,this.parentDetails.school.schoolId,PostAuthorTypeEnum.Course.toString());
    }
   }

   appendData(authorId:string, parentId:string, ownerId:string, postAuthorType:string){
    debugger
      this.postToUpload.append('authorId', authorId);
      this.postToUpload.append('parentId', parentId);
      this.postToUpload.append('ownerId', ownerId);
      this.postToUpload.append('postAuthorType', postAuthorType);
      this.postToUpload.append('postTags', JSON.stringify(this.tagLists))

   }

   saveReels(){
    debugger
    this.isSubmitted = true;
    if (!this.createReelForm.valid) {
      return;
    }

    if(this.scheduleTime != undefined){
      if(this.scheduleTime < new Date()){
        debugger
        this.createReelForm.setErrors({ unauthenticated: true });
        return;
     }
    }

    this.loadingIcon = true;
    var reel =this.createReelForm.value;
    this.postFrom();
    this.postToUpload.append('postType', PostTypeEnum.Reel.toString());
    this.postToUpload.append('dateTime', reel.scheduleTime.toISOString());

    // this.postToUpload.append('dateTime', reel.scheduleTime == undefined ? null | reel.scheduleTime.toISOString());

    this._postService.createPost(this.postToUpload).subscribe((response:any) => {
      this.isSubmitted=false;
      this.postToUpload = new FormData();
      this.ngOnInit();
    });


   }



   removeTags(tag:any){
    debugger
    const tagIndex = this.tagLists.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.tagLists.splice(tagIndex, 1);
    }
   }

   isValidTags(){
    debugger
    var re = this.tagLists;
    if(this.tagLists == undefined || this.tagLists.length == 0){
      this.isTagsValid = false;
      return;
    }

    this.isTagsValid = true;
    this.closeTagsModal();
    //this.openCreatePostModal();

   }

  //  private closeTagModal(): void {
  //   this.TagModal.nativeElement.click();
  // }

  private openCreatePostModal(): void {
    debugger
    //this.CreatePostModal.nativeElement.click();
  }


  private openFirstModal(): void {
    debugger
    this.openFirst.nativeElement.click();
  }

  onEnter(tags:any) {
    debugger
    this.tagLists.push(tags);
    this.tags = '';
  }


  closeCreatePostModal(){
    debugger
   // this.activeModal.dismiss('Close click');

  }

  openAttachmentModal(){
    debugger
   // this.activeModal.dismiss('Close click');
    this.addAttachmentModal.nativeElement.click();
    


  }

  close(): void {
    debugger
    this.bsModalService.hide();
    this.addAttachmentModal.nativeElement.click();
    //this.createPostModal.hide();
  }





  // for ngx
  show() {
    debugger
    this.bsModalService.show(this.templatefirst);
    this.createPostModal.show();
   }

   hide() {
    debugger
    this.addAttachmentModal.nativeElement.click();
    //this.createPostModal.hide();
   }

   openAttachment(){
    debugger
    this.bsModalService.hide();
    this.addAttachmentModal.nativeElement.click();

   }

   AttachmentModalOpen(template: TemplateRef<any>) {
    debugger
    // this.bsModalService.hide();
    this.attachmentModalRef = this.bsModalService.show(template);
    
    //this.openAttachmentModals.nativeElement.click();
    // this.closePostM.nativeElement.click();
    // //this.bsModalService.hide();
    // this.modalRef2 = this.bsModalService.show(template, { class: 'second' });
  }

  closeAttachmentModal(){
    debugger
    this.attachmentModalRef.hide();

  }

  closeTagsModal(){
    debugger
    this.tagModalRef.hide();

  }

  openTagModal(template: TemplateRef<any>) {
    debugger
    // this.bsModalService.hide();
    this.tagModalRef = this.bsModalService.show(template);
    
    //this.openAttachmentModals.nativeElement.click();
    // this.closePostM.nativeElement.click();
    // //this.bsModalService.hide();
    // this.modalRef2 = this.bsModalService.show(template, { class: 'second' });
  }

  isValidAttachments(){
    debugger
   if(this.attachment == undefined || this.attachment.length == 0){
    this.isAttachmentsValid = false;
      return;
   }

   this.isAttachmentsValid = true;
    this.closeAttachmentModal();
   }

   
  
    
}

   

