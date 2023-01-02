import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService, ModalDirective, ModalOptions } from 'ngx-bootstrap/modal';
import { SchoolService } from 'src/root/service/school.service';

@Component({
    selector: 'post-view',
    templateUrl: './postView.component.html',
    styleUrls: ['./postView.component.css']
  })

export class PostViewComponent implements OnInit {

    posts:any;
    @ViewChild('createPostModal', { static: true }) createPostModal!: ModalDirective;

    constructor(private bsModalService: BsModalService,public options: ModalOptions,private fb: FormBuilder,private router: Router, private http: HttpClient,private activatedRoute: ActivatedRoute) { 

    }
  
    ngOnInit(): void {
      this.posts = this.options.initialState;


     


    }

    show() {
      //this.bsModalService.show(this.templatefirst);
      this.createPostModal.show();
     }

     close(): void {
      this.bsModalService.hide();
      //this.addAttachmentModal.nativeElement.click();
    }
  
}
