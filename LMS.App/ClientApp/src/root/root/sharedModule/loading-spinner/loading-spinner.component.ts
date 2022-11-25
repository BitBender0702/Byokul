import { Component, Injector, Input, OnInit } from '@angular/core';

@Component({
  selector: 'loading-spinner',
  templateUrl: 'loading-spinner.component.html',
  styleUrls: []
})
export class LoadingSpinnerComponent implements OnInit {

    @Input() loadingIcon:boolean = false;

  constructor() {}

  ngOnInit(): void {

  }

}
