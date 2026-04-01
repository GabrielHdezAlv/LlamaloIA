import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, effect, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModalService } from '../../modals/modal.service';
import { AiSphereComponent } from '../ai-sphere/ai-sphere.component';
import {
    VoiceTestService,
    VoiceTestConfig,
} from '../../../core/services/voice-test.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
    selector: 'app-support-widget',
    standalone: true,
    imports: [CommonModule, AiSphereComponent],
    templateUrl: './support-widget.component.html',
    styleUrl: './support-widget.component.scss'
})
export class SupportWidgetComponent implements OnInit, OnDestroy {
    isOpen = false;
    isClosing = false;
    /** Un poco más largo que la animación de la X (300 ms) para evitar cortar el último frame. */
    private readonly closeAnimationMs = 340;
    audioLevel = 0;
    isMicrophoneActive = false;
    isSettingsOpen = false;
    volume = 80; // Default volume (0-100)
    isPlaying = false;
    currentUrl = '';
    hideSupportWidget = false;

    /** Fuera de la plantilla: `@` en HTML dispara NG5002 (bloques de control). */
    readonly advancedSupportMailto = 'mailto:team@llamalo.ai';
    readonly advancedSupportEmailLabel = 'team@llamalo.ai';

    readonly voiceTest = inject(VoiceTestService);
    private router = inject(Router);
    private notificationService = inject(NotificationService);

    private animationId: any;
    private isBrowser: boolean;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;

    constructor(
        @Inject(PLATFORM_ID) platformId: Object,
        private modalService: ModalService
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        effect(() => {
            const state = this.voiceTest.connectionState();
            if (state === 'ended' || state === 'error') {
                this.isPlaying = false;
                this.isMicrophoneActive = false;
                this.stopMicrophone();
                this.animateIdle();
            }
        });
    }

    ngOnInit() {
        if (this.isBrowser) {
            this.animateIdle();
            this.updateVisibility();
            this.router.events
                .pipe(filter(event => event instanceof NavigationEnd))
                .subscribe(() => {
                    this.updateVisibility();

                    // Al navegar: si NO hay llamada en curso, cerramos el widget
                    // (comportamiento original). Si hay llamada activa, no tocamos nada.
                    const state = this.voiceTest.connectionState();
                    const hasActiveCall = state === 'connecting' || state === 'connected';
                    if (!hasActiveCall) {
                        this.closeWidget();
                    }
                });
        }
    }

