import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';
// import * as $ from 'jquery';
declare const $: any;
import 'slick-carousel/slick/slick';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/root/service/user.service';
import videojs from 'video.js';

@Component({
    selector: 'fileStorage',
    templateUrl: './reelsSlider.component.html',
    styleUrls: ['./reelsSlider.component.css'],
    providers: [MessageService]
  })

export class ReelsSliderComponent implements OnInit {
    private _userService;
    reelsPageNumber:number = 1;
    reels:any;
    isDataLoaded:boolean = false;
    loadingIcon:boolean = false;
    private videoPlayer!: videojs.Player;

    constructor(private  route: ActivatedRoute, private userService:UserService,private cd: ChangeDetectorRef) {
        this._userService = userService;
     }

    ngOnInit() {
        debugger
        this.loadingIcon = true;
        var userId = this.route.snapshot.paramMap.get('userId')??'';
        this._userService.getReelsByUserId(userId, this.reelsPageNumber).subscribe((response) => {
            debugger
            this.reels = response;
            this.loadingIcon = false;
            this.isDataLoaded = true;
            this.cd.detectChanges();

            this.videoPlayer = videojs('videoPlayer', {
                // Set any additional options or plugins for Video.js here
              });
            var res = document.getElementsByClassName("slick");
            var res1 = document.getElementsByClassName("vertical-slider");
            $('.slick', '.vertical-slider').slick({
                vertical: true,
                verticalSwiping: true,
                slidesToShow: 1,
                slidesToScroll: 1
            });
         });
        //  setTimeout(() => {
        //     debugger
        //     var res = document.getElementsByClassName("slick");
        //     var res1 = document.getElementsByClassName("vertical-slider");
        //     $('.slick', '.vertical-slider').slick({
        //         vertical: true,
        //         verticalSwiping: true,
        //         slidesToShow: 1,
        //         slidesToScroll: 1
        //     });
        //   }, 10000);
     }
  
    // ngAfterViewInit() {
    //     debugger
    //     // setTimeout(() => {
    //     //     debugger
    //     //     $('.slider').slick();
    //     //   }, 100);
    // //   $('.slider').slick();
    // }

    back(): void {
       window.history.back();
    }
}