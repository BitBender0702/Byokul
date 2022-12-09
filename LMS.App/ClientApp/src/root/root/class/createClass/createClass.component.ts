import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { CreateClassModel } from 'src/root/interfaces/class/createClassModel';
import { ClassService } from 'src/root/service/class.service';
import { FilterService } from "primeng/api";
import { IfStmt } from '@angular/compiler';

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
  createClassForm1!:FormGroup;
  createClassForm2!:FormGroup;
  createClassForm3!:FormGroup;
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
  studentInfo:any[] = [];
  disciplineIds:string[] = [];
  disciplineInfo:any[] = [];
  teacherIds:string[] = [];
  teacherInfo:any[] = [];
  loadingIcon:boolean = false;
  isStepCompleted: boolean = false;
  currentDate!:string;
  fromSchoolProfile!:string;
  schools:any;
  selectedSchool:any;


  constructor(injector: Injector,private route: ActivatedRoute,private router: Router,private fb: FormBuilder,classService: ClassService,private http: HttpClient) {
    super(injector);
    this._classService = classService;
  }

  ngOnInit(): void {
    
    var id = this.route.snapshot.paramMap.get('id');
    this.fromSchoolProfile = id ?? '';

    if(this.fromSchoolProfile == ''){
      this.getSchoolsForDropdown();
    }

    if(this.fromSchoolProfile != ''){
      this.getSelectedSchool(this.fromSchoolProfile);
    }

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
    this.createClassForm1.controls['accessibilityId'].setValue(this.accessibility[0].id, {onlySelf: true});
  });

  this.currentDate = this.getCurrentDate();

  this.createClassForm1 = this.fb.group({
    schoolId: this.fb.control('', [Validators.required]),
    schoolName: this.fb.control(''),
    className: this.fb.control('', [Validators.required]),
    description: this.fb.control(''),
    noOfStudents: this.fb.control('',[Validators.required]),
    startDate: this.fb.control('',[Validators.required]),
    endDate: this.fb.control('',[Validators.required]),
    serviceTypeId: this.fb.control('',[Validators.required]),
    accessibilityId: this.fb.control('',[Validators.required]),
    languageIds:this.fb.control('',[Validators.required]),
    price:this.fb.control('')

}, {validator: this.dateLessThan('startDate', 'endDate',this.currentDate)});

this.createClassForm2 = this.fb.group({
  disciplineIds:this.fb.control(''),
  studentIds:this.fb.control(''),
  teacherIds:this.fb.control('')

});

this.createClassForm3 = this.fb.group({
  classUrl: this.fb.control('',[Validators.required])
});
}

getSchoolsForDropdown(){
  this._classService.getAllSchools().subscribe((response) => {
    this.schools = response;
    this.createClassForm1.controls['schoolId'].setValue(this.schools[0].schoolId, {onlySelf: true});
  });  
}

getSelectedSchool(schoolId:string){
  this._classService.getSelectedSchool(schoolId).subscribe((response) => {
    this.selectedSchool = response;
    this.createClassForm1.controls['schoolId'].setValue(this.selectedSchool.schoolId, {onlySelf: true});
    this.createClassForm1.controls['schoolName'].setValue(this.selectedSchool.schoolName, {onlySelf: true});

  });  
}


dateLessThan(from: string, to: string, currentDate:string) {
  return (group: FormGroup): {[key: string]: any} => {
   let f = group.controls[from];
   let t = group.controls[to];
   if (f.value > t.value || f.value < currentDate) {
     return {
       dates: `Please enter valid date`
     };
   }
   return {};
  }
}

getCurrentDate(){
var today = new Date();
  var dd = String(today. getDate()). padStart(2, '0');
  var mm = String(today. getMonth() + 1). padStart(2, '0');
  var yyyy = today. getFullYear();
​  var currentDate = yyyy + '-' + mm + '-' + dd;
  return currentDate;
}


captureStudentId(event: any) {
  var studentId = event.studentId;
  this.studentIds.push(studentId);
  this.studentInfo.push(event);
}

