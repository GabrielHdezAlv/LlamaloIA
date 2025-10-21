import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'llamaloAI';

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadIntercom();
    }
  }

  private loadIntercom(): void {
    const w = window as any;

    // Configurar Intercom
    w.intercomSettings = {
      api_base: 'https://api-iam.intercom.io',
      app_id: 'tpi8snld',
      hide_default_launcher: false,
    };

    // Función de inicialización de Intercom
    const initIntercom = () => {
      const ic = w.Intercom;
      if (typeof ic === 'function') {
        ic('reattach_activator');
        ic('update', w.intercomSettings);
      } else {
        const d = document;
        const i: any = function () {
          i.c(arguments);
        };
        i.q = [];
        i.c = function (args: any) {
          i.q.push(args);
        };
        w.Intercom = i;

        const loadScript = () => {
          const s = d.createElement('script');
          s.type = 'text/javascript';
          s.async = true;
          s.src = 'https://widget.intercom.io/widget/tpi8snld';
          const x = d.getElementsByTagName('script')[0];
          if (x && x.parentNode) {
            x.parentNode.insertBefore(s, x);
          }
        };

        if (document.readyState === 'complete') {
          loadScript();
        } else if (w.attachEvent) {
          w.attachEvent('onload', loadScript);
        } else {
          w.addEventListener('load', loadScript, false);
        }
      }
    };

    // Ejecutar inmediatamente
    initIntercom();
  }
}
