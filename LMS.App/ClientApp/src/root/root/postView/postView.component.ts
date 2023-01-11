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

    showCommentsField:boolean = false;
    messageToGroup!:string;
    private _postService;
    likeUnlikePost!: LikeUnlikePost;
    postView!:PostView;

    constructor(private bsModalService: BsModalService,public postService:PostService, public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 
         this._postService = postService;
    }
  
    ngOnInit(): void {
      debugger
      this.posts = this.options.initialState;
      this.likeUnlikePost = {
        postId: '',
        userId: '',
        isLike:false,
        commentId:''
       };

       this.postView ={
        postId:'',
        userId:''
       }

      // here we count ++ for view
      this.postView.postId = this.posts.posts[0].post.id;
      this._postService.postView(this.postView).subscribe((response) => {
        debugger
     });

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
  likeUnlikePosts(postId:string,isLike:boolean){
    debugger
    this.likeUnlikePost.postId = postId;
    this.likeUnlikePost.isLike = isLike;
    this.likeUnlikePost.commentId = '00000000-0000-0000-0000-000000000000'
    this._postService.likeUnlikePost(this.likeUnlikePost).subscribe((response) => {
       debugger
       console.log("succes");
    });


  }
}
