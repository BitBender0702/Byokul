import {Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from '../sharedModule/Multilingual/multilingual.component';
import { Subscription } from 'rxjs';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { notificationResponse } from 'src/root/service/signalr.service';
import { NotificationViewModel } from 'src/root/interfaces/notification/notificationViewModel';
import { paymentStatusResponse } from '../payment/payment.component';

@Component({
    selector: 'fileStorage',
    templateUrl: './paymentResponseModal.component.html',
    styleUrls: ['./paymentResponseModal.component.css'],
    providers: [MessageService]
  })

export class PaymentResponseModalComponent extends MultilingualComponent implements OnInit, OnDestroy {

  isPaymentSuccess!:boolean;
  from!:string;
  loadingIcon: boolean = false;
  paymentStatus: boolean = false;
  notificationViewModel!:NotificationViewModel;
  changeLanguageSubscription!:Subscription;
  constructor(injector: Injector,public options: ModalOptions,private bsModalService: BsModalService) { 
    super(injector);
  }

  ngOnInit(): void {
    debugger
    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage?? '');
    this.loadingIcon = false;
    var paymentInfo = this.options.initialState;
    var paymentStatus = paymentInfo?.paymentDetails;
    // var test = this.isPaymentSuccess;
    paymentStatusResponse.next({loadingIcon: false});
    notificationResponse.next(this.notificationViewModel);

    if(!this.changeLanguageSubscription){
      this.changeLanguageSubscription = changeLanguage.subscribe(response => {
        this.selectedLanguage = localStorage.getItem("selectedLanguage");
        this.translate.use(this.selectedLanguage?? '');
      })
    }
  }

  ngOnDestroy(): void {
    if(this.changeLanguageSubscription){
      this.changeLanguageSubscription.unsubscribe();
    }
  }

  back(): void {
    window.history.back();
  }

  closeModal(){
    this.bsModalService.hide(this.bsModalService.config.id);
  }
}