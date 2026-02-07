class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.wantedLevel = 0;
    }

    preload() {
        // MENGGUNAKAN ASET MOTOR (Top-Down View)
        // Kamu bisa ganti URL ini dengan aset motor lokal di folder assets/ nanti
        this.load.image('motor', 'https://labs.phaser.io/assets/sprites/car-red.png'); // Placeholder motor
        this.load.image('polisi', 'https://labs.phaser.io/assets/sprites/car-yellow.png'); 
    }

    create() {
        // ... (kode background map tetap sama seperti sebelumnya) ...
        let bg = this.add.graphics();
        bg.fillStyle(MapData.city.groundColor, 1);
        bg.fillRect(0, 0, MapData.dividerX, MapData.height);
        bg.fillStyle(MapData.village.groundColor, 1);
        bg.fillRect(MapData.dividerX, 0, MapData.width - MapData.dividerX, MapData.height);

        // 1. PLAYER SEBAGAI MOTOR
        // Kita pakai sprite supaya bisa ganti gambar
        this.player = this.physics.add.sprite(500, 500, 'motor');
        this.player.setScale(0.8); // Ukuran motor disesuaikan
        this.player.setCollideWorldBounds(true);

        // 2. GROUP POLISI
        this.polices = this.physics.add.group();

        // 3. KAMERA
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.physics.world.setBounds(0, 0, MapData.width, MapData.height);

        // 4. INPUT
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Tabrakan
        this.physics.add.overlap(this.player, this.polices, this.onBusted, null, this);
    }

    update() {
        let speed = 400;
        this.player.setVelocity(0);

        // Logika Gerak Motor (WASD / Panah)
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setAngle(-90); // Putar motor ke kiri
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed);
            this.player.setAngle(90); // Putar motor ke kanan
        }

        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.player.setVelocityY(-speed);
            this.player.setAngle(0); // Putar motor ke atas
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.player.setVelocityY(speed);
            this.player.setAngle(180); // Putar motor ke bawah
        }

        // ... (sisanya sama: cek lokasi & spawn polisi) ...
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.triggerCrime();
        }
    }

    spawnPolice() {
        let spawnX = this.player.x + (Math.random() > 0.5 ? 600 : -600);
        let spawnY = this.player.y + (Math.random() > 0.5 ? 600 : -600);
        
        let p = this.polices.create(spawnX, spawnY, 'polisi');
        p.setTint(0x0000ff); // Mobil polisi jadi biru
        p.setScale(0.8);
    }
    
    // ... (fungsi triggerCrime dan onBusted tetap sama) ...
          }
