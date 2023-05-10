import { Component, Input, OnInit } from '@angular/core';
import { ClassLocation } from '../../../../data/types/class.type';

@Component({
  selector: 'pec-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.scss'],
})
export class MeetingCardComponent implements OnInit {
  @Input() courseCode: string;
  @Input() locations: ClassLocation[];

  public meetingsList: ClassLocation[] = [];

  constructor() {}

  public ngOnInit() {
    this.locations.forEach((item) => {
      if (item.RoomNumber !== 'HYBRID') {
        item.StartTimeFormattedString = this.formatClassStartTime(item.StartTimeFormattedString);
        this.meetingsList.push(item);
      }
    });
  }

  private formatClassStartTime(startTime) {
    let day = startTime.split(',')[0].trim();
    const time = startTime.split(',')[1].trim();
    day = day.length > 3 ? day.substring(0, 3) : day;

    return `${day}, ${time.toUpperCase()}`;
  }
}
