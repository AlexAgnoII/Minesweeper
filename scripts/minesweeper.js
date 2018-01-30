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

let id, 
    spriteSource = ["asset_bomb.png",             //0
                    "asset_bomb_container.png",   //1
                    "asset_button_down.png",      //2
                    "asset_button_hover.png",     //3
                    "asset_button_up.png",        //4
                    "asset_game_over_header.png", //5
                    "asset_ingame_bg.png",        //6
                    "asset_logo.png",             //7
                    "asset_menu_bg.png",          //8
                    "asset_pressed_block.png",    //9
                    "asset_timer_container.png",  //10
                    "asset_unpressed_block"];     //11
let bombSprite, 
    bombContainerSprite, 
    buttonDownSprite = [], 
    buttonHoverSprite = [], 
    buttonUpSprite = [], 
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

gameDiv.appendChild(app.view);
PIXI.loader
.add(mineSweeperAtlas)
.load(setup);

function setup() {
    id = PIXI.loader.resources[mineSweeperAtlas].textures; 
    
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
    let buttonStart;
    let buttonAction = function() {
        console.log("Play!");  
    };
    
    playScene = new PIXI.Container();
    app.stage.addChild(playScene);
    
    buttonStart = new PIXI.Sprite(id[spriteSource[4]]);
    initializeButton(buttonStart);
    buttonStart
    .on("pointerdown", () => buttonDown(buttonStart, id[spriteSource[2]]))
    .on("pointerover", () => buttonHover(buttonStart, id[spriteSource[3]]))
    .on("pointerup", () => buttonUp(buttonStart, 
                                    id[spriteSource[4]], 
                                    id[spriteSource[3]],
                                    buttonAction))
    .on("pointerout", () => buttonOut(buttonStart, 
                                      id[spriteSource[4]]));
    playScene.addChild(buttonStart);
    
    
}
function play() {}

function initializeEnd(){
    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);

}
function end(){}


function initializeButton(button) {
    button.interactive = true;
    button.buttonMode = true;
    button.isDown = false;
    button.isOver = false;
}

function buttonUp(sprite, textureUP, textureOver, action) {
    sprite.isDown = false;
    console.log("Is up");
    
    if(sprite.isOver) {
        sprite.texture = textureOver;
    }
    else {
        sprite.texture = textureUP;
    }
    action();

}
function buttonHover(sprite, texture) {
    sprite.isOver = true;
    console.log("Is hover");
    sprite.texture = texture;    
}
function buttonDown(sprite, texture) {
    sprite.isDown = true;
    console.log("Is down");
    sprite.texture = texture;
}
function buttonOut(sprite, texture) {
    sprite.isOver = false;
    console.log("Is out");
    sprite.texture = texture;
}


function test(sprite) {
    console.log("Up: " + !sprite.isDown)
    console.log("Down: " + sprite.isDown)
    console.log("Over: " + sprite.isOver)
    console.log("Out: " + !sprite.isOver)
    console.log("....")
}


