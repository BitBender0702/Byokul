import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { CreateSchoolModel } from 'src/root/interfaces/school/createSchoolModel';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {StepsModule} from 'primeng/steps';
import {MenuItem} from 'primeng/api';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';

@Component({
  selector: 'students-Home',
  templateUrl: './createSchool.component.html',
  styleUrls: ['./createSchool.component.css'],
})

export class CreateSchoolComponent extends MultilingualComponent implements OnInit {
  private _schoolService;
  countries:any;
  specializations:any;
  defaultLogos:any;
  languages:any;
  school!:CreateSchoolModel;
  createSchoolForm!:FormGroup;
  invalidMeetingName!: boolean;
  isSubmitted: boolean = false;
  uploadImage!:any;
  uploadImageName!:string;
  fileToUpload= new FormData();
  logoUrl!:string;
  items!: MenuItem[];
  step: number = 0;
  nextPage:boolean = false;


  constructor(injector: Injector,private domSanitizer: DomSanitizer,private router: Router,private fb: FormBuilder,schoolService: SchoolService,private http: HttpClient) {
    super(injector);
    this._schoolService = schoolService;
  }

  ngOnInit(): void {

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];

  this._schoolService.getDefaultLogo().subscribe((response) => {
    this.defaultLogos = response;
  });

  this._schoolService.getCountryList().subscribe((response) => {
    this.countries = response;
  });

  this._schoolService.getSpecializationList().subscribe((response) => {
    this.specializations = response;
  });
    
  this._schoolService.getLanguageList().subscribe((response) => {
    this.languages = response;
  });


  this.createSchoolForm = this.fb.group({
    schoolName: this.fb.control('', [Validators.required]),
    countryId: this.fb.control('', [Validators.required]),
    specializationId: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    schoolUrl: this.fb.control(''),
    defaultAvatar: this.fb.control(''),
    selectedLanguages:this.fb.control('')
  });
}

  copyMessage(inputElement:any){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  handleDefaultImageInput(url:string){
    this.logoUrl = url;
  }

  handleImageInput(event: any) {
    this.fileToUpload.append("avatarImage", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
    const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadImage = _event.target?.result; 
        this.uploadImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadImage);
    }
    reader.readAsDataURL(event.target.files[0]); 

  }

  createSchool(){
    this.isSubmitted=true;
    if (!this.createSchoolForm.valid) {
      return;
    }

    this.school=this.createSchoolForm.value;
    this.fileToUpload.append('schoolName', this.school.schoolName);
    this.fileToUpload.append('description', this.school.description);
    this.fileToUpload.append('countryId',this.school.countryId);
    this.fileToUpload.append('specializationId',this.school.specializationId);
    this.fileToUpload.append('languageIds',JSON.stringify(this.school.selectedLanguages));
    this.fileToUpload.append('schoolUrl',JSON.stringify(this.school.schoolUrl));
    this.fileToUpload.append('avatar',this.logoUrl);

    this._schoolService.createSchool(this.fileToUpload).subscribe((response:any) => {
      console.log(response);

    });
  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    this.step += 1;
    this.nextPage = true;
  }

  backStep() {
    this.step -= 1;
  }
}