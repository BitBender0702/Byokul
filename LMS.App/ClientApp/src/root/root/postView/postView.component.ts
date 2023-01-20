import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { LikeUnlikePost } from 'src/root/interfaces/post/likeUnlikePost';
import { PostView } from 'src/root/interfaces/post/postView';
import { PostService } from 'src/root/service/post.service';
import { SchoolService } from 'src/root/service/school.service';

@Component({
    selector: 'post-view',
    templateUrl: './postView.component.html',
    styleUrls: ['./postView.component.css']
  })

export class PostViewComponent implements OnInit {

    posts:any;
    @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;

    //

    showCommentsField:boolean = true;
    messageToGroup!:string;
    private _postService;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;
    currentLikedPostId!:string;
    likesLength!:number;
    isLiked!:boolean;
    userId!:string;

    constructor(private bsModalService: BsModalService,public postService:PostService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
         this._postService = postService;
    }
  
    ngOnInit(): void {
      
      this.getLoginUserId();
      this.posts = this.options.initialState;
       this.postView ={
        postId:'',
        userId:''
       }

      // here we count ++ for view
      if(this.posts.posts.postId != null){
        this.addPostView(this.posts.posts.postId);
      }
      else{
      this.addPostView(this.posts.posts.id);
      }
    //   this.postView.postId = this.posts.posts.id;
    //   this._postService.postView(this.postView).subscribe((response) => {
    //  });

     this.InitializeLikeUnlikePost();


    }

    getLoginUserId(){
      var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.userId = decodedJwtData.jti;
      }
    }

    InitializeLikeUnlikePost(){
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

    }

    show() {
      //this.bsModalService.show(this.templatefirst);
      this.createPostModal.show();
     }

     close(): void {
      this.bsModalService.hide();
      //this.addAttachmentModal.nativeElement.click();
    }
  
    showComments(){
      
      if(this.showCommentsField){
          this.showCommentsField = false;
      }
      else{
          this.showCommentsField = true;
      }
  }

  // here from like post
  // likeUnlikePosts(postId:string,isLike:boolean){
  //   this.likeUnlikePost.postId = postId;
  //   this.likeUnlikePost.isLike = isLike;
  //   this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
  //   this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
  //      console.log("succes");
  //   });


  // }

  likeUnlikePosts(postId:string, isLike:boolean){
    this.currentLikedPostId = postId;
    // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
      var likes: any[] = this.posts.posts.likes;
      var isLiked = likes.filter(x => x.userId == this.userId && x.postId == postId);
    if(isLiked.length != 0){
      this.isLiked = false;
      this.likesLength = this.posts.posts.likes.length - 1;
      this.posts.posts.isPostLikedByCurrentUser = false;
    }
    else{
      this.isLiked = true;
      this.likesLength = this.posts.posts.likes.length + 1;
      this.posts.posts.isPostLikedByCurrentUser = true;
  
    }

    
   
    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
      this.posts.posts.likes = response;
       this.InitializeLikeUnlikePost();
       console.log("succes");
    });
  
  
  }

  
  addPostView(postId:string){
    
    if(this.userId != undefined){
    this.postView.postId = postId;
    this._postService.postView(this.postView).subscribe((response) => {
      
      console.log('success');
      this.posts.posts.views.length = response;
      // this.user.posts.filter((p : any) => p.id == postId).forEach( (item : any) => {
      //  var itemss = item.likes;
      //  item.likes = response;
     }); 
    }
  
  }
}
