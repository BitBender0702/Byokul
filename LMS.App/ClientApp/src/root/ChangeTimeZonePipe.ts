import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'ChangeTimeZonePipe'
})
export class ChangeTimeZonePipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(givenTime:any): any {
  const utcTime = moment.utc(givenTime, 'YYYY-MM-DDTHH:mm:ss.SSSSZ');
  const changedTimeZone = utcTime.tz(moment.tz.guess());
  return changedTimeZone;
  }
}