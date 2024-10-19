import { WORLD_ASSET_KEYS } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE } from "../config.js";
import Phaser from "../lib/phaser.js";
import { Controls } from "../utils/controls.js";
import { Player } from "../world/character/player.js";
import { SCENE_KEYS } from "./scene-keys.js";



/** @type {import("../types/typedef.js").Coordinate} */
const PLAYER_POSITION = Object.freeze({
    x: 6 * TILE_SIZE,
    y: 21 * TILE_SIZE,
});

export class WorldScene extends Phaser.Scene {
    /**@type {Player} */
    #player;
     /**@type {Controls} */
    #controls;

    constructor() {
        super({
            key: SCENE_KEYS.WORLD_SCENE, 
        });
    }

    create() {
        console.log(`[${WorldScene.name}:preload] invoked`);

        const x = 6 * TILE_SIZE;
        const y = 22 * TILE_SIZE;
        this.cameras.main.setBounds(0, 0, 1280, 2176);
        this.cameras.main.setZoom(0.8);
        this.cameras.main.centerOn(x, y);

        this.add.image(0, 0, WORLD_ASSET_KEYS.WORLD_BACKGROUND, 0).setOrigin(0);

        this.#player = new Player({
            scene: this,
            position: PLAYER_POSITION,
            direction: DIRECTION.DOWN,
        });

        this.cameras.main.startFollow(this.#player.sprite);

        this.#controls = new Controls(this);

        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }

    update(time){
        const selectedDirection = this.#controls.getDirectionKeyJustPressed();
        if(selectedDirection !== DIRECTION.NONE){
            this.#player.moveCharacter(selectedDirection);
        }

        this.#player.update(time);
    }
}