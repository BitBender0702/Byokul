import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { EditClassModel } from 'src/root/interfaces/class/editClassModel';
import { ClassService } from 'src/root/service/class.service';
import { PostService } from 'src/root/service/post.service';
import { DomSanitizer } from '@angular/platform-browser';
import { UploadImage } from 'src/root/interfaces/post/uploadImage';
import { UploadVideo } from 'src/root/interfaces/post/uploadVideo';
//import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
  selector: 'create-post',
  templateUrl: 'createPost.component.html',
  styleUrls: ['createPost.component.css'],
})

export class CreatePostComponent implements OnInit {

  @Input() isOpenModal!:boolean;
  @Input() schoolId!:string;

  @ViewChild('openModal') openModal!: ElementRef;

  private _postService;
  //createPostForm!:FormGroup;
  isSubmitted: boolean = false;
  //fileToUpload= new FormData();
  //items!: MenuItem[];

  schoolDetails:any;
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
  attachment:string[] = [];

  @ViewChild('createPostModal', { static: true }) modal!: any;


  
  constructor(private fb: FormBuilder,postService: PostService,private http: HttpClient) {
    this._postService = postService;
  }

  ngOnInit(): void {
    debugger

    this._postService.getSchool(this.schoolId).subscribe((response) => {
      this.schoolDetails = response;
      // this.openModalPopup();
     
    });

    this.createPostForm = this.fb.group({
      title: this.fb.control('',[Validators.required]),
      bodyText: this.fb.control('',[Validators.required])
    });

    this.createLiveForm = this.fb.group({
      title: this.fb.control(''),
      bodyText: this.fb.control(''),
      coverLetter: this.fb.control('')

    })

    this.initializeImageObject();
    this.initializeVideoObject();


   }

   openModalPopup(){
    if(this.isOpenModal){
      this.openModal.nativeElement.click();
        
     }
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
 }

   savePost(){
    debugger
    this.isSubmitted=true;
    if (!this.createPostForm.valid) {
      return;
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
    this.postToUpload.append('authorId', this.schoolId);
    this.postToUpload.append('title', post.title);
    this.postToUpload.append('description', post.bodyText);
    this.postToUpload.append('parentId', this.schoolId);
    this.postToUpload.append('postAuthorType', "1");
    this.postToUpload.append('postType', "1");



    this._postService.createPost(this.postToUpload).subscribe((response:any) => {
      this.postToUpload = new FormData();
      this.ngOnInit();
    });


   }

   show() {

     this.modal.show();

   }


   
  
    
}

   

