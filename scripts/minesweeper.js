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

//const getPos = app.renderer.plugins.interaction.mouse.global;

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

//All about title
let buttonStart,
    buttonStartContainer,
    titleLogo,
    titleBG,
    textStart;

//All about the play
let playBG;

//All about the end
let winText,
    gameOverLogo,
    endButtonGroup,
    buttonRetry,
    buttonMain,
    blackBackground;

let titleScene,
    playScene,
    gameOverScene;

let deathTween;

let state;
let charm = new Charm(PIXI);

let textStyle = new PIXI.TextStyle({
    fontFamily: 'Arvo',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 30,
    fill: "0xffffff",
    wordWrap: true,
    wordWrapWidth: 440
});

gameDiv.appendChild(app.view);
PIXI.loader
.add(mineSweeperAtlas)
.on("progress", loadProgressHandler)
.load(setup);

function loadProgressHandler(loader, resource) {
  //Display the file `url` currently being loaded
  console.log("loading: " + resource.url); 

  //Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%"); 
}

function setup() {
    id = PIXI.loader.resources[mineSweeperAtlas].textures; 
    
    initializeTitle();
    initializePlay();
    initializeEnd();

    
    state = title;
    app.ticker.add(delta => gameLoop())
}



function gameLoop() {
    //console.log(getPos);
    state();
    charm.update();
}

let time = 0;
let ctr = 0;
function timer() {
    ctr++;
    if(ctr == 60) {
        time++;
        console.log(time);
        ctr = 0;
    }
}

function initializeTitle(){
    //This button action serves as the "transition" for title -> play
    let buttonAction = function() {
        console.log("Play!");
        //reset and send to 'play'
        initializeButton(buttonStart);
        charm.fadeOut(titleScene).onComplete = () => {
            buttonStartContainer.alpha = 0;
            titleLogo.alpha = 0;
            titleScene.alpha = 0;
            buttonStart.texture = id[spriteSource[4]];
            state = play
        };
    };
    
    titleScene = new PIXI.Container();
    titleScene.alpha = 0;
    app.stage.addChild(titleScene);
    
    titleBG = new PIXI.Sprite(id[spriteSource[8]]);
    titleBG.anchor.set(0.5, 0.5);
    titleBG.position.set(gameWidth / 2, gameHeight / 2);
    titleScene.addChild(titleBG);
    
    titleLogo = new PIXI.Sprite(id[spriteSource[7]]);
    titleLogo.anchor.set(0.5,0.5);
    titleLogo.position.set(gameWidth/2, gameHeight/2 - 50);
    titleLogo.alpha = 0;
    titleScene.addChild(titleLogo);
    
    buttonStart = new PIXI.Sprite(id[spriteSource[4]]);
    initializeButton(buttonStart);
    buttonStart.anchor.set(0.5,0.5);
    buttonStart
    .on("pointerdown", () => buttonDown(buttonStart, id[spriteSource[2]]))
    .on("pointerover", () => buttonHover(buttonStart, id[spriteSource[3]]))
    .on("pointerup", () => buttonUp(buttonStart, 
                                    id[spriteSource[4]], 
                                    id[spriteSource[3]],
                                    buttonAction))
    .on("pointerout", () => buttonOut(buttonStart, id[spriteSource[4]]))

    textStart = new PIXI.Text("Play", textStyle);
    textStart.anchor.set(0.5,0.5);

    buttonStartContainer = new PIXI.Container();
    buttonStartContainer.position.set(gameWidth/2, gameHeight/2 + 50);
    buttonStartContainer.alpha = 0;
    buttonStartContainer.addChild(buttonStart);
    buttonStartContainer.addChild(textStart);
    titleScene.addChild(buttonStartContainer);
    
    titleScene.visible = false;
}
function title() {
    if(!titleScene.visible) {
        playScene.visible = false;
        gameOverScene.visible = false;
        titleScene.visible = true; 
        charm.fadeIn(titleScene).onComplete = () => 
        charm.fadeIn(titleLogo).onComplete = () => 
        charm.fadeIn(buttonStartContainer).onComplete = () => activateButton(buttonStart);
    }
}

let testButton;
let testButton2;
function initializePlay(){
    playScene = new PIXI.Container();
    playScene.alpha = 0;
    app.stage.addChild(playScene);
    
    playBG = new PIXI.Sprite(id[spriteSource[6]])
    playBG.position.set(gameWidth/2, gameHeight/2);
    playBG.anchor.set(0.5,0.5);
    playScene.addChild(playBG);
    
    testButton = new PIXI.Sprite(id[spriteSource[4]]);
    testButton.interactive = true;
    testButton.on("pointerdown", () => {
       state = end; 
       //deathTween.play();
    });
    
    deathTween = charm.slide(playScene, 20, 0, 5, 'smoothstep', true);
    deathTween.pause();
    
    
    

    
    testButton2 = new PIXI.Sprite(id[spriteSource[3]]);
    testButton2.interactive = true;
    testButton2.position.set(200, 0);
    testButton2.on("pointerdown", () => {
       deathTween.pause();
       playScene.position.set(0,0);
    });
    
    playScene.addChild(testButton);
    playScene.addChild(testButton2);
    
    
    playScene.visible = false;
}

let timerOn = false;
function play() {
    if(!playScene.visible) {
        titleScene.visible = false;
        gameOverScene.visible = false
        playScene.visible = true; 
        charm.fadeIn(playScene).onComplete = () => {
            timerOn = true;
        }
    }
    
    if(timerOn)
        timer();
}

function initializeEnd(){
    
    let buttonActionRetry;
    let buttonActionMain;
    
    gameOverScene = new PIXI.Container();
    app.stage.addChild(gameOverScene);
    
    blackBackground = new PIXI.Graphics();
    blackBackground.drawRect((gameWidth/2) - (playBG.width/2), 
                             (gameHeight/2) - (playBG.height/2), 
                             playBG.width, 
                             playBG.height);
    blackBackground.fill = 0x000000;
    blackBackground.alpha = 0.6;
    gameOverScene.addChild(blackBackground);
    
    gameOverLogo = new PIXI.Sprite(id[spriteSource[5]]);
    gameOverLogo.position.set(gameWidth/2, gameHeight/2 - 130);
    gameOverLogo.anchor.set(0.5,0.5);
    gameOverScene.addChild(gameOverLogo);

    buttonActionMain = new PIXI.Sprite(id[spriteSource[4]]);
    buttonActionMain.anchor.set(0.5,0.5);
    buttonActionMain.position.set(buttonActionMain.width/2, buttonActionMain.height/2);

    buttonActionRetry = new PIXI.Sprite(id[spriteSource[4]]);
    buttonActionRetry.anchor.set(0.5,0.5);
    buttonActionRetry.position.set(buttonActionRetry.width/2, buttonActionRetry.height * 2); 
    
    endButtonGroup = new PIXI.Container();
    endButtonGroup.position.set((gameWidth/2) - (buttonActionMain.width/2), (gameHeight/2) - 20);
    gameOverScene.addChild(endButtonGroup);


    
    endButtonGroup.addChild(buttonActionMain);
    endButtonGroup.addChild(buttonActionRetry);
    

    
    

    
    
    
    gameOverScene.visible = false;
}

function end(){
    if(!gameOverScene.visible) {
        titleScene.visible = false;
        gameOverScene.visible = true
    }

}


function initializeButton(button) {
    button.interactive = false;
    button.buttonMode = false;
    button.isDown = false;
    button.isOver = false;
}

function activateButton(button) {
    buttonStart.interactive = true;
    buttonStart.buttonMode = true;
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


