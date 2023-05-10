import { Component, Input } from '@angular/core';
import { GlobalConfigsService } from '../../services/global-configs.service';

@Component({
  selector: 'pec-smarthinking-tips-card',
  templateUrl: './smarthinking-tips-card.component.html',
  styleUrls: ['./smarthinking-tips-card.component.scss'],
})
export class SmarthinkingTipsCardComponent {
  @Input() classId: number;
  @Input() trackView: string;

  constructor(public globalConfigs: GlobalConfigsService) {}
}
