import { Component, Input, OnChanges } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
import { curveBasis } from 'd3-shape';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexYAxis,
  NgApexchartsModule,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis?: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  grid: ApexGrid;
  colors: string[];
};

@Component({
  selector: 'app-home-chart',
  imports: [NgxChartsModule, NgApexchartsModule],
  templateUrl: './home-chart.component.html',
  styleUrl: './home-chart.component.scss',
})
export class HomeChartComponent implements OnChanges {
  @Input() chartLabel!: string;
  @Input() chartData!: { time: number; name: number }[];
  @Input() chartIndex!: number;

  chartOptions: Partial<ChartOptions> = {};
  curve = curveBasis;

  ngOnChanges(): void {
    const seriesData = this.chartData.map((d) => ({
      x: new Date(d.name).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      }),
      y: d.time,
    }));

    this.chartOptions = {
      series: [
        {
          name: this.chartLabel,
          data: seriesData,
        },
      ],
      chart: {
        type: 'area',
        height: '40px',
        width: '100%',
        sparkline: { enabled: true },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      grid: {
        show: false,
      },
      xaxis: {
        type: 'category',
        labels: {
          show: false,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        show: false,
      },
      colors: [this.getChartColor()],
    };
  }

  getChartColor(): string {
    switch (this.chartIndex) {
      case 0:
        return '#F97316'; // naranja
      case 1:
        return '#EF4444'; // rojo
      case 2:
        return '#10B981'; // verde
      default:
        return '#6B7280'; // gris por defecto
    }
  }

  colorScheme(): Color {
    return {
      name: 'custom',
      selectable: true,
      group: ScaleType.Ordinal,
      domain: [this.getChartColor()],
    };
  }

  totalChartInfo(): string {
    if (this.chartIndex === 0) {
      const totalTime = this.chartData.reduce(
        (sum, item) => sum + item.time,
        0
      );
      return `${totalTime}`;
    }

    const totalTime = this.chartData.reduce((sum, data) => sum + data.time, 0);
    const avgTime = totalTime / this.chartData.length;

    if (this.chartIndex === 1) {
      const minutes = Math.floor(avgTime / 60);
      const seconds = Math.floor(avgTime % 60);
      return `${minutes}m ${seconds}s`;
    } else if (this.chartIndex === 2) {
      const hours = Math.floor(avgTime / 3600);
      return `${hours}h`;
    }

    return '0';
  }
}
