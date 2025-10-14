import { Component, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TwilioIntegrationModalComponent } from '../../shared/modals/twilio-integration-modal/twilio-integration-modal.component';
import { TwilioSuccessModalComponent } from '../../shared/modals/twilio-success-modal/twilio-success-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { TwilioConfig } from '../../shared/models/twilio-config.model';
import { TwilioService } from '../../core/services/twilio.service';
import { TwilioStorage } from '../../storages/twilio/twilio-storage';
import { LoaderComponent } from '../../shared/components/loader/loader.component';
import { AgentsService } from '../../core/services/agents.service';
import { Agent } from '../../shared/models/agent.model';
import { UserStorage } from '../../storages/user/user-storage';
import { UserService } from '../../core/services/user.service';
import { ElevenLabsService } from '../../core/services/eleven-labs.service';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
  ],
  templateUrl: './agents.component.html',
  styleUrl: './agents.component.scss',
})
export class AgentsComponent {
  dialog = inject(MatDialog);
  private router = inject(Router);
  private twilioService = inject(TwilioService);
  private agentsService = inject(AgentsService);
  private userService = inject(UserService);
  private elevenLabsService = inject(ElevenLabsService);

  public twilioStorage: any = inject(TwilioStorage);
  private userStorage: any = inject(UserStorage);
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  showIntegrationModal = false;
  showSuccessModal = false;

  textareaFocused = false;

