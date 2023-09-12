import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { PostService } from 'src/root/service/post.service';
import { deletePostResponse } from '../postView/postView.component';

export const deleteModalPostResponse = new Subject<{ postId: string }>();

@Component({
    selector: 'app-delete-confirmation',
    templateUrl: './delete-confirmation.component.html',
    styleUrls: ['./delete-confirmation.component.css']
})
export class DeleteConfirmationComponent implements OnInit {

    id: any
    loadingIcon: boolean = false;
    constructor(private translateService: TranslateService, private bsModalService: BsModalService, public options: ModalOptions, private _postService: PostService, private cd: ChangeDetectorRef) { }

    ngOnInit(): void {

    }

    deleteItemById() {
        debugger;
        this.id = this.options.initialState?.id

        this.loadingIcon = true;
        this._postService.deletePost(this.id).subscribe((_response) => {
            this.close();
            this.loadingIcon = false;
            deletePostResponse.next({ postId: this.id });
        });

    }

    close() {
        this.bsModalService.hide()
    }

}
