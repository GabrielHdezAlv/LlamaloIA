import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { UserStorage } from '../../storages/user/user-storage';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { computed } from '@angular/core';

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

interface PhoneFormat {
  pattern: RegExp;
  format: (number: string) => string;
}

const PHONE_FORMATS: { [key: string]: PhoneFormat } = {
  '+34': {
    pattern: /^(\d{3})(\d{3})(\d{3})$/,
    format: (number: string) => {
      if (number.length === 9) {
        const formatted = number.replace(/^(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3');
        return formatted;
      }
      return number;
    },
  },
  '+1': {
    pattern: /^(\d{3})(\d{3})(\d{4})$/,
    format: (number: string) =>
      number.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3'),
  },
  '+44': {
    pattern: /^(\d{2})(\d{4})(\d{4})$/,
    format: (number: string) => {
      const formatted = number.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3');
      return formatted;
    },
  },
  '+33': {
    pattern: /^(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    format: (number: string) =>
      number.replace(/^(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5'),
  },
  '+49': {
    pattern: /^(\d{2,4})(\d{3,4})(\d{4})$/,
    format: (number: string) =>
      number.replace(/^(\d{2,4})(\d{3,4})(\d{4})$/, '$1 $2 $3'),
  },
  '+52': {
    pattern: /^(\d{2})(\d{4})(\d{4})$/,
    format: (number: string) =>
      number.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3'),
  },
};

@Component({
  selector: 'app-home',
  imports: [
    HomeChartComponent,
    MatButtonModule,
    NgApexchartsModule,
    ChartComponent,
    CommonModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  userStorage = inject(UserStorage);
  private twilioStorage = inject(TwilioStorage);

  private formatPhoneNumber(countryCode: string, number: string): string {
    const format = PHONE_FORMATS[countryCode];
    if (!format) return number;

    // Eliminar cualquier espacio o caracter no numérico
    const cleanNumber = number.replace(/\D/g, '');

    if (format.pattern.test(cleanNumber)) {
      return format.format(cleanNumber);
    }

    return number;
  }

  public phoneNumber = computed(() => {
    const config = this.twilioStorage.config();
    if (!config) return '+34 600 00 00 00';

    const formattedNumber = this.formatPhoneNumber(
      config.countryCode,
      config.phoneNumber.toString()
    );

    return `${config.countryCode} ${formattedNumber}`;
  });

  public isConnected = computed(() => {
    return !!this.twilioStorage.config();
  });

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
