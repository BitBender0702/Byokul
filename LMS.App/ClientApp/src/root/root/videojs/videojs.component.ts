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
    @Input() isView:boolean=false;
    @Input() isReelView:boolean=false;
    @ViewChild('disVideo', { read: ElementRef }) disVideo!:ElementRef;
    player: videojs.Player = new Object as videojs.Player;

  constructor(private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    debugger;
    this.cd.detectChanges();
    if(this.isReelView){
      this.player = videojs(this.disVideo.nativeElement,{
        autoplay: 'muted',
        loop: true
      });
    }
    else{
      this.player = videojs(this.disVideo.nativeElement);
    }    
  }

  pausevideo(){
    this.player.pause();
  }

//   ngAfterViewInit(): void {
//     debugger;
//     videojs("displayVideo"); 
//   }
}