import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import {MenuItem} from 'primeng/api';
import { MultilingualComponent } from '../../sharedModule/Multilingual/multilingual.component';
import { FilterService } from "primeng/api";
import { CreateCourseModel } from 'src/root/interfaces/course/createCourseModel';
import { CourseService } from 'src/root/service/course.service';
import { ActivatedRoute, Router } from '@angular/router';

// import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { CreatePostComponent } from '../../createPost/createPost';

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
  createCourseForm1!:FormGroup;
  createCourseForm2!:FormGroup;
  createCourseForm3!:FormGroup;
  isSubmitted: boolean = false;
  fileToUpload= new FormData();
  items!: MenuItem[];
  step: number = 0;
  nextPage:boolean = false;
  isCoursePaid:boolean = false;
  studentIds:string[] = [];
  studentInfo:any[] = [];
  disciplineIds:string[] = [];
  disciplineInfo:any[] = [];
  teacherIds:string[] = [];
  teacherInfo:any[] = [];
  isOpenSidebar:boolean = false;
  isStepCompleted: boolean = false;
  fromSchoolProfile!:string;
  schools:any;
  selectedSchool:any;
  loadingIcon:boolean = false;
  courseUrl!:string;
  courseId!:string;
  courseName!:string;
  uploadImageName!:string;
  tagList!: string[];
  isTagsValid: boolean = true;



  constructor(injector: Injector,private router: Router,private route: ActivatedRoute,private fb: FormBuilder,courseService: CourseService,private http: HttpClient) {
    super(injector);
    this._courseService = courseService;
  }

  ngOnInit(): void {

    var id = this.route.snapshot.paramMap.get('id');
    this.fromSchoolProfile = id ?? '';
    this.step = 0;

    if(this.fromSchoolProfile == ''){
      this.getSchoolsForDropdown();
    }

    if(this.fromSchoolProfile != ''){
      this.getSelectedSchool(this.fromSchoolProfile);
    }

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
    this.createCourseForm1.controls['accessibilityId'].setValue(this.accessibility[0].id, {onlySelf: true});
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

  this.createCourseForm1 = this.fb.group({
    schoolId: this.fb.control('', [Validators.required]),
    schoolName: this.fb.control(''),
    courseName: this.fb.control('', [Validators.required]),
    serviceTypeId: this.fb.control('',[Validators.required]),
    accessibilityId: this.fb.control('',[Validators.required]),
    languageIds:this.fb.control('',[Validators.required]),
    description: this.fb.control(''),
    price:this.fb.control(''),
    tags:this.fb.control('',[Validators.required])

  });

  this.createCourseForm2 = this.fb.group({
    disciplineIds:this.fb.control(''),
    studentIds:this.fb.control(''),
    teacherIds:this.fb.control('')
  
  });

  this.createCourseForm3 = this.fb.group({
    courseUrl: this.fb.control('',[Validators.required])
  });

  this.tagList = [];
}

getSchoolsForDropdown(){
  this._courseService.getAllSchools().subscribe((response) => {
    this.schools = response;
    this.createCourseForm1.controls['schoolId'].setValue(this.schools[0].schoolId, {onlySelf: true});
  });  
}

