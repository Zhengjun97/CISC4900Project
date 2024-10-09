
import { BATTLE_ASSET_KEYS, BATTLE_BACKGROUND_ASSET_KEYS, DATA_ASSET_KEYS, HEALTH_BAR_ASSET_KEYS, MONSTER_ASSET_KEYS, UI_ASSET_KEYS } from "../assets/asset-keys.js";
import Phaser from "../lib/phaser.js";
import { SCENE_KEYS } from "./scene-keys.js";
import { KENNEY_FUTURE_NARROW_FONT_NAME } from "../assets/font-keys.js";
import { WebFontFileLoader } from "../assets/web-font-file-loader.js";

export class PreloadScene extends Phaser.Scene{
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE, //unique key for pharse scene
        });
        console.log(SCENE_KEYS.PRELOAD_SCENE);  
    }

    //phaser life cycle events



    preload() {
        console.log(`[${PreloadScene.name}:preload] invoked`);
        
        const mosterTamerAssetPath = 'assets/images/monster-tamer';
        const kenneysAssetPath = 'assets/images/kenneys-assets';
        
        //battle backgrounds
        this.load.image(BATTLE_BACKGROUND_ASSET_KEYS.FOREST, `${mosterTamerAssetPath}/battle-backgrounds/forest-background.png`);
        //battle assets
        this.load.image(BATTLE_ASSET_KEYS.HEALTH_BAR_BACKGROUND, `${kenneysAssetPath}/ui-space-expansion/custom-ui.png`);
        //health bar assets
        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_right.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_mid.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_green_left.png`);

        this.load.image(HEALTH_BAR_ASSET_KEYS.RIGHT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_left.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.MIDDLE_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_mid.png`);
        this.load.image(HEALTH_BAR_ASSET_KEYS.LEFT_CAP_SHADOW, `${kenneysAssetPath}/ui-space-expansion/barHorizontal_shadow_right.png`);

        //monster assets
        this.load.image(MONSTER_ASSET_KEYS.CARNODUSK, `${mosterTamerAssetPath}/monsters/carnodusk.png`);
        this.load.image(MONSTER_ASSET_KEYS.IGUANIGNITE, `${mosterTamerAssetPath}/monsters/iguanignite.png`);
        
        //ui assets
        this.load.image(UI_ASSET_KEYS.CURSOR, `${mosterTamerAssetPath}/ui/cursor.png`);

        //load json data
        this.load.json(DATA_ASSET_KEYS.ATTACKS, 'assets/data/attacks.json');

        //load custom font
        this.load.addFile(new WebFontFileLoader(this.load, [KENNEY_FUTURE_NARROW_FONT_NAME]));
    

    }

    create() {
       
        console.log(`[${PreloadScene.name}:create] invoked`);
        this.scene.start(SCENE_KEYS.BATTLE_SCENE);


    }

}