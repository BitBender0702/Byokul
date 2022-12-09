import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { JoinMeetingModel } from 'src/root/interfaces/bigBlueButton/joinMeeting';
import { StudentsService } from 'src/root/userModule/services/students.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'students-Home',
  templateUrl: './joinMeeting.component.html',
  styleUrls: [],
})
export class JoinMeetingComponent implements OnInit {
  private _studentsService;
  meetingInfo:any;
  invalidMeetingName!: boolean;
  credentials: JoinMeetingModel = {meetingId:'',name:''};

  
  constructor(studentService: StudentsService,private route: ActivatedRoute) {
    this._studentsService = studentService;
  }

  ngOnInit(): void {

    
  }

  joinMeeting = (form: NgForm) => {
  var Id = this.route.snapshot.paramMap.get('meetingId');
  this.credentials.meetingId = Id ?? '';
  this._studentsService.joinMeeting(this.credentials).subscribe((response) => {
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
