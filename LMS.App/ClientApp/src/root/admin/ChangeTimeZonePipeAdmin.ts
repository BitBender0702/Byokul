import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'ChangeTimeZonePipe'
})
export class ChangeTimeZonePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(givenTime:any): any {
    
     // Ensure that the input string is in ISO 8601 format with UTC offset 'Z'
  const utcTime = moment.utc(givenTime, 'YYYY-MM-DDTHH:mm:ss.SSSSZ');

  // Convert the UTC time to IST (Indian Standard Time)
  const changedTimeZone = utcTime.tz(moment.tz.guess());

  // Format the date and time in the desired format
  return changedTimeZone; // Adjust the format as needed
  }
}