import {Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent } from '../sharedModule/Multilingual/multilingual.component';
import { DatePipe } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
export const isUserSchoolOrNotResponse =new Subject<{isUserSchool:boolean}>(); 


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
    isUserSchoolOrNotSubscription!: Subscription;
    constructor(injector: Injector,private datePipe: DatePipe,private router: Router) {
      debugger
        super(injector);
        router.events.subscribe((val) => {
          debugger
          console.log(val instanceof NavigationEnd);
          this.ngOnInit();
      });
      }

ngOnInit(): void {
    this.getTrialSchoolCreatedDate();

    if (!this.isUserSchoolOrNotSubscription) {
      this.isUserSchoolOrNotSubscription = isUserSchoolOrNotResponse.subscribe(response => {
        debugger
        this.showMethod(response.isUserSchool);
      });
    }
}

getTrialSchoolCreatedDate(){
    debugger

    var freeTrialInfo = JSON.parse(localStorage.getItem("freeTrialInfo")??'');
    
    
      if(freeTrialInfo.trialSchoolCreationDate != null && freeTrialInfo.trialSchoolCreationDate != ""){

        const [datePart, timePart] = freeTrialInfo.trialSchoolCreationDate.split(' ');

const [day, month, year] = datePart.split('-').map(Number);
const [hours, minutes, seconds] = timePart.split(':').map(Number);

this.trialSchoolCreationDate = new Date(year, month - 1, day, hours, minutes, seconds);

        // this.trialSchoolCreationDate = this.datePipe.transform(decodedJwtData.trialSchoolCreationDate, 'MM/dd/yyyy h:mm:ss a');
        // this.trialSchoolCreationDate = new Date(this.trialSchoolCreationDate);




        var currentDate = this.currentDate;
        const timeDifference = this.currentDate.getTime() - this.trialSchoolCreationDate.getTime();

        // Convert the time difference to days
        // const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        const daysDifference = 32;

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




            if(this.freeTrialDaysLeft <= 3){
              this.showFreeTrialPopup = true;
            }
        }
        else{
            this.showFreeTrialPopup = false;
        }
      


}

ngOnDestroy(): void {
this.isUserSchoolOrNotSubscription.unsubscribe();
    
}

showMethod(isUserSchool:boolean){
  var freeTrialInfo = JSON.parse(localStorage.getItem("freeTrialInfo")??'');
    
    
  if(freeTrialInfo.trialSchoolCreationDate != null){

    const [datePart, timePart] = freeTrialInfo.trialSchoolCreationDate.split(' ');

const [day, month, year] = datePart.split('-').map(Number);
const [hours, minutes, seconds] = timePart.split(':').map(Number);

this.trialSchoolCreationDate = new Date(year, month - 1, day, hours, minutes, seconds);

    // this.trialSchoolCreationDate = this.datePipe.transform(decodedJwtData.trialSchoolCreationDate, 'MM/dd/yyyy h:mm:ss a');
    // this.trialSchoolCreationDate = new Date(this.trialSchoolCreationDate);




    var currentDate = this.currentDate;
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
