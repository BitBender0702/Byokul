import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CertificateTemplateEnum } from 'src/root/Enums/certificateTemplateEnum';
import { PostAuthorTypeEnum } from 'src/root/Enums/postAuthorTypeEnum';
import { NotificationType } from 'src/root/interfaces/notification/notificationViewModel';
import { SaveStudentCertificate } from 'src/root/interfaces/student/saveStudentCertificate';
import { ClassService } from 'src/root/service/class.service';
import { CourseService } from 'src/root/service/course.service';
import { NotificationService } from 'src/root/service/notification.service';
import { StudentService } from 'src/root/service/student.service';

@Component({
    selector: 'payment',
    templateUrl: './generateCertificate.component.html',
    styleUrls: ['./generateCertificate.component.css'],
    providers: [MessageService]
  })

  export class GenerateCertificateComponent {
    isSubmitted: boolean = false;
    isStepCompleted: boolean = false;
    step: number = 0;
    loadingIcon:boolean = false;

    createCertificateForm1!:FormGroup;
    // createCertificateForm2!:FormGroup;
    // createCertificateForm3!:FormGroup;
    private _classService;
    private _courseService;
    private _studentService;
    private _notificationService;
    certificateInfo:any;
    disabled:boolean = true;
    fileToUpload= new FormData();
    uploadSignatureImage!:any;
    uploadQrImage!:any;
    currentDate!:string;
    certificateId!:number;
    isTemplateSelected:boolean = false;

    studentName!:string;
    studentId!:string;
    classOrCourseName!:string;
    courseName!:string;
    createdDate!:any;
    certificateHtml!:string;
    saveStudentCertificate!:SaveStudentCertificate;
    isCreatingClassCertificate!:boolean;
    from!:number;
    isSendCertificateToAll:boolean = false;
    isDataLoaded:boolean = false;
    loginUserId!:string;
    certificateTitle!:string;
    certificateReason!:string;



    constructor(private fb: FormBuilder,private route: ActivatedRoute,private router: Router,public messageService:MessageService,classService:ClassService,courseService:CourseService,studentService:StudentService,notificationService:NotificationService,private domSanitizer: DomSanitizer) {
        this._classService = classService;
        this._courseService = courseService;
        this._studentService = studentService;
        this._notificationService = notificationService;
    }

    ngOnInit(): void {
        this.step = 0;
        this.loadingIcon = true;

        var id = this.route.snapshot.paramMap.get('id')??'';
        var from = this.route.snapshot.paramMap.get('from');
        this.from = Number(from);

        if(Number(from) == 1){
          this._classService.getClassInfoForCertificate(id).subscribe((response) => {
            this.certificateInfo = response;
            this.isCreatingClassCertificate = true;

            this.createCertificateForm1.controls['schoolId'].setValue(this.certificateInfo.school.schoolId, {onlySelf: true});
            this.createCertificateForm1.controls['schoolName'].setValue(this.certificateInfo.school.schoolName, {onlySelf: true});
            this.createCertificateForm1.controls['classId'].setValue(this.certificateInfo.classId, {onlySelf: true});
            this.createCertificateForm1.controls['className'].setValue(this.certificateInfo.className, {onlySelf: true});
            this.createCertificateForm1.controls['studentId'].setValue(this.certificateInfo.students[0].studentId, {onlySelf: true});
            this.isDataLoaded = true;
            this.loadingIcon = false;
          });
        }

        if(Number(from) == 2){
          this._courseService.getCourseInfoForCertificate(id).subscribe((response) => {
            this.certificateInfo = response;
            this.isCreatingClassCertificate = false;
            this.createCertificateForm1.controls['schoolId'].setValue(this.certificateInfo.school.schoolId, {onlySelf: true});
            this.createCertificateForm1.controls['schoolName'].setValue(this.certificateInfo.school.schoolName, {onlySelf: true});
            this.createCertificateForm1.controls['courseId'].setValue(this.certificateInfo.courseId, {onlySelf: true});
            this.createCertificateForm1.controls['courseName'].setValue(this.certificateInfo.courseName, {onlySelf: true});
            this.createCertificateForm1.controls['studentId'].setValue(this.certificateInfo.students[0].studentId, {onlySelf: true});
            this.isDataLoaded = true;
            this.loadingIcon = false;
          });
        }

        this.currentDate = this.getCurrentDate();
        this.createCertificateForm1 = this.fb.group({
            schoolId: this.fb.control('', [Validators.required]),
            schoolName: this.fb.control(''),
            certificateTitle: this.fb.control('', [Validators.required]),
            studentId: this.fb.control('',[Validators.required]),
            certificateReason: this.fb.control('',[Validators.required]),
            classId: this.fb.control(''),
            className: this.fb.control(''),
            courseId: this.fb.control(''),
            courseName: this.fb.control(''),
            date: this.fb.control('',[Validators.required]),
        }, {validator: this.dateLessThan('date',this.currentDate)});
        

        this.getCurrentuserId();
      
    }

    getCurrentuserId(){
      var validToken = localStorage.getItem("jwt");
      if (validToken != null) {
        let jwtData = validToken.split('.')[1]
        let decodedJwtJsonData = window.atob(jwtData)
        let decodedJwtData = JSON.parse(decodedJwtJsonData);
        this.loginUserId = decodedJwtData.jti;
      }
    }

    getCurrentDate(){
        var today = new Date();
          var dd = String(today. getDate()). padStart(2, '0');
          var mm = String(today. getMonth() + 1). padStart(2, '0');
          var yyyy = today. getFullYear();
          var currentDate = yyyy + '-' + mm + '-' + dd;
          return currentDate;
    }

    dateLessThan(from: string, currentDate:string) {
        return (group: FormGroup): {[key: string]: any} => {
         let f = group.controls[from];
         if(f.value ==""){
          return {};
         }
         if (f.value < currentDate) {
           return {
             dates: `Please enter valid date`
           };
         }
         return {};
        }
      }

    forwardStep1() {
        this.isStepCompleted = true;
        if (!this.createCertificateForm1.valid) {
            return;
          }
        this.step += 1;
        this.isStepCompleted = false;
    }

    forwardStep2() {
      if(this.certificateId == undefined){
         this.certificateId = 6;
      }
            var certificateInfo=this.createCertificateForm1.value;
            if(this.from == 1){
            this.classOrCourseName = certificateInfo.className;
            }
            else{
              this.classOrCourseName = certificateInfo.courseName;
            }
            this.createdDate = certificateInfo.date;

            this.studentId = certificateInfo.studentId;

            // if All students selected
            if( this.studentId == "All"){
              this.isSendCertificateToAll = true;
             this.studentId = this.certificateInfo.students[0].studentId;
            }

            var students: any[] = this.certificateInfo.students;
            var student = students.find(x => x.studentId == this.studentId);
            this.studentName = student.studentName;
            this.certificateTitle = certificateInfo.certificateTitle;
            this.certificateReason = certificateInfo.certificateReason;
            
        this.step += 1;
    }



    createCertificate(){
        this.InitializeSaveStudentCertificate();
        this.certificateHtml = document.getElementById('finalCertificate')?.innerHTML??'';
        this.saveStudentCertificate.certificateHtml = this.certificateHtml;
        if(this.isSendCertificateToAll){
          this.saveStudentCertificate.students = this.certificateInfo.students;
          this.saveStudentCertificate.studentId = null;
        }
        else{
         var students: any[] = this.certificateInfo.students;
         var student = students.find(x => x.studentId == this.studentId);
         this.saveStudentCertificate.students?.push(student);
          this.saveStudentCertificate.studentId = null;
        }
        this.saveStudentCertificate.certificateName = this.classOrCourseName;
        this.saveStudentCertificate.schoolName = this.certificateInfo.school.schoolName;
        this.saveStudentCertificate.certificateTitle = this.certificateTitle;
        this.saveStudentCertificate.certificateReason = this.certificateReason;
        this.saveStudentCertificate.date = this.createdDate;
        this.saveStudentCertificate.uploadSignatureImage = this.uploadSignatureImage.changingThisBreaksApplicationSecurity;
        this.saveStudentCertificate.uploadQrImage = this.uploadQrImage.changingThisBreaksApplicationSecurity;
        this.saveStudentCertificate.schoolAvatar = this.certificateInfo.school.avatar;

        if(this.certificateId == CertificateTemplateEnum.Certificate1Id){
          this.saveStudentCertificate.backgroundImage = "../../../assets/images/certificate-frame-first.svg";
        }
        if(this.certificateId == CertificateTemplateEnum.Certificate2Id){
          this.saveStudentCertificate.backgroundImage = "./../../assets/images/certificate-frame-2.svg";
        }
        if(this.certificateId == CertificateTemplateEnum.Certificate3Id){
          this.saveStudentCertificate.backgroundImage = "./../../assets/images/certificate-frame3.svg";
        }
        if(this.certificateId == CertificateTemplateEnum.Certificate4Id){
          this.saveStudentCertificate.backgroundImage = "./../../assets/images/certificate-frame4.svg";
        }
        if(this.certificateId == CertificateTemplateEnum.Certificate5Id){
          this.saveStudentCertificate.backgroundImage = "./../../assets/images/certificate-frame5.svg";
        }
        if(this.certificateId == CertificateTemplateEnum.Certificate6Id){
          this.saveStudentCertificate.backgroundImage = "./../../assets/images/certificate-frame6.svg";
        }
 



      
        if(!this.isSendCertificateToAll){
          this.messageService.add({severity:'success', summary:'Success',life: 3000, detail:`Certificate successfully sent to the ${this.studentName}`});
        }
        else{
          this.messageService.add({severity:'info', summary:'Info',life: 3000, detail:'We will notify you, when certificate will be sent to all the students'});
        }

        this._studentService.saveStudentCertificates(this.saveStudentCertificate).subscribe((response) => {
          if(this.isSendCertificateToAll){
             var notificationContent = `Certificates created for ${this.classOrCourseName} students are successfully sent`;
             this._notificationService.initializeNotificationViewModel(this.loginUserId,NotificationType.CertificateSent,notificationContent,this.loginUserId,null,0,null,null).subscribe((response) => {});
          }

            // this.certificateInfo = response;

            // if(this.from == 1){
            // this.router.navigateByUrl(`profile/class/${this.certificateInfo.school.schoolName.replace(" ","").toLowerCase()}/${this.certificateInfo.className.replace(" ","").toLowerCase()}`)
            // }
            // else{
            //   this.router.navigateByUrl(`profile/course/${this.certificateInfo.school.schoolName.replace(" ","").toLowerCase()}/${this.certificateInfo.courseName.replace(" ","").toLowerCase()}`);
            // }
        });
    }

    InitializeSaveStudentCertificate(){
     this.saveStudentCertificate = {
        certificateHtml: '',
        studentId: '',
        certificateName:'',
        students:[],
        schoolName:'',
        certificateTitle:'',
        certificateReason:'',
        date:new Date(),
        uploadSignatureImage:'',
        uploadQrImage:'',
        backgroundImage:'',
        schoolAvatar:''
     }
    }

    handleSignatureInput(event: any) {
        this.fileToUpload.append("signature", event.target.files[0], event.target.files[0].name);
    const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadSignatureImage = _event.target?.result; 
        this.uploadSignatureImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadSignatureImage);
    }
    reader.readAsDataURL(event.target.files[0]); 
      }

      handleQrCodeInput(event: any) {
        this.fileToUpload.append("qrCode", event.target.files[0], event.target.files[0].name);
    const reader = new FileReader();
    reader.onload = (_event) => { 
        this.uploadQrImage = _event.target?.result; 
        this.uploadQrImage = this.domSanitizer.bypassSecurityTrustUrl(this.uploadQrImage);
    }
    reader.readAsDataURL(event.target.files[0]); 
      }

      removeQrImage(){
        this.uploadQrImage = null;
        this.fileToUpload.set('qrCode', '');
    }

    removeSignatureImage(){
        this.uploadSignatureImage = null;
        this.fileToUpload.set('signature', '');
    }

    backStep() {
        this.step -= 1;
      }

      addCertificateId(certificateId:number){
        this.certificateId = certificateId;
      }

      getCertificate(certificateNumber:Number){
      if(certificateNumber == 1){
        var res = document.getElementById('certificate1')?.innerHTML;
       }
      }
 
}
