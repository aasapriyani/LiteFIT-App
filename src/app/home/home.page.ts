import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Platform } from '@ionic/angular'; 
import { LocalNotifications } from '@capacitor/local-notifications';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
  IonIcon, IonFooter, IonItem, IonInput, IonList, IonAlert 
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { addIcons } from 'ionicons'; 
import { 
  personCircle, flash, statsChart, checkmarkDoneCircle,
  eggOutline, shieldHalfOutline, flameOutline, trophyOutline,
  accessibilityOutline, refreshCircleOutline, walkOutline, fitnessOutline, waterOutline, eyeOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton, 
    IonIcon, 
    IonFooter, 
    IonItem, 
    IonInput,
    IonList,
    IonAlert
  ]
})
export class HomePage implements OnInit {
  currentTab: string = 'LATIHAN'; 
  userName: string = "";
  isFirstTime: boolean = true;
  activities: any[] = [];
  isRunning: boolean = false;
  seconds: number = 0;
  timer: any;
  currentQuote: string = "";
  streak: number = 0;

  // Expose icons for template binding with lookup capability
  public icons: any = {
    'person-circle': personCircle,
    'flash': flash,
    'stats-chart': statsChart,
    'checkmark-done-circle': checkmarkDoneCircle,
    'egg-outline': eggOutline,
    'shield-half-outline': shieldHalfOutline,
    'flame-outline': flameOutline,
    'trophy-outline': trophyOutline,
    'accessibility-outline': accessibilityOutline,
    'refresh-circle-outline': refreshCircleOutline,
    'walk-outline': walkOutline,
    'fitness-outline': fitnessOutline,
    'water-outline': waterOutline,
    'eye-outline': eyeOutline
  };

  // Audio Lokal
  whistleSound = new Audio('assets/sounds/whistle.mp3');
  chimeSound = new Audio('assets/sounds/chime.mp3');

  quotes: string[] = [
    "Kesehatan adalah kekayaan terbesar! 💪",
    "Mata sehat, fokus pun meningkat! 👀",
    "Disiplin adalah jembatan antara target dan hasil. ✨",
    "Jangan berhenti sampai kamu bangga. 🔥"
  ];

  constructor(
    private storage: Storage, 
    private alertCtrl: AlertController,
    private platform: Platform 
  ) {
    addIcons({
      'person-circle': personCircle,
      'flash': flash,
      'stats-chart': statsChart,
      'checkmark-done-circle': checkmarkDoneCircle,
      'egg-outline': eggOutline,
      'shield-half-outline': shieldHalfOutline,
      'flame-outline': flameOutline,
      'trophy-outline': trophyOutline,
      'accessibility-outline': accessibilityOutline,
      'refresh-circle-outline': refreshCircleOutline,
      'walk-outline': walkOutline,
      'fitness-outline': fitnessOutline,
      'water-outline': waterOutline,
      'eye-outline': eyeOutline
    });
  }

  async ngOnInit() {
    await this.storage.create();
    this.loadState();
    this.initNotifications();
  }

  async ionViewDidEnter() {
    await this.loadState();
  }

  private async loadState() {
    this.whistleSound.load();
    this.chimeSound.load();

    const savedName = await this.storage.get('userName');
    const lastDate = await this.storage.get('lastUpdateDate');
    const savedStreak = await this.storage.get('streak');
    const today = new Date().toDateString();

    this.streak = savedStreak ? savedStreak : 0;
    this.currentQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

    // Inisialisasi daftar aktivitas
    const defaultActivities = [
      { id: 1, name: 'PEREGANGAN', icon: 'accessibility-outline', done: false, color: '#4facfe' },
      { id: 2, name: 'PUTAR BAHU', icon: 'refresh-circle-outline', done: false, color: '#ff8c00' },
      { id: 3, name: 'JALAN TEMPAT', icon: 'walk-outline', done: false, color: '#00dbde' },
      { id: 4, name: 'WALL PUSH-UP', icon: 'fitness-outline', done: false, color: '#f53d3d' },
      { id: 5, name: 'MINUM AIR', icon: 'water-outline', done: false, color: '#2dd36f' },
      { id: 6, name: 'ISTIRAHAT MATA', icon: 'eye-outline', done: false, color: '#af40ff' }
    ];

    if (savedName) {
      this.userName = savedName;
      this.isFirstTime = false;
      this.currentTab = 'LATIHAN';
      
      const savedActivities = await this.storage.get('activities');
      if (lastDate !== today) {
        this.activities = defaultActivities;
        await this.storage.set('activities', this.activities);
        await this.storage.set('lastUpdateDate', today);
      } else {
        this.activities = savedActivities || defaultActivities;
      }
    } else {
      this.isFirstTime = true;
      this.activities = defaultActivities;
    }
  }

