import { Component, ElementRef, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReelsService } from 'src/root/service/reels.service';

@Component({
    selector: 'reels-view',
    templateUrl: 'reelsView.component.html',
    styleUrls: ['reelsView.component.css'],
  })
  
  export class ReelsViewComponent implements OnInit {

    private _reelsService;
    reelId!:string;
    reels:any;
    isOpenSidebar:boolean = false;
    isDataLoaded:boolean = false;
    showCommentsField:boolean = false;

    constructor(private route: ActivatedRoute,reelsService: ReelsService,private activatedRoute: ActivatedRoute) { 
        // super(injector);
          this._reelsService = reelsService;
  
      }

    ngOnInit(): void {
        this.reelId = this.route.snapshot.paramMap.get('id') ?? '';

        this._reelsService.getReelById(this.reelId).subscribe((response) => {
            this.reels = response;
            this.isDataLoaded = true;
            // this.loadingIcon = false;
          });

    }

    showComments(){
        if(this.showCommentsField){
            this.showCommentsField = false;
        }
        else{
            this.showCommentsField = true;
        }
    }

    back(): void {
        window.history.back();
      }

    openSidebar(){
        this.isOpenSidebar = true;
    
      }

  }