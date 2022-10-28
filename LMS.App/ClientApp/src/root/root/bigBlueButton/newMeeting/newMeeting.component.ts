import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NewMeetingModel } from 'src/root/interfaces/bigBlueButton/newMeeting';
import { StudentsService } from 'src/root/school_StudentsModule/services/students.service';

@Component({
  selector: 'students-Home',
  templateUrl: './newMeeting.component.html',
  styleUrls: [],
})
export class NewMeetingComponent implements OnInit {
  private _studentsService;
  meetingInfo:any;
  invalidMeetingName!: boolean;
  credentials: NewMeetingModel = {meetingName:''};

  
  constructor(studentService: StudentsService) {
    this._studentsService = studentService;
  }

  ngOnInit(): void {

    
  }

  createMeeting = (form: NgForm) => {
    debugger;
  this._studentsService.createMeeting(this.credentials).subscribe((response) => {
    this.meetingInfo = response;
    window.location = response.url;
    console.log(response);
  });
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

}
