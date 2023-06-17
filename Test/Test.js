import {PositionHelper} from '../Pacman.js'

const assert = chai.assert;
describe("PositionHelper.equal()", function() {
    it("pos1 = [1,1], pos2 = [1,1], Expected: true", function () {
        assert.equal(true, PositionHelper.positionEqual([1,1], [1,1]));
    })
    it("pos1 = [1,2], pos2 = [1,1], Expected: false", function () {
        assert.notEqual(true, PositionHelper.positionEqual([1,2], [1,1]))
    })
    it("pos1 = [], pos2 = [1,2], Expected: false", function () {
        assert.notEqual(true, PositionHelper.positionEqual([], [1,2]))
    })
});

describe("PositionHelper.add()", function () {
    it("pos1 = [1,1], pos2 = [0,2], expected = [1,3]", function () {
        assert.equal(1, PositionHelper.add([1,1], [0,2])[0])
        assert.equal(3, PositionHelper.add([1,1], [0,2])[1])
    })
})

describe("PositionHelper.subtract()", function () {
    it("pos1 = [1,1], pos2 = [0,2], expected = [1,-1]", function () {
        assert.equal(1, PositionHelper.subtract([1,1], [0,2])[0])
        assert.equal(-1, PositionHelper.subtract([1,1], [0,2])[1])
    })
})


mocha.run();