import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { DbService } from '../../services/db.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-device-form',
  templateUrl: './device-form.component.html',
  styleUrls: ['./device-form.component.scss']
})
export class deviceFormComponent implements OnInit {
  constructor(
    private db: DbService,
    private auth: AuthService,
    public modal: ModalController,
    private fb: FormBuilder // private params: NavParams
  ) {}

  deviceForm: FormGroup;

  device;

  ngOnInit() {
    const data = {
      content: '',
      tag: '',
      status: 'pending',
      ...this.device
    };
    this.deviceForm = this.fb.group({
      content: [
        data.content,
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(250)
        ]
      
      ],
      status: [data.status, [Validators.required]],
      tag: [data.tag, []]
    });
  }

  async createdevice() {
    const uid = await this.auth.uid();
    const id = this.device ? this.device.id : '';
    const data = {
      uid,
      createdAt: Date.now(),
      ...this.device,
      ...this.deviceForm.value
    };

    this.db.updateAt(`devices/${id}`, data);
    this.modal.dismiss();
  }
}
