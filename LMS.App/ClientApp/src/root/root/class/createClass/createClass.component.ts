import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { Router } from '@angular/router';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { CreateClassModel } from 'src/root/interfaces/class/createClassModel';
import { ClassService } from 'src/root/service/class.service';
import { FilterService } from "primeng/api";

@Component({
  selector: 'students-Home',
  templateUrl: './createClass.component.html',
  styleUrls: ['./createClass.component.css'],
  providers: [FilterService]
})

export class CreateClassComponent extends MultilingualComponent implements OnInit {
  private _classService;

  languages:any;
  students:any;
  filteredStudents!: any[];
  teachers:any;
  filteredTeachers!: any[];
  disciplines:any;
  filteredDisciplines!: any[];
  serviceTypes:any;
  accessibility:any;
  class!:CreateClassModel;
  createClassForm!:FormGroup;
  isSubmitted: boolean = false;
  uploadImageName!:string;
  fileToUpload= new FormData();
  items!: MenuItem[];
  step: number = 0;
  nextPage:boolean = false;
  isOpenSearch:boolean = false;
  isOpenSidebar:boolean = false;
  isClassPaid!:boolean;
  studentIds:string[] = [];
  disciplineIds:string[] = [];
  teacherIds:string[] = [];
  loadingIcon:boolean = false;


  constructor(injector: Injector,private fb: FormBuilder,classService: ClassService,private http: HttpClient) {
    super(injector);
    this._classService = classService;
  }

  ngOnInit(): void {

    this.loadingIcon = true;

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];
    
  this._classService.getLanguageList().subscribe((response) => {
    this.languages = response;
  });

  this._classService.getAllStudents().subscribe((response) => {
    this.students = response;
  });

  this._classService.getAllTeachers().subscribe((response) => {
    this.teachers = response;
  });

  this._classService.getDisciplines().subscribe((response) => {
    this.disciplines = response;
  });

  this._classService.getServiceType().subscribe((response) => {
    this.serviceTypes = response;
  });

  this._classService.getAccessibility().subscribe((response) => {
    this.accessibility = response;
  });


  this.createClassForm = this.fb.group({
      schoolId: this.fb.control('C65DDBF5-42F5-496D-CFF7-08DA9CA1C8A0', [Validators.required]),
      className: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
      noOfStudents: this.fb.control(''),
      startDate: this.fb.control(''),
      endDate: this.fb.control(''),
      serviceTypeId: this.fb.control(''),
      accessibilityId: this.fb.control(''),
      languageIds:this.fb.control(''),
      classUrl: this.fb.control(''),
      disciplineIds:this.fb.control(''),
      studentIds:this.fb.control(''),
      teacherIds:this.fb.control(''),
      price:this.fb.control('')

  });
}

captureStudentId(event: any) {
  var studentId = event.studentId;
  this.studentIds.push(studentId);
}

captureDisciplineId(event: any) {
  var disciplineId = event.id;
  this.disciplineIds.push(disciplineId);
}

captureTeacherId(event: any) {
  var teacherId = event.teacherId;
  this.teacherIds.push(teacherId);
}

  copyMessage(inputElement:any){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  handleImageInput(event: any) {
    this.fileToUpload.append("thumbnail", event.target.files[0], event.target.files[0].name);
    this.uploadImageName = event.target.files[0].name;
  }

  createClass(){
    this.isSubmitted=true;
    var schoolId = this.createClassForm.get('schoolId')?.value;
    var startDate = this.createClassForm.get('startDate')?.value;
    startDate = new Date(startDate + 'UTC');
    var endDate = this.createClassForm.get('endDate')?.value;
    endDate = new Date(endDate + 'UTC');

    this.class=this.createClassForm.value;
    this.class.schoolId = schoolId;

    this.fileToUpload.append('schoolId', this.class.schoolId);
    this.fileToUpload.append('className', this.class.className);
    this.fileToUpload.append('description', this.class.description);
    this.fileToUpload.append('noOfStudents',this.class.noOfStudents);
    this.fileToUpload.append('startDate',startDate.toDateString());
    this.fileToUpload.append('endDate',endDate.toDateString());
    this.fileToUpload.append('serviceTypeId',this.class.serviceTypeId);
    this.fileToUpload.append('accessibilityId',this.class.accessibilityId);
     this.fileToUpload.append('classUrl',JSON.stringify(this.class.classUrl));
    this.fileToUpload.append('languageIds',JSON.stringify(this.class.languageIds));
    this.fileToUpload.append('disciplineIds',JSON.stringify(this.disciplineIds));
    this.fileToUpload.append('studentIds',JSON.stringify(this.studentIds));
    this.fileToUpload.append('teacherIds',JSON.stringify(this.teacherIds));
    this.fileToUpload.append('price',this.class.price.toString());


    this._classService.createClass(this.fileToUpload).subscribe((response:any) => {
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

  filterDisciplines(event:any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.disciplines.length; i++) {
      let discipline = this.disciplines[i];
      if (discipline.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(discipline);
      }
    }
    this.filteredDisciplines = filtered;
  }

  filterStudents(event:any) {
    let filteredStudents: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.students.length; i++) {
      let student = this.students[i];
      if (student.studentName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filteredStudents.push(student);
      }
    }
    this.filteredStudents = filteredStudents;
  }

  filterTeachers(event:any) {
    let filteredTeachers: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.teachers.length; i++) {
      let teacher = this.teachers[i];
      if (teacher.firstName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filteredTeachers.push(teacher);
      }
    }
    this.filteredTeachers = filteredTeachers;
  }

  getFreeClass(){
    this.isClassPaid = false;
  }

  getPaidClass(){
    this.isClassPaid = true;
  }

  openSearch(){
    this.isOpenSearch = true;
  }

  closeSearch(){
    this.isOpenSearch = false;
  }

  closeSidebar(){
    this.isOpenSidebar = false;

  }

  openSidebar(){
    this.isOpenSidebar = false;

  }
}
