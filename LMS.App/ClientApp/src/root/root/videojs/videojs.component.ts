import {AfterViewInit, ChangeDetectorRef, Component, ElementRef, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

@Component({
    selector: 'videoJs-component',
    templateUrl: './videojs.component.html',
    styleUrls: ['./videojs.component.css'],
    providers: [MessageService]
  })

export class VideoJsComponent implements OnInit {
  selectedLanguage:any;
  changeLanguageSubscription!:Subscription;
    @Input() postAttachment:any;
    @ViewChild('disVideo', { read: ElementRef }) disVideo!:ElementRef;
  constructor(private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    debugger;
    this.cd.detectChanges();
    videojs(this.disVideo.nativeElement); 
  }

//   ngAfterViewInit(): void {
//     debugger;
//     videojs("displayVideo"); 
//   }
}