getSelectedSchool(schoolId:string){
  this._courseService.getSelectedSchool(schoolId).subscribe((response) => {
    this.selectedSchool = response;
    this.createCourseForm1.controls['schoolId'].setValue(this.selectedSchool.schoolId, {onlySelf: true});
    this.createCourseForm1.controls['schoolName'].setValue(this.selectedSchool.schoolName, {onlySelf: true});
  });  
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

  createCourse(){
    this.isSubmitted=true;
    if (!this.createCourseForm3.valid) {
      return;
    }

    this.loadingIcon = true;
    this.router.navigateByUrl(`user/courseProfile/${this.courseId}`)

  }

  back(): void {
    window.history.back();
  }

  forwardStep() {
    this.isStepCompleted = true;
    if (!this.createCourseForm1.valid) {
      return;
    }

    if(this.tagList == undefined || this.tagList.length == 0){
      this.isTagsValid = false;
      return;
    }

    // var schoolId = this.createCourseForm1.get('schoolId')?.value;
    this.course=this.createCourseForm1.value;
    // this.course.schoolId = schoolId;

    this.fileToUpload.append('schoolId', this.course.schoolId);
    this.fileToUpload.append('courseName', this.course.courseName);
    this.fileToUpload.append('serviceTypeId',this.course.serviceTypeId);
    this.fileToUpload.append('accessibilityId',this.course.accessibilityId);
    this.fileToUpload.append('languageIds',JSON.stringify(this.course.languageIds));
    this.fileToUpload.append('description', this.course.description);
    this.fileToUpload.append('price', this.course.price?.toString());
    this.courseName = this.course.courseName.split(' ').join('');
    this.fileToUpload.append('courseTags', JSON.stringify(this.tagList))
    this._courseService.isCourseNameExist(this.course.courseName).subscribe((response) => {
      if(!response){
        this.createCourseForm1.setErrors({ unauthenticated: true });
        return;
      }
      else{
        this.step += 1;
        this.isStepCompleted = false;
        this.nextPage = true;
    
        if(this.fromSchoolProfile != ''){
        this.createCourseForm3.patchValue({
          courseUrl: 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.course.courseName.split(' ').join(''),
          });
        }
       else{
        var schoolId = this.createCourseForm1.controls['schoolId'].value;
        this._courseService.getSelectedSchool(schoolId).subscribe((response) => {
          this.selectedSchool = response;
          this.createCourseForm3.patchValue({
            courseUrl: 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.course.courseName.split(' ').join(''),
          });
        });  
      
        }
      }
    });
    // this.isStepCompleted = false;
    // this.step += 1;
    // this.nextPage = true;

    // this.createCourseForm3.patchValue({
    //   courseUrl: 'byokul.com/schoolname/' + this.course.courseName.split(' ').join(''),
    // });
  }

  forwardStep2(){
    this.loadingIcon = true;
    this.isStepCompleted = true;

    this.fileToUpload.append('disciplineIds',JSON.stringify(this.disciplineIds));
    this.fileToUpload.append('studentIds',JSON.stringify(this.studentIds));
    this.fileToUpload.append('teacherIds',JSON.stringify(this.teacherIds));

    this.courseUrl = 'byokul.com/profile/course/' + this.selectedSchool.schoolName.split(' ').join('') + "/" +  this.courseName.split(' ').join('');
    this.fileToUpload.append('courseUrl',JSON.stringify(this.courseUrl));
    this._courseService.createCourse(this.fileToUpload).subscribe((response:any) => {
      this.courseId = response;
      this.loadingIcon = false;
      this.step += 1;
      this.isStepCompleted = false;
    });
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
    this.createCourseForm1.get('price')?.removeValidators(Validators.required);
    this.createCourseForm1.patchValue({
      price: null,
    });
  }

  getPaidCourse(){
    this.isCoursePaid = true;
    this.createCourseForm1.get('price')?.addValidators(Validators.required);
    //this.createCourseForm1.setErrors({ priceRequired: true });
  }

  openSidebar(){
    this.isOpenSidebar = true;

  }

  removeTeacher(event: any){
    const teacherIndex = this.teacherInfo.findIndex((item) => item.teacherId === event.teacherId);
    if (teacherIndex > -1) {
      this.teacherInfo.splice(teacherIndex, 1);
    }
  }

  removeStudent(event: any){
    const studentIndex = this.studentInfo.findIndex((item) => item.studentId === event.studentId);
    if (studentIndex > -1) {
      this.studentInfo.splice(studentIndex, 1);
    }
  }

  removeDiscipline(event: any){
    const disciplineIndex = this.disciplineInfo.findIndex((item) => item.id === event.id);
    if (disciplineIndex > -1) {
      this.disciplineInfo.splice(disciplineIndex, 1);
    }
  }

  openModal(link:any) {
    // const modalRef = this.modalService.open(ModalComponent);
    // modalRef.componentInstance.src = link;
  }

  courseProfile(){
    window.location.href=`profile/course/${this.selectedSchool.schoolName}/${this.courseName}`;
  }

  onEnter(event:any) {
    if(event.target.value.indexOf('#') > -1){
      this.tagList.push(event.target.value);
    }
    else{
      event.target.value = '#' + event.target.value;
      this.tagList.push(event.target.value);
    }
    
    event.target.value = '';
  }

    removeTag(tag:any){
    const tagIndex = this.tagList.findIndex((item) => item ===tag);
    if (tagIndex > -1) {
      this.tagList.splice(tagIndex, 1);
    }
   }

}
