import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { SchoolService } from 'src/root/service/school.service';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { EditClassModel } from 'src/root/interfaces/class/editClassModel';
import { ClassService } from 'src/root/service/class.service';

@Component({
  selector: 'edit-class',
  templateUrl: './editClass.component.html',
  styleUrls: [],
})
export class EditClassComponent implements OnInit {

  private _classService;
  class!:EditClassModel;
  editClassForm!:FormGroup;
  isSubmitted: boolean = false;
  fileToUpload= new FormData();
  items!: MenuItem[];

  
  constructor(private fb: FormBuilder,classService: ClassService,private http: HttpClient) {
    this._classService = classService;
  }

  ngOnInit(): void {

    // get school data related to schoolId that are clicked. and show in html

    var classId = '8245F5D2-B016-441D-31D7-08DACBCC0EA0';
    this._classService.getClassEditDetails(classId).subscribe((response) => {
      this.class = response;
     
    });



    this.editClassForm = this.fb.group({
    //   schoolName: this.fb.control(''),
    //   schoolSlogan: this.fb.control(''),
    //   founded: this.fb.control(''),
    //   serviceTypeId: this.fb.control(''),
    //   schoolEmail: this.fb.control(''),

    //   // here for owner if needed
    //   description: this.fb.control(''),
    });

    
  }


  editSchool(){
    this.isSubmitted=true;
    if (!this.editClassForm.valid) {
      return;
    }

    var foundedDate = this.editClassForm.get('founded')?.value;
    foundedDate = new Date(foundedDate + 'UTC');

    // this.school=this.editClassForm.value;
    // this.fileToUpload.append('schoolName', this.school.schoolName);
    // this.fileToUpload.append('schoolSlogan', this.school.schoolSlogan);
    // this.fileToUpload.append('founded',foundedDate);
    // this.fileToUpload.append('accessibilityId',this.school.accessibilityId);
    // this.fileToUpload.append('schoolEmail',this.school.schoolEmail);
    // this.fileToUpload.append('description',this.school.description);

    // // here for the owner if needed

    // this._schoolService.editSchool(this.fileToUpload).subscribe((response:any) => {
    //   console.log(response);

    // });
  }

}
   

