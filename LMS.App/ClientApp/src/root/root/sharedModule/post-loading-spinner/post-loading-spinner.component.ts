import { Component, Injector, Input, OnInit } from '@angular/core';

@Component({
  selector: 'post-loading-spinner',
  templateUrl: 'post-loading-spinner.component.html',
  styleUrls: []
})
export class PostLoadingSpinnerComponent implements OnInit {

    @Input() postLoadingIcon:boolean = false;

  constructor() {}

  ngOnInit(): void {

  }

}
