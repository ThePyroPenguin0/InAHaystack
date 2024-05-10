class menu extends Phaser.Scene {
    constructor() {
        super('menu');
        this.startkey = null;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image('reticle', 'crosshair.png');
        this.load.image('dead', 'tile_0016.png');
        this.load.image("playerDrone", "ship_0012.png");
        this.load.image("playerBomb", "tile_0012.png");
        this.load.image("combatant", "enemy.png");
        this.load.image("noncom", "friendly.png");
        this.load.bitmapFont('textfont', 'gametext_0.png', 'gametext.fnt');
    }

    create() {
        this.title = this.add.bitmapText(50, 50, 'textfont', 'In A Haystack', 90);
        this.subtitle = this.add.bitmapText(50, 150, 'textfont', 'This is a simulation.\nThere is no beginning or end.\nYou cannot win, but you must not lose.\nShould an enemy make it to the bottom of the screen\nthe game is over.', 24);
        this.coExample = this.add.sprite(500, 300, "combatant");
        this.combatant = this.add.bitmapText(50, 280, 'textfont', 'This is your enemy.\nYou can tell he is an enemy because he is red.\nEach killed grants nine points.', 16);
        this.ciExample = this.add.sprite(500, 365, "noncom");
        this.noncombatant = this.add.bitmapText(50, 340, 'textfont', 'This is NOT your enemy.\nThe world cares about these civilians dying.\nEach killed loses a point.', 16);
        this.player = this.add.bitmapText(50, 400, 'textfont', 'This is your plane.\nYou fire bombs from the plane using the F key.\nBut depending on where the plane is\nit might take longer for the bomb to get to your destination.', 16);
        this.plExample = this.add.sprite(500, 425, "playerDrone");
        this.reticle = this.add.bitmapText(50, 480, 'textfont', 'This is your targeting reticle.\nIt approximately matches the explosive radius of the bomb\nwith a bit of extra room for caution. Move it with W, A, S, and D.', 16);
        this.reticleExample = this.add.sprite(680, 505, "reticle");
        this.reticleExample.scale = 0.75;
        this.startkey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.startext = this.add.bitmapText(280, 550, 'textfont', 'Press SPACE to begin...', 20);
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.startkey)) {
            this.scene.start('player', {
                enemytime: 0,
                score: 0,
                boom: false,
                leveldiff: 1,
                enemyspeed: 0.1,
                enemycount: 10,
                civdead: 0,
                enemydead: 0,});
        }
    }
}