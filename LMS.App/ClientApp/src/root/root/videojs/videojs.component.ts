import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Injector, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
    @Input() isClassCourseThumbnail:boolean=false;
    @Input() isReelView:boolean=false;
    @ViewChild('disVideo', { read: ElementRef }) disVideo!:ElementRef;
    player: videojs.Player = new Object as videojs.Player;

  constructor(private cd: ChangeDetectorRef,) { }

  ngOnInit(): void {
    this.onWindowResize();
    this.cd.detectChanges();
    if (this.isReelView) {
      if(this.isScreenMobile){
        this.player = videojs(this.disVideo.nativeElement, {
          autoplay: 'muted',
          loop: true,
          controlBar: {
            fullscreenToggle: false
          },
          userActions:{
            doubleClick: false
          }
        });
      } else{
        this.player = videojs(this.disVideo.nativeElement, {
          autoplay: 'muted',
          loop: true
        });
      }
    }
    else {
      this.player = videojs(this.disVideo.nativeElement);
    }
  }

  pausevideo() {
    this.player.pause();
  }

  //   ngAfterViewInit(): void {
  //     debugger;
  //     videojs("displayVideo"); 
  //   }

  @HostListener('window:resize')
  onWindowResize() {
    this.checkScreenSize();
  }

  // isScreenPc!: boolean;
  // isScreenTablet!: boolean;
  isScreenMobile!: boolean;

  private checkScreenSize() {
    const screenWidth = window.innerWidth;
    // this.isScreenPc = screenWidth >= 992;
    // this.isScreenTablet = screenWidth >= 768 && screenWidth < 992;
    this.isScreenMobile = screenWidth < 768
    if(this.isScreenMobile){
      this.player = videojs(this.disVideo.nativeElement, {
        autoplay: 'muted',
        loop: true,
        controlBar: {
          fullscreenToggle: false
        }
      });
    }
  }





}