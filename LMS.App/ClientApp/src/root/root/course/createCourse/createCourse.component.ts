import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { FilterService } from "primeng/api";
import { CreateCourseModel } from 'src/root/interfaces/course/createCourseModel';
import { CourseService } from 'src/root/service/course.service';

@Component({
  selector: 'students-Home',
  templateUrl: './createCourse.component.html',
  styleUrls: ['./createCourse.component.css'],
  providers: [FilterService]
})

export class CreateCourseComponent extends MultilingualComponent implements OnInit {
  private _courseService;
  languages:any;
  students:any;
  filteredStudents!: any[];
  teachers:any;
  filteredTeachers!: any[];
  disciplines:any;
  filteredDisciplines!: any[];
  serviceTypes:any;
  accessibility:any;
  course!:CreateCourseModel;
  createCourseForm!:FormGroup;
  isSubmitted: boolean = false;
  fileToUpload= new FormData();
  items!: MenuItem[];
  step: number = 0;
  nextPage:boolean = false;
  isCoursePaid:boolean = false;
  studentIds:string[] = [];
  disciplineIds:string[] = [];
  teacherIds:string[] = [];



  constructor(injector: Injector,private fb: FormBuilder,courseService: CourseService,private http: HttpClient) {
    super(injector);
    this._courseService = courseService;
  }

  ngOnInit(): void {

    this.selectedLanguage = localStorage.getItem("selectedLanguage");
    this.translate.use(this.selectedLanguage);

    this.items = [
      { label: "" },
      { label: "" }
    ];
    
  this._courseService.getLanguageList().subscribe((response) => {
    this.languages = response;
  });

    this._courseService.getAllStudents().subscribe((response) => {
    this.students = response;
  });

  this._courseService.getAllTeachers().subscribe((response) => {
    this.teachers = response;
  });

  this._courseService.getDisciplines().subscribe((response) => {
    this.disciplines = response;
  });

  this._courseService.getServiceType().subscribe((response) => {
    this.serviceTypes = response;
  });

  this._courseService.getAccessibility().subscribe((response) => {
    this.accessibility = response;
  });


  this.createCourseForm = this.fb.group({
      schoolId: this.fb.control('C65DDBF5-42F5-496D-CFF7-08DA9CA1C8A0', [Validators.required]),
      courseName: this.fb.control('', [Validators.required]),
      description: this.fb.control(''),
      serviceTypeId: this.fb.control(''),
      accessibilityId: this.fb.control(''),
      languageIds:this.fb.control(''),
      courseUrl: this.fb.control(''),
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

  }

  createCourse(){
    this.isSubmitted=true;
    this.course=this.createCourseForm.value;
    this.fileToUpload.append('schoolId', this.course.schoolId);
    this.fileToUpload.append('courseName', this.course.courseName);
    this.fileToUpload.append('description', this.course.description);
    this.fileToUpload.append('serviceTypeId',this.course.serviceTypeId);
    this.fileToUpload.append('accessibilityId',this.course.accessibilityId);
     this.fileToUpload.append('courseUrl',JSON.stringify(this.course.courseUrl));
    this.fileToUpload.append('languageIds',JSON.stringify(this.course.languageIds));
    this.fileToUpload.append('disciplineIds',JSON.stringify(this.disciplineIds));
    this.fileToUpload.append('studentIds',JSON.stringify(this.studentIds));
    this.fileToUpload.append('teacherIds',JSON.stringify(this.teacherIds));
    this.fileToUpload.append('price',this.course.price.toString());

    this._courseService.createCourse(this.fileToUpload).subscribe((response:any) => {
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

  getFreeCourse(){
    this.isCoursePaid = false;
  }

  getPaidCourse(){
    this.isCoursePaid = true;
  }

}
