import { MONSTER_ASSET_KEYS  } from "../assets/asset-keys.js";
import { DIRECTION } from "../common/direction.js";
import Phaser from "../lib/phaser.js";
import { StateMachine } from "../utils/state-machine.js";
import { Background } from "./battle/background.js";
import { EnemyBattleMonster } from "./battle/monsters/enemy-battle-monster.js";
import { PlayerBattleMonster } from "./battle/monsters/player-battle-monster.js";
import { BattleMenu } from "./battle/ui/menu/battle-menu.js";
import { SCENE_KEYS } from "./scene-keys.js";

const BATTLE_STATES = Object.freeze({
    INTRO: 'INTRO',
    PRE_BATTLE_INFO: 'PRE_BATTLE_INFO',
    BRING_OUT_MONSTER: 'BRING_OUT_MONSTER',
    PLAYER_INPUT: 'PLAYER_INPUT',
    ENEMY_INPUT: 'ENEMY_INPUT',
    BATTLE: 'BATTLE',
    POST_ATTACK_CHECK: 'POST_ATTACK_CHECK',
    FINISHED: 'FINISHED',
    RUN_ATTEMPT: 'RUN_ATTEMPT',
});

export class BattleScene extends Phaser.Scene{
    /** @type {BattleMenu} */
    #battleMenu;
    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    #cursorKeys;
    /** @type {EnemyBattleMonster}*/
    #activeEnemyMonster;
    /** @type {PlayerBattleMonster}*/
    #activePlayerMonster;
    /** @type {number} */
    #activePlayerAttackIndex;
    /** @type {StateMachine} */
    #battleStateMachine

    constructor() {
        super({
            key: SCENE_KEYS.BATTLE_SCENE, //unique key for pharse scene
        });
        
    }

    //phaser life cycle events

    init() {
        this.#activePlayerAttackIndex = -1;
    }

