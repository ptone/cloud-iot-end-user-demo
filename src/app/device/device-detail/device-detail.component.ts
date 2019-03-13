import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbService } from '../../services/db.service';
import { throwError, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-device-detail',
  templateUrl: './device-detail.component.html',
  styleUrls: ['./device-detail.component.scss']
})
export class DeviceDetailComponent implements OnInit {
  device$;
  public errorObject = null;

  constructor(private route: ActivatedRoute, private db: DbService) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.device$ = this.db.doc$(`devices/${id}`).pipe(
      catchError(err => {
        this.errorObject = err;
        return throwError(err);
      })
    );
  }
}
