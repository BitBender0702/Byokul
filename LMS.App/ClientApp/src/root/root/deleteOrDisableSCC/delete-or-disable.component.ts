import { Component, Injector, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from "../sharedModule/Multilingual/multilingual.component";
import { Subscription } from "rxjs";

@Component({
    selector: 'app-delete-or-disable',
    templateUrl: './delete-or-disable.component.html',
    styleUrls: ['./delete-or-disable.component.css'],
    providers: [MessageService],
})

export class DeleteOrDisableComponent extends MultilingualComponent implements OnInit, OnDestroy {

    constructor(private translateService: TranslateService, private route: ActivatedRoute, public messageService: MessageService, injector: Injector) {
        super(injector);
    }

    schoolDeleted: boolean = false;
    schoolDisabled: boolean = false;
    schoolDisabledAndDeleted:boolean=false;

    classDeleted: boolean = false;
    classDisabled: boolean = false;
    classDisabledAndDeleted:boolean=false;
    classDisabledByAdmin:boolean=false;

    courseDeleted: boolean = false;
    courseDisabled: boolean = false;
    courseDisabledByAdmin: boolean = false;

    courseDisabledAndDeleted:boolean=false;

    userBan:boolean = false;
    userId=''
    
  
    schoolName:string=''
    className:string=''
    courseName:string=''
    disabledOrDeleted:string=''
    isDeleted:string=''
    isDisabled:string=''
    changeLanguageSubscription!:Subscription;

    ngOnInit(): void {
        debugger;
        var selectedLang = localStorage.getItem('selectedLanguage');
        this.translate.use(selectedLang ?? '');
        this.route.params.subscribe(params => {
            const schoolName = params['schoolName'];
            const className = params['className'];
            const courseName = params['courseName'];
            const userId = params['userId'];
            let disabledOrDeleted = params['disabledOrDeleted'];
            let isDeleted = params['isDeleted']
            let isDisabled = params['isDisabled']
            disabledOrDeleted = disabledOrDeleted?.toLowerCase();
            isDeleted = isDeleted?.toLowerCase();
            isDisabled = isDisabled?.toLowerCase();

            this.schoolName = schoolName;
            this.className = className;
            this.courseName = courseName;
            this.disabledOrDeleted = disabledOrDeleted;
            this.isDeleted = isDeleted;
            this.isDisabled = isDisabled;
            this.userId = userId;
        });

        // if(this.schoolName != undefined && this.disabledOrDeleted == "disabled"){
        //     this.schoolDisabled = true;
        // }

        // if(this.schoolName != undefined && this.disabledOrDeleted == "deleted"){
        //     this.schoolDeleted = true;
        // }


        if(this.schoolName != undefined && this.isDeleted=="false" && this.isDisabled=="true"){
            this.schoolDisabled = true;
        }

        if(this.schoolName != undefined && this.isDeleted=="true" && this.isDisabled=="false"){
            this.schoolDeleted = true;
        }

        if(this.schoolName != undefined && this.isDeleted=="true" && this.isDisabled=="true"){
            this.schoolDisabledAndDeleted = true;
        }



        // if(this.className != undefined && this.disabledOrDeleted == "disabled"){
        //     this.classDisabled = true;
        // }

        // if(this.className != undefined && this.disabledOrDeleted == "deleted"){
        //     this.classDeleted = true;
        // }

        if(this.className != undefined && this.isDeleted=="false" && this.isDisabled=="true"){
            this.classDisabled = true;
        }

        if(this.className != undefined && this.isDeleted=="true" && this.isDisabled=="false"){
            this.classDeleted = true;
        }

        if(this.className != undefined && this.isDeleted=="null" && this.isDisabled=="null"){
            this.classDisabledByAdmin = true;
        }

        if(this.className != undefined && this.isDeleted=="true" && this.isDisabled=="true"){
           this.classDisabledAndDeleted = true
        }

        if(this.userId != undefined && this.isDeleted=="true" && this.isDisabled=="true"){
            this.userBan = true
         }




        // if(this.courseName != undefined && this.disabledOrDeleted == "disabled"){
        //     this.courseDisabled = true;
        // }

        // if(this.courseName != undefined && this.disabledOrDeleted == "deleted"){
        //     this.courseDeleted = true;
        // }
       
        if(this.courseName != undefined && this.isDeleted=="false" && this.isDisabled=="true"){
            this.courseDisabled = true;
        }

        if(this.courseName != undefined && this.isDeleted=="true" && this.isDisabled=="false"){
            this.courseDeleted = true;
        }

        if(this.courseName != undefined && this.isDeleted=="null" && this.isDisabled=="null"){
            this.courseDisabledByAdmin = true;
        }

        if(this.courseName != undefined && this.isDeleted=="true" && this.isDisabled=="true"){
           this.courseDisabledAndDeleted = true
        }

        if(!this.changeLanguageSubscription){
            this.changeLanguageSubscription = changeLanguage.subscribe(response => {
              this.translate.use(response.language);
            })
          }
    }

    ngOnDestroy(): void {
        if(this.changeLanguageSubscription){
            this.changeLanguageSubscription.unsubscribe();
          }
    }

    
}