class player extends Phaser.Scene {
    constructor() {
        super("player");
        this.markKey = null;
        this.fireKey = null;
        this.leftKey = null;
        this.rightKey = null;
        this.downKey = null;
        this.upKey = null;
        this.angle = 0;
        this.velocityX = Math.cos(this.angle);
        this.velocityY = Math.sin(this.angle);
        this.lockX = 0;
        this.lockY = 0;
        this.enemytime = 0;
        this.score = 0;
        this.boom = false;
        this.leveldiff = 1;
        this.enemyspeed = 0.1;
        this.enemycount = this.leveldiff * 10;
        this.civdead = 0;
        this.enemydead = 0;
    }

    init(data) {
        this.enemytime = data.enemytime,
            this.score = data.score,
            this.boom = data.boom,
            this.leveldiff = data.leveldiff,
            this.enemyspeed = data.enemyspeed,
            this.enemycount = data.enemycount,
            this.civdead = data.civdead,
            this.enemydead = data.enemydead
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image('reticle', 'crosshair.png');
        this.load.image('dead', 'tile_0016.png');
        this.load.image("playerDrone", "ship_0012.png");
        this.load.image("playerBomb", "tile_0012.png");
        this.load.image("combatant", "enemy.png");
        this.load.image("noncom", "friendly.png");
        this.load.image('frame1', 'flash01.png');
        this.load.image('frame2', 'explosion04.png');
        this.load.image('frame3', 'explosion06.png');
        this.load.image('frame4', 'blackSmoke00.png');
        this.load.image('frame5', 'blackSmoke01.png');
        this.load.image('frame6', 'blackSmoke02.png');
        this.load.image('frame7', 'blackSmoke03.png');
        this.load.image('frame8', 'blackSmoke04.png');
        this.load.image("warzone_tiles", "tiles_packed.png");    // tile sheet   
        this.load.tilemapTiledJSON("map", "warzone.json");       // Load JSON of tilemap
        this.load.bitmapFont('textfont', 'gametext_0.png', 'gametext.fnt');
        this.load.audio('boom', 'bomb-02.mp3');

    }

