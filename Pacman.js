
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
}

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

}

class PacmanEntity extends GameEntity{
    constructor(x0, y0, renderCoordinates) {
        super(x0, y0, renderCoordinates)
    }

}

class GhostEntity extends GameEntity{
    constructor(x0, y0, renderCoordinates) {
        super(x0, y0, renderCoordinates)
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

    let gameEntity = new GameEntity(1,0, [], walls, 9, 10);


}

main();

// For testing purposes, export needed classes and functions
export {PositionHelper}