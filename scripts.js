class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.wantedLevel = 0;
    }

    preload() {
        // Aset visual (Mobil merah sebagai motor, kuning sebagai polisi)
        this.load.image('motor', 'https://labs.phaser.io/assets/sprites/car-red.png');
        this.load.image('polisi', 'https://labs.phaser.io/assets/sprites/car-yellow.png');
    }

    create() {
        // 1. Gambar Dunia
        let graphics = this.add.graphics();
        // Area Kota
        graphics.fillStyle(MapData.city.color, 1);
        graphics.fillRect(0, 0, MapData.border, MapData.height);
        // Area Desa
        graphics.fillStyle(MapData.village.color, 1);
        graphics.fillRect(MapData.border, 0, MapData.width - MapData.border, MapData.height);
        // Garis Kuning Perbatasan
        graphics.lineStyle(10, 0xffff00, 1);
        graphics.lineBetween(MapData.border, 0, MapData.border, MapData.height);

        // 2. Pemain
        this.player = this.physics.add.sprite(500, 500, 'motor');
        this.player.setScale(0.7);
        this.player.setCollideWorldBounds(true);

        // 3. Grup Polisi
        this.polices = this.physics.add.group();

        // 4. Kamera & World
        this.cameras.main.setBounds(0, 0, MapData.width, MapData.height);
        this.physics.world.setBounds(0, 0, MapData.width, MapData.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // 5. Input Kontrol (Keyboard & Touch)
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');
        
        // Tabrakan
        this.physics.add.overlap(this.player, this.polices, this.handleBusted, null, this);
    }

    update() {
        const speed = 400;
        let isMoving = false;

        // KONTROL HP (SENTUH LAYAR)
        if (this.input.activePointer.isDown) {
            this.physics.moveToObject(this.player, this.input.activePointer, speed);
            // Rotasi motor ke arah sentuhan
            let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            this.player.rotation = angle + Math.PI/2;
            isMoving = true;
        } 
        
        // KONTROL LAPTOP (KEYBOARD)
        if (!isMoving) {
            this.player.setVelocity(0);
            if (this.cursors.left.isDown || this.keys.A.isDown) {
                this.player.setVelocityX(-speed);
                this.player.angle = -90;
            } else if (this.cursors.right.isDown || this.keys.D.isDown) {
                this.player.setVelocityX(speed);
                this.player.angle = 90;
            }
            if (this.cursors.up.isDown || this.keys.W.isDown) {
                this.player.setVelocityY(-speed);
                this.player.angle = 0;
            } else if (this.cursors.down.isDown || this.keys.S.isDown) {
                this.player.setVelocityY(speed);
                this.player.angle = 180;
            }
        }

        // UPDATE UI & LOKASI
        let currentLoc = this.player.x < MapData.border ? MapData.city.name : MapData.village.name;
        document.getElementById('loc').innerText = currentLoc;

        // LOGIKA WANTED LEVEL
        if (this.wantedLevel > 0) {
            this.polices.children.iterate((p) => {
                this.physics.moveToObject(p, this.player, 280 + (this.wantedLevel * 20));
                p.rotation = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y) + Math.PI/2;
            });
        }

        // TEKAN SPASI (DI LAPTOP) ATAU DOUBLE TAP UNTUK JADI KRIMINAL
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.addWanted();
        }
    }

    addWanted() {
        if (this.wantedLevel < 5) {
            this.wantedLevel++;
            document.getElementById('star-display').innerText = '⭐'.repeat(this.wantedLevel);
            this.spawnPolice();
        }
    }

    spawnPolice() {
        let x = this.player.x + Phaser.Math.Between(-600, 600);
        let y = this.player.y + Phaser.Math.Between(-600, 600);
        let p = this.polices.create(x, y, 'polisi');
        p.setTint(0x0000ff);
        p.setScale(0.7);
    }

    handleBusted() {
        if (this.wantedLevel > 0) {
            this.physics.pause();
            document.getElementById('busted').style.display = 'block';
            setTimeout(() => { location.reload(); }, 2000);
        }
    }
            }
