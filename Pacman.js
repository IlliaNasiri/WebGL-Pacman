"use strict"
class PositionHelper {
    //TODO: CHECK COMPATIBILITY WITH OTHER BROWSERS FOR STATIC KEYWORD
    static positionEqual(pos1, pos2) {
        return pos1[0] == pos2[0] && pos1[1] == pos2[1];
    }
    static add(position, direction) {
        return [ position[0] + direction[0], position[1] + direction[1] ]
    }
    static subtract(position, direction) {
        return [position[0] - direction[0], position[1] - direction[1]]
    }

    static manhattanDistance(pos1, pos2) {
        return Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
    }
    static isPositionFormatValid(pos) {
        if (!Array.isArray(pos)) return false;
        if (pos.length != 2) return false;
        return true;
    }

}


//TODO: game class-> add return statements when game is over to some functions that can be potentially called after game is over e.g handleMoveEvent()
class Game {
    constructor(pacman, ghosts, walls, dots, logical_width, logical_height) {
        this._logical_width = logical_width;
        this._logical_height = logical_height;
        this._score = 0;
        this._pacman = pacman;
        this._ghosts = ghosts;
        this._walls = walls;
        this._countdown = 60;
        this._isGameOver = false;
        if (dots == null)
            this._dots = this.#generateDotPositions();
        else
            this.dots = dots;
    }

    get pacman() {return this._pacman;}
    set pacman(value) {this._pacman = value;}
    get ghosts() {return this._ghosts;}
    set ghosts(value) {this._ghosts = value;}
    get walls() {return this._walls;}
    set walls(value) {this._walls = value;}
    get dots() {return this._dots;}
    set dots(value) {this._dots = value;}
    get logical_width() {return this._logical_width;}
    set logical_width(value) {this._logical_width = value;}
    get logical_height() {return this._logical_height;}
    set logical_height(value) {this._logical_height = value;}
    get isGameOver() {return this._isGameOver;}
    set countdown(t) {this._countdown = t;}
    get countdown() {return this._countdown;}
    get score() {return this._score;}

    isPositionLegal(pos) {
        //TODO: WRITE A CLASS FOR THE EXCEPTION
        if (!PositionHelper.isPositionFormatValid(pos)) throw "Invalid Position at Game.isPositionLegal()."
        return !(this.#isWallPosition(pos)) && !(this.#doesPositionExceedLogicalBounds(pos))
    }

    checkPacmanCaught() {
        if (this._ghosts.some( ghost => PositionHelper.positionEqual(this._pacman.position, ghost.position)))
            this.#handlePacmanCaughtEvent();
    }

    checkPacmanOnDot() {
        if (this._dots.some(dot => PositionHelper.positionEqual(this._pacman.position, dot)))
            this.#handleDotEatenEvent();
    }

    handleMoveEvent() {
        if (this.isGameOver) return;
        this.checkPacmanCaught();
        //TODO: SEE IF THIS FUNCTION NEEDS NOT TO BE EXECUTED IF THE FIRST ONE IS EXECUTED
        this.checkPacmanOnDot();
    }

    #handleDotEatenEvent() {

        // adjust score, remove the dots from dot array
        let dotIndex = this._dots.findIndex( dot => { return PositionHelper.positionEqual(this._pacman.position, dot) } )
        console.log(dotIndex)
        this._dots.splice(dotIndex, 1);
        this._score += 100;
        // check if dots array is empty, if yes: score += countdown * 100; END GAME;
        if (this._dots.length <= 0) {
            this._score += 100 * this._countdown;
            this.#endGame();
        }
    }