  async saveInitialName() {
    if (!this.userName || this.userName.trim().length === 0) {
      const alert = await this.alertCtrl.create({
        header: 'Eits!',
        message: 'Masukkan nama dulu ya.',
        buttons: ['OKE']
      });
      await alert.present();
      return;
    }

    this.userName = this.userName.toUpperCase();
    await this.storage.set('userName', this.userName);
    await this.storage.set('lastUpdateDate', new Date().toDateString());
    await this.storage.set('activities', this.activities);
    
    this.isFirstTime = false;
    this.currentTab = 'LATIHAN';
    this.chimeSound.play().catch(e => console.log('Audio error', e));

    const welcomeAlert = await this.alertCtrl.create({
      header: `Selamat Datang, ${this.userName}! 🚀`,
      subHeader: 'Mari Mulai Hidup Sehat',
      message: 'Senang melihatmu bergabung! Yuk, selesaikan gerakan pertamamu hari ini agar tubuh lebih segar.',
      buttons: ['AYO MULAI!']
    });
    await welcomeAlert.present();
  }

  formatTime(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  toggleTimer() {
    if (this.isRunning) { 
      clearInterval(this.timer); 
    } else { 
      this.whistleSound.play().catch(e => console.log('Audio error', e)); 
      this.timer = setInterval(() => { this.seconds++; }, 1000); 
    }
    this.isRunning = !this.isRunning;
  }

  toggleDone(item: any) {
    item.done = !item.done;
    if (item.done) {
      this.chimeSound.play().catch(e => console.log('Audio error', e));
      this.streak++;
      this.storage.set('streak', this.streak);
    } else if (this.streak > 0) {
      this.streak--;
      this.storage.set('streak', this.streak);
    }
    this.storage.set('activities', this.activities);
  }

  async initNotifications() {
    try {
      const permission = await LocalNotifications.checkPermissions();
      if (permission.display !== 'granted') {
        await LocalNotifications.requestPermissions();
      }
      
      await this.scheduleReminder();
    } catch (e) {
      console.error('Notification error:', e);
    }
  }

  async scheduleReminder() {
    // Cek jika sudah ada notifikasi terjadwal (opsional, tapi bagus untuk mencegah duplikasi)
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      return; 
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "LiteFIT 🔥",
          body: "Waktunya gerak kembali!",
          id: 1,
          schedule: { 
            allowWhileIdle: true,
            every: 'hour'
          },
          sound: 'chime.mp3'
        }
      ]
    });
  }

  getPercent() {
    if (!this.activities || this.activities.length === 0) return 0;
    const finished = this.activities.filter(a => a.done).length;
    return Math.round((finished / this.activities.length) * 100);
  }

  getLevel() {
    const totalDone = this.activities ? this.activities.filter(a => a.done).length : 0;
    if (totalDone <= 1) return { rank: "NEWBIE", icon: eggOutline, color: "#aaa" };
    if (totalDone <= 3) return { rank: "WARRIOR", icon: shieldHalfOutline, color: "#4facfe" };
    if (totalDone <= 5) return { rank: "ELITE", icon: flameOutline, color: "#ff8c00" };
    return { rank: "LEGEND", icon: trophyOutline, color: "#f53d3d" };
  }
}