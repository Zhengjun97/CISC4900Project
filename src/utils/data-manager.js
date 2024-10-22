import { DIRECTION } from "../common/direction.js";
import { TILE_SIZE } from "../config.js";
import Phaser from "../lib/phaser.js";

/**
 * @typedef GlobalState
 * @type {object}
 * @property {object} player
 * @property {object} player.position
 * @property {object} player.position.x
 * @property {object} player.position.y
 * @property {import("../common/direction.js").Direction} player.direction
 */

/** @type {GlobalState} */
const initialState = {
    player: {
        position : {
            x: 6 * TILE_SIZE,
            y: 21 * TILE_SIZE
        },
        direction: DIRECTION.DOWN,
    }
}

export const DATA_MANAGER_STORE_KEYS = Object.freeze({
    PLAYER_POSITION: 'PLAYER_POSITION',
    PLAYER_DIRECTION: 'PLAYER_DIRECTION',
});

class DataManager extends Phaser.Events.EventEmitter {
    /** @type {Phaser.Data.DataManager} */
    #store;

    constructor() {
        super();
        this.#store = new Phaser.Data.DataManager(this);
        this.#updateDataManager(initialState);
    }

    /** @type {Phaser.Data.DataManager} */
    get store() {
        return this.#store;
    }

    /**
     * 
     * @param {GlobalState} data 
     * @returns {void}
     */
    #updateDataManager(data) {
        this.#store.set({
            [DATA_MANAGER_STORE_KEYS.PLAYER_POSITION]: data.player.position,
            [DATA_MANAGER_STORE_KEYS.PLAYER_DIRECTION]: data.player.direction,
        });
    }

}

export const dataManager = new DataManager();