    private updateVisibility(): void {
        this.currentUrl = this.router.url;
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) {
            route = route.firstChild;
        }
        this.hideSupportWidget = route.data['hideSupportWidget'] === true;
    }

    get shouldShow(): boolean {
        const authRoutes = ['/login', '/register', '/verify-email', '/shopify'];
        if (authRoutes.some(route => this.currentUrl.includes(route))) return false;
        if (this.hideSupportWidget) return false;
        return true;
    }

    /** Fondo del slider de volumen según tema (modo claro vs oscuro). */
    get volumeSliderBackground(): string {
        if (!this.isBrowser) {
            return '';
        }
        const dark = document.documentElement.classList.contains('dark');
        const v = this.volume;
        if (dark) {
            return `linear-gradient(90deg, #ffffff 0%, #ffffff ${v}%, rgba(255, 255, 255, 0.2) ${v}%, rgba(255, 255, 255, 0.2) 100%)`;
        }
        return `linear-gradient(90deg, #1e3a8a 0%, #1e3a8a ${v}%, #e2e8f0 ${v}%, #e2e8f0 100%)`;
    }

    ngOnDestroy() {
        if (this.isBrowser) {
            this.stopMicrophone();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    /**
     * Cierra el widget y detiene cualquier sesi?n de voz/micr?fono activa.
     * Se usa tanto al cambiar de p?gina como cuando el usuario lo cierra manualmente.
     */
    private closeWidget() {
        // Si no hay nada activo ni abierto, no hacemos nada
        if (!this.isOpen && !this.isPlaying && !this.isMicrophoneActive) {
            return;
        }

        // Solo notificar "finalizado" si había llamada real (connecting/connected).
        // Abrir y cerrar el panel sin iniciar la llamada no debe disparar endSession().
        const conn = this.voiceTest.connectionState();
        if (
            conn === 'connecting' ||
            conn === 'connected' ||
            this.isPlaying
        ) {
            this.voiceTest.endSession();
        } else if (conn === 'error') {
            this.voiceTest.reset();
        }
        this.isPlaying = false;
        this.isMicrophoneActive = false;
        this.stopMicrophone();
        this.animateIdle();

        if (this.isOpen) {
            this.isClosing = true;
            this.isSettingsOpen = false;
            setTimeout(() => {
                this.isOpen = false;
                this.isClosing = false;
            }, this.closeAnimationMs);
        }
    }

    toggle() {
        if (this.isOpen) {
            // Si hay una llamada en curso, solo minimizamos el widget
            const state = this.voiceTest.connectionState();
            const hasActiveCall = state === 'connecting' || state === 'connected';

            if (hasActiveCall) {
                this.isOpen = false;
                this.isClosing = false;
                this.isSettingsOpen = false;
                return;
            }

            // Si no hay llamada, cerramos completamente
            this.closeWidget();
        } else {
            this.isOpen = true;
        }
    }

    onBackdropClick(event: MouseEvent) {
        // Solo cerrar al hacer click fuera cuando NO hay llamada en curso
        const state = this.voiceTest.connectionState();
        const hasActiveCall = state === 'connecting' || state === 'connected';
        if (hasActiveCall) {
            return;
        }

        const target = event.target as HTMLElement;
        // Si el clic NO est? dentro del contenido del widget, consideramos que es fondo
        const clickedInsideContent = !!target.closest('.widget-content');
        if (!clickedInsideContent) {
            this.closeWidget();
        }
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
    }

    setVolume(value: string) {
        const parsed = parseInt(value, 10);
        const clamped = isNaN(parsed) ? 0 : Math.min(100, Math.max(0, parsed));
        this.volume = clamped;
        // Mapear 0-100 ��� 0.0-1.0 y actualizar volumen real de reproducci?n
        this.voiceTest.setPlaybackVolume(this.volume / 100);
    }

    async togglePlayback() {
        if (this.isPlaying) {
            this.voiceTest.endSession();
            this.isPlaying = false;
            this.isMicrophoneActive = false;
            this.stopMicrophone();
            this.animateIdle();
        } else {
            if (this.isMicrophoneActive) {
                this.stopMicrophone();
            }
            this.isMicrophoneActive = true;
            const config: VoiceTestConfig = {
                useSupportChat: true,
                agentInstruction: '',
                firstInteraction: '',
                language: 'es',
                name: 'Xenon',
                voiceId: '',
                parameters: {
                    stability: 0.5,
                    similarity: 0.75,
                    style: 0,
                    boost: false,
                    speed: 1,
                },
            };
            try {
                await this.voiceTest.startSession(config);
            } catch (err) {
                this.isMicrophoneActive = false;
                this.isPlaying = false;
                return;
            }
            try {
                await this.startMicrophone();
            } catch (_) {
                // Sin analizador de mic la bola solo reaccionar? al agente
            }
            this.isPlaying = true;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animateVoiceCall();
        }
    }

    async toggleMicrophone() {
        if (this.isPlaying) {
            this.voiceTest.toggleMute();
            this.isMicrophoneActive = !this.voiceTest.isMuted();
        } else {
            if (this.isMicrophoneActive) {
                this.stopMicrophone();
                this.animateIdle();
            } else {
                await this.startMicrophone();
            }
        }
    }

    private animateVoiceCall() {
        if (!this.isBrowser || !this.isPlaying) return;
        const connState = this.voiceTest.connectionState();
        if (connState === 'ended' || connState === 'error') return;

        let target = 0.15;
        const playbackLevel = this.voiceTest.getPlaybackLevel();
        if (playbackLevel > 0.02) {
            const wave = 0.6 + Math.sin(Date.now() / 200) * 0.25;
            target = Math.max(target, Math.min(1, playbackLevel * wave));
        }

        if (this.analyser && !this.voiceTest.isMuted()) {
            const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            this.analyser.getByteFrequencyData(dataArray);
            let max = 0;
            for (let i = 0; i < dataArray.length; i++) max = Math.max(max, dataArray[i]);
            const userLevel = Math.min(1, Math.pow(max / 255, 0.5) * 1.2);
            target = Math.max(target, userLevel);
        }

        this.audioLevel = this.audioLevel * 0.75 + target * 0.25;
        this.animationId = requestAnimationFrame(() => this.animateVoiceCall());
    }

    private async startMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);

            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.3;
            this.microphone.connect(this.analyser);

            this.isMicrophoneActive = true;
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animateVoice();

        } catch (error) {
            console.error('Error al acceder al micr?fono:', error);
            this.notificationService.error(
                'No se pudo acceder al micr?fono. Por favor, verifica los permisos.'
            );
        }
    }

    private stopMicrophone() {
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.analyser = null;
        this.isMicrophoneActive = false;
        this.audioLevel = 0;
    }

    private animateIdle() {
        const animate = () => {
            if (!this.isBrowser || this.isMicrophoneActive) return;
            // Pulso sinusoidal suave
            this.audioLevel = Math.sin(Date.now() / 1000) * 0.2 + 0.1;
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    private animateVoice() {
        if (!this.isMicrophoneActive || !this.analyser) return;

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

        const updateLevel = () => {
            if (!this.isMicrophoneActive || !this.analyser) return;

            this.analyser.getByteFrequencyData(dataArray);

            let max = 0;
            for (let i = 0; i < dataArray.length; i++) {
                max = Math.max(max, dataArray[i]);
            }

            let normalizedLevel = max / 255;
            normalizedLevel = Math.pow(normalizedLevel, 0.5);
            normalizedLevel = Math.min(normalizedLevel, 1.0);

            // Factor de sensibilidad para que se note m?s la voz
            const targetLevel = normalizedLevel * 1;
            this.audioLevel = this.audioLevel * 0.7 + targetLevel * 0.3;
            this.audioLevel = Math.min(this.audioLevel, 1);

            this.animationId = requestAnimationFrame(updateLevel);
        };

        updateLevel();
    }
}
