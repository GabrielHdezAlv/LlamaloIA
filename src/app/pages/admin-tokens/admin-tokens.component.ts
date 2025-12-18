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
  ApexFill
} from 'ng-apexcharts';

@Component({
  selector: 'app-admin-tokens',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './admin-tokens.component.html',
  styleUrls: ['./admin-tokens.component.scss']
})
export class AdminTokensComponent implements OnInit {
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

  // Servicios externos (tokens y gastos)
  servicios = [
    { 
      name: 'Twilio', 
      tokensRestantes: 170000, 
      gasto: 1250.50,
      status: 'Activo',
      color: 'red'
    },
    { 
      name: 'OpenAI', 
      tokensRestantes: 125000, 
      gasto: 890.75,
      status: 'Activo',
      color: 'green'
    },
    { 
      name: 'ElevenLabs', 
      tokensRestantes: 89000, 
      gasto: 650.25,
      status: 'Activo',
      color: 'purple'
    },
    { 
      name: 'Deepgram', 
      tokensRestantes: 210000, 
      gasto: 1100.00,
      status: 'Activo',
      color: 'blue'
    },
    { 
      name: 'Render', 
      tokensRestantes: 145000, 
      gasto: 720.30,
      status: 'Activo',
      color: 'indigo'
    }
  ];

  // Período seleccionado
  selectedPeriod: '7d' | '30d' | '1y' = '7d';

  // Datos históricos para el gráfico
  historicoTokens7d: number[] = [594000, 598000, 592000, 595000, 590000, 588000, 594000];
  historicoGastos7d: number[] = [3890, 3950, 3820, 3880, 3850, 3800, 3891.50];
  
  // Datos para últimos 30 días (generados)
  historicoTokens30d: number[] = [];
  historicoGastos30d: number[] = [];
  
  // Datos para último año (generados - mensual)
  historicoTokens1y: number[] = [];
  historicoGastos1y: number[] = [];

  // Generar datos para 30 días
  private generate30DaysData() {
    if (this.historicoTokens30d.length === 0) {
      const tokens: number[] = [];
      const gastos: number[] = [];
      let baseTokens = 594000;
      let baseGastos = 3890;
      
      for (let i = 0; i < 30; i++) {
        const variation = (Math.random() * 0.1 - 0.05); // Variación del ±5%
        tokens.push(Math.round(baseTokens * (1 + variation)));
        gastos.push(Math.round((baseGastos * (1 + variation)) * 100) / 100);
      }
      
      this.historicoTokens30d = tokens;
      this.historicoGastos30d = gastos;
    }
  }

  // Generar datos para último año (12 meses)
  private generate1YearData() {
    if (this.historicoTokens1y.length === 0) {
      const tokens: number[] = [];
      const gastos: number[] = [];
      let baseTokens = 550000;
      let baseGastos = 3500;
      
      for (let i = 0; i < 12; i++) {
        const growth = 1 + (i * 0.02); // Crecimiento gradual
        const variation = (Math.random() * 0.15 - 0.075); // Variación del ±7.5%
        tokens.push(Math.round(baseTokens * growth * (1 + variation)));
        gastos.push(Math.round((baseGastos * growth * (1 + variation)) * 100) / 100);
      }
      
      this.historicoTokens1y = tokens;
      this.historicoGastos1y = gastos;
    }
  }

  // Obtener categorías según el período
  get categoriasFecha(): string[] {
    if (this.selectedPeriod === '7d') {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const today = new Date();
      const result: string[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        result.push(days[date.getDay()]);
      }
      return result;
    } else if (this.selectedPeriod === '30d') {
      const result: string[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        result.push(date.getDate().toString());
      }
      return result;
    } else {
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return months;
    }
  }

  // Obtener datos según el período
  get historicoTokens(): number[] {
    if (this.selectedPeriod === '7d') {
      return this.historicoTokens7d;
    } else if (this.selectedPeriod === '30d') {
      this.generate30DaysData();
      return this.historicoTokens30d;
    } else {
      this.generate1YearData();
      return this.historicoTokens1y;
    }
  }

  get historicoGastos(): number[] {
    if (this.selectedPeriod === '7d') {
      return this.historicoGastos7d;
    } else if (this.selectedPeriod === '30d') {
      this.generate30DaysData();
      return this.historicoGastos30d;
    } else {
      this.generate1YearData();
      return this.historicoGastos1y;
    }
  }