  languages = [
    { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
    { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
    { code: 'fr', name: 'Français', flag: 'https://flagcdn.com/w40/fr.png' },
  ];

  showDropdown = false;

  agents: Agent[] = [];

  selectedAgent: Agent | null = null;
  selectedLanguage: any = null;
  showVoiceDropdown = false;

  currentStep = 1; // Seteado el valor por defecto en la primera pantalla
  public firstInteractionMessage: string = '';
  public agentInstructionMessage: string = '';
  
  // Variable para manejar el idioma actual
  currentLanguage: string = 'es';

  // Mensajes de instrucciones en ambos idiomas
  private spanishInstructions = `Rol:
Eres un agente telefónico de inteligencia artificial llamado Alex y trabajas como asistente virtual de atención al cliente de JD Sports, la reconocida cadena internacional líder en moda urbana, ropa deportiva y calzado de las mejores marcas.

Tarea:
Tu función es ayudar a los clientes que llaman respondiendo preguntas, resolviendo problemas relacionados con pedidos, devoluciones, productos, envíos y promociones. Debes proporcionar una atención profesional, clara, amable y eficiente, alineada con la imagen moderna y de calidad de JD Sports.

Responsabilidades principales:

Pedidos:

Consultar el estado de un pedido (preparación, enviado, entregado o pendiente).

Proporcionar el número de seguimiento si el pedido ha sido enviado.

Ayudar si un pedido no ha llegado o se ha perdido.

Devoluciones y cambios:

Explicar la política de devoluciones: 28 días desde la recepción, siempre que el producto esté en condiciones originales y con etiqueta.

Informar sobre cómo realizar una devolución (puntos JD, envío postal o devoluciones online).

Resolver dudas sobre reembolsos, plazos y procesos.

Consultas sobre productos:

Confirmar disponibilidad de productos (tallas, colores o modelos).

Aclarar dudas sobre tallaje, materiales, especificaciones, colecciones o lanzamientos.

En caso de que un producto esté agotado, ofrecer alternativas o informar sobre posibles reposiciones.

Información sobre envíos:

Explicar los tipos de envío: estándar, exprés y recogida en tienda.

Informar sobre tiempos de entrega:

Envío estándar: 3-5 días laborables.

Envío exprés: 1-2 días laborables.

Recogida en tienda: 2-5 días laborables.

Resolver problemas con retrasos o incidencias de transporte.

Pagos y facturación:

Aclarar dudas sobre métodos de pago aceptados: tarjeta bancaria, PayPal, Klarna (pago a plazos) y tarjetas regalo JD.

Asistir en casos de pago fallido o doble cobro.

Gestionar solicitudes de factura o comprobante de compra.

Cuentas y soporte técnico:

Ayudar con problemas de acceso a la cuenta, contraseñas olvidadas o errores en la web/app.

Promociones, ofertas y lanzamientos:

Informar sobre ofertas activas, rebajas, códigos de descuento, exclusivas online y próximos lanzamientos de zapatillas u otros productos.

Problemas o incidencias:

Manejar quejas, productos defectuosos, entregas incorrectas o paquetes dañados.

Ofrecer solución inmediata o escalar el caso a un agente humano cuando sea necesario.

Procedimiento cuando no puedes resolver:

Si no puedes resolver una consulta específica, toma los datos del cliente (nombre, correo y número de pedido o teléfono) y comunica que un agente especializado le contactará lo antes posible.

Tono y estilo:

Mantén siempre un tono joven, profesional, cercano y eficiente, acorde con la imagen moderna de JD Sports.

Sé claro, directo y resolutivo.

Evita sonar robótico, usa un lenguaje natural.

Personaliza la conversación usando el nombre del cliente si te lo proporciona.

Políticas principales de JD Sports:

Devoluciones: 28 días desde la entrega (en tienda o por correo).

Envíos: estándar (3-5 días), exprés (1-2 días), recogida en tienda (2-5 días).

Atención al cliente: Lunes a viernes de 9:00 a 18:00 (hora local).

Notas clave:

No inventes información. Si no estás seguro, indica que un agente humano continuará la gestión.

Nunca des datos personales sin validar la identidad del cliente (correo, nombre o número de pedido).

Mantén la marca JD Sports siempre presente en tus respuestas para reforzar confianza.

Ejemplo breve de conversación:
Cliente: Hola, mi pedido no ha llegado.
Tú: Claro, ¿puedes darme tu número de pedido o el correo con el que realizaste la compra?
Cliente: Sí, es 47892.
Tú: Perfecto, veo que tu pedido está en tránsito y deberías recibirlo en las próximas 24 horas. Te comparto el número de seguimiento: 72910XXXXX. ¿Puedo ayudarte en algo más?`;

  private englishInstructions = `Role:
You are a telephone artificial intelligence agent named Alex and you work as a virtual customer service assistant for JD Sports, the recognized international chain leader in urban fashion, sports clothing and footwear from the best brands.

Task:
Your function is to help customers who call by answering questions, solving problems related to orders, returns, products, shipments and promotions. You must provide professional, clear, friendly and efficient service, aligned with JD Sports' modern and quality image.

Main responsibilities:

Orders:

Check the status of an order (preparation, shipped, delivered or pending).

Provide the tracking number if the order has been shipped.

Help if an order has not arrived or has been lost.

Returns and exchanges:

Explain the return policy: 28 days from receipt, as long as the product is in original condition and with label.

Inform about how to make a return (JD points, postal shipping or online returns).

Resolve doubts about refunds, deadlines and processes.

Product inquiries:

Confirm product availability (sizes, colors or models).

Clarify doubts about sizing, materials, specifications, collections or launches.

In case a product is out of stock, offer alternatives or inform about possible restocking.

Shipping information:

Explain shipping types: standard, express and store pickup.

Inform about delivery times:

Standard shipping: 3-5 business days.

Express shipping: 1-2 business days.

Store pickup: 2-5 business days.

Resolve problems with delays or transportation incidents.

Payments and billing:

Clarify doubts about accepted payment methods: bank card, PayPal, Klarna (installment payment) and JD gift cards.

Assist in cases of failed payment or double charging.

Handle invoice requests or purchase receipts.

Accounts and technical support:

Help with account access problems, forgotten passwords or web/app errors.

Promotions, offers and launches:

Inform about active offers, discounts, discount codes, online exclusives and upcoming sneaker or other product launches.

Problems or incidents:

Handle complaints, defective products, incorrect deliveries or damaged packages.

Offer immediate solution or escalate the case to a human agent when necessary.

Procedure when you cannot resolve:

If you cannot resolve a specific query, take the customer's data (name, email and order number or phone) and communicate that a specialized agent will contact them as soon as possible.

Tone and style:

Always maintain a young, professional, friendly and efficient tone, in line with JD Sports' modern image.

Be clear, direct and decisive.

Avoid sounding robotic, use natural language.

Personalize the conversation using the customer's name if they provide it.

JD Sports main policies:

Returns: 28 days from delivery (in store or by mail).

Shipping: standard (3-5 days), express (1-2 days), store pickup (2-5 days).

Customer service: Monday to Friday from 9:00 to 18:00 (local time).

Key notes:

Don't invent information. If you're not sure, indicate that a human agent will continue the management.

Never give personal data without validating the customer's identity (email, name or order number).

Keep the JD Sports brand always present in your responses to reinforce trust.

Brief conversation example:
Customer: Hello, my order hasn't arrived.
You: Of course, can you give me your order number or the email with which you made the purchase?
Customer: Yes, it's 47892.
You: Perfect, I can see that your order is in transit and you should receive it in the next 24 hours. I share the tracking number: 72910XXXXX. Can I help you with anything else?`;

  get currentAgentInstructionMessage(): string {
    return this.currentLanguage === 'es' ? this.spanishInstructions : this.englishInstructions;
  }

  ngOnInit() {
    if (!this.isBrowser) {
      return;
    }

    // Recuperar idioma del localStorage si existe
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedLanguage = localStorage.getItem('interfaceLanguage');
      if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
        this.currentLanguage = savedLanguage;
      }
    }

        // Listener para detectar cambios de idioma
        if (typeof window !== 'undefined') {
          window.addEventListener('languageChanged', (e: any) => {
            this.currentLanguage = e.detail.language;
            // Actualizar el mensaje de instrucciones al idioma seleccionado
            this.agentInstructionMessage = this.currentAgentInstructionMessage;
          });
        }

    let token: string | null = null;

    if (typeof window !== 'undefined' && window.localStorage) {
      token = localStorage.getItem('token');
    }
    if (!token) {
      window.location.href = '/login'; // O usa '/' si tu página de inicio es esa
      return;
    }

    this.userService.getLanguages().subscribe((languages) => {
      this.languages = languages;
    });

    this.agentsService.getAgents().subscribe((agents) => {
      this.agents = agents;

      // Recuperar el agente seleccionado del localStorage
      let savedAgentId: string | null = null;

      if (typeof window !== 'undefined' && window.localStorage) {
        savedAgentId = localStorage.getItem('selectedAgentId');
      }

      if (savedAgentId && agents.length > 0) {
        this.selectedAgent =
          agents.find((agent) => agent.labsId === savedAgentId) || agents[0];
      } else {
        this.selectedAgent = this.userStorage.user()?.agent ?? agents[0];
      }

      this.selectedLanguage = this.selectedAgent?.language ?? this.languages[0];
    });

    // Inicializar los mensajes personalizados
    const config = this.twilioStorage.config();
    this.firstInteractionMessage = config?.firstInteraction || '';
    // Usar el mensaje según el idioma actual
    this.agentInstructionMessage = this.currentAgentInstructionMessage;
  }

