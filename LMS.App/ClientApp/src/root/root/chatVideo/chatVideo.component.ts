import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SchoolService } from 'src/root/service/school.service';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

@Component({
    selector: 'chat-video',
    templateUrl: './chatVideo.component.html',
    styleUrls: ['./chatVideo.component.css']
  })

export class ChatVideoComponent implements OnInit {
    constructor(private bsModalService: BsModalService,private cd: ChangeDetectorRef) { 
    }

    fileUrl!:string;
    fileName!:string;
    isDataLoaded:boolean = false;
    @ViewChild('videoPlayer') videoPlayer!: ElementRef;
  
    ngOnInit(): void {
        debugger
        this.cd.detectChanges();
        videojs(this.videoPlayer.nativeElement, {autoplay: true});
        var modal = document.getElementById('videoChat-modal');
        window.onclick = (event) => {
         if (event.target == modal) {
          if (modal != null) {
           this.bsModalService.hide();
          }
        } 
       }
    }

    close(){
       this.bsModalService.hide();
    }
  
}