captureDisciplineId(event: any) {
  var disciplineId = event.id;
  this.disciplineIds.push(disciplineId);
  this.disciplineInfo.push(event);
}

captureTeacherId(event: any) {
  var teacherId = event.teacherId;
  this.teacherIds.push(teacherId);
  this.teacherInfo.push(event);
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
    if (!this.createClassForm3.valid) {
      return;
    }

    var step3Value =this.createClassForm3.value;
    this.fileToUpload.append('classUrl',JSON.stringify(step3Value.classUrl));

    this._classService.createClass(this.fileToUpload).subscribe((response:any) => {
      var classId =  response;
      this.router.navigateByUrl(`user/classProfile/${classId}`)

    });
  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    this.isStepCompleted = true;
    if (!this.createClassForm1.valid || this.uploadImageName == undefined) {
      return;
    }

    var schoolId = this.createClassForm1.get('schoolId')?.value;
    this.class=this.createClassForm1.value;
    this.class.schoolId = schoolId;

    this.fileToUpload.append('schoolId', this.class.schoolId);
    this.fileToUpload.append('className', this.class.className);
    this.fileToUpload.append('description', this.class.description);
    this.fileToUpload.append('noOfStudents',this.class.noOfStudents);
    this.fileToUpload.append('startDate',this.class.startDate);
    this.fileToUpload.append('endDate',this.class.endDate);
    this.fileToUpload.append('serviceTypeId',this.class.serviceTypeId);
    this.fileToUpload.append('accessibilityId',this.class.accessibilityId);
    this.fileToUpload.append('languageIds',JSON.stringify(this.class.languageIds));
    this.fileToUpload.append('price',this.class.price?.toString());
    
    this.step += 1;
    this.isStepCompleted = false;
    this.nextPage = true;

    this.createClassForm3.patchValue({
      classUrl: 'byokul.com/schoolname/' + this.class.className.replace(" ",""),
    });
  }

  forwardStep2() {
    this.isStepCompleted = true;
    this.fileToUpload.append('disciplineIds',JSON.stringify(this.disciplineIds));
    this.fileToUpload.append('studentIds',JSON.stringify(this.studentIds));
    this.fileToUpload.append('teacherIds',JSON.stringify(this.teacherIds));
    this.isStepCompleted = false;
    this.step += 1;

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
    this.createClassForm1.get('price')?.removeValidators(Validators.required);
    this.createClassForm1.patchValue({
      price: null,
    });
  }

  getPaidClass(){
    this.isClassPaid = true;
    this.createClassForm1.get('price')?.addValidators(Validators.required);
  }

  openSearch(){
    this.isOpenSearch = true;
  }

  closeSearch(){
    this.isOpenSearch = false;
  }

  openSidebar(){
    this.isOpenSidebar = true;

  }

  removeTeacher(event: any){
    const teacherIndex = this.teacherInfo.findIndex((item) => item.teacherId === event.teacherId);
    if (teacherIndex > -1) {
      this.teacherInfo.splice(teacherIndex, 1);
    }

    const index = this.teacherIds.findIndex((item) => item === event.teacherId);
    if (index > -1) {
      this.teacherIds.splice(teacherIndex, 1);
    }
    
  }

  removeStudent(event: any){
    const studentIndex = this.studentInfo.findIndex((item) => item.studentId === event.studentId);
    if (studentIndex > -1) {
      this.studentInfo.splice(studentIndex, 1);
    }

    const index = this.studentIds.findIndex((item) => item === event.studentId);
    if (index > -1) {
      this.studentIds.splice(index, 1);
    }
  }

  removeDiscipline(event: any){
    const disciplineIndex = this.disciplineInfo.findIndex((item) => item.id === event.id);
    if (disciplineIndex > -1) {
      this.disciplineInfo.splice(disciplineIndex, 1);
    }

    const index = this.disciplineIds.findIndex((item) => item === event.id);
    if (index > -1) {
      this.disciplineIds.splice(index, 1);
    }
  }
}
