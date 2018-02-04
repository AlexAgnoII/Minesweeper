/*
Author: Alexander H. Agno II
*/
"use strict";

let gameDiv = document.getElementById("game");
let gameHeight;
let gameWidth;

let app = new PIXI.Application({ 
    width: 800, 
    height: 800,                       
    antialias: true, 
    transparent: false, 
    resolution: 1
  }
);

//const getPos = app.renderer.plugins.interaction.mouse.global;

const MINE_SWEEPER_ATLAS = "images/imgMineSweeper.json";
const SPIRTE_OFF_SET = 1000;
const BOMB_COUNT = 15; //changine this adds/lessen bombs (this is maximum count of bombs.)
const BOARD_SIZE = 15; //dont change.

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
    cellBelowArray = [],
    cellAboveArray = [],
    bombArray = [],
    bombFoundArray =[],
    timeText,
    bombText;

//All about the end
let didWin = false,
    winText,
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

let wayPoints = [[0,0],
                 [10,0],
                 [-10,0],
                 [0,0]];


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

let numWarnArray = [];
let textStyleNumWarn = new PIXI.TextStyle({
    fontFamily: 'Sans Sarif',
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: 12,
    fill: "0xffffff",
});

gameDiv.appendChild(app.view);
PIXI.loader
.add(MINE_SWEEPER_ATLAS)
.on("progress", loadProgressHandler)
.load(setup);

function loadProgressHandler(loader, resource) {
  //Display the file `url` currently being loaded
  console.log("loading: " + resource.url); 

  //Display the percentage of files currently loaded
  console.log("progress: " + loader.progress + "%"); 
}

function setup() {
    id = PIXI.loader.resources[MINE_SWEEPER_ATLAS].textures; 
    


    setCanvasSize();
    initializeTitle();
    initializePlay();
    initializeEnd();

    
    state = title;
    app.ticker.add(delta => gameLoop())
}

function setCanvasSize() {
    let testSize = new PIXI.Sprite(id[spriteSource[8]]);
    gameWidth = testSize.width;
    gameHeight = testSize.height;
    app.renderer.resize(gameWidth, gameHeight);
}


function gameLoop() {
    console.log(bombArray.length);
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
        //console.log(time);
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
        //console.log("Play!");
        //reset and send to 'play'
        initializeButton(buttonStart);
        charm.slide(buttonStartContainer, 
                    buttonStartContainer.x, 
                    buttonStartContainer.y + SPIRTE_OFF_SET,
                    30)
        .onComplete = () => 
        charm.fadeOut(titleScene, 30).onComplete = () => {
            titleLogo.x = gameWidth/2 - SPIRTE_OFF_SET;
            buttonStartContainer.y = gameHeight/2 + SPIRTE_OFF_SET;
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
    titleLogo.position.set(gameWidth/2 - SPIRTE_OFF_SET, gameHeight/2 - 50);
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
    buttonStartContainer.position.set(gameWidth/2, gameHeight/2 + SPIRTE_OFF_SET);
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
        charm.fadeIn(titleScene, 50).onComplete = () => {
            charm.slide(titleLogo, gameWidth/2, titleLogo.y, 25).onComplete = () => 
            charm.slide(buttonStartContainer, buttonStartContainer.x, gameHeight/2 + 50, 30).onComplete = () => activateButton(buttonStart);
        }

    }
}

