import {Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'fileStorage',
    templateUrl: './faq.component.html',
    styleUrls: ['./faq.component.css'],
    providers: [MessageService]
  })

export class FaqComponent extends MultilingualComponent {

    back(): void {
       window.history.back();
    }
}