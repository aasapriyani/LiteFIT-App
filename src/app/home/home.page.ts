import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { IonicModule, AlertController, Platform } from '@ionic/angular'; 
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
  imports: [IonicModule, CommonModule, FormsModule]
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
    
    this.whistleSound.load();
    this.chimeSound.load();

    const savedName = await this.storage.get('userName');
    const lastDate = await this.storage.get('lastUpdateDate');
    const savedStreak = await this.storage.get('streak');
    const today = new Date().toDateString();

    this.streak = savedStreak ? savedStreak : 0;
    this.currentQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];

    // Inisialisasi daftar aktivitas
    this.activities = [
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
      
      if (lastDate !== today) {
        this.activities.forEach(a => a.done = false);
        await this.storage.set('activities', this.activities);
        await this.storage.set('lastUpdateDate', today);
      } else {
        const savedActivities = await this.storage.get('activities');
        if (savedActivities) {
          this.activities = savedActivities;
        }
      }

      // Alert selamat datang kembali
      setTimeout(async () => {
        const backAlert = await this.alertCtrl.create({
          header: `Halo Lagi, ${this.userName}! 👋`,
          message: 'Sudah siap melanjutkan latihanmu?',
          buttons: ['GAS POL!']
        });
        await backAlert.present();
      }, 800);
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
    }
    this.storage.set('activities', this.activities);
  }

  async resetName() {
    const alert = await this.alertCtrl.create({
      header: 'Ganti Profil?',
      message: 'Semua progres akan dihapus.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Ya, Ganti',
          handler: async () => {
            await this.storage.clear();
            this.activities.forEach(a => a.done = false);
            this.userName = '';
            this.streak = 0;
            this.isFirstTime = true;
          }
        }
      ]
    });
    await alert.present();
  }

  getPercent() {
    const finished = this.activities.filter(a => a.done).length;
    return Math.round((finished / this.activities.length) * 100);
  }

  getLevel() {
    const totalDone = this.activities.filter(a => a.done).length;
    if (totalDone <= 1) return { rank: "NEWBIE", icon: "egg-outline", color: "#aaa" };
    if (totalDone <= 3) return { rank: "WARRIOR", icon: "shield-half-outline", color: "#4facfe" };
    if (totalDone <= 5) return { rank: "ELITE", icon: "flame-outline", color: "#ff8c00" };
    return { rank: "LEGEND", icon: "trophy-outline", color: "#f53d3d" };
  }
}