function initializePlay(){
    playScene = new PIXI.Container();
    playScene.alpha = 0;
    app.stage.addChild(playScene);
    
    playBG = new PIXI.Sprite(id[spriteSource[6]])
    playBG.position.set(gameWidth/2, gameHeight/2);
    playBG.anchor.set(0.5,0.5);
    playScene.addChild(playBG);
    
    
    timeText = new PIXI.Text("0:00", textStyle);
    timeText.position.set(gameWidth/2 - 120, gameHeight/2 + 160);
    playScene.addChild(timeText);
    
    bombText = new PIXI.Text(BOMB_COUNT, textStyle);
    bombText.position.set(gameWidth/2 + 120, timeText.y);
    playScene.addChild(bombText);

    
    /* Initialize board and its cells */
    board = new PIXI.Container();
    createBoard(BOARD_SIZE, BOARD_SIZE);
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
    
    let trueWidth;
    let trueHeight;
    let ctr = 1;
    
    for(let x = 0; x < row; x++) {
        cellBelowArray.push([]);
        //cellAboveArray.push([]);
        for(let y = 0; y < col; y++) {
            
            //below Cells
            cellsB = new PIXI.Sprite(id[spriteSource[9]]);
            createCell(cellsB, xReal, yReal);
            cellBelowArray[x].push(cellsB);
            
            //add bomb if necessary
            decision = Math.floor((Math.random() * 100) + 1);
            if(decision < 10 && bombArray.length < BOMB_COUNT) {
                bomb = new PIXI.Sprite(id[spriteSource[0]]);
                bomb.position.set(xReal, yReal);
                bomb.anchor.set(0.5,0.5);
                bomb.alpha = 0;
                board.addChild(bomb);
                bombArray.push(bomb);
            }
            
            //Default cells B.
            xReal+= cellsB.width;
            if(y == col-1) {
                yReal += cellsB.height;
                xReal = 0; 
            }
            
            if(ctr == 1) {
                ctr--;
                trueHeight = cellsB.height;
                trueWidth = cellsB.width;
            }
        }
    }
    yReal = 0;
    xReal = 0;
    let mineCount = 0;
    let numWarn;
    for(let x = 0; x < row; x++) {
        cellAboveArray.push([]);
        for(let y = 0; y < col; y++) {
            //place number if needed
            mineCount = getMineCount(x, y);
            if(mineCount > 0) {
                numWarn = new PIXI.Text(mineCount, textStyleNumWarn);
                numWarn.anchor.set(0.5,0.5);
                numWarn.alpha = 0;
                numWarn.position.set(xReal, yReal);
                board.addChild(numWarn);
                numWarnArray.push(numWarn);
            }
            
            //place above cell.
            cellsA = new PIXI.Sprite(id[spriteSource[11]]);
            createCell(cellsA, xReal, yReal);
            cellOnClick(cellsA);
            cellAboveArray[x].push(cellsA);
            
            xReal+= trueWidth;
            if(y == col-1) {
                yReal += trueHeight;
                xReal = 0; 
            }
        }
    }
    
    //console.log(bombArray);
}

function getMineCount(x, y) {
    let count = 0;
    //check above
    if(x != 0) {
        if(hitBomb(cellBelowArray[x-1][y]) && !hitBomb(cellBelowArray[x][y])) {
            count++;
        }
    }
    
    //cehck below
    if (x != BOARD_SIZE-1) {
        if(hitBomb(cellBelowArray[x+1][y])&& !hitBomb(cellBelowArray[x][y])) {
            count++;
        }
    }
    
    //check left
    if(y != 0) {
        if(hitBomb(cellBelowArray[x][y-1])&& !hitBomb(cellBelowArray[x][y])) {
            count++;
        }
    }
    
    //check right
    if(y != BOARD_SIZE-1) {
        if(hitBomb(cellBelowArray[x][y+1])&& !hitBomb(cellBelowArray[x][y])) {
            count++;
        }
    }
    
    //check diagonals
    //upper left
    if(checkDiagonals(x-1,y-1, x, y)) {
        count++;
    }
    
    //upper right
    if(checkDiagonals(x-1,y+1, x, y)) {
        count++;
    }
    
    //lower left
    if(checkDiagonals(x+1,y-1, x ,y)) {
        count++;
    }
    //lower right
    if(checkDiagonals(x+1,y+1, x, y)) {
        count++;
    }    
    
    return count;
}
function checkDiagonals(testx, testy, x, y) {
    if(testx >= 0 && testx < BOARD_SIZE &&
       testy >= 0 && testy < BOARD_SIZE) {
        return hitBomb(cellBelowArray[testx][testy]) && !hitBomb(cellBelowArray[x][y]);
    }
    return false;
}

function createCell(cell, x, y) {
    cell.position.set(x,y);
    cell.anchor.set(0.5,0.5);
    board.addChild(cell);
    cell.upVisited = false;
    cell.downVisited = false;
    cell.leftVisited = false;
    cell.rightVisited = false;
}

