import { BATTLE_ASSET_KEYS, BATTLE_BACKGROUND_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, MONSTER_ASSET_KEYS  } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { BattleMenu } from "./battle/ui/menu/battle-menu.js";
import { SCENE_KEYS } from "./scene-keys.js";



export class BattleScene extends Phaser.Scene{
    /** @type {BattleMenu} */
    #battleMenue;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE, //unique key for pharse scene
        });
        
    }

    //phaser life cycle events


    create() {
        console.log(`[${BattleScene.name}:create] invoked`);
        //create main background
        this.add.image(0,0,BATTLE_BACKGROUND_ASSET_KEYS.FOREST).setOrigin(0);
        //render player and enemy monster
        this.add.image(768,144,MONSTER_ASSET_KEYS.CARNODUSK,(0)).setFlipX(true).setScale(0.5);
        this.add.image(256,316,MONSTER_ASSET_KEYS.IGUANIGNITE,(0)).setScale(2);

        //render out the player HP bar
        const playerMsName = this.add.text(30,20,'Main Character', {color: '#7E3D3F', fontSize: '32px'});
        this.add.container(556,318,[this.add.image(0,0,BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0)
            , playerMsName, this.#createHP(34,34), 
            this.add.text(playerMsName.width + 35,23,'L5', {color: '#ED474B', fontSize: '28px'}),
            this.add.text(30,55,'HP', {color: '#FF6505', fontSize: '24px', fontStyle: 'italic'}),
            this.add.text(443,80,'25/25', {color: '#7E3D3F', fontSize: '16px',}).setOrigin(1,0),
            ]);

        //render out the enemy HP bar
        const enemyMsName = this.add.text(30,20,'Dark Knight', {color: '#7E3D3F', fontSize: '32px'});
        this.add.container(0,0,[this.add.image(0,0,BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND).setOrigin(0)
            , enemyMsName, this.#createHP(34,34), 
            this.add.text(enemyMsName.width + 35,23,'L5', {color: '#ED474B', fontSize: '28px'}),
            this.add.text(30,55,'HP', {color: '#FF6505', fontSize: '24px', fontStyle: 'italic'}),
            ]);
            
        //render out the main info and sub info panes
        this.#battleMenue = new BattleMenu(this);
        this.#battleMenue.showMainBattleMenu();

        this.#cursorKeys = this.input.keyboard.createCursorKeys();

    }

    update() {
        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        if (wasSpaceKeyPressed) {
            this.#battleMenue.handlePlayerInput('OK');
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
            this.#battleMenue.handlePlayerInput('CANCEL');
            return;
        }

        /** @type {import('../common/direction.js').Direction}*/
        let selectDirection = DIRECTION.NONE;
        if (this.#cursorKeys.left.isDown) {
            selectDirection = DIRECTION.LEFT;
        } else if (this.#cursorKeys.right.isDown) {
            selectDirection = DIRECTION.RIGHT;
        } else if (this.#cursorKeys.up.isDown) {
            selectDirection = DIRECTION.UP;
        } else if (this.#cursorKeys.down.isDown) {
            selectDirection = DIRECTION.DOWN;
        }

        if (selectDirection !== DIRECTION.NONE) {
            this.#battleMenue.handlePlayerInput(selectDirection);
        }
    }

    /**
     * 
     * @param {number} x the x position to place the health bar container
     * @param {number} y the y position to place the health bar container
     * @returns {Phaser.GameObjects.Container}
     */
    #createHP(x,y) {
        const scaleY = 0.7;
        const leftCap = this.add.image(x, y, HEALTH_BAR_ASSET_KEYS.LEFT_CAP).setOrigin(0,0.5).setScale(1, scaleY);
        const midCap = this.add.image(leftCap.x + leftCap.width, y, HEALTH_BAR_ASSET_KEYS.MIDDLE).setOrigin(0,0.5).setScale(1, scaleY);
        midCap.displayWidth = 360;
        const rightCap = this.add.image(midCap.x + midCap.displayWidth, y, HEALTH_BAR_ASSET_KEYS.RIGHT_CAP).setOrigin(0,0.5).setScale(1, scaleY);
        return this.add.container(x, y, [leftCap, midCap, rightCap]);
    }

}