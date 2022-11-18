import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { StudentsModel } from '../../interfaces/user';
import { StudentsService } from '../../services/students.service';

@Component({
  selector: 'students-Home',
  templateUrl: 'userHome.component.html',
  styleUrls: [],
})
export class UserHomeComponent implements OnInit {
  private _studentsService;
  users: StudentsModel[] = [];
  meetingInfo:any;

  url: string = "https://google.com";
  urlSafe!: SafeResourceUrl;
  
  constructor(studentService: StudentsService,public sanitizer: DomSanitizer) {
    this._studentsService = studentService;
  }

  ngOnInit(): void {
    this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
}
}