  selectLanguage(lang: any) {
    this.selectedLanguage = lang;
    this.showDropdown = false;
  }

  selectAgent(agent: Agent) {
    this.selectedAgent = agent;
    this.showVoiceDropdown = false;

    // Guardar el agente seleccionado en localStorage
    if (
      agent &&
      agent.labsId &&
      typeof window !== 'undefined' &&
      window.localStorage
    ) {
      localStorage.setItem('selectedAgentId', agent.labsId);
    }
  }

  openIntegrationDialog(editMode: boolean) {
    const existingConfig = this.twilioStorage.config();

    const dialogRef = this.dialog.open(TwilioIntegrationModalComponent, {
      width: '380px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {
        formEnabled: editMode,
        config: existingConfig,
      },
    });

    dialogRef.afterClosed().subscribe((result: TwilioConfig) => {
      if (!result) return;

      const loaderRef = this.dialog.open(LoaderComponent, {
        width: '100px',
        disableClose: true,
        panelClass: 'loader-dialog',
      });

      this.twilioService.setConfig(result).subscribe({
        next: () => {
          loaderRef.close();
          this.openSuccessDialog(result);
        },
        error: (err) => {
          loaderRef.close();
          console.error('Error al guardar la configuración:', err);
        },
      });
    });
  }

  openSuccessDialog(twilioData: TwilioConfig) {
    this.dialog.open(TwilioSuccessModalComponent, {
      width: '400px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: {
        message: twilioData.countryCode + ' ' + twilioData.phoneNumber,
        title: 'Integración Twilio',
        twilioData: twilioData,
      },
    });
  }

  closeModals() {
    this.showIntegrationModal = false;
    this.showSuccessModal = false;
  }

  publishAgent() {
    if (!this.selectedAgent) {
      return;
    }

    const loaderRef = this.dialog.open(LoaderComponent, {
      width: '100px',
      disableClose: true,
      panelClass: 'loader-dialog',
    });

    this.selectedAgent.language = this.selectedLanguage;

    // Validar que el mensaje no esté vacío
    if (
      !this.firstInteractionMessage ||
      this.firstInteractionMessage.trim() === ''
    ) {
      loaderRef.close();
      console.error('El mensaje de saludo personalizado no puede estar vacío.');
      return;
    }

    // Primero guardar el mensaje de firstInteraction
    this.elevenLabsService
      .setFirstInteraction(this.firstInteractionMessage)
      .subscribe({
        next: () => {
          // Actualizar el store local con el nuevo firstInteraction
          const config = this.twilioStorage.config();
          if (config) {
            config.firstInteraction = this.firstInteractionMessage;
            this.twilioStorage.setConfig(config);
          }
          // Luego guardar la configuración del agente
          this.agentsService.setAgentConfig(this.selectedAgent!).subscribe({
            next: (response) => {
              loaderRef.close();
              this.dialog.open(TwilioSuccessModalComponent, {
                width: '400px',
                disableClose: false,
                panelClass: 'custom-dialog-container',
                data: {
                  message: '¡Agente configurado exitosamente!',
                  title: 'Configuración Completada',
                },
              });
            },
            error: (error) => {
              loaderRef.close();
              console.error('Error al publicar el agente:', error);
            },
          });
        },
        error: (error) => {
          loaderRef.close();
          console.error(
            'Error al guardar el mensaje de firstInteraction:',
            error
          );
        },
      });
  }

  irAlPaso(paso: number) {
    this.currentStep = paso;
    // Si el paso es el de saludo personalizado
    if (paso === 2) {
      const config = this.twilioStorage.config();
      this.firstInteractionMessage = config?.firstInteraction || '';
    }
    // Aquí puedes agregar lógica adicional según el paso
  }

  getProgressWidth(): string {
    const totalSteps = 4; // Total de pasos (1, 2, 3, 4)
    const progress = (this.currentStep / totalSteps) * 100;
    return `${progress}%`;
  }

  finalizarConfiguracion() {
    // Mostrar modal de éxito
    const dialogRef = this.dialog.open(TwilioSuccessModalComponent, {
      width: '400px',
      disableClose: false,
      panelClass: 'custom-dialog-container',
      data: {
        message: '¡Agente configurado exitosamente!',
        title: 'Configuración Completada',
      },
    });

    // Cuando se cierre el modal, navegar al dashboard
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/dashboard']);
    });
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
    
    // Guardar en localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('interfaceLanguage', this.currentLanguage);
    }
    
    // Disparar evento personalizado para notificar a otros componentes
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: this.currentLanguage } 
      }));
    }
  }
}
