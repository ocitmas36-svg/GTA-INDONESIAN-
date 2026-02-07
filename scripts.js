class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.wantedLevel = 0;
    }

    preload() {
        // Menggunakan aset gambar motor dari Phaser Lab (Bisa kamu ganti nanti)
        this.load.image('motor', 'https://labs.phaser.io/assets/sprites/car-red.png');
        this.load.image('polisi', 'https://labs.phaser.io/assets/sprites/car-yellow.png');
    }

    create() {
        // 1. Gambar Tanah (Maps)
        let graphics = this.add.graphics();
        // Kota
        graphics.fillStyle(MapData.city.color, 1);
        graphics.fillRect(0, 0, MapData.border, MapData.height);
        // Desa
        graphics.fillStyle(MapData.village.color, 1);
        graphics.fillRect(MapData.border, 0, MapData.width - MapData.border, MapData.height);
        // Garis Batas
        graphics.lineStyle(15, 0xffff00, 0.8);
        graphics.lineBetween(MapData.border, 0, MapData.border, MapData.height);

        // 2. Player (Motor)
        this.player = this.physics.add.sprite(500, 500, 'motor');
        this.player.setScale(0.8);
        this.player.setCollideWorldBounds(true);

        // 3. Polisi Group
        this.polices = this.physics.add.group();

        // 4. Kamera
        this.cameras.main.setBounds(0, 0, MapData.width, MapData.height);
        this.physics.world.setBounds(0, 0, MapData.width, MapData.height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // 5. Kontrol
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D');

        // Deteksi Tabrakan
        this.physics.add.overlap(this.player, this.polices, this.handleBusted, null, this);
    }

    update() {
        let speed = 450;
        this.player.setVelocity(0);

        // Gerak Motor & Rotasi
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
            this.player.setAngle(-90);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed);
            this.player.setAngle(90);
        }
        if (this.cursors.up.isDown || this.keys.W.isDown) {
            this.player.setVelocityY(-speed);
            this.player.setAngle(0);
        } else if (this.cursors.down.isDown || this.keys.S.isDown) {
            this.player.setVelocityY(speed);
            this.player.setAngle(180);
        }

        // Cek Nama Lokasi
        let currentLoc = this.player.x < MapData.border ? MapData.city.name : MapData.village.name;
        document.getElementById('loc').innerText = currentLoc;

        // Bikin Kriminal (Tambah Bintang)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            this.doCrime();
        }

        // Logika Polisi Mengejar
        this.polices.children.iterate((p) => {
            this.physics.moveToObject(p, this.player, 300 + (this.wantedLevel * 20));
            p.rotation = Phaser.Math.Angle.Between(p.x, p.y, this.player.x, this.player.y) + Math.PI/2;
        });
    }

    doCrime() {
        if (this.wantedLevel < 5) {
            this.wantedLevel++;
            document.getElementById('star-display').innerText = '⭐'.repeat(this.wantedLevel);
            this.spawnPolice();
        }
    }

    spawnPolice() {
        let x = this.player.x + Phaser.Math.Between(-800, 800);
        let y = this.player.y + Phaser.Math.Between(-800, 800);
        let p = this.polices.create(x, y, 'polisi');
        p.setTint(0x0000ff);
        p.setScale(0.8);
    }

    handleBusted() {
        if (this.wantedLevel > 0) {
            this.physics.pause();
            document.getElementById('busted').style.display = 'block';
            setTimeout(() => { location.reload(); }, 2500);
        }
    }
    }
