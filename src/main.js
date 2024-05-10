/*
** Name: Gabriel Lipow
** Date: 9/5/2024
** Project: CMPM-120 Gallery Shooter
** Instructor: Whitehead
** Additional credit to Kenney for various assets and the various authors of the BMFont tool.
*/
"use strict"
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true
    },
    width: 800,
    height: 600,
    scene: [menu, player, aar]
}

const game = new Phaser.Game(config);