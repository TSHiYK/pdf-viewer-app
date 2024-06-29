import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivityLogService } from '../../services/activity-log.service';
import { Observable, of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-activity-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-log.component.html',
  styleUrls: ['./activity-log.component.scss']
})
export class ActivityLogComponent implements OnInit {
  logs$: Observable<any[]> = of([]);

  constructor(private activityLogService: ActivityLogService, private authService: AuthService) { }

  ngOnInit(): void {
    this.logs$ = this.authService.getCurrentUser().pipe(
      switchMap((user: User | null) => {
        if (user?.organizationId) {
          return this.activityLogService.getLogs();
        } else {
          return of([]);
        }
      })
    );
  }
}
