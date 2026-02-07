class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.wantedLevel = 0;
    }

    preload() {
        // Menggunakan sprite mobil sebagai motor & polisi
        this.load.image('motor', 'https://labs.phaser.io/assets/sprites/car-red.png');
        this.load.image('polisi', 'https://labs.phaser.io/assets/sprites/car-yellow.png');
    }

    create() {
        // 1. Gambar Dunia (Set Pipeline Light)
        let graphics = this.add.graphics();
        
        // Aspal Kota
        graphics.fillStyle(MapData.city.color, 1);
        graphics.fillRect(0, 0, MapData.border, MapData.height);
        
        // Rumput Desa
        graphics.fillStyle(MapData.village.color, 1);
        graphics.fillRect(MapData.border, 0, MapData.width - MapData.border, MapData.height);
        
        // Garis Perbatasan
        graphics.lineStyle(8, 0xffff00, 0.5);
        graphics.lineBetween(MapData.border, 0, MapData.border, MapData.height);

        // 2. Player (Motor)
        this.player = this.physics.add.sprite(500, 500, 'motor');
        this.player.setScale(0.8);
        this.player.setCollideWorldBounds(true);

        // 3. EFEK LAMPU (REALISM)
        // Kita buat lampu sorot di depan motor
        this.headlight = this.add.pointlight(this.player.x, this.player.y, 0xffffff, 300, 0.5);
        
        // 4. Polisi Group
        this.polices = this.physics.add.group();

        // 5. Kamera
        this.cameras.main.setBounds(0, 0, MapData.width, MapData.height);
        this.physics.world.setBounds(0, 0, MapData.width, MapData.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // 6. Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        this.physics.add.overlap(this.player, this.polices, this.handleBusted, null, this);
    }

    update() {
        const speed = 450;
        let isMoving = false;

        // Kontrol HP (Sentuh Layar)
        if (this.input.activePointer.isDown) {
            this.physics.moveToObject(this.player, this.input.activePointer, speed);
            let angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            this.player.rotation = angle + Math.PI/2;
            isMoving = true;
        }

        // Kontrol PC (Keyboard)
        if (!isMoving) {
            this.player.setVelocity(0);
            if (this.cursors.left.isDown || this.keys.A.isDown) { this.player.setVelocityX(-speed); this.player.angle = -90; }
            else if (this.cursors.right.isDown || this.keys.D.isDown) { this.player.setVelocityX(speed); this.player.angle = 90; }
            if (this.cursors.up.isDown || this.keys.W.isDown) { this.player.setVelocityY(-speed); this.player.angle = 0; }
            else if (this.cursors.down.isDown || this.keys.S.isDown) { this.player.setVelocityY(speed); this.player.angle = 180; }
        }

        // Update Posisi Lampu agar mengikuti Motor
        this.headlight.x = this.player.x;
        this.headlight.y = this.player.y;

        // Lokasi & UI
        let locName = this.player.x < MapData.border ? MapData.city.name : MapData.village.name;
        document.getElementById('loc').innerText = "GPS: " + locName;

        // Wanted Level & Polisi
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) { this.addWanted(); }

        this.polices.children.iterate((p) => {
            if (p) {
                this.physics.moveToObject(p, this.player, 300 + (this.wantedLevel * 20));
                p.rotation = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y) + Math.PI/2;
            }
        });
    }

    addWanted() {
        if (this.wantedLevel < 5) {
            this.wantedLevel++;
            document.getElementById('star-display').innerText = '⭐'.repeat(this.wantedLevel);
            let x = this.player.x + (Math.random() > 0.5 ? 500 : -500);
            let y = this.player.y + (Math.random() > 0.5 ? 500 : -500);
            let p = this.polices.create(x, y, 'polisi');
            p.setTint(0x0000ff);
            // Kasih lampu polisi (Merah Biru)
            this.add.pointlight(p.x, p.y, 0xff0000, 150, 0.4).setAlpha(0.5);
        }
    }

    handleBusted() {
        if (this.wantedLevel > 0) {
            this.physics.pause();
            document.getElementById('busted').style.display = 'block';
            setTimeout(() => { location.reload(); }, 2500);
        }
    }
    }