    #handlePacmanCaughtEvent() {
        console.log("PACMAN CAUGHT EVENT")
        this._score -= 500;
        if (this._score <= 0)
            this.#endGame();
        else
            this.#putGhostsIntoInitialPositions();
    }

    #putGhostsIntoInitialPositions() {
        this._ghosts.forEach( ghost => ghost.position = [ghost.initialX, ghost.initialY] );
    }

    #generateDotPositions() {
        let dotArray = [];
        for(let i = 0; i < this.logical_width; i++) {
            for(let j = 0; j < this.logical_height; j++) {
                let pos = [i, j];
                let doesPosOverlapWall = this.#isWallPosition(pos);
                let doesPosOverlapPacman = PositionHelper.positionEqual(this.pacman.position, pos);
                let doesPosOverlapWithAnyGhost =
                    this.ghosts.some(ghost => {
                        return PositionHelper.positionEqual(ghost.position, pos)
                    });
                if (!doesPosOverlapWall && !doesPosOverlapPacman && !doesPosOverlapWithAnyGhost) {
                    dotArray.push(pos);
                }
            }
        }
        return dotArray;
    }
    #isWallPosition(pos) {
        if (!PositionHelper.isPositionFormatValid(pos)) throw "Invalid Position at Game.#isWallPosition()."
        for(let WallEntity of this.walls)
            for(let wallPosition of WallEntity.positions)
                if( PositionHelper.positionEqual(wallPosition, pos) ) return true;
        return false;
    }
    #doesPositionExceedLogicalBounds(pos) {
        if (!PositionHelper.isPositionFormatValid(pos)) throw "Invalid Position at Game.doesPositionExceedLogicalBounds()."
        return (pos[0] < 0 || pos[0] >= this.logical_width) || (pos[1] < 0 || pos[1] >= this.logical_height);
    }
    #endGame() {
        console.log("END GAME SET TRUE")
        this._isGameOver = true
    }
}

class WallEntity {
    constructor(positions, renderCoordinates) {
        this.positions = positions;
        this.renderCoordinates = renderCoordinates;
    }
}

class GameEntity {
    constructor(x0, y0, renderCoordinates, entityType) {
        this._position = [x0, y0];
        this._initialX = x0;
        this._initialY = y0;
        this._renderCoordinates = renderCoordinates;
        this._directions = [ [0, 1], [0, -1], [1, 0], [-1, 0] ]
        this._gameInstance = null;
        this._moveDirection = null;
        this._entityType = entityType
    }

    getLegalMoves(pos = this._position) {
        this.checkGameInstance();
        let legalMoves = [];
        this._directions.forEach( direction => {
            let newPos = PositionHelper.add(pos, direction);
            if(this._gameInstance.isPositionLegal(newPos))
                legalMoves.push(direction);
        } );
        return legalMoves;
    }
    move(){
        this.checkGameInstance()

        let moveAction = this.getMoveAction();
        if (moveAction == null) return;

        let legalActions = this.getLegalMoves();
        let actionIsLegal = legalActions.some( legalAction => PositionHelper.positionEqual(legalAction, moveAction) )
        if(actionIsLegal)
            this._position = PositionHelper.add(this._position, moveAction);
        this._moveDirection = null
        this.gameInstance.handleMoveEvent()
    }
    set gameInstance(gameInstance) {this._gameInstance = gameInstance;}
    get gameInstance() {return this._gameInstance;}
    set position(pos) {
        PositionHelper.isPositionFormatValid(pos)
        this._position = pos;
    }
    get position() {return this._position;}
    set moveDirection(moveDirection) {this._moveDirection = moveDirection}
    get moveDirection() {return this._moveDirection}
    set entityType(value) {this._entityType = value;}
    get entityType() {return this._entityType;}
    get initialX() {return this._initialX;}
    get initialY(){return this._initialY;}

    getMoveAction() {
        this.checkGameInstance();
        return this._moveDirection;
    }
    checkGameInstance() {
        if (this._gameInstance == null) throw "Game instance is not defined for gameEntity!"
    }

}

class PacmanEntity extends GameEntity{

    constructor(x0, y0, renderCoordinates) {
        super(x0, y0, renderCoordinates, "pacman")
    }
    getMoveAction() {
        this.checkGameInstance();
        return this._moveDirection;
    }
}

class GhostEntity extends GameEntity{

