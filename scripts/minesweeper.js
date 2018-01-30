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
const spriteOffSet = 1000;
const bombCount = 10;
const boardSize = 15;

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
                    "asset_unpressed_block.png"];     //11
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
let playBG,
    board,
    boardArray = [],
    bombArray = [],
    timeText,
    bombText;

//All about the end
let winText,
    tryText,
    mainText,
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
    fontFamily: 'Sans Sarif',
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
let minuteElapse = 0;
let ctr = 0;
function timer() {
    ctr++;
    if(ctr == 60) {
        time++;
        console.log(time);
        ctr = 0;
        
        if(time < 10) {
            timeText.text = minuteElapse + ":0" + time; 
        }
        else if(time < 60) {
            timeText.text = minuteElapse + ":" + time;
        }
        else {
            minuteElapse++;
            time = 0;
            timeText.text = minuteElapse + ":00";
        }
    }
}

function initializeTitle(){
    //This button action serves as the "transition" for title -> play
    let buttonAction = function() {
        console.log("Play!");
        //reset and send to 'play'
        initializeButton(buttonStart);
        charm.slide(buttonStartContainer, 
                    buttonStartContainer.x, 
                    buttonStartContainer.y + spriteOffSet)
        .onComplete = () => 
        charm.fadeOut(titleScene, 30).onComplete = () => {
            titleLogo.x = gameWidth/2 - spriteOffSet;
            buttonStartContainer.y = gameHeight/2 + spriteOffSet;
            //titleScene.alpha = 0;
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
    titleLogo.position.set(gameWidth/2 - spriteOffSet, gameHeight/2 - 50);
    titleScene.addChild(titleLogo);
    
    buttonStart = new PIXI.Sprite(id[spriteSource[4]]);
    initializeButton(buttonStart);
    buttonStart.anchor.set(0.5,0.5);
    addButtonActionListener(buttonStart, 
                            id[spriteSource[2]], 
                            id[spriteSource[3]], 
                            id[spriteSource[4]], 
                            buttonAction)

    textStart = new PIXI.Text("Play", textStyle);
    textStart.anchor.set(0.5,0.5);

    buttonStartContainer = new PIXI.Container();
    buttonStartContainer.position.set(gameWidth/2, gameHeight/2 + spriteOffSet);
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
        charm.fadeIn(titleScene, 30).onComplete = () => {
            charm.slide(titleLogo, gameWidth/2, titleLogo.y).onComplete = () => 
            charm.slide(buttonStartContainer, buttonStartContainer.x, gameHeight/2 + 50).onComplete = () => activateButton(buttonStart);
        }

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
    

    
    deathTween = charm.slide(playScene, 20, 0, 2, 'smoothstep', true);
    deathTween.pause();
    
    timeText = new PIXI.Text("0:00", textStyle);
    timeText.position.set(gameWidth/2 - 120, gameHeight/2 + 160);
    playScene.addChild(timeText);
    
    bombText = new PIXI.Text(bombCount, textStyle);
    bombText.position.set(gameWidth/2 + 120, timeText.y);
    playScene.addChild(bombText);
    

    testButton = new PIXI.Sprite(id[spriteSource[4]]);
    testButton.interactive = true;
    testButton.on("pointerdown", () => {
       state = end; 
    });
    testButton2 = new PIXI.Sprite(id[spriteSource[3]]);
    testButton2.interactive = true;
    testButton2.position.set(200, 0);
    testButton2.on("pointerdown", () => {
       deathTween.pause();
       playScene.position.set(0,0);
    });
    
    playScene.addChild(testButton);
    playScene.addChild(testButton2);
    
    /* Initialize board and its cells */
    board = new PIXI.Container();
    createBoard(boardSize, boardSize);
    board.position.set(gameWidth/2 - board.width/2 + 10, gameHeight/2 - board.height/2 - 20);
    playScene.addChild(board);
    
    
    
    
    playScene.visible = false;
}

function createBoard(row, col) {
    let cellsA;
    let cellsB;
    let bomb;
    let decision;
    
    let xReal = 0,
        yReal = 0;
    
    
    for(let x = 0; x < row; x++) {
        boardArray.push([]);
        for(let y = 0; y < col; y++) {
            
            //below Cells
            cellsB = new PIXI.Sprite(id[spriteSource[9]]);
            createCell(cellsB, xReal, yReal);
            boardArray[x].push(cellsB);
            
            //add bomb if necessary
            decision = Math.floor((Math.random() * 100) + 1);
            if(decision < 10 && bombArray.length < 10) {
                bomb = new PIXI.Sprite(id[spriteSource[0]]);
                bomb.position.set(xReal, yReal);
                bomb.anchor.set(0.5,0.5);
                board.addChild(bomb);
                bombArray.push(bomb);
            }
            
            
            //above Cells
            cellsA = new PIXI.Sprite(id[spriteSource[11]]);
            createCell(cellsA, xReal, yReal);
            cellOnClick(cellsA);
            
            //Default cells B.
            xReal+= cellsB.width;
            if(y == col-1) {
                yReal += cellsB.height;
                xReal = 0; 
            }
        }
    }
    
    console.log(bombArray);
}

function createCell(cell, x, y) {
    cell.position.set(x,y);
    cell.anchor.set(0.5,0.5);
    board.addChild(cell);
}

function cellOnClick(cell) {
    cell.interactive = true;
    cell.on("pointerup", () => {
       charm.fadeOut(cell, 20); 
       if(hitBomb(cell)) {
           deathTween.play();
           state = end;
       }
        
    });
}

function hitBomb(cell) {
    for(let i = 0; i < bombArray.length; i++) {
        if(cell.x == bombArray[i].x && cell.y == bombArray[i].y) {
            return true;
        }
    }
    return false;
}

let timerOn = false;
function play() {
    if(!playScene.visible ) {
        titleScene.visible = false;
        gameOverScene.visible = false
        playScene.visible = true; 
        charm.fadeIn(playScene, 20).onComplete = () => {
            timerOn = true;
        }
    }
    
    if(timerOn)
        timer();
}

function initializeEnd(){
    
    let buttonActionRetry = () => {
        resetEndNext(play);

    };
    
    let buttonActionMain = () => {
        resetEndNext(title);
    };
    
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
    gameOverLogo.position.set(gameWidth/2 - spriteOffSet, gameHeight/2 - 130);
    gameOverLogo.anchor.set(0.5,0.5);
    gameOverScene.addChild(gameOverLogo);
    

    buttonRetry = new PIXI.Sprite(id[spriteSource[4]]);
    buttonRetry.anchor.set(0.5,0.5);
    buttonRetry.position.set(buttonRetry.width/2, buttonRetry.height/2); 
    initializeButton(buttonRetry);
    activateButton(buttonRetry);
    addButtonActionListener(buttonRetry, 
                            id[spriteSource[2]], 
                            id[spriteSource[3]], 
                            id[spriteSource[4]], 
                            buttonActionRetry);

    buttonMain = new PIXI.Sprite(id[spriteSource[4]]);
    buttonMain.anchor.set(0.5,0.5);
    buttonMain.position.set(buttonMain.width/2, buttonMain.height * 2);
    initializeButton(buttonMain);
    activateButton(buttonMain);
    addButtonActionListener(buttonMain, 
                            id[spriteSource[2]], 
                            id[spriteSource[3]], 
                            id[spriteSource[4]], 
                            buttonActionMain);
    
    endButtonGroup = new PIXI.Container();
    endButtonGroup.position.set((gameWidth/2) - (buttonMain.width/2), (gameHeight/2) + spriteOffSet);
    gameOverScene.addChild(endButtonGroup);
    
    tryText = new PIXI.Text("Retry", textStyle);
    tryText.position.set(buttonRetry.x, buttonRetry.y);
    tryText.anchor.set(0.5,0.5);
    
    mainText = new PIXI.Text("Quit", textStyle);
    mainText.position.set(buttonMain.x, buttonMain.y);
    mainText.anchor.set(0.5,0.5);
    
    
    
    
    

    endButtonGroup.addChild(buttonRetry);
    endButtonGroup.addChild(buttonMain);
    endButtonGroup.addChild(tryText);
    endButtonGroup.addChild(mainText);
    

    
    

    
    
    
    gameOverScene.visible = false;
}

function resetEndNext(next) {
    console.log("wtf?")
    charm.slide(endButtonGroup, endButtonGroup.x, (gameHeight/2) + spriteOffSet).onComplete = () => {
        charm.fadeOut(playScene, 20);
        charm.fadeOut(gameOverScene, 20).onComplete = () => {
            playScene.visible = false;
            //playScene.alpha = 0;
            timeText.text = "0:00";
            minuteElapse = 0;
            time = 0;
            ctr = 0;
            timerOn = false;
            gameOverLogo.x = gameWidth/2 - spriteOffSet;
            endButtonGroup.y = (gameHeight/2) + spriteOffSet;   
            state = next;
        };
    }

    

}

function end(){
    if(!gameOverScene.visible) {
        gameOverScene.alpha = 1;
        titleScene.visible = false;
        gameOverScene.visible = true
        charm.slide(gameOverLogo, gameWidth/2, gameOverLogo.y)
        .onComplete = () => {
            charm.slide(endButtonGroup, endButtonGroup.x, (gameHeight/2) - 20);
            deathTween.pause();
            playScene.position.set(0,0);
        }


    }

}


function initializeButton(button) {
    button.interactive = false;
    button.buttonMode = false;
    button.isDown = false;
    button.isOver = false;
}

function activateButton(button) {
    button.interactive = true;
    button.buttonMode = true;
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
                                                          
function addButtonActionListener(button, 
                                  textureDown, //2  
                                  textureHover, //3 
                                  textureUp,     //4
                                  action) {
    button
    .on("pointerdown", () => buttonDown(button, textureDown))
    .on("pointerover", () => buttonHover(button, textureHover))
    .on("pointerup", () => buttonUp(button, 
                                    textureUp, 
                                    textureHover,
                                    action))
    .on("pointerout", () => buttonOut(button, textureUp))
}


function test(sprite) {
    console.log("Up: " + !sprite.isDown)
    console.log("Down: " + sprite.isDown)
    console.log("Over: " + sprite.isOver)
    console.log("Out: " + !sprite.isOver)
    console.log("....")
}


