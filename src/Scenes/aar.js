class aar extends Phaser.Scene {
    constructor() {
        super('aar');
        this.return = null
        this.text = "";
        this.timer = 0;
        this.civ = 0;
        this.enemy = 0;
    }

    init(data) {
        this.text = data.text;
        this.civ = data.civ;
        this.enemy = data.enemy;
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.bitmapFont('textfont', 'gametext_0.png', 'gametext.fnt');
    }

    create() {
        this.return = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.losstext = this.add.bitmapText(50, 60, 'textfont', "Game over!\nMaybe an enemy got away.\nor maybe you killed too many civilians.\nEither way, you lose.\n\nIn today's wars, the average ratio of civilian to combatant\ndeaths is approximatly 9 to 1. (Credited to the U.N.)\n\nLook and see - how did you do?", 20);
        this.returntext = this.add.bitmapText(200, 520, 'textfont', '(Press escape to return to start)', 16).setOrigin(0.5);
        // this.returntext.visible = false;
        // this.losstext.setAlign('center');
        // console.log(this.text);
        this.aar = this.add.bitmapText(50, 350, 'textfont', this.text, 30);
        let final = this.civ/this.enemy;
        this.aar2 = this.add.bitmapText(50, 460, 'textfont', "Ratio: " + final.toFixed(1) + ":1", 30);
        // this.aar.setText('Final score: ' + this.score + '\n' + this.civdead + ' unnecessary casualties\n' + this.enemydead + ' combatants killed');
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.return)) {
            this.scene.start('menu');
            this.scene.stop();
        }
    }
}