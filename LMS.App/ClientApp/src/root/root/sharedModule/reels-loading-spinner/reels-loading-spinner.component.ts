import { Component, Injector, Input, OnInit } from '@angular/core';

@Component({
  selector: 'reels-loading-spinner',
  templateUrl: 'reels-loading-spinner.component.html',
  styleUrls: []
})
export class ReelsLoadingSpinnerComponent implements OnInit {

    @Input() reelsLoadingIcon:boolean = false;

  constructor() {}

  ngOnInit(): void {

  }

}
