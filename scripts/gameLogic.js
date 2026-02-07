class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.wantedLevel = 0;
        this.polices = null;
        this.lastCrimeTime = 0;
    }

    preload() {
        // Aset Motor Pemain & Mobil Polisi
        this.load.image('player_motor', 'https://labs.phaser.io/assets/sprites/car-red.png');
        this.load.image('police_car', 'https://labs.phaser.io/assets/sprites/car-yellow.png');
    }

    create() {
        // 1. Setup Map (Kota & Desa)
        this.cameras.main.setBounds(0, 0, MapConfig.fullWidth, MapConfig.height);
        this.physics.world.setBounds(0, 0, MapConfig.fullWidth, MapConfig.height);

        let bg = this.add.graphics();
        bg.fillStyle(MapConfig.city.color, 1);
        bg.fillRect(0, 0, MapConfig.city.width, MapConfig.height);
        bg.fillStyle(MapConfig.village.color, 1);
        bg.fillRect(MapConfig.city.width, 0, MapConfig.village.width, MapConfig.height);

        // 2. Pemain
        this.player = this.physics.add.sprite(MapConfig.city.spawnPoint.x, MapConfig.city.spawnPoint.y, 'player_motor');
        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // 3. Grup Polisi
        this.polices = this.physics.add.group();
        
        // Tabrakan Polisi dengan Pemain
        this.physics.add.collider(this.player, this.polices, this.handleArrest, null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        // 4. Instruksi & Bintang UI
        this.add.text(20, 50, 'TEKAN [SPACE] UNTUK BUAT KRIMINAL', { fill: '#fff' }).setScrollFactor(0);
        this.starText = this.add.text(20, 80, '', { fontSize: '32px', fill: '#ffff00' }).setScrollFactor(0);
    }

    update() {
        const speed = 400;
        this.player.setVelocity(0);

        // Input Gerak
        if (this.cursors.left.isDown) { this.player.setVelocityX(-speed); this.player.angle = -90; }
        else if (this.cursors.right.isDown) { this.player.setVelocityX(speed); this.player.angle = 90; }
        if (this.cursors.up.isDown) { this.player.setVelocityY(-speed); this.player.angle = 0; }
        else if (this.cursors.down.isDown) { this.player.setVelocityY(speed); this.player.angle = 180; }

        // Trigger Wanted Level (Contoh: Tekan Spasi)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.addWantedLevel();
        }

        // Logika Polisi Mengejar
        this.polices.children.iterate((police) => {
            this.physics.moveToObject(police, this.player, 250 + (this.wantedLevel * 20));
            // Polisi berputar menghadap pemain
            police.rotation = Phaser.Math.Angle.Between(police.x, police.y, this.player.x, this.player.y) + Math.PI/2;
        });

        // Update UI Bintang
        this.starText.setText('⭐'.repeat(this.wantedLevel));
    }

    addWantedLevel() {
        if (this.wantedLevel < 5) {
            this.wantedLevel++;
            this.spawnPolice();
        }
    }

    spawnPolice() {
        // Polisi muncul di luar layar kamera tapi di dalam map
        const x = this.player.x + Phaser.Math.Between(-500, 500);
        const y = this.player.y + Phaser.Math.Between(-500, 500);
        let police = this.polices.create(x, y, 'police_car');
        police.setTint(0x0000ff); // Kasih warna biru biar kayak polisi
    }

    handleArrest(player, police) {
        if (this.wantedLevel > 0) {
            alert("BUSTED! Kamu tertangkap polisi Indonesia.");
            this.wantedLevel = 0;
            this.polices.clear(true, true);
            player.setPosition(500, 500); // Balik ke RS / Kantor Polisi
        }
    }
          }
