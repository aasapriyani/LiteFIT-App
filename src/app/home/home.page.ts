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
  saveInitialName() {
    if (this.userName && this.userName.trim() !== "") {
      // Mengubah status isFirstTime jadi false supaya tampilan berganti ke Dashboard
      this.isFirstTime = false;
      
      // Opsional: Simpan nama ke memori HP agar kalau app ditutup, nama tidak hilang
      localStorage.setItem('athlete_name', this.userName);
      
      console.log("Selamat datang, " + this.userName);
    } else {
      // Jika nama kosong, beri peringatan
      alert("Masukkan nama kamu dulu ya, Atlet!");
    }
  }

  // 1. TAMBAHKAN STREAK DISINI (Agar error merah di terminal hilang)
  streak: number = 0;

  // 2. AUDIO LOKAL (Pastikan file sudah ada di src/assets/sounds/)
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
    
    // Preload audio agar lancar di Android
    this.whistleSound.load();
    this.chimeSound.load();

    if (this.platform.is('android')) {
      console.log("Running on Android - Adjusting Layout...");
    }

    const savedName = await this.storage.get('userName');
    const lastDate = await this.storage.get('lastUpdateDate'); // TAMBAHKAN INI
    const today = new Date().toDateString();

    if (savedName) {
      this.userName = savedName;
      this.isFirstTime = false;
      this.currentTab = 'LATIHAN';
      
      if (lastDate !== today) {
        // Jika ganti hari, bersihkan centang
        this.activities.forEach(a => a.done = false);
        await this.storage.set('activities', this.activities);
        await this.storage.set('lastUpdateDate', today);
      } else {
        // Jika hari yang sama, ambil data yang sudah dicentang
        const savedActivities = await this.storage.get('activities');
        if (savedActivities) {
          this.activities = savedActivities;
        }
      }
    }
  } // Penutup ngOnInit

  async saveInitialName() {
    if (this.userName && this.userName.trim().length > 0) {
      // Simpan nama ke memori HP
      await this.storage.set('userName', this.userName);

      // Simpan tanggal hari ini
      const today = new Date().toDateString();
      await this.storage.set('lastUpdateDate', today);

      // Pindah tampilan ke dashboard
      this.isFirstTime = false;
      this.currentTab = 'LATIHAN';

      console.log('Data Atlet Berhasil Disimpan!');
    }
  }

} // <--- INI PENUTUP TERAKHIR FILE (Class HomePage)
      
      setTimeout(async () => {
        const backAlert = await this.alertCtrl.create({
          header: `Halo Lagi, ${this.userName}! 👋`,
          message: 'Sudah siap melanjutkan latihanmu? Ayo gerak sedikit lagi agar tubuh tetap bugar!',
          buttons: ['GAS POL!']
        });
        await backAlert.present();
      }, 800);
    } else {
      this.isFirstTime = true;
    }

    // Load streak jika ada
    const savedStreak = await this.storage.get('streak');
    this.streak = savedStreak ? savedStreak : 0;

    this.activities = [
      { id: 1, name: 'PEREGANGAN', icon: 'accessibility-outline', done: false, color: '#4facfe' },
      { id: 2, name: 'PUTAR BAHU', icon: 'refresh-circle-outline', done: false, color: '#ff8c00' },
      { id: 3, name: 'JALAN TEMPAT', icon: 'walk-outline', done: false, color: '#00dbde' },
      { id: 4, name: 'WALL PUSH-UP', icon: 'fitness-outline', done: false, color: '#f53d3d' },
      { id: 5, name: 'MINUM AIR', icon: 'water-outline', done: false, color: '#2dd36f' },
      { id: 6, name: 'ISTIRAHAT MATA', icon: 'eye-outline', done: false, color: '#af40ff' }
    ];
    
    this.currentQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
  }

  async saveInitialName() {
    if (!this.userName || this.userName.trim().length === 0) {
      const alert = await this.alertCtrl.create({
        header: 'Eits!',
        message: 'Masukkan nama dulu ya biar keren.',
        buttons: ['OKE']
      });
      await alert.present();
      return;
    }

    this.userName = this.userName.toUpperCase();
    await this.storage.set('userName', this.userName);
    this.isFirstTime = false;
    this.currentTab = 'LATIHAN';
    this.chimeSound.play().catch(e => console.log('Audio play error', e));
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
      this.whistleSound.play().catch(e => console.log('Audio play error', e)); 
      this.timer = setInterval(() => { this.seconds++; }, 1000); 
    }
    this.isRunning = !this.isRunning;
  }

  toggleDone(item: any) {
    item.done = !item.done;
    if (item.done) {
      this.chimeSound.play().catch(e => console.log('Audio play error', e));
      // Logika streak sederhana
      this.streak++;
      this.storage.set('streak', this.streak);
    }
    this.storage.set('activities', this.activities);
    this.storage.set('lastUpdateDate', new Date().toDateString());
  }
  async resetName() {
    const alert = await this.alertCtrl.create({
      header: 'Ganti Profil?',
      message: 'Ini akan menghapus progres namamu dan centang latihan saat ini.',
      buttons: [
        { text: 'Batal', role: 'cancel' },
        {
          text: 'Ya, Ganti',
          handler: async () => {
            await this.storage.remove('userName');
            await this.storage.remove('activities');
            await this.storage.remove('lastUpdateDate');
            await this.storage.remove('streak');

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