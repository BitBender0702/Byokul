import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { UserPreference } from 'src/root/interfaces/post/userPreference';
import { PostService } from 'src/root/service/post.service';
import { SchoolService } from 'src/root/service/school.service';
import { UserService } from 'src/root/service/user.service';
import { PostViewComponent } from '../postView/postView.component';

@Component({
    selector: 'post-view',
    templateUrl: './userFeed.component.html',
    styleUrls: ['./userFeed.component.css']
  })

export class UserFeedComponent implements OnInit {

    showCommentsField:boolean = false;
    messageToGroup!:string;
    private _userService;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;


    isProfileGrid:boolean = true;

    myFeeds:any;
    globalFeeds:any;
    isOpenSidebar:boolean = false;

    constructor(private bsModalService: BsModalService,public userService:UserService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
         this._userService = userService;
    }
  
    ngOnInit(): void {
        // for global feed
        this._userService.getMyFeed().subscribe((response) => {
            debugger
            this.myFeeds = response;
          });

          // this._userService.getGlobalFeed().subscribe((response) => {
          //   debugger
          //   this.globalFeeds = response;
          //   console.log(this.globalFeeds);
          // });



    }

    profileGrid(){
        this.isProfileGrid = true;
  
      }
  
      profileList(){
        this.isProfileGrid = false;
  
      }

      saveUserPreference(title:string,description:string,postTags:any){
      debugger
      var tagString = '';
      postTags.forEach(function (item:any) {
        debugger
        tagString = tagString + item.postTagValue
      }); 

      var preferenceString = (title??'') + ' ' + (description??'') + ' ' + tagString??'';
      this._userService.saveUserPreference(preferenceString).subscribe((response) => {
        debugger
        this.myFeeds = response;
      });


      }

      openSidebar(){
        this.isOpenSidebar = true;
    
      }

      openPostsViewModal(posts:string): void {
        const initialState = {
          posts: posts
        };
        this.bsModalService.show(PostViewComponent,{initialState});
      }

}
