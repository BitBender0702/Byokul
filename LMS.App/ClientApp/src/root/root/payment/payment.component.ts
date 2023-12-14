import { HttpClient } from '@angular/common/http';
import { HtmlParser, Parser } from '@angular/compiler';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { MessageService } from 'primeng/api';
import { Subject, Subscription, subscribeOn } from 'rxjs';
import { IyizicoService } from 'src/root/service/iyizico.service';
import { PaymentService } from 'src/root/service/payment.service';
import { close3dsPopup, closeIyizicoThreeDAuthWindow } from 'src/root/service/signalr.service';
export const paymentStatusResponse =new Subject<{ loadingIcon: boolean}>(); 

@Component({
    selector: 'payment',
    templateUrl: './payment.component.html',
    styleUrls: ['./payment.component.css'],
    providers: [MessageService]
  })

  export class PaymentComponent {
    private _paymentService;
    private _iyizicoService;
    paymentDetails:any;
    paymentForm!:FormGroup;
    isSubmitted: boolean = false;
    loadingIcon:boolean = false;
    parentInfo:any;
    isDataLoaded:boolean = false;
    currentDate!:string;
    cardNumberMask:string = "0000-0000-0000-0000";
    monthYearMask:string = "00-00"
    isPaymentConfirmation:boolean = false;
    paymentConfirmationHtml:any;
    paymentConfirmationWindow!:Window | null;
    subscriptionPlans: any;
    userSavedCardsList: any;
    isShowCardDetailsForm: boolean = false;
    paymentViewModel: any;
    cardUserKey!: string;
    cardToken!: string;
    subscriptionPlanId!: string;
    IsSaveCardCheckboxSelected: boolean = false;
    isUserAcceptByOkulAgreement: boolean = false;
    isPaymentPopup: boolean = true;
    deletedCardUserKey: string = "";
    deletedCardToken: string = "";
    close3dsPopupSubscription!: Subscription;
    closeIyizicoWindowSubscription!: Subscription;
    attachmentModalRef!: BsModalRef;
    @Input() school:any;
    @Output() childEvent = new EventEmitter<any>();

    constructor(public messageService:MessageService,private translateService: TranslateService,private http: HttpClient,private fb: FormBuilder,private bsModalService: BsModalService,public options: ModalOptions,paymentService:PaymentService, iyizicoService:IyizicoService, private cd: ChangeDetectorRef) {
      this._paymentService = paymentService;
      this._iyizicoService = iyizicoService;
    }

    ngOnInit(): void {
      var schoolss = this.school;
      this.parentInfo = this.options.initialState;
      if(this.parentInfo == undefined){
         this.isPaymentPopup = false;
      }
 
      if(this.school != undefined){
        this.parentInfo = {
          paymentDetails:{}
        }
        this.isPaymentPopup = false;
        this.parentInfo.paymentDetails = this.school;
      }
      this.isDataLoaded = true;
      this.currentDate = this.getCurrentDate();
      this.InitializePaymentForm();
      this._iyizicoService.getUserSavedCardsList().subscribe((response) => {
        this.userSavedCardsList = response;
        this.cd.detectChanges();
      });
     
      if(this.parentInfo.paymentDetails.type == 1){
        this._iyizicoService.getSubscriptionPlans().subscribe((response) => {
          this.subscriptionPlans = response;
        }); 
      }
      else{
        this.closeIyizicoWindowSubscription = closeIyizicoThreeDAuthWindow.subscribe((response:any) => {
          this.paymentConfirmationWindow?.close();
        });
      }

      if (!this.close3dsPopupSubscription) {
        this.close3dsPopupSubscription = close3dsPopup.subscribe(response => {
         this.loadingIcon = true;
         this.paymentConfirmationWindow?.close();
        });
      }
    }

    InitializePaymentForm(){
        this.paymentForm = this.fb.group({
            paymentMethod: this.fb.control('1',[Validators.required]),
            cardNumber: this.fb.control('',[Validators.required, Validators.minLength(16)]),
            expiresOn: this.fb.control('',[Validators.required, Validators.minLength(4)]),
            securityCode: this.fb.control('',[Validators.required]),
            cardHolderName: this.fb.control('',[Validators.required]),
            parentId: this.fb.control(this.parentInfo.paymentDetails.id),
            parentName: this.fb.control(this.parentInfo.paymentDetails.name),
            parentType: this.fb.control(this.parentInfo.paymentDetails.type),
            amount: this.fb.control(this.parentInfo.paymentDetails.amount),
            currency: this.fb.control(this.parentInfo.paymentDetails.currency),
          }
          , {validator: this.isValidExpiresOn('expiresOn',this.currentDate)}
          );
    }

    isValidExpiresOn(expiresOn: string, currentDate:string){
      return (group: FormGroup): {[key: string]: any} => {
        let monthYear = group.controls[expiresOn].value;
        if(monthYear.length == 5){
          const yearIndex = monthYear.indexOf('-');
          const year = monthYear.substring(yearIndex + 1);
          const currentYearIndex = currentDate.indexOf('-');
          const currentYear = currentDate.substring(currentYearIndex + 1);
          const monthIndex = monthYear.indexOf('-');
          const month = monthYear.substring(0, monthIndex);
          const currentMonthIndex = currentDate.indexOf('-');
          const currentMonth = currentDate.substring(0, currentMonthIndex);
          if(year < currentYear || (year == currentYear && month < currentMonth) || month > 12){
            return { dates: `Please enter valid expiresOn`};
          }
        }
        return {};
       }
    }
    
    result = `"<!doctype html>
    <html lang="en">
    <head>
        <title>iyzico Mock 3D-Secure Processing Page</title>
    </head>
    <body>
    <h1>Test</h1>
    <form id="iyzico-3ds-form" action="https://sandbox-api.iyzipay.com/payment/mock/init3ds" method="post">
    <h1>Test22</h1>
    <input type = "text" name = "testtt">
        <input type="hidden" name="orderId" value="mock12-2071925513136821iyziord">
        <input type="hidden" name="bin" value="552879">
        <input type="hidden" name="successUrl" value="https://sandbox-api.iyzipay.com/payment/iyzipos/callback3ds/success/3">
        <input type="hidden" name="failureUrl" value="https://sandbox-api.iyzipay.com/payment/iyzipos/callback3ds/failure/3">
        <input type="hidden" name="confirmationUrl" value="https://sandbox-api.iyzipay.com/payment/mock/confirm3ds">
        <input type="hidden" name="PaReq" value="811e0a4e-0989-45de-b54b-37fc22de3e5b">
    </form>
    <script type="text/javascript">
        document.getElementById("iyzico-3ds-form").submit();
    </script>
    </body>
    </html>"`;

    winUrl = URL.createObjectURL(new Blob([this.result], { type: 'text/html' }));


// openWindow() {
//   // window.open(this.winUrl);
//   //window.open(this.winUrl, "", "width=200,height=100");

//   var myWindow = window.open("", "MsgWindow", "width=500,height=300");
// myWindow?.document.write(this.result);

// setTimeout(function(){myWindow?.close()},10000);
// }

    addPayment(){
      // this.subscriptionPlanId
      this.paymentViewModel = {};
      this.isSubmitted=true;
      if(!this.isUserAcceptByOkulAgreement){
        return;
      }

      if(this.cardUserKey == undefined && !this.isShowCardDetailsForm){
        return;
      }

      if(this.subscriptionPlanId == undefined && this.subscriptionPlans != undefined){
        return;
      }

      if(this.isShowCardDetailsForm){
        if(!this.paymentForm.valid){
          return;
        }
        var paymentDetails =this.paymentForm.value;
        this.paymentViewModel.cardNumber = paymentDetails.cardNumber;
        this.paymentViewModel.expiresOn = paymentDetails.expiresOn;
        this.paymentViewModel.securityCode = paymentDetails.securityCode;
        this.paymentViewModel.cardHolderName = paymentDetails.cardHolderName;
      }

      if(!this.isShowCardDetailsForm){
        this.paymentViewModel.cardUserKey = this.cardUserKey;
        this.paymentViewModel.cardToken = this.cardToken;
      }

      this.paymentViewModel.isSaveCardCheckboxSelected = this.IsSaveCardCheckboxSelected;
      this.paymentViewModel.parentId = this.parentInfo.paymentDetails.id;
      this.paymentViewModel.parentName = this.parentInfo.paymentDetails.name;
      this.paymentViewModel.parentType = this.parentInfo.paymentDetails.type;
      this.paymentViewModel.amount = this.parentInfo.paymentDetails.amount;
      this.paymentViewModel.currency =  this.parentInfo.paymentDetails.currency;
      this.paymentViewModel.schoolSubscriptionPlanId = this.subscriptionPlanId;
    //   var paymentDetails =this.paymentForm.value;
    //   // this.isSubmitted=true;
    //   if (!this.paymentForm.valid) {
    //   return;
    //  }

     this.loadingIcon = true;
     this._paymentService.buyClassCourse(this.paymentViewModel).subscribe((response: any) => {
      this.closeModal();
      // this.loadingIcon = false;
      paymentStatusResponse.next({loadingIcon: true});
      //this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:'We will notify when payment will be successful'});
      this.isPaymentConfirmation = true;
      this.paymentConfirmationHtml = response;
      
      
      this.paymentConfirmationWindow = window.open("","_blank", "width=500,height=300");
      this.paymentConfirmationWindow?.document.write(response);

      // const parser = new HtmlParser();
      // this.paymentConfirmationHtml = parser.parse(this.paymentConfirmationHtml,'text/html');
      // paymentConfirmDialoge.next({response});
     });


     
    }

    closeModal(){
      // this.attachmentModalRef.hide();
      this.bsModalService.hide();
    }

    formatCardNumber(event:any) {
      const input = event.target as HTMLInputElement;
      let trimmed = input.value.replace(/[\s|-]/g, '');
      trimmed = trimmed.slice(0, 16);
      const chunks = trimmed.match(/.{1,4}/g);
      input.value = chunks?.join('-')??'';
    }

    formatMonthYear(event:any){
      const input = event.target as HTMLInputElement;
      let trimmed = input.value.replace(/[\s|-]/g, '');
      trimmed = trimmed.slice(0, 4);
      const chunks = trimmed.match(/.{1,2}/g);
      input.value = chunks?.join('-')??'';
    }

    getCurrentDate(){
      var today = new Date();
        var dd = String(today. getDate()). padStart(2, '0');
        var mm = String(today. getMonth() + 1). padStart(2, '0');
        var yyyy = today. getFullYear().toString().slice(-2);
      ​  var currentDate = mm + '-' + yyyy;
        return currentDate;
      }
      

      omit_special_char(event: any) {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
          event.preventDefault();
        }
      }

      getSavedCardInfo(cardUserKey:string, cardToken:string){
        this.isShowCardDetailsForm = false;
        this.cardUserKey = cardUserKey;
        this.cardToken = cardToken;
      }

      showCardDetailsForm(){
        this.isShowCardDetailsForm = true;
        this.cd.detectChanges();
      }

      close(){
        this.bsModalService.hide();
      }

      storeUserCard(){
        this.IsSaveCardCheckboxSelected = !this.IsSaveCardCheckboxSelected;
      }

      byOkulAgreement(){
        this.isUserAcceptByOkulAgreement = !this.isUserAcceptByOkulAgreement;
      }

      getSchoolSubscriptionPlanId(subscriptionPlanId:string, amount:number){
        this.subscriptionPlanId = subscriptionPlanId;
        this.parentInfo.paymentDetails.amount = amount;
      }

      sendDataToParent() {
        this.childEvent.emit("back step");
      }

      removeCard(){
        this._paymentService.removeCard(encodeURIComponent(this.deletedCardUserKey),encodeURIComponent(this.deletedCardToken)).subscribe((response: any) => {
          this.closeRemoveCardModal();
          if(response.success){
            this.userSavedCardsList = this.userSavedCardsList.data.filter((x: { cardUserKey: string; }) => x.cardUserKey !== this.deletedCardUserKey);
            const translatedSummary = this.translateService.instant('Success');
            const translatedMessage = this.translateService.instant('CardRemovedSuccessfully');
            this.messageService.add({ severity: 'success', summary: translatedSummary, life: 6000, detail: translatedMessage });
          }
          else{
            const translatedSummary = this.translateService.instant('Error');
            const translatedMessage = this.translateService.instant('CardDetailsInvalid');
            this.messageService.add({ severity: 'error', summary: translatedSummary, life: 6000, detail: translatedMessage });
          }
          
        });
      }

      removeCardPopupOpen(template: TemplateRef<any>, cardUserKey:string, cardToken:string) {
        this.attachmentModalRef = this.bsModalService.show(template);
        this.deletedCardUserKey = cardUserKey;
        this.deletedCardToken = cardToken;
      }

      closeRemoveCardModal(){
        this.attachmentModalRef.hide();
      }
}
