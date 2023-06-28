import {Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'fileStorage',
    templateUrl: './termsOfService.component.html',
    styleUrls: ['./termsOfService.component.css'],
    providers: [MessageService]
  })

export class TermsOfServiceComponent extends MultilingualComponent {

    back(): void {
       window.history.back();
    }
}