    constructor(x0, y0, renderCoordinates, ghostType) {
        super(x0, y0, renderCoordinates, "ghost");
        if (ghostType != "minimax" && ghostType != "greedy" && ghostType != "random") throw "Invalid ghost type!";
        this.ghostType = ghostType;

    }
    getMoveAction() {
        this.checkGameInstance();
        let action = [0,0]
        switch (this.ghostType) {
            case "minimax":
                // action = thus.#getMinimaxAction();
                break;
            case "random":
                action = this.getRandomAction();
                break;
            default: // greedy case
                action = this.getGreedyAction(this._gameInstance.pacman.position);
                break;
        }
        return action;
    }

    getGreedyAction(pacmanPosition) {
        // EDGE CASE: PACMAN AND GHOST ARE IN SAME POSITION, RETURN [0,0]
        if( PositionHelper.manhattanDistance(this._position, pacmanPosition) == 0 ) return [0,0];
        let legalMoves = this.getLegalMoves()
        let action = legalMoves[0]
        let manhattanDistance = PositionHelper.manhattanDistance( PositionHelper.add(this._position, action), pacmanPosition );
        for(let i = 1; i < legalMoves.length; i++) {
            if(manhattanDistance >= PositionHelper.manhattanDistance( PositionHelper.add(this._position, legalMoves[i]), pacmanPosition )) {
                action = legalMoves[i]
                manhattanDistance = PositionHelper.manhattanDistance( PositionHelper.add(this._position, legalMoves[i]), pacmanPosition );
            }
        }
        return action;
    }

    getRandomAction() {
        let legalMoves = this.getLegalMoves();
        return legalMoves[Math.floor(Math.random() * (legalMoves.length + 1))]
    }

}

const walls = [
    new WallEntity(
        [ [1,1], [2,1], [3,1], [1,2], [2,2], [3,2] ],
        []
    ),
    new WallEntity(
        [ [5,1], [6,1], [7,1], [5,2], [6,2], [7,2] ],
        []
    ),
    new WallEntity(
        [ [1, 4], [1, 5]],
        []
    ),
    new WallEntity(
        [[7,4], [7,5]],
        []
    ),
    new WallEntity(
        [ [1,7], [2,7], [3,7], [1,8], [2,8], [3,8] ],
        []
    ),
    new WallEntity(
        [ [5, 7], [6, 7], [7,7], [5,8], [6,8], [7,8]],
        []
    )
]

function main() {

    let ghosts = [new GhostEntity(8, 9,[], "greedy"), new GhostEntity(7,9, [], "random")];
    let pacman = new PacmanEntity(0,0, []);
    let game = new Game(pacman, ghosts, walls, null, 9, 10);
    // let game = new Game(pacman, ghosts, walls, [[0,1]], 9, 10);
    pacman.gameInstance = game;
    ghosts[0].gameInstance = game;
    ghosts[1].gameInstance = game;



    setUpDirectionKeyEventListener(pacman)
    // setInterval(() => {pacman.move(); console.log(pacman.position)}, 500)
    let myInterval = setInterval(() => {
        console.log("Pacman: ", pacman.position);
        pacman.move();
        for(let ghost of ghosts) {
            ghost.move();
            console.log("ghost:", ghost.ghostType, " ", ghost.position);
        }
        console.log(game.score)
        console.log("\n")

        if(game.isGameOver) {
            console.log("GAME OVER!")
            clearInterval(myInterval)
        }

    }, 500)
}

function setUpDirectionKeyEventListener(pacman) {
    document.addEventListener("keydown", (event) => {
        switch (event.code) {

            case "KeyW":
                pacman.moveDirection = [0,1];
                break;
            case "KeyD":
                pacman.moveDirection = [1, 0];
                break;
            case "KeyS":
                pacman.moveDirection = [0, -1];
                break;
            case "KeyA":
                pacman.moveDirection = [-1, 0];
                break;
        }
    })
}

main();

// For testing purposes, export needed classes and functions
export {PositionHelper}