import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/api';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PostService } from 'src/root/service/post.service';
import videojs from 'video.js';
import 'video.js/dist/video-js.css'
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';
import { CreatePostComponent, addPostResponse } from '../createPost/createPost.component';
import { SignalrService } from 'src/root/service/signalr.service';
import { Meta } from '@angular/platform-browser';
import { Tooltip } from 'primeng/tooltip';

export const sharedPostResponse =new Subject<{postType:number,postId:string}>();  

declare var require: any;
require('videojs-contrib-quality-levels');
require('videojs-hls-quality-selector');

@Component({
  selector: 'share-post',
  templateUrl: './sharePost.component.html',
  styleUrls: ['./sharePost.component.css'],
  providers: [MessageService],

})

export class SharePostComponent implements OnInit {

   get apiUrl(): string {
     return environment.apiUrl;
   }
    postId!:string;
    postType!:number;
    schoolName!:string;
    className!:string;
    coursename!:string;
    courseName!:string;
    userId!:string;
    private _postService;
    private _signalrService;
    post!:any;
    websiteUrl:any;
    streamUrl!:any;
    streamId!:string;

    schoolId!: string;
    classId!: string;
    courseId!: string;
    from!: string;
    isShareProfile!: boolean;

    reelId!:string;


  constructor(private bsModalService: BsModalService,private elementRef: ElementRef,private meta: Meta,private options: ModalOptions,public messageService: MessageService,postService: PostService,signalrService:SignalrService,private router: Router) {
    this._postService = postService;
    this._signalrService = signalrService;
  }

  ngOnInit(): void {
    debugger
    this.post = this.options.initialState;
    if(this.post.schoolName != undefined && this.post.className == undefined && this.post.courseName == undefined){
      const encodedSchoolName = encodeURIComponent(this.post.schoolName.split(" ").join("").toLowerCase());
      this.websiteUrl = `${this.apiUrl}/profile/school/` + encodedSchoolName;
    }
    if(this.post.postId != undefined){
      this.addFbMetaTags(this.post.title,this.post.description,this.post.image,`${this.apiUrl}/user/post/` + this.post.postId,"profile");
      this.addTwitterMetaTags(this.post.title,this.post.description,this.post.image);
      if(this.postType==3){
        this.websiteUrl = `${this.apiUrl}/user/reels/` + this.reelId;
      }
      else this.websiteUrl = `${this.apiUrl}/user/post/` + this.post.postId;
    }

    if(this.post.className != undefined){
      this.addFbMetaTags(this.post.title,this.post.description,this.post.image,`${this.apiUrl}/profile/class/` + this.post.schoolName + '/' + this.post.className,"profile");
      this.addTwitterMetaTags(this.post.title,this.post.description,this.post.image);
      const encodedSchoolName = encodeURIComponent(this.post.schoolName.split(" ").join("").toLowerCase());
      const encodedClassName = encodeURIComponent(this.post.className.split(" ").join("").toLowerCase());
      this.websiteUrl = `${this.apiUrl}/profile/class/` + encodedSchoolName + '/' + encodedClassName;
    }
    if(this.post.courseName != undefined){
      this.addFbMetaTags(this.post.title,this.post.description,this.post.image,`${this.apiUrl}/profile/course/` + this.post.schoolName + '/' + this.post.courseName,"profile");
      this.addTwitterMetaTags(this.post.title,this.post.description,this.post.image);
      const encodedSchoolName = encodeURIComponent(this.post.schoolName.split(" ").join("").toLowerCase());
      const encodedCourseName = encodeURIComponent(this.post.courseName.split(" ").join("").toLowerCase());
      this.websiteUrl = `${this.apiUrl}/profile/course/` + encodedSchoolName + '/' + encodedCourseName;
    }

    if(this.streamUrl != undefined){
      this.websiteUrl = this.streamUrl;
    }

    if(this.schoolId != undefined && this.schoolName != undefined){
      const encodedSchoolName = encodeURIComponent(this.schoolName.split(" ").join("").toLowerCase());
      this.websiteUrl = `${this.apiUrl}/profile/school/` + encodedSchoolName;
    }
    
    if(this.classId != undefined && this.schoolName != undefined && this.className != undefined){
      const encodedSchoolName = encodeURIComponent(this.schoolName.split(" ").join("").toLowerCase());
      const encodedClassName = encodeURIComponent(this.className.split(" ").join("").toLowerCase());
      this.websiteUrl = `${this.apiUrl}/profile/class/` + encodedSchoolName + '/' + encodedClassName;
    }

    if(this.courseId != undefined && this.schoolName != undefined && this.courseName != undefined){
      const encodedSchoolName = encodeURIComponent(this.schoolName.split(" ").join("").toLowerCase());
      const encodedCourseName = encodeURIComponent(this.courseName.split(" ").join("").toLowerCase());
      this.websiteUrl = `${this.apiUrl}/profile/course/` + encodedSchoolName + '/' + encodedCourseName;
    }

    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
    }
}

