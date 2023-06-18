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
}

class GameManager {}

class Game {
    LOGICAL_WIDTH = 9;
    LOGICAL_HEIGHT = 10;
    constructor(walls, dots) {
        this.score = 0;
        this.timer = 60;
        this.walls = walls;
        this.dots = dots;
    }

}

class WallEntity {
    constructor(positions, renderCoordinates) {
        this.positions = positions;
        this.renderCoordinates = renderCoordinates;
    }

}

class GameEntity {
    //TODO: MAYBE MOVE THIS TO THE CHILD CLASS.
    moveDirection = null;
    //TODO: ADD MOVEMENT DIRECTION
    constructor(x0, y0, renderCoordinates, walls, LOGICAL_WIDTH, LOGICAL_HEIGHT) {
        this.position = [x0, y0];
        this.renderCoordinates = renderCoordinates;
        this.walls = walls;
        this.LOGICAL_WIDTH = LOGICAL_WIDTH;
        this.LOGICAL_HEIGHT = LOGICAL_HEIGHT;
        this.actions = [
            [0, 1], // North
            [0, -1], // South
            [1, 0], // East,
            [-1, 0] // West
        ]
    }
    getLegalMoves() {
        let legalMoves = []
        this.actions.forEach( action => {
            let newPosition = PositionHelper.add(this.position, action)
            if(!this.doesPositionOverlapWithWalls(newPosition) && !this.doesExitGameBorders(newPosition)) {
                legalMoves.push(action);
            }
        } )
        return legalMoves;
    }

    doesPositionOverlapWithWalls(position) {

        for(let WallEntity of this.walls) {
            for(let wallPosition of WallEntity.positions) {
                if( PositionHelper.positionEqual(wallPosition, position) ) {
                    return true;
                }
            }
        }
        return false;
    }

    doesExitGameBorders(position) {
        return (position[0] < 0 || position[0] >= this.LOGICAL_WIDTH) || (position[1] < 0 || position[1] >= this.LOGICAL_HEIGHT)
    }

    move(){
        let moveAction = this.getMoveAction();
        if (moveAction == null) return;
        let legalActions = this.getLegalMoves();
        let actionIsLegal = legalActions.some( legalAction => PositionHelper.positionEqual(legalAction, moveAction) )
        if(actionIsLegal) {
            this.position = PositionHelper.add(this.position, moveAction);
        }

    }

    getMoveAction() {
        let ret = this.moveDirection;
        this.moveDirection = null;
        return ret
    }

}

class PacmanEntity extends GameEntity{

    constructor(x0, y0, renderCoordinates, walls, LOGICAL_WIDTH, LOGICAL_HEIGHT) {
        super(x0, y0, renderCoordinates, walls, LOGICAL_WIDTH, LOGICAL_HEIGHT)
    }

    getMoveAction() {
        return this.moveDirection;
    }
}

class GhostEntity extends GameEntity{

    constructor(x0, y0, renderCoordinates, walls, LOGICAL_WIDTH, LOGICAL_HEIGHT, ghostType) {
        super(x0, y0, renderCoordinates, walls, LOGICAL_WIDTH, LOGICAL_HEIGHT);
        // can be either greedy or minimax, or random
        this.ghostType = ghostType;
    }

    getMoveAction() {
        // TODO: IMPLEMENT CHASING ALGORITHM FOR A GHOST
        let action = [0,0]

        switch (this.ghostType) {
            case "greedy":
                //todo: pass pacman position
                action = getGreedyAction();
                break;
            case "minimax":
                action = getMinimaxAction();
                break;
            case "random":
                action = getRandomAction();
                break;
        }
        //TODO: MAKE EXCEPTION CLASS FOR EMPTY ACTION
        return action;
    }

    getGreedyAction(pacmanPosition) {
        // EDGE CASE: PACMAN AND GHOST ARE IN SAME POSITION, RETURN [0,0]
        if( PositionHelper.manhattanDistance(this.position, pacmanPosition) == 0 ) return [0,0];

        let action = this.actions[0];
        let manhattanDistance = PositionHelper.manhattanDistance( PositionHelper.add(this.position, action), pacmanPosition );
        let legalMoves = this.getLegalMoves();
        console.log(legalMoves)
        for(let i = 1; i < legalMoves.length; i++) {
            if(manhattanDistance >= PositionHelper.manhattanDistance( PositionHelper.add(this.position, legalMoves[i]), pacmanPosition )) {
                action = legalMoves[i]
                manhattanDistance = PositionHelper.manhattanDistance( PositionHelper.add(this.position, legalMoves[i]), pacmanPosition );
            }
        }
        return action;
    }

    getRandomAction() {
        return this.actions[Math.floor(Math.random() * 5)]
    }


}

// The main loop of the game that keeps the game running

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

    let ghostEntity = new GhostEntity(0,7, [], walls, 9, 10, "greedy");
    console.log(ghostEntity.getGreedyAction([2, 6]));

    // setInterval(() => {
    //     gameEntity.move();
    //     console.log(gameEntity.position)
    // }, 1000)
    // gameEntity.moveDirection = [1,0]
    // gameEntity.move()
    // console.log(gameEntity.position)


    // console.log(gameEntity.position)
    // console.log(gameEntity.getLegalMoves())
    // gameEntity.moveDirection = [1,0]
    // gameEntity.move()
    // setUpDirectionKeyEventListener(gameEntity);
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