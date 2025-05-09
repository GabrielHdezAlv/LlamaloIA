import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeChartComponent } from './home-chart/home-chart.component';
import { MatButtonModule } from '@angular/material/button';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ChartComponent,
  ApexStroke,
  ApexGrid,
  NgApexchartsModule,
} from 'ng-apexcharts';
import { CommonModule } from '@angular/common';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  grid: ApexGrid;
  colors: string[];
};

@Component({
  selector: 'app-home',
  imports: [
    HomeChartComponent,
    MatButtonModule,
    NgApexchartsModule,
    ChartComponent,
    CommonModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {
    series: [],
    chart: {
      type: 'area',
      height: '500vh',
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    title: {
      text: '',
      align: 'left',
    },
    grid: {
      row: {
        colors: ['transparent'],
        opacity: 0.5,
      },
    },
    colors: ['#003366'],
    xaxis: {
      categories: [],
    },
  };

  chartsInfo = {
    totalCalls: [
      { time: 120, name: 1711843200000 },
      { time: 150, name: 1712448000000 },
      { time: 180, name: 1713052800000 },
      { time: 130, name: 1713657600000 },
    ],
    callsDuration: [
      { time: 90, name: 1711843200000 },
      { time: 110, name: 1712448000000 },
      { time: 105, name: 1713052800000 },
      { time: 95, name: 1713657600000 },
    ],
    timeSaved: [
      { time: 3600, name: 1711843200000 },
      { time: 4200, name: 1712448000000 },
      { time: 3900, name: 1713052800000 },
      { time: 4000, name: 1713657600000 },
    ],
    weeklyVolume: [
      { time: 40, name: 'Lun' },
      { time: 60, name: 'Mar' },
      { time: 45, name: 'Mie' },
      { time: 254, name: 'Jue' },
      { time: 90, name: 'Vie' },
      { time: 45, name: 'Sab' },
      { time: 260, name: 'Dom' },
    ],
  };

  ngxChartData: any[] = [];

  ngOnInit(): void {
    const chartData = this.chartsInfo.weeklyVolume;

    this.chartOptions.series = [
      {
        name: 'Volumen Semanal',
        data: chartData.map((d) => d.time),
      },
    ];

    this.chartOptions.xaxis!.categories = chartData.map((d) => d.name);

    this.chartOptions.xaxis = {
      categories: chartData.map((d) => d.name),
      labels: {
        style: {
          colors: '#888888',
        },
      },
    };

    this.chartOptions.yaxis = {
      labels: {
        style: {
          colors: '#888888',
        },
      },
    };
  }

  get isChartReady(): boolean {
    return !!(
      this.chartOptions.series?.length &&
      this.chartOptions.xaxis?.categories?.length &&
      this.chartOptions.yaxis &&
      this.chartOptions.chart &&
      this.chartOptions.stroke &&
      this.chartOptions.grid &&
      this.chartOptions.colors
    );
  }
}
