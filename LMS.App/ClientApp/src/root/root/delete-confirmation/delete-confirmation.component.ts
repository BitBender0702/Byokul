import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { PostService } from 'src/root/service/post.service';
import { deleteCommentResponse, deletePostResponse } from '../postView/postView.component';
import { CommentLikeUnlike } from 'src/root/interfaces/chat/commentsLike';
import { SignalrService, commentDeleteResponse } from 'src/root/service/signalr.service';

export const deleteModalPostResponse = new Subject<{ postId: string }>();

@Component({
    selector: 'app-delete-confirmation',
    templateUrl: './delete-confirmation.component.html',
    styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit {

    id: any;
    item: any;
    from:any;
    loadingIcon: boolean = false;
    commentLikeUnlike!: CommentLikeUnlike;
    isDeleteComment:boolean = false;
    constructor(private bsModalService: BsModalService, public options: ModalOptions, private _postService: PostService, private cd: ChangeDetectorRef, private _signalRService: SignalrService) { }

    ngOnInit(): void {
        this.getSenderInfo();
        this.item = this.options.initialState?.item;
        this.from = this.options.initialState?.from;
        if(this.from == "deleteComment"){
            this.isDeleteComment = true;
        } else{
            this.isDeleteComment = false;
        }
        debugger;
    }

    initializeCommentLikeUnlike() {
        this.commentLikeUnlike = {
          commentId: "",
          userId: "",
          likeCount: 0,
          isLike: false,
          groupName: ""
        }
    
      }

    deleteItemById() {
        debugger;
        this.id = this.options.initialState?.id

        this.loadingIcon = true;
        this._postService.deletePost(this.id).subscribe((_response) => {
            this.bsModalService.hide();
            this.loadingIcon = false;
            deletePostResponse.next({ postId: this.id });
        });

    }

    close() {
        this.bsModalService.hide(this.bsModalService.config.id)
    }

    userId:any;
    getSenderInfo() {
        var validToken = localStorage.getItem("jwt");
        if (validToken != null) {
          let jwtData = validToken.split('.')[1]
          let decodedJwtJsonData = window.atob(jwtData)
          let decodedJwtData = JSON.parse(decodedJwtJsonData);
          this.userId = decodedJwtData.jti;
        }
      }

    deleteComment() {
        debugger;
        this.initializeCommentLikeUnlike();
        this.commentLikeUnlike.userId = this.userId;
        this.commentLikeUnlike.commentId = this.item.id;
        this.commentLikeUnlike.groupName = this.item.groupName;
        if(this.userId == this.item.userId){
          this._signalRService.notifyCommentDelete(this.commentLikeUnlike);
          this.close();
          commentDeleteResponse.next({ commentId: this.item.id });
        }
    }

}
