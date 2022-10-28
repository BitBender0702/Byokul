import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NewMeetingModel } from 'src/root/interfaces/bigBlueButton/newMeeting';
import { CreateSchoolModel } from 'src/root/interfaces/school/createSchoolModel';
import { StudentsService } from 'src/root/school_StudentsModule/services/students.service';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";

import {StepsModule} from 'primeng/steps';
import {MenuItem} from 'primeng/api';

@Component({
  selector: 'students-Home',
  templateUrl: './createSchool.component.html',
  styleUrls: [],
})
export class CreateSchoolComponent implements OnInit {
  private _schoolService;
  countries:any;
  specializations:any;
  languages:any;
  school!:CreateSchoolModel;
  createSchoolForm!:FormGroup;
  invalidMeetingName!: boolean;
  isSubmitted: boolean = false;
  //credentials: CreateSchoolModel = {SchoolName:'',Avatar:'',CoveredPhoto:'',Description:''};
  // credentials!:CreateSchoolModel;
  fileToUpload= new FormData();

  items!: MenuItem[];

  
  constructor(private fb: FormBuilder,schoolService: SchoolService,private http: HttpClient) {
    this._schoolService = schoolService;
  }

  ngOnInit(): void {
    this.items = [
      {label: 'Step 1'},
      {label: 'Step 2'},
      {label: 'Step 3'}
  ];
  
    this._schoolService.getCountryList().subscribe((response) => {
      this.countries = response;
      console.log(response);
    });

    this._schoolService.getSpecializationList().subscribe((response) => {
      this.specializations = response;
      console.log(response);
    });
    
    this._schoolService.getLanguageList().subscribe((response) => {
      this.languages = response;
      console.log(response);
    });



    this.createSchoolForm = this.fb.group({
      schoolName: this.fb.control('', [Validators.required]),
      countryId: this.fb.control('', [Validators.required]),
      specializationId: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
      // avatar: this.fb.control(''),
      selectedLanguages:this.fb.control('')
    });

    
  }

  handleImageInput(event: any) {
    //let formData: FormData = new FormData();
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    
  }

  // handleFileInput(event: any) {
  //     //let formData: FormData = new FormData();
  //     this.fileToUpload.append("video", event.target.files[0], event.target.files[0].name);
      
  //   }

  createSchool(){
    this.isSubmitted=true;
    if (!this.createSchoolForm.valid) {
      return;
    }

    this.school=this.createSchoolForm.value;

    this.fileToUpload.append('schoolName', this.school.schoolName);
    // this.fileToUpload.append('avatar', this.school.avatar);
    this.fileToUpload.append('description', this.school.description);
    this.fileToUpload.append('countryId',this.school.countryId);
    this.fileToUpload.append('specializationId',this.school.specializationId);
    this.fileToUpload.append('languageIds',JSON.stringify(this.school.selectedLanguages));

    this._schoolService.createSchool(this.fileToUpload).subscribe((response:any) => {
      console.log(response);

    });
  }

  // createSchool= (form: NgForm) =>{
  //   this.fileToUpload.append('schoolName', this.credentials.SchoolName);
  //   this.fileToUpload.append('avatar', this.credentials.Avatar);
  //   this.fileToUpload.append('coveredPhoto', this.credentials.CoveredPhoto);
  //   this.fileToUpload.append('description', this.credentials.Description);

  //   this._schoolService.createSchool(this.fileToUpload).subscribe((response:any) => {
  //     console.log(response);

  //   });
  // }
}
   

  // createMeeting = () => {
  //   this._studentsService.createMeeting().subscribe((response) => {
  //     this.meetingInfo = response;
  //     console.log(response);
  // })

  //     // this._studentsService.joinMeetings().subscribe((response) => {
  //     //     console.log(response);
  //     // })

  // }
