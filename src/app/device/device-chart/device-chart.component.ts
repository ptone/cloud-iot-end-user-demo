import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import 'chartjs-plugin-streaming';
import {
  concatMap,
  debounceTime,
  distinctUntilChanged,
  map,
  filter,
  share,
  shareReplay,
  switchMap
} from 'rxjs/operators';
import * as moment from 'moment';

import { DeviceService } from '../../services/device.service';

@Component({
  selector: 'app-device-chart',
  templateUrl: './device-chart.component.html',
  styleUrls: ['./device-chart.component.scss']
})
export class DeviceChartComponent implements OnInit {
  lightChart: Chart;
  tempChart: Chart;
  currentLight: number;
  currentTemp: number;
  lastUpdated: Date;

  constructor(
    private deviceService: DeviceService,
  ) { }

  ngOnInit() {
    console.log('loading chart');
    this.deviceService.deviceTelemetry$('harrisTestDevice').subscribe(data => this.updateCharts(data));
  }


  async updateCharts(data) {
    data.sort((a, b) => a.time.toMillis() - b.time.toMillis());
    // if (this.loading) {
    //   this.loading = false;
    // }
    // if (!this.device || !this.device.exists) {
    //   return;
    // }

    // Get current values
    if (data.length) {
      this.currentLight = data[0].light;
      this.currentTemp = data[0].temp;
      this.lastUpdated = data[0].time.toDate();
    }
    // Create or update light chart
    if (!this.lightChart) {
      this.createLightChart();
    } else if (data.length) {
      const datapoint = {
        x: new Date(),
        y: data[0].light
      };
      this.lightChart.data.datasets[0].data.push(datapoint);
      this.lightChart.update({
        preservation: true
      });
    }

    if (!this.tempChart) {
      this.createTempChart();
    } else if (data.length) {
      const datapoint = {
        x: new Date(),
        y: data[0].temp
      };
      this.tempChart.data.datasets[0].data.push(datapoint);
      this.tempChart.update({
        preservation: true
      });
    }
  }


  createTempChart() {
    const canvas = document.getElementById('tempChart') as any;
    const ctx = canvas.getContext('2d');
    this.tempChart = new Chart(ctx, {
      type: 'line',
      data: {
          datasets: [{
              pointRadius: 0,
              label: 'Temperature Data',
              borderColor: 'rgb(255, 99, 132)',
              data: [],
          }]
      },
      // Configuration options go here
      options: {
        scales: {
          xAxes: [{
            type: 'realtime',   // x axis will auto-scroll from right to left
            realtime: {         // per-axis options
                duration: 20000,    // data in the past 20000 ms will be displayed
                delay: 4000,        // delay of 1000 ms, so upcoming values are known before plotting a line
                pause: false,       // chart is not paused
                ttl: undefined      // data will be automatically deleted as it disappears off the chart
            }
          }],
          yAxes: [{
            ticks: {
              min: 0,
              max: 60,
            }
          }]
        },
        plugins: {
          streaming: {            // per-chart option
              frameRate: 30       // chart is drawn 30 times every second
          }
        }
      }
    });
  }

  createLightChart() {
    const canvas = document.getElementById('lightChart') as any;
    const ctx = canvas.getContext('2d');
    this.lightChart = new Chart(ctx, {
      type: 'line',
      data: {
          datasets: [{
              pointRadius: 0,
              label: 'Light Data',
              borderColor: 'rgb(255, 99, 132)',
              data: [],
          }]
      },
      // Configuration options go here
      options: {
        scales: {
          xAxes: [{
            type: 'realtime',   // x axis will auto-scroll from right to left
            realtime: {         // per-axis options
                duration: 20000,    // data in the past 20000 ms will be displayed
                delay: 4000,        // delay of 1000 ms, so upcoming values are known before plotting a line
                pause: false,       // chart is not paused
                ttl: undefined      // data will be automatically deleted as it disappears off the chart
            }
          }],
          yAxes: [{
            ticks: {
              min: 0,
              max: 500,
            }
          }]
        },
        plugins: {
          streaming: {            // per-chart option
              frameRate: 30       // chart is drawn 30 times every second
          }
        }
      }
    });
  }

}
