"use strict";

let gameDiv = document.getElementById("game");
const gameHeight = gameDiv.offsetHeight;
const gameWidth = gameDiv.offsetWidth;

let app = new PIXI.Application({ 
    width: gameHeight, 
    height: gameWidth,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);


const mineSweeperAtlas = "images/imgMineSweeper.json";

let spriteSource = ["asset_bomb.png",
                    "asset_bomb_container.png",
                    "asset_button_down.png",
                    "asset_button_hover.png",
                    "asset_button_up.png",
                    "asset_game_over_header.png",
                    "asset_ingame_bg.png",
                    "asset_logo.png",
                    "asset_menu_bg.png",
                    "asset_pressed_block.png",
                    "asset_timer_container.png",
                    "asset_unpressed_block",];
let bombSprite, 
    bombContainerSprite, 
    buttonDownSprite, 
    buttonHoverSprite, 
    buttonUpSprite, 
    gameOverSprite,
    ingameBGSprite,
    logoSprite,
    menuBgSprite,
    pressedBlockSprite,
    timerContainerSprite,
    unpressedBlockSprite;

let titleScene,
    playScene,
    gameOverScene;

let state;


PIXI.loader
.add(mineSweeperAtlas)
.load(setup);

function setup() {
    let id = PIXI.loader.resources[mineSweeperAtlas].textures; 
    
    initializeTitle();
    initializePlay();
    initializeEnd();
    
    state = title;
    app.ticker.add(delta => gameLoop())
}


function gameLoop() {
    state();
}


function initializeTitle(){
    titleScene = new PIXI.Container();
    app.stage.addChild(titleScene);
}
function title() {}

function initializePlay(){
    playScene = new PIXI.Container();
    app.stage.addChild(playScene);
}
function play() {}

function initializeEnd(){
    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
}
function end(){}


