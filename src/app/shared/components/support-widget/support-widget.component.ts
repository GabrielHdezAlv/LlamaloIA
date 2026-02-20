import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, effect, inject, computed } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ModalService } from '../../modals/modal.service';
import { AiSphereComponent } from '../ai-sphere/ai-sphere.component';
import {
    VoiceTestService,
    VoiceTestConfig,
} from '../../../core/services/voice-test.service';

@Component({
    selector: 'app-support-widget',
    standalone: true,
    imports: [CommonModule, AiSphereComponent],
    templateUrl: './support-widget.component.html',
    styleUrl: './support-widget.component.scss'
})
export class SupportWidgetComponent implements OnInit, OnDestroy {
    isOpen = false;
    audioLevel = 0;
    isMicrophoneActive = false;
    isSettingsOpen = false;
    volume = 80; // Default volume
    isPlaying = false;
    currentUrl = '';

    readonly voiceTest = inject(VoiceTestService);
    private router = inject(Router);

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
                this.animateIdle();
            }
        });
    }

    ngOnInit() {
        if (this.isBrowser) {
            this.animateIdle();
            this.currentUrl = this.router.url;
            this.router.events.pipe(
                filter(event => event instanceof NavigationEnd)
            ).subscribe((event: any) => {
                this.currentUrl = event.url;
            });
        }
    }

    get shouldShow(): boolean {
        const authRoutes = ['/login', '/register', '/verify-email'];
        return !authRoutes.some(route => this.currentUrl.includes(route));
    }

    ngOnDestroy() {
        if (this.isBrowser) {
            this.stopMicrophone();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
        }
    }

    toggle() {
        this.isOpen = !this.isOpen;
        if (!this.isOpen) this.isSettingsOpen = false;
    }

    toggleSettings() {
        this.isSettingsOpen = !this.isSettingsOpen;
    }

    setVolume(value: string) {
        this.volume = parseInt(value);
        // Here you would typically adjust the actual audio output volume
        // if هناك actual audio logic.
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.voiceTest.endSession();
            this.isPlaying = false;
            this.isMicrophoneActive = false;
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
            this.voiceTest.startSession(config);
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
        const state = this.voiceTest.agentState();
        const connState = this.voiceTest.connectionState();
        if (connState === 'ended' || connState === 'error') return;

        let target = 0.1;
        if (state === 'speaking') target = 0.6 + Math.sin(Date.now() / 200) * 0.2;
        else if (state === 'thinking') target = 0.3 + Math.sin(Date.now() / 400) * 0.15;
        else if (connState === 'connected') target = 0.2 + Math.sin(Date.now() / 800) * 0.1;

        this.audioLevel = this.audioLevel * 0.8 + target * 0.2;
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
            console.error('Error al acceder al micrófono:', error);
            this.modalService.openError({
                title: 'Error de micrófono',
                message: 'No se pudo acceder al micrófono. Por favor, verifica los permisos.'
            });
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

            // Factor de sensibilidad para que se note más la voz
            const targetLevel = normalizedLevel * 1;
            this.audioLevel = this.audioLevel * 0.7 + targetLevel * 0.3;
            this.audioLevel = Math.min(this.audioLevel, 1);

            this.animationId = requestAnimationFrame(updateLevel);
        };

        updateLevel();
    }
}
