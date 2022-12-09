import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { EditSchoolModel } from 'src/root/interfaces/school/editSchoolModel';

@Component({
  selector: 'edit-school',
  templateUrl: './editSchool.component.html',
  styleUrls: [],
})
export class EditSchoolComponent implements OnInit {

  private _schoolService;
  school!:EditSchoolModel;
  editSchoolForm!:FormGroup;
  invalidMeetingName!: boolean;
  isSubmitted: boolean = false;

  fileToUpload= new FormData();

  items!: MenuItem[];

  
  constructor(private fb: FormBuilder,schoolService: SchoolService,private http: HttpClient) {
    this._schoolService = schoolService;
  }

  ngOnInit(): void {

    // get school data related to schoolId that are clicked. and show in html
    var schoolId = 'C65DDBF5-42F5-496D-CFF7-08DA9CA1C8A0';
    this._schoolService.getSchoolEditDetails(schoolId).subscribe((response) => {
      this.school = response;
     
    });



    this.editSchoolForm = this.fb.group({
      schoolName: this.fb.control(''),
      schoolSlogan: this.fb.control(''),
      founded: this.fb.control(''),
      serviceTypeId: this.fb.control(''),
      schoolEmail: this.fb.control(''),

      // here for owner if needed
      description: this.fb.control(''),
    });

    
  }


  editSchool(){
    this.isSubmitted=true;
    if (!this.editSchoolForm.valid) {
      return;
    }

    var foundedDate = this.editSchoolForm.get('founded')?.value;
    foundedDate = new Date(foundedDate + 'UTC');

    this.school=this.editSchoolForm.value;
    this.fileToUpload.append('schoolName', this.school.schoolName);
    this.fileToUpload.append('schoolSlogan', this.school.schoolSlogan);
    this.fileToUpload.append('founded',foundedDate);
    this.fileToUpload.append('accessibilityId',this.school.accessibilityId);
    this.fileToUpload.append('schoolEmail',this.school.schoolEmail);
    this.fileToUpload.append('description',this.school.description);

    // here for the owner if needed

    this._schoolService.editSchool(this.fileToUpload).subscribe((response:any) => {
      console.log(response);

    });
  }

}
   