    create() {
        // Map definition
        this.map = this.add.tilemap("map", 25, 20, 32, 32);
        this.tileset = this.map.addTilesetImage("warzone-packed", "warzone_tiles");
        this.groundLayer = this.map.createLayer("groundlayer", this.tileset, 0, 0);
        let playerPath = [
            game.config.width / 2, game.config.height * 1.25,
            game.config.width / 2, game.config.height * 0.8,
            game.config.width * 0.75, game.config.height / 2,
            game.config.width / 2, game.config.height / 6,
            game.config.width / 4, game.config.height / 2,
            game.config.width / 2, game.config.height * 0.8,
            game.config.width / 2, game.config.height * 1.25
        ]

        this.curve = new Phaser.Curves.Spline(playerPath);

        // Text
        this.myScore = this.add.bitmapText(600, 30, 'textfont', 'Score: ' + this.score, 54).setOrigin(0.5);
        this.myleveltext = this.add.bitmapText(130, 30, 'textfont', 'Level ' + this.leveldiff, 54).setOrigin(0.5);
        this.levelScore = this.add.bitmapText(400, 300, 'textfont', 'Score: ' + this.score, 40).setOrigin(0.5);
        this.levelScore.visible = false;
        this.myScore.setDepth(1);
        this.myleveltext.setDepth(1);
        this.levelScore.setDepth(1);

        // Control codes
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        // Civvie/Combatant stuff
        this.enemyGroup = this.add.group({
            defaultKey: "combatant",
            maxSize: 10 * this.leveldiff
        })

        this.enemyGroup.createMultiple({
            active: false,
            key: this.enemyGroup.defaultKey,
            repeat: this.enemyGroup.maxSize - 1
        });

        this.civvieGroup = this.add.group({
            defaultKey: "noncom",
            maxSize: 200 * this.leveldiff
        })

        this.civvieGroup.createMultiple({
            active: false,
            visible: false,
            setXY: { x: -200, y: -200 },
            key: this.civvieGroup.defaultKey,
            repeat: this.civvieGroup.maxSize - 1
        });

        this.updateVelocities();
        this.time.addEvent({
            delay: 1750,
            callback: this.updateVelocities,
            callbackScope: this,
            loop: true
        });
        // console.log("Enemies this round: " + this.enemycount);
        // Player and bomb
        this.drone = this.add.follower(this.curve, this.curve.points[0].x, this.curve.points[0].y, "playerDrone");
        this.cursor = this.add.sprite(400, 300, "reticle");
        this.bomb = this.add.sprite(0, 0, "playerBomb");
        this.explode = this.sound.add('boom');

        this.bomb.visible = false;
        this.drone.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 22000,
            sine: "Sine.easeInOut",
            repeat: -1,
            yoyo: false,
            rotateToPath: true,
            rotationOffset: 90
        })
        this.bomb.visible = false;
        // Animations
        let frames = [
            { key: 'frame1' },
            { key: 'frame2' },
            { key: 'frame3' },
            { key: 'frame4' },
            { key: 'frame5' },
            { key: 'frame6' },
            { key: 'frame7' },
            { key: 'frame8' }
        ];

        this.anims.create({
            key: 'explosion',
            frames: frames,
            frameRate: 8,
            repeat: 0,
            hideOnComplete: true
        });
    }

    closeEnough(object, targetX, targetY) {

        let distanceX = Math.abs(object.x - targetX);
        let distanceY = Math.abs(object.y - targetY);
        if (distanceX <= 10 && distanceY <= 10) {
            return true;
        } else {
            return false;
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) {
            return false;
        }
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) {
            return false;
        }
        return true;
    }

    updateVelocities() {
        this.civvieGroup.children.iterate(function (entity) {
            let velocityX = Math.random() - 0.5;
            let velocityY = Math.random() - 0.5;
            entity.vx = velocityX;
            entity.vy = velocityY;
        });
        this.anim = this.add.sprite(-1000, -1000, "frame1");
        this.anim.scale = 0.25;
    }
    update() {
        if (this.leftKey.isDown && this.cursor.x > 63) {
            this.cursor.x -= 1;
            this.rightKey.isDown = false;
            this.upKey.isDown = false;
            this.downKey.isDown = false;
        }
        if (this.rightKey.isDown && this.cursor.x < 737) {
            this.cursor.x += 1;

            this.leftKey.isDown = false;
            this.upKey.isDown = false;
            this.downKey.isDown = false;
        }
        if (this.upKey.isDown && this.cursor.y > 63) {
            this.cursor.y -= 1;
            this.rightKey.isDown = false;
            this.leftKey.isDown = false;
            this.downKey.isDown = false;
        }
        if (this.downKey.isDown && this.cursor.y < 537) {
            this.cursor.y += 1;
            this.rightKey.isDown = false;
            this.upKey.isDown = false;
            this.leftKey.isDown = false;
        }

        if (this.enemytime % 200 == 0) {
            let enemy = this.enemyGroup.getFirstDead();
            if (enemy != null) {
                enemy.active = true;
                enemy.visible = true;
                enemy.x = Math.random() * 600 + 50;
                enemy.y = Math.random() * 300 + 20;
                enemy.scale = 0.7;
            }
        }

        let friendly = this.civvieGroup.getFirstDead();
        if (friendly != null) {
            friendly.active = true;
            friendly.visible = true;
            // console.log("making active!\n");
            friendly.x = Math.random() * 800 + 20;
            friendly.y = Math.random() * 600 + 20;
            friendly.scale = 0.5;
        }
        if (Phaser.Input.Keyboard.JustDown(this.fireKey) && !this.bomb.visible && this.drone.y < game.config.height - 50) {
            this.bomb = this.add.sprite(this.drone.x, this.drone.y, "playerBomb");
            this.angle = Phaser.Math.Angle.Between(this.drone.x, this.drone.y, this.cursor.x, this.cursor.y);
            this.lockX = this.cursor.x;
            this.lockY = this.cursor.y;
            this.velocityX = Math.cos(this.angle);
            this.velocityY = Math.sin(this.angle);
        }
        if (this.bomb.visible) {
            this.bomb.rotation = Phaser.Math.Angle.Between(this.bomb.x, this.bomb.y, this.lockX, this.lockY) + 1.5;
            this.bomb.x += this.velocityX;
            this.bomb.y += this.velocityY;
            this.velocityX *= 1.03;
            this.velocityY *= 1.03;
        }
        else {
            this.velocityX = 0;
            this.velocityY = 0;
        }

        if (this.bomb.visible && this.closeEnough(this.bomb, this.lockX, this.lockY)) {
            this.bomb.visible = false;
            this.boom = true;
            // console.log("Bomb despawned.\n");
            this.anim = this.add.sprite(this.lockX, this.lockY, "frame1");
            this.anim.scale = 0.25;
            this.anim.play('explosion');
            this.explode.play();
            // console.log(this.lockX + " " + this.lockY);
        }

        this.enemytime++;
        this.civvieGroup.children.iterate(function (entity) {
            entity.y += entity.vy;
            entity.x += entity.vx;
            if (this.collides(entity, this.anim) && this.boom == true) {
                entity.x -= 1000;
                entity.y -= 1000;
                // console.log("Civilian casualty.\n");
                this.score--;
                this.civdead++;
                if (entity.x < 20) {
                    entity.active = false;
                }
            }
        }, this);

        this.enemyGroup.children.iterate(function (entity) {
            if (entity.x > 20) {
                entity.y += 0.05*this.leveldiff;
            }
            if (this.collides(entity, this.anim) && this.boom == true) {
                // entity.x -= 1000;
                entity.y -= 10000;
                this.score += 9;
                this.enemycount--;
                this.enemydead++;
                // console.log("Enemies remaining: " + this.enemycount);
            }
            else if (entity.y >= game.config.height || this.score < -1000) {
                // this.myScore.setText("Game over! You lose. Maybe someone got away, or you killed too many civilians.");
                this.levelScore.visible = true;
                let losstext = "Final score: " + this.score + "\n" + this.civdead + " unnecessary casualties\n" + this.enemydead + " combatants killed";
                this.scene.start('aar', {
                    text: losstext,
                    civ: this.civdead,
                    enemy: this.enemydead
                });
                this.scene.stop();
            }
        }, this);
        this.boom = false;
        this.myScore.setText('Score:' + this.score);
        if (this.enemycount < 1) {
            // this.enemycount = 10;
            this.leveldiff++;
            this.enemycount = 10 * this.leveldiff;
            this.scene.restart({
                enemytime: this.enemytime,
                score: this.score,
                boom: this.boom,
                leveldiff: this.leveldiff,
                enemyspeed: this.enemyspeed,
                enemycount: this.enemycount,
                civdead: this.civdead,
                enemydead: this.enemydead
            })
            this.levelScore.visible = false;

        }
        this.myleveltext.setText('LEVEL ' + this.leveldiff);
    }

}