    create() {
        console.log(`[${BattleScene.name}:create] invoked`);
        //create main background
        const background = new Background(this);
        background.showForest();
        //render enemy monster
        this.#activeEnemyMonster = new EnemyBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.CARNODUSK,
                assetKey: MONSTER_ASSET_KEYS.CARNODUSK,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [1],
                baseAttack: 5,
                currentLevel: 5
            },
        });

        //render player
        this.#activePlayerMonster = new PlayerBattleMonster({
            scene: this,
            monsterDetails: {
                name: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetKey: MONSTER_ASSET_KEYS.IGUANIGNITE,
                assetFrame: 0,
                currentHp: 25,
                maxHp: 25,
                attackIds: [2],
                baseAttack: 15,
                currentLevel: 5
            },
        });
            
        //render out the main info and sub info panes
        this.#battleMenu = new BattleMenu(this, this.#activePlayerMonster);
        
        //create state machine
        this.#createBattleStateMachine();

        this.#cursorKeys = this.input.keyboard.createCursorKeys();
        
    }

    update() {
        this.#battleStateMachine.update();

        const wasSpaceKeyPressed = Phaser.Input.Keyboard.JustDown(this.#cursorKeys.space);
        // litmit input based on the current battle state we are in
        // if we are not in the right battle state, return early and do not process input
        if (wasSpaceKeyPressed && (this.#battleStateMachine.currentStateName === BATTLE_STATES.PRE_BATTLE_INFO || 
        this.#battleStateMachine.currentStateName === BATTLE_STATES.POST_ATTACK_CHECK || 
        this.#battleStateMachine.currentStateName === BATTLE_STATES.RUN_ATTEMPT)) {
            this.#battleMenu.handlePlayerInput('OK');
            return;
        }

        if (this.#battleStateMachine.currentStateName !== BATTLE_STATES.PLAYER_INPUT) {
            return;
        }

        if (wasSpaceKeyPressed) {
            this.#battleMenu.handlePlayerInput('OK');

            //check if the player selected an attack, and update display text
            if (this.#battleMenu.selectedAttack === undefined) {
                return;
            }
        
            this.#activePlayerAttackIndex = this.#battleMenu.selectedAttack;

            if (!this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex]) {
                return;
            }

            console.log(`Player selected the following move: ${this.#battleMenu.selectedAttack}`);
            this.#battleMenu.hideMsAttackSubMenu();
            this.#battleStateMachine.setState(BATTLE_STATES.ENEMY_INPUT);
        }

        if (Phaser.Input.Keyboard.JustDown(this.#cursorKeys.shift)) {
            this.#battleMenu.handlePlayerInput('CANCEL');
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
            this.#battleMenu.handlePlayerInput(selectDirection);
        }
    }


    #playerAttack() {
        this.#battleMenu.updateInfoPaneMessageNoInputRequired(`You used ${this.#activePlayerMonster.attacks[this.#activePlayerAttackIndex].name}`, () => {
            this.time.delayedCall(1200, () => {
                this.#activeEnemyMonster.takeDamage(this.#activePlayerMonster.baseAttack, ()=>{
                    this.#enemyAttack();
                });
            });
        });
    }

    #enemyAttack() {
        if (this.#activeEnemyMonster.isFainted) {
            this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
            return;
        }

        this.#battleMenu.updateInfoPaneMessageNoInputRequired(`For ${this.#activeEnemyMonster.name} used ${this.#activeEnemyMonster.attacks[0].name}`, () => {
            this.time.delayedCall(1200, () => {
                this.#activePlayerMonster.takeDamage(this.#activeEnemyMonster.baseAttack, ()=>{
                    this.#battleStateMachine.setState(BATTLE_STATES.POST_ATTACK_CHECK);
                });
            });
        });
    }

    #postBattleSequenceCheck() {
        if (this.#activeEnemyMonster.isFainted) {
            this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`Wild ${this.#activeEnemyMonster.name} fainted`, 'You have gained some exp'], () => {
                this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
            });
            return;
        }

        if (this.#activePlayerMonster.isFainted) {
            this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`${this.#activePlayerMonster.name} fainted`, 'You lose, escaping to safety...'], () => {
                this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
            });
            return;
        }

        this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
    }

    #transitionToNextScene() {
        this.cameras.main.fadeOut(600,0,0,0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start(SCENE_KEYS.BATTLE_SCENE);
        });
    }

    #createBattleStateMachine() {
        this.#battleStateMachine = new StateMachine('battle', this);
        this.#battleStateMachine.addState({
            name: BATTLE_STATES.INTRO,
            onEnter: () => {
                // wait for any scene setup and transitions to complete
                this.time.delayedCall(500, () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.PRE_BATTLE_INFO);
                });
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.PRE_BATTLE_INFO,
            onEnter: () => {
                // wait for enemy monster to appear on the screen and notify player about the monster
                this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`${this.#activeEnemyMonster.name} appeared!`], 
                () => {
                    // wait for text animation to complete and move to next state
                    this.time.delayedCall(1200, () => {
                        this.#battleStateMachine.setState(BATTLE_STATES.BRING_OUT_MONSTER);
                    });
                });
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.BRING_OUT_MONSTER,
            onEnter: () => {
                // wait for player to appear on the screen and notify 
                this.#battleMenu.updateInfoPaneMessageNoInputRequired(`go ${this.#activePlayerMonster.name}!`, 
                () => {
                    // wait for text animation to complete and move to next state
                    this.time.delayedCall(1200, () => {
                        this.#battleStateMachine.setState(BATTLE_STATES.PLAYER_INPUT);
                    });
                });
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.PLAYER_INPUT,
            onEnter: () => {
                this.#battleMenu.showMainBattleMenu();
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.ENEMY_INPUT,
            onEnter: () => {
                //to do: add featur in a future update
                // pick a randow move for the enemy monster, and in the future implement some type of AI behaivor
                this.#battleStateMachine.setState(BATTLE_STATES.BATTLE);
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.BATTLE,
            onEnter: () => {
                // general battle flow
                // show attack used, brief pause
                // then play attack animation, brief pause
                // then play damage animation, brief pause
                // then play health bar animation, brief pause
                // then repeat the steps above 

                this.#playerAttack();
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.POST_ATTACK_CHECK,
            onEnter: () => {
                this.#postBattleSequenceCheck();
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.FINISHED,
            onEnter: () => {
                this.#transitionToNextScene();
            },
        });

        this.#battleStateMachine.addState({
            name: BATTLE_STATES.RUN_ATTEMPT,
            onEnter: () => {
                this.#battleMenu.updateInfoPaneMessageAndWaitForInput([`You got away safely!`], 
                () => {
                    this.#battleStateMachine.setState(BATTLE_STATES.FINISHED);
                });
            },
        });

        //start state machine
        this.#battleStateMachine.setState('INTRO');

    }
}