  // Configuración del gráfico de líneas
  get chartSeries(): ApexAxisChartSeries {
    return [
      {
        name: 'Tokens',
        type: 'area',
        data: this.historicoTokens
      },
      {
        name: 'Gasto (€)',
        type: 'area',
        data: this.historicoGastos
      }
    ];
  }

  chartOptions: ApexChart = {
    type: 'area',
    height: 380,
    width: '100%',
    toolbar: { show: false },
    zoom: {
      enabled: false
    },
    animations: {
      enabled: true,
      speed: 800,
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

  chartStroke: ApexStroke = {
    curve: 'smooth',
    width: 3
  };

  get chartXAxis(): ApexXAxis {
    return {
      categories: this.categoriasFecha,
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontWeight: 500
        },
        rotate: this.selectedPeriod === '30d' ? -45 : 0,
        hideOverlappingLabels: this.selectedPeriod === '30d'
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    };
  }

  get chartYAxis(): any {
    const isDark = this.isDarkMode;
    return [
      {
        title: {
          text: 'Tokens',
          style: {
            color: isDark ? '#FFFFFF' : '#3B82F6',
            fontSize: '11px',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            colors: ['#6B7280'],
            fontSize: '11px'
          },
          formatter: (value: number) => {
            if (value >= 1000) {
              return (value / 1000).toFixed(0) + 'K';
            }
            return value.toString();
          }
        }
      },
      {
        opposite: true,
        title: {
          text: 'Gasto (€)',
          style: {
            color: isDark ? '#FFFFFF' : '#10B981',
            fontSize: '11px',
            fontWeight: 600
          }
        },
        labels: {
          style: {
            colors: ['#6B7280'],
            fontSize: '11px'
          },
          formatter: (value: number) => {
            return '€' + value.toFixed(0);
          }
        }
      }
    ];
  }

  chartDataLabels: ApexDataLabels = {
    enabled: false
  };

  chartGrid: ApexGrid = {
    show: true,
    strokeDashArray: 3,
    borderColor: '#E5E7EB',
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
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  };

  chartLegend: ApexLegend = {
    show: true,
    position: 'top',
    horizontalAlign: 'left',
    floating: false,
    fontSize: '13px',
    fontFamily: 'inherit',
    fontWeight: 600,
    labels: {
      colors: ['#374151', '#374151'],
      useSeriesColors: false
    },
    markers: {
      offsetX: 0,
      offsetY: 0
    },
    itemMargin: {
      horizontal: 12,
      vertical: 0
    }
  };

  chartColors: string[] = ['#2563EB', '#10B981'];

  // Configuración del fill con opacidad adaptativa
  get chartFill(): ApexFill {
    const isDark = this.isDarkMode;
    return {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: undefined, // Usar el mismo color de la serie
        inverseColors: false,
        opacityFrom: isDark ? 0.6 : 0.4,
        opacityTo: isDark ? 0.15 : 0.05,
        stops: [0, 100]
      }
    };
  }

  // Configuración del tooltip que se adapta al modo
  get chartTooltip(): ApexTooltip {
    return {
      theme: this.isDarkMode ? 'dark' : 'light',
      shared: true,
      intersect: false,
      style: {
        fontSize: '13px',
        fontFamily: 'inherit'
      },
      y: {
        formatter: (value: number, opts: any) => {
          if (opts.seriesIndex === 0) {
            return this.formatNumber(value) + ' tokens';
          }
          return this.formatCurrency(value);
        }
      },
      marker: {
        show: true
      },
      fixed: {
        enabled: false
      },
      fillSeriesColor: false
    };
  }

  ngOnInit() {
    // Aquí puedes cargar los tokens y gastos reales desde un servicio
    // Observar cambios en el modo oscuro
    if (this.isBrowser) {
      const observer = new MutationObserver(() => {
        // Forzar detección de cambio (los getters se evaluarán cuando se acceda)
        this.detectDarkModeChange();
      });
      
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });
    }
    
    // Iniciar animación fade in
    this.startFadeInAnimation();
  }

  private detectDarkModeChange() {
    // Los getters se evaluarán automáticamente cuando Angular los acceda
    // Esto solo fuerza una detección si es necesario
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

  // Cambiar período
  setPeriod(period: '7d' | '30d' | '1y') {
    this.selectedPeriod = period;
  }

  // Obtener texto del período seleccionado
  get periodText(): string {
    if (this.selectedPeriod === '7d') {
      return 'Últimos 7 días';
    } else if (this.selectedPeriod === '30d') {
      return 'Último mes';
    } else {
      return 'Último año';
    }
  }

  // Método para formatear números con separadores de miles
  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-ES').format(num);
  }

  // Método para formatear moneda
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }
}