function cellOnClick(cell) {
    cell.on("pointerup", () => {
       
        //if its a right click (Not Stable)
       if(event.button == 2 || event.button == 3) {
           let currentBombCount;
           currentBombCount = parseInt(bombText.text);
           
           if(hitBomb(cell)) {
               if(alreadyFound(cell.x, cell.y)) {
                   //console.log("Already found.");
               }
               else {
                  // console.log("not found");
                   bombFoundArray.push(cell);
                   currentBombCount--;
                   bombText.text = currentBombCount;
                   
                   if(currentBombCount == 0) {
                       didWin = true;
                       state = end;
                   }
               }
           }
           
           //console.log(currentBombCount);
       }
       //left click
       else {
           charm.fadeOut(cell, 20); 

            //if Hit, game over!
           if(hitBomb(cell)) {
               //Exploding shaking effect
               charm.walkPath(playScene, wayPoints, 15).onComplete = () => {
                   dissapearCellAbove();
               };
               state = end;
           }

           //if not, show other tiles.
           else {
                let theIndex = findCellAndGiveIndex(cell.x, cell.y);
                reveal(theIndex[0], theIndex[1]);
           }
       }
    });
}

function findCellAndGiveIndex(cellX, cellY) {
    let temp = [];
    
    for(let x = 0; x < cellAboveArray.length; x++) {
        for(let y = 0; y < cellAboveArray.length;y++) {
            if(cellAboveArray[x][y].x == cellX &&
              cellAboveArray[x][y].y == cellY) {
                temp.push(x);
                temp.push(y);
                return temp;
            }
        }
    }    
}


//reveals all blank till numbers r found
function reveal(x, y) {

    
    if((x >= 0 && x < BOARD_SIZE) &&
       (y >= 0 && y < BOARD_SIZE)) {
        let cell = cellAboveArray[x][y];
            
        //cell.alpha = 0;
        charm.fadeOut(cell, 20);
        if(!hitNum(cell)) {
            
            //top
            if(cell.upVisited == false) {
                cell.upVisited = true;
                reveal(x+1, y);
            }

            //down
            if(cell.downVisited == false) {
                cell.downVisited = true;
                reveal(x-1, y);         
            }

            //right
            if(cell.rightVisited == false) {
                cell.rightVisited = true;
                reveal(x, y+1);     
            }

            //left
            if(cell.leftVisited == false) {
                cell.leftVisited = true;
                reveal(x, y-1);
            }

        }
        else {
            return;
        }
        
    }
    else {
        return;
    }
}

function hitNum(cell) {
    for(let i = 0; i < numWarnArray.length; i++) {
        if(cell.x == numWarnArray[i].x &&
           cell.y == numWarnArray[i].y) {
            return true;
        }
    }
    return false;
}


function alreadyFound(x, y) {
    
    for(let i = 0; i < bombFoundArray.length; i++) {
        if(bombFoundArray[i].x == x &&
           bombFoundArray[i].y == y) {
            return true;
        }
    }
    return false;
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
            reApearBomb(); //change bomb's alpha to 1
            reApearNum();
            makeCellsClickable(true);
        }
    }
    
    if(timerOn)
        timer();
}

//makes all cells above invisible when game is over.
function dissapearCellAbove() {
    for(let x = 0 ; x < BOARD_SIZE;x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            cellAboveArray[x][y].alpha = 0;
        }
    }
}

function reApearNum() {
    for(let i = 0; i < numWarnArray.length; i++) {
        numWarnArray[i].alpha = 1;
    }
}

function makeCellsClickable(isClickable) {
    for (let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            cellAboveArray[x][y].interactive = isClickable;
        }
    }
}

function reApearBomb() {
    for(let i = 0; i < bombArray.length; i++) {
        bombArray[i].alpha = 1;
    }
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
    gameOverLogo.position.set(gameWidth/2 - SPIRTE_OFF_SET, gameHeight/2 - 130);
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
    endButtonGroup.position.set((gameWidth/2) - (buttonMain.width/2), (gameHeight/2) + SPIRTE_OFF_SET);
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
    
    winText = new PIXI.Text("Congratulations, you win!", textStyle);
    winText.anchor.set(0.5,0.5);
    winText.alpha = 0;
    winText.position.set(gameWidth/2, gameHeight/2 - 70);
    gameOverScene.addChild(winText);

    
    

    
    
    
    gameOverScene.visible = false;
}

