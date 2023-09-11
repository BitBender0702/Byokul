import { Component, Injector, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { MultilingualComponent, changeLanguage } from "../sharedModule/Multilingual/multilingual.component";

@Component({
    selector: 'app-delete-or-disable',
    templateUrl: './delete-or-disable.component.html',
    styleUrls: ['./delete-or-disable.component.css'],
    providers: [MessageService],
})

export class DeleteOrDisableComponent extends MultilingualComponent implements OnInit{

    constructor(private translateService: TranslateService, private route: ActivatedRoute, public messageService: MessageService, injector: Injector) {
        super(injector);
    }

    schoolDeleted: boolean = false;
    schoolDisabled: boolean = false;
    classDeleted: boolean = false;
    courseDeleted: boolean = false;
    courseDisabled: boolean = false;
    classDisabled: boolean = false;

    schoolName:string=''
    className:string=''
    courseName:string=''
    disabledOrDeleted:string=''

    ngOnInit(): void {
        debugger;

        this.route.params.subscribe(params => {
            const schoolName = params['schoolName'];
            const className = params['className'];
            const courseName = params['courseName'];
            let disabledOrDeleted = params['disabledOrDeleted'];
            disabledOrDeleted = disabledOrDeleted?.toLowerCase();

            this.schoolName = schoolName;
            this.className = className;
            this.courseName = courseName;
            this.disabledOrDeleted = disabledOrDeleted;
        });

        if(this.schoolName != undefined && this.disabledOrDeleted == "disabled"){
            this.schoolDisabled = true;
        }

        if(this.schoolName != undefined && this.disabledOrDeleted == "deleted"){
            this.schoolDeleted = true;
        }

        if(this.className != undefined && this.disabledOrDeleted == "disabled"){
            this.classDisabled = true;
        }

        if(this.className != undefined && this.disabledOrDeleted == "deleted"){
            this.classDeleted = true;
        }

        if(this.courseName != undefined && this.disabledOrDeleted == "disabled"){
            this.courseDisabled = true;
        }

        if(this.courseName != undefined && this.disabledOrDeleted == "deleted"){
            this.courseDeleted = true;
        }
        debugger

    }
}