addFbMetaTags(title:string, description:string, image:string,url:string,type:string){
  const tagsExists = this.meta.getTag('property="og:title"');
  if(tagsExists){
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content:  url });
}
else{
  this.meta.addTag({ property: 'og:title', content: title });
  this.meta.addTag({ property: 'og:type', content: type });
  this.meta.addTag({ property: 'og:description', content: description });
  this.meta.addTag({ property: 'og:image', content: image });
  this.meta.addTag({ property: 'og:url', content: url });
}
}

addTwitterMetaTags(title:string,description:string,image:string){
  const tagsExists = this.meta.getTag('property="og:title"');
  if(tagsExists){
    this.meta.updateTag({ name: 'twitter:card', content: "summary_large_image" });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:site', content: "@byokul" });
    this.meta.updateTag({ name: 'twitter:image', content:  image });
  }
  else{
    this.meta.addTag({ name: 'twitter:card', content: "summary_large_image" });
    this.meta.addTag({ name: 'twitter:title', content: title });
    this.meta.addTag({ name: 'twitter:description', content: description });
    this.meta.addTag({ name: 'twitter:site', content: "@byokul" });
    this.meta.addTag({ name: 'twitter:image', content: image });
  }
}

saveUserSharedPost(){
  debugger
    this._postService.saveUserSharedPost(this.userId, this.postId).subscribe((response) => {
        this.close();
        debugger;
        sharedPostResponse.next({postType:this.post.postType,postId:this.post.postId}); 

        //this.router.navigateByUrl(`user/userProfile/${this.userId}`);
    });
}

  close(): void {
    this.bsModalService.hide(this.bsModalService.config.id);
  }

  shareStream(){
    debugger
    if(this.streamUrl != undefined){
      this._signalrService.notifyShareStream(this.streamId + "_group");
      this._postService.saveUserSharedPost(this.userId,this.streamId).subscribe((result) => {
    });
  }
}

copyMessage(){
  debugger
  var url = this.websiteUrl;
  if(this.schoolName != undefined && this.className == undefined && this.courseName == undefined){
    const encodedSchoolName = encodeURIComponent(this.schoolName.split(" ").join("").toLowerCase());
     url = `${this.apiUrl}/profile/school/` + encodedSchoolName;
  }

  if(this.schoolName != undefined && this.className != undefined && this.courseName == undefined){
    const encodedSchoolName = encodeURIComponent(this.schoolName.split(" ").join("").toLowerCase());
    const encodedClassName = encodeURIComponent(this.className.split(" ").join("").toLowerCase());
    url = `${this.apiUrl}/profile/class/` + encodedSchoolName + "/" + encodedClassName;
  }

  if(this.schoolName != undefined && this.className == undefined && this.courseName != undefined){
    const encodedSchoolName = encodeURIComponent(this.schoolName.split(" ").join("").toLowerCase());
    const encodedCourseName = encodeURIComponent(this.courseName.split(" ").join("").toLowerCase());
    url = `${this.apiUrl}/profile/course/` + encodedSchoolName + "/" + encodedCourseName;
  }
  const inputElement = this.elementRef.nativeElement.appendChild(document.createElement('input'));
  inputElement.value = url;
  inputElement.select();
  
  // Execute the copy command
  document.execCommand('copy');
  
  // Remove the temporary input element
  this.elementRef.nativeElement.removeChild(inputElement);
}


openSharePostModal(){
  debugger
  // this.bsModalService.hide(this.bsModalService.config.id);
  const initialState = {
    schoolId: this.schoolId,
    classId: this.classId,
    courseId: this.courseId,
    from: this.from,
    isLiveTabOpen: false,
    isShareProfile: true
  };
  this.bsModalService.show(CreatePostComponent, { initialState });
}
  

}
