import { HttpClient } from '@angular/common/http';
import { HtmlParser, Parser } from '@angular/compiler';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
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
    close3dsPopupSubscription!: Subscription;
    closeIyizicoWindowSubscription!: Subscription;

    constructor(public messageService:MessageService,private http: HttpClient,private fb: FormBuilder,private bsModalService: BsModalService,public options: ModalOptions,paymentService:PaymentService, iyizicoService:IyizicoService, private cd: ChangeDetectorRef) {
      this._paymentService = paymentService;
      this._iyizicoService = iyizicoService;
    }

    ngOnInit(): void {
      debugger
      // this.openWindow();
      this.parentInfo = this.options.initialState;
      this.isDataLoaded = true;

      this.currentDate = this.getCurrentDate();
      this.InitializePaymentForm();

      this._iyizicoService.getUserSavedCardsList().subscribe((response) => {
        debugger
        this.userSavedCardsList = response;
        this.cd.detectChanges();
      });
     
      if(this.parentInfo.paymentDetails.type == 1){
        this._iyizicoService.getSubscriptionPlans().subscribe((response) => {
          debugger
          this.subscriptionPlans = response;
        }); 
      }
      else{
        this.closeIyizicoWindowSubscription = closeIyizicoThreeDAuthWindow.subscribe((response:any) => {
          debugger
          this.paymentConfirmationWindow?.close();
        });
      }

      // this._paymentService.stripeWebhook().subscribe((response: any) => {
  
      //  });

      // this._paymentService.webhookSubject.asObservable().subscribe(response => {
      //   // Handle the webhook response here
      // });

      // this.http.post('https://66c8-122-160-143-16.ngrok-free.app/stripe/webhook', {}).subscribe(
      //   (response) => {
      //     console.log(response);
      //     // Handle success response
      //   },
      //   (error) => {
      //     console.error(error);
      //     // Handle error response
      //   }
      // );

      if (!this.close3dsPopupSubscription) {
        this.close3dsPopupSubscription = close3dsPopup.subscribe(response => {
          debugger
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
            // firstName: this.fb.control('',[Validators.required]),
            // lastName: this.fb.control('',[Validators.required]),
            parentId: this.fb.control(this.parentInfo.paymentDetails.id),
            parentName: this.fb.control(this.parentInfo.paymentDetails.name),
            parentType: this.fb.control(this.parentInfo.paymentDetails.type),
            amount: this.fb.control(this.parentInfo.paymentDetails.amount),
            currency: this.fb.control(this.parentInfo.paymentDetails.currency)
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
//   debugger
//   // window.open(this.winUrl);
//   //window.open(this.winUrl, "", "width=200,height=100");

//   var myWindow = window.open("", "MsgWindow", "width=500,height=300");
// myWindow?.document.write(this.result);

// setTimeout(function(){myWindow?.close()},10000);
// }

    addPayment(){
      debugger
      this.paymentViewModel = {};
      this.isSubmitted=true;
      if(!this.isUserAcceptByOkulAgreement){
        return;
      }

      if(this.isShowCardDetailsForm){
        if(!this.paymentForm.valid){

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
      this.bsModalService.hide(this.bsModalService.config.id);
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
        debugger
        this.isShowCardDetailsForm = false;
        this.cardUserKey = cardUserKey;
        this.cardToken = cardToken;
      }

      showCardDetailsForm(){
        debugger
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
        debugger
        this.isUserAcceptByOkulAgreement = !this.isUserAcceptByOkulAgreement;
      }

      getSchoolSubscriptionPlanId(subscriptionPlanId:string, amount:number){
        debugger
        this.subscriptionPlanId = subscriptionPlanId;
        this.parentInfo.paymentDetails.amount = amount;
      }
}
