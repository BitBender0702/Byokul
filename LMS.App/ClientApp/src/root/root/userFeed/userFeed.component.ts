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
import { CreatePostComponent } from '../createPost/createPost.component';
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
    isOwner!:boolean;
    userId!:string;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    private _postService;

    constructor(private bsModalService: BsModalService,postService: PostService,public userService:UserService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
         this._userService = userService;
         this._postService = postService;
    }
  
    ngOnInit(): void {
      this.loadingIcon = true;
      this.isOwnerOrNot();
        // for global feed
        this._userService.getMyFeed().subscribe((response) => {
            this.myFeeds = response;
            this.loadingIcon = false;
            this.isDataLoaded = true;
          });

          // this._userService.getGlobalFeed().subscribe((response) => {
          //   this.globalFeeds = response;
          //   console.log(this.globalFeeds);
          // });

          this.InitializeLikeUnlikePost();



    }

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    profileGrid(){
        this.isProfileGrid = true;
  
      }
  
      profileList(){
        this.isProfileGrid = false;
  
      }

      saveUserPreference(title:string,description:string,postTags:any){
      var tagString = '';
      postTags.forEach(function (item:any) {
        tagString = tagString + item.postTagValue
      }); 

      var preferenceString = (title??'') + ' ' + (description??'') + ' ' + tagString??'';
      this._userService.saveUserPreference(preferenceString).subscribe((response) => {
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

      getGlobalFeeds(){
       if(this.globalFeeds == undefined){

        this.loadingIcon = true;
        this._userService.getGlobalFeed().subscribe((response) => {
            this.globalFeeds = response;
            this.loadingIcon = false;
            console.log(this.globalFeeds);
          });
        }

      }

      isOwnerOrNot(){
        var validToken = localStorage.getItem("jwt");
          if (validToken != null) {
            let jwtData = validToken.split('.')[1]
            let decodedJwtJsonData = window.atob(jwtData)
            let decodedJwtData = JSON.parse(decodedJwtJsonData);
            this.userId = decodedJwtData.jti;
          }
          
      }

      openPostModal(): void {
        const initialState = {
          userId: this.userId,
          from: "user"
        };
          this.bsModalService.show(CreatePostComponent,{initialState});
      }

      likeUnlikePosts(postId:string, isLike:boolean){
        this.currentLikedPostId = postId;

        this.myFeeds.filter((p : any) => p.id == postId).forEach( (item : any) => {
          var likes: any[] = item.likes;
          var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
        if(isLiked.length != 0){
          this.isLiked = false;
          this.likesLength = item.likes.length - 1;
          item.isPostLikedByCurrentUser = false;
        }
        else{
          this.isLiked = true;
          this.likesLength = item.likes.length + 1;
          item.isPostLikedByCurrentUser = true;
      
        }
        }); 
        
       
        this.likeUnlikePost.postId = postId;
        this.likeUnlikePost.isLike = isLike;
        this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
        this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      
      
           this.myFeeds.filter((p : any) => p.id == postId).forEach( (item : any) => {
            var itemss = item.likes;
            item.likes = response;
          }); 
      
      
      
      
           this.InitializeLikeUnlikePost();
           console.log("succes");
        });
      
      
      }

      likeUnlikeGlobalPosts(postId:string, isLike:boolean){
        this.currentLikedPostId = postId;

        this.globalFeeds.filter((p : any) => p.postId == postId).forEach( (item : any) => {
          var likes: any[] = item.likes;
          var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
        if(isLiked.length != 0){
          this.isLiked = false;
          this.likesLength = item.likes.length - 1;
          item.isPostLikedByCurrentUser = false;
        }
        else{
          this.isLiked = true;
          this.likesLength = item.likes.length + 1;
          item.isPostLikedByCurrentUser = true;
      
        }
        }); 
        
       
        this.likeUnlikePost.postId = postId;
        this.likeUnlikePost.isLike = isLike;
        this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
        this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      
      
           this.globalFeeds.filter((p : any) => p.postId == postId).forEach( (item : any) => {
            var itemss = item.likes;
            item.likes = response;
          }); 
      
      
      
      
           this.InitializeLikeUnlikePost();
           console.log("succes");
        });
      
      
      }

}
