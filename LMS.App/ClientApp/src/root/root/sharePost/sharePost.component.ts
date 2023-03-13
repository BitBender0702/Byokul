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

export const sharedPostResponse =new Subject<{}>();  

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

    postId!:string;
    userId!:string;
    private _postService;

    websiteUrl:any;


  constructor(private bsModalService: BsModalService,private options: ModalOptions,public messageService: MessageService,postService: PostService,private router: Router) {
    this._postService = postService;
  }

  ngOnInit(): void {
    var post = this.options.initialState;
    //this.websiteUrl = `${environment.apiUrl}/user/post/${post?.postId}`;
    this.websiteUrl = "https://byokul.com/user/auth/login"
    var validToken = localStorage.getItem('jwt');
    if (validToken != null) {
      let jwtData = validToken.split('.')[1];
      let decodedJwtJsonData = window.atob(jwtData);
      let decodedJwtData = JSON.parse(decodedJwtJsonData);
      this.userId = decodedJwtData.jti;
    }
}

saveUserSharedPost(){
    this._postService.saveUserSharedPost(this.userId, this.postId).subscribe((response) => {
        this.close();
        this.router.navigateByUrl(`user/userProfile/${this.userId}`);
    });
}

  close(): void {
    this.bsModalService.hide();
  }
  

}