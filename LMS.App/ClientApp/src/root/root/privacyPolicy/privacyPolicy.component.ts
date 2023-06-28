import {Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';

@Component({
    selector: 'fileStorage',
    templateUrl: './privacyPolicy.component.html',
    styleUrls: ['./privacyPolicy.component.css'],
    providers: [MessageService]
  })

export class PrivecyPolicyComponent {

    back(): void {
       window.history.back();
    }
}