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
import { addPostResponse } from '../createPost/createPost.component';
import { SignalrService } from 'src/root/service/signalr.service';
import { Meta } from '@angular/platform-browser';

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
    userId!:string;
    private _postService;
    private _signalrService;
    post!:any;
    websiteUrl:any;
    streamUrl!:any;
    streamId!:string;


  constructor(private bsModalService: BsModalService,private meta: Meta,private options: ModalOptions,public messageService: MessageService,postService: PostService,signalrService:SignalrService,private router: Router) {
    this._postService = postService;
    this._signalrService = signalrService;
  }

  ngOnInit(): void {
    debugger
    this.post = this.options.initialState;
    if(this.post.schoolName != undefined && this.post.className == undefined && this.post.courseName == undefined){
      this.websiteUrl = `${this.apiUrl}/profile/school/` + this.post.schoolName;
    }
    if(this.post.postId != undefined){
      this.addFbMetaTags(this.post.title,this.post.description,this.post.image,`${this.apiUrl}/user/post/` + this.post.postId,"profile");
      this.addTwitterMetaTags(this.post.title,this.post.description,this.post.image);
      this.websiteUrl = `${this.apiUrl}/user/post/` + this.post.postId;
    }

    if(this.post.className != undefined){
      this.addFbMetaTags(this.post.title,this.post.description,this.post.image,`${this.apiUrl}/profile/class/` + this.post.schoolName + '/' + this.post.className,"profile");
      this.addTwitterMetaTags(this.post.title,this.post.description,this.post.image);
      this.websiteUrl = `${this.apiUrl}/profile/class/` + this.post.schoolName + '/' + this.post.className;
    }
    if(this.post.courseName != undefined){
      this.addFbMetaTags(this.post.title,this.post.description,this.post.image,`${this.apiUrl}/profile/course/` + this.post.schoolName + '/' + this.post.courseName,"profile");
      this.addTwitterMetaTags(this.post.title,this.post.description,this.post.image);
      this.websiteUrl = `${this.apiUrl}/profile/course/` + this.post.schoolName + '/' + this.post.courseName;
    }

    if(this.streamUrl != undefined){
      this.websiteUrl = this.streamUrl;
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
  

}
