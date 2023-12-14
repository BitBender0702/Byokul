import {Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';
import { DatePipe } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription, filter } from 'rxjs';
import { PaymentComponent } from '../payment/payment.component';
import { BsModalService } from 'ngx-bootstrap/modal';
export const isUserSchoolOrNotResponse =new Subject<{isUserSchool:boolean}>(); 
export const hideSubscriptionNotiBand =new Subject(); 


@Component({
    selector: 'freeTrial-Info',
    templateUrl: './freeTrial.component.html',
    styleUrls: ['./freeTrial.component.css'],
    providers: [MessageService]
  })

export class FreeTrialComponent extends MultilingualComponent implements OnInit, OnDestroy {
    trialSchoolCreationDate: any;
    currentDate: Date = new Date();
    showFreeTrialPopup: boolean = false;
    freeTrialDaysLeft: number = 0;
    afterFreeTrialPopup:boolean = false;
    isAuthRoute: boolean = false;
    freeTrialInfo:any;
    isUserSchoolOrNotSubscription!: Subscription;
    hideSubscriptionNotiBandSub!: Subscription;
    constructor(injector: Injector,private datePipe: DatePipe,private router: Router,private bsModalService: BsModalService) {
        super(injector);
        router.events.pipe(
          filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
          this.isAuthRoute = this.router.url.includes('/user/auth');
          this.ngOnInit();
      });
      }

ngOnInit(): void {
    this.getTrialSchoolCreatedDate();

    if (!this.isUserSchoolOrNotSubscription) {
      this.isUserSchoolOrNotSubscription = isUserSchoolOrNotResponse.subscribe(response => {
        this.showMethod(response.isUserSchool);
      });
    }

    if (!this.hideSubscriptionNotiBandSub) {
      this.hideSubscriptionNotiBandSub = hideSubscriptionNotiBand.subscribe(response => {
        var freeTrialInfo = JSON.parse(localStorage.getItem("freeTrialInfo")??'');
        if(freeTrialInfo.isTrialSchoolPaymentDone == "" || freeTrialInfo.isTrialSchoolPaymentDone == "False"){
          freeTrialInfo.isTrialSchoolPaymentDone = "True";
        }
        localStorage.setItem("freeTrialInfo",JSON.stringify(freeTrialInfo));   
        this.freeTrialInfo.isTrialSchoolPaymentDone = "True";
      });
    }
}

getTrialSchoolCreatedDate(){
    var freeTrialInfo = JSON.parse(localStorage.getItem("freeTrialInfo")??'');
    this.freeTrialInfo = freeTrialInfo;
    if(Number(this.freeTrialInfo.userSchoolsCount) == 1){

      if(freeTrialInfo.trialSchoolCreationDate != null && freeTrialInfo.trialSchoolCreationDate != ""){

//         const [datePart, timePart] = freeTrialInfo.trialSchoolCreationDate.split(' ');

// const [day, month, year] = datePart.split('-').map(Number);
// const [hours, minutes, seconds] = timePart.split(':').map(Number);

const parsedDate = new Date(freeTrialInfo.trialSchoolCreationDate);

// Extract individual components
const year = parsedDate.getFullYear();
const month = parsedDate.getMonth() + 1; // Months are zero-based
const day = parsedDate.getDate();
const hours = parsedDate.getHours();
const minutes = parsedDate.getMinutes();
const seconds = parsedDate.getSeconds();

// Create a new Date object with the desired format
this.trialSchoolCreationDate = new Date(year, month - 1, day, hours, minutes, seconds);

        // this.trialSchoolCreationDate = this.datePipe.transform(decodedJwtData.trialSchoolCreationDate, 'MM/dd/yyyy h:mm:ss a');
        // this.trialSchoolCreationDate = new Date(this.trialSchoolCreationDate);




        this.currentDate = new Date();
        const timeDifference = this.currentDate.getTime() - this.trialSchoolCreationDate.getTime();

        // Convert the time difference to days
         const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        // const daysDifference = 32;

        if(daysDifference < 30){
            this.showFreeTrialPopup = true;
            this.freeTrialDaysLeft = 30 - daysDifference;

            if(freeTrialInfo.userSchoolsCount == "1"){
              var routerUrl = window.location.href;
              if(routerUrl.includes('/profile/')){
                this.showFreeTrialPopup = true;
              }
              else{
                this.showFreeTrialPopup = false;
              }
            }
            else{
              this.showFreeTrialPopup = true;
            }
            }
            else{
              this.afterFreeTrialPopup = true;
            }




            if(this.freeTrialDaysLeft <= 3 && !this.afterFreeTrialPopup){
              this.showFreeTrialPopup = true;
            }
        }
        else{
            this.showFreeTrialPopup = false;
        }

        
    }
      


}

ngOnDestroy(): void {
this.isUserSchoolOrNotSubscription.unsubscribe();
    
}

showMethod(isUserSchool:boolean){
  var freeTrialInfo = JSON.parse(localStorage.getItem("freeTrialInfo")??'');
  if(Number(this.freeTrialInfo.userSchoolsCount) == 1){

  if(freeTrialInfo.trialSchoolCreationDate != null){

    const [datePart, timePart] = freeTrialInfo.trialSchoolCreationDate.split(' ');

const [day, month, year] = datePart.split('-').map(Number);
const [hours, minutes, seconds] = timePart.split(':').map(Number);

this.trialSchoolCreationDate = new Date(year, month - 1, day, hours, minutes, seconds);

    // this.trialSchoolCreationDate = this.datePipe.transform(decodedJwtData.trialSchoolCreationDate, 'MM/dd/yyyy h:mm:ss a');
    // this.trialSchoolCreationDate = new Date(this.trialSchoolCreationDate);




    this.currentDate = new Date();
    const timeDifference = this.currentDate.getTime() - this.trialSchoolCreationDate.getTime();

    // Convert the time difference to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    if(isUserSchool){
    if(daysDifference < 30){
        this.showFreeTrialPopup = true;
        this.freeTrialDaysLeft = 30 - daysDifference;

        
        if(freeTrialInfo.userSchoolsCount == "1"){
          var routerUrl = window.location.href;
          if(routerUrl.includes('/profile/')){
            this.showFreeTrialPopup = true;
          }
          else{
            this.showFreeTrialPopup = false;
          }
        }
        else{
          this.showFreeTrialPopup = true;
        }
        }




        if(this.freeTrialDaysLeft <= 3){
          this.showFreeTrialPopup = true;
        }
    }
    else{
        this.showFreeTrialPopup = false;
    }

  }
  }
  
  
}

openSchoolPaymentPopup(){
  var freeTrialInfo = JSON.parse(localStorage.getItem("freeTrialInfo")??'');
  var schoolDetails = { "id": freeTrialInfo.trialSchoolId, "name": freeTrialInfo.trialSchoolName, "avatar": freeTrialInfo.trialSchoolAvatar, "type": 1, "amount":0 }
  const initialState = {
    paymentDetails: schoolDetails
  };
  this.bsModalService.show(PaymentComponent, { initialState });
}

}