function resetEndNext(next) {
    charm.slide(endButtonGroup, endButtonGroup.x, (gameHeight/2) + SPIRTE_OFF_SET, 20).onComplete = () => {
        charm.fadeOut(playScene, 20);
        charm.fadeOut(gameOverScene, 20).onComplete = () => {
            playScene.visible = false;
            //playScene.alpha = 0;
            timeText.text = "0:00";
            bombText.text = BOMB_COUNT;
            winText.alpha = 0;
            didWin = false;
            minuteElapse = 0;
            time = 0;
            ctr = 0;
            timerOn = false;
            gameOverLogo.x = gameWidth/2 - SPIRTE_OFF_SET;
            endButtonGroup.y = (gameHeight/2) + SPIRTE_OFF_SET;   
            resetPlayBoard();
            reCreateBoard();
            state = next;
        };
    }
}

function resetPlayBoard() {
    //remove bombs
    while(bombArray.length > 0) {
        board.removeChild(bombArray[0]);
        bombArray.splice(0, 1);
    }
    
    //resetTiles (above cells)
    for(let x = 0; x < BOARD_SIZE; x++) {
        while(cellAboveArray[x].length > 0) {
            board.removeChild(cellAboveArray[x][0]);
            cellAboveArray[x].splice(0, 1);
        }
    }
    
    while(numWarnArray.length > 0) {
        board.removeChild(numWarnArray[0]);
        numWarnArray.splice(0, 1);
    }
    
    while(bombFoundArray.length > 0) {
        bombFoundArray.splice(0, 1);
    }
    
//    console.log(cellAboveArray);
//    console.log(bombArray.length);
//    console.log(numWarnArray.length);
//    console.log(bombFoundArray.length);
}

//recraetas board by setting bomb and upper layer
function reCreateBoard() {
    let decision;
    let xReal = 0, 
        yReal = 0;
    let bomb;
    let cellsA;
    let cellsB = new PIXI.Sprite(id[spriteSource[9]]);
    let trueWidth = cellsB.width;
    let trueHeight = cellsB.height;
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            //add bomb if necessary
            decision = Math.floor((Math.random() * 100) + 1);
            if(decision < 10 && bombArray.length < BOMB_COUNT) {
                bomb = new PIXI.Sprite(id[spriteSource[0]]);
                bomb.position.set(xReal, yReal);
                bomb.anchor.set(0.5,0.5);
                bomb.alpha = 0;
                board.addChild(bomb);
                bombArray.push(bomb);
            }
            
            xReal+= trueWidth;
            if(y == BOARD_SIZE-1) {
                yReal += trueHeight;
                xReal = 0; 
            }
        }
    }
    
    yReal = 0;
    xReal = 0;
    let mineCount = 0;
    let numWarn;
    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {
            //place number if needed
            mineCount = getMineCount(x, y);
            if(mineCount > 0) {
                numWarn = new PIXI.Text(mineCount, textStyleNumWarn);
                numWarn.anchor.set(0.5,0.5);
                numWarn.alpha = 0;
                numWarn.position.set(xReal, yReal);
                board.addChild(numWarn);
                numWarnArray.push(numWarn);
            }
            
            //place above cell.
            cellsA = new PIXI.Sprite(id[spriteSource[11]]);
            createCell(cellsA, xReal, yReal);
            cellOnClick(cellsA);
            cellAboveArray[x].push(cellsA);
            
            xReal+= trueWidth;
            if(y == BOARD_SIZE-1) {
                yReal += trueHeight;
                xReal = 0; 
            }
        }
    }
//    console.log(bombArray);
//    console.log(cellAboveArray);
}

function end(){
    if(!gameOverScene.visible) {
        gameOverScene.alpha = 1;
        titleScene.visible = false;
        gameOverScene.visible = true
        makeCellsClickable(false); //disabled clickableness of above cells
        charm.slide(gameOverLogo, gameWidth/2, gameOverLogo.y, 20)
        .onComplete = () => {
            playScene.position.set(0,0);
            charm.slide(endButtonGroup, endButtonGroup.x, (gameHeight/2) - 20, 20);
            if(didWin)
                charm.fadeIn(winText, 30);
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
    //console.log("Is up");
    
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
    //console.log("Is hover");
    sprite.texture = texture;    
}
function buttonDown(sprite, texture) {
    sprite.isDown = true;
    //console.log("Is down");
    sprite.texture = texture;
}
function buttonOut(sprite, texture) {
    sprite.isOver = false;
    //console.log("Is out");
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


//function test(sprite) {
//    console.log("Up: " + !sprite.isDown)
//    console.log("Down: " + sprite.isDown)
//    console.log("Over: " + sprite.isOver)
//    console.log("Out: " + !sprite.isOver)
//    console.log("....")
//}


