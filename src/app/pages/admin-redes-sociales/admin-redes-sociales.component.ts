import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexStroke,
  ApexGrid,
  ApexLegend,
  ApexTooltip,
  ApexPlotOptions
} from 'ng-apexcharts';

@Component({
  selector: 'app-admin-redes-sociales',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-redes-sociales.component.html',
  styleUrls: ['./admin-redes-sociales.component.scss']
})
export class AdminRedesSocialesComponent implements OnInit {
  private isBrowser: boolean;
  showContent: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // Detectar si está en modo oscuro
  get isDarkMode(): boolean {
    if (!this.isBrowser || typeof document === 'undefined') {
      return false;
    }
    return document.documentElement.classList.contains('dark');
  }

  // Redes sociales con visualizaciones, seguidores, ingresos y gastos
  redesSociales = [
    { 
      name: 'Instagram', 
      visualizaciones: 2450000, 
      seguidores: 125000,
      ingresos: 2150.50,
      gastos: 850.50,
      status: 'Activo',
      color: 'pink'
    },
    { 
      name: 'LinkedIn', 
      visualizaciones: 1890000, 
      seguidores: 89000,
      ingresos: 1680.75,
      gastos: 620.75,
      status: 'Activo',
      color: 'blue'
    },
    { 
      name: 'X', 
      visualizaciones: 1560000, 
      seguidores: 67000,
      ingresos: 1320.25,
      gastos: 480.25,
      status: 'Activo',
      color: 'sky'
    },
    { 
      name: 'TikTok', 
      visualizaciones: 3200000, 
      seguidores: 210000,
      ingresos: 2850.00,
      gastos: 950.00,
      status: 'Activo',
      color: 'black'
    }
  ];

  // Configuración del gráfico de barras
  get chartSeries(): ApexAxisChartSeries {
    return [
      {
        name: 'Visualizaciones',
        data: this.redesSociales.map(red => red.visualizaciones)
      },
      {
        name: 'Seguidores',
        data: this.redesSociales.map(red => red.seguidores)
      }
    ];
  }

  chartOptions: ApexChart = {
    type: 'bar',
    height: 450,
    width: '100%',
    toolbar: { show: false },
    animations: {
      enabled: true,
      speed: 1000,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    },
    foreColor: '#6B7280'
  };

  chartPlotOptions: ApexPlotOptions = {
    bar: {
      horizontal: false,
      columnWidth: '85%',
      borderRadius: 6,
      borderRadiusApplication: 'end',
      borderRadiusWhenStacked: 'last',
      dataLabels: {
        position: 'top'
      },
      distributed: false,
      barHeight: '100%'
    }
  };

  get chartXAxis(): ApexXAxis {
    return {
      categories: this.redesSociales.map(red => red.name),
      labels: {
        style: {
          colors: this.isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '13px',
          fontWeight: 500,
          fontFamily: 'inherit'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    };
  }

  get chartYAxis(): ApexYAxis {
    return {
      title: {
        text: '',
        style: {
          color: this.isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '12px'
        }
      },
      labels: {
        style: {
          colors: this.isDarkMode ? '#9CA3AF' : '#6B7280',
          fontSize: '11px',
          fontWeight: 400
        },
        formatter: (value: number) => {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
          }
          return value.toString();
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    };
  }

  get chartDataLabels(): ApexDataLabels {
    return {
      enabled: true,
      offsetY: -20,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: this.isDarkMode ? ['#FFFFFF', '#FFFFFF'] : ['#1F2937', '#1F2937'],
        fontFamily: 'inherit'
      },
      formatter: (val: number) => {
        if (val >= 1000000) {
          return (val / 1000000).toFixed(1) + 'M';
        } else if (val >= 1000) {
          return (val / 1000).toFixed(0) + 'K';
        }
        return val.toString();
      }
    };
  }

  get chartGrid(): ApexGrid {
    return {
      show: true,
      strokeDashArray: 3,
      borderColor: this.isDarkMode ? '#374151' : '#E5E7EB',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      },
      padding: {
        top: 10,
        right: 10,
        bottom: 0,
        left: 0
      }
    };
  }

  get chartLegend(): ApexLegend {
    return {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '13px',
      fontFamily: 'inherit',
      fontWeight: 500,
      labels: {
        colors: this.isDarkMode ? ['#D1D5DB', '#D1D5DB'] : ['#374151', '#374151'],
        useSeriesColors: false
      },
      markers: {
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 15,
        vertical: 0
      }
    };
  }

  chartColors: string[] = ['#3B82F6', '#10B981']; // Azul y verde más clásicos y profesionales

  get chartTooltip(): ApexTooltip {
    return {
      theme: this.isDarkMode ? 'dark' : 'light',
      shared: true,
      intersect: false,
      style: {
        fontSize: '12px',
        fontFamily: 'inherit'
      },
      y: {
        formatter: (value: number) => {
          return this.formatNumber(value);
        }
      },
      marker: {
        show: true
      },
      fixed: {
        enabled: false
      }
    };
  }

  // Métricas adicionales
  metricas = {
    ingresos: 8900.50,
    gastos: 2900.50,
    seguidoresGanados: 15250,
    crecimientoMensual: 12.5
  };

  ngOnInit() {
    // Los getters se calcularán automáticamente cuando se renderice el gráfico
    this.startFadeInAnimation();
  }

  private startFadeInAnimation(): void {
    if (!this.isBrowser) {
      this.showContent = true;
      return;
    }
    
    setTimeout(() => {
      this.showContent = true;
    }, 100);
  }

  // Método para formatear números con separadores de miles
  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  // Método para formatear moneda
  formatCurrency(num: number): string {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(num);
  }

  // Método para formatear porcentaje
  formatPercent(num: number): string {
    return num.toFixed(1) + '%';
  }
}
