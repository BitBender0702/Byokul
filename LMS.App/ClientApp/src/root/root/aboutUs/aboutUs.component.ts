import {Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'fileStorage',
    templateUrl: './aboutUs.component.html',
    styleUrls: ['./aboutUs.component.css'],
    providers: [MessageService]
  })

export class AboutUsComponent extends MultilingualComponent {

    back(): void {
      window.history.back();
    }
}