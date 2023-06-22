

export class Renderer {
    constructor(gameObject, canvasTagId) {
        this._gameObject = gameObject;
        this._logicalSegmentWidth = 2 / (gameObject.logical_width);
        this._logicalSegmentHeight = 2 / (gameObject.logical_height);
        this._canvasTagId = canvasTagId;
        let init = this.#init(); // sets up this._gl, and this._canvas
        this._canvas = init.canvas;
        this._gl = init.gl;
        this.setUpShaders()
    }

    get gameObject() {return this._gameObject;}
    set gameObject(gameObject) {this._gameObject = gameObject;}
    get canvasTagId() {return this._canvasTagId;}
    set canvasTagId(value) {this._canvasTagId = value;}

    renderWalls() {
        for(let i = 0; i < this.gameObject.walls.length; i++) {
            this.#renderWall(this.gameObject.walls[i]);
        }
    }
    renderDots() {
        let gl = this._gl;
        let dotsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, dotsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#getDotsClipCoordinates()), gl.STATIC_DRAW);
        let loc = gl.getAttribLocation(this._program, "vPositions");
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(loc)
        let colorLoc = gl.getUniformLocation(this._program, "renderColor")
        gl.uniform4f(colorLoc, 0.626, 0.710, 0.206, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, this.gameObject.dots.length );

    }
    renderGameEntities(){
        this.#renderPacman();

        let colors = [ [0.0, 0.0, 0.4, 1.0], [0.8, 0.0, 0.0, 1.0] ]
        for (let i = 0; i < 2; i++) {
            let ghost = this._gameObject.ghosts[i];
            let color = colors[i]
            this.#renderGhost(ghost, color);
        }

    }

    #renderGhost(ghost, color) {
        let gl = this._gl;
        let ghostsBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, ghostsBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#getGhostClipCoordinates(ghost)), gl.STATIC_DRAW);
        let loc = gl.getAttribLocation(this._program, "vPositions");
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        let colorLoc = gl.getUniformLocation(this._program, "renderColor")
        gl.uniform4f(colorLoc, color[0], color[1], color[2], color[3]);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }
    #renderPacman() {
        let gl = this._gl;
        let pacmanBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, pacmanBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#getPacmanClipCoordinates()), gl.STATIC_DRAW);
        let loc = gl.getAttribLocation(this._program, "vPositions");
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.enableVertexAttribArray(loc)
        let colorLoc = gl.getUniformLocation(this._program, "renderColor")
        gl.uniform4f(colorLoc, 0.0, 0.0, 0.8, 1.0)
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    #renderWall(wallEntity) {
        let gl = this._gl;
        let wallBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, wallBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.#getWallClipCoordinates(wallEntity)), gl.STATIC_DRAW);
        let loc = gl.getAttribLocation(this._program, "vPositions");
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, gl.FALSE, 2 * Float32Array.BYTES_PER_ELEMENT, 0);
        let colorLoc = gl.getUniformLocation(this._program, "renderColor")
        gl.uniform4f(colorLoc, 0.0, 0.8 , 0.0, 1.0);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        gl.uniform4f(colorLoc, 0.0, 0.0, 1.0, 1.0);

        gl.drawArrays(gl.LINE_LOOP, 0, 4);
    }


    #init() {
        let canvas = document.getElementById(this._canvasTagId);
        let result = {}
        if (canvas == null)
            throw "Error at Renderer.init(): canvas with id " + this._canvasTagId + " doesn't exist";
        else
            result["canvas"] = canvas;

        let gl = canvas.getContext("webgl2");
        if(gl == null)
            throw "Error at Renderer.init(): Your browser doesn't support WebGL2";
        else
            result["gl"] = gl;

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = pixelRatio * canvas.clientWidth;
        canvas.height = pixelRatio * canvas.clientHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.361, 0.361, 0.361, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return result;
    }
    setUpShaders() {
        let gl = this._gl;
        let vertexShaderText = document.getElementById("vertex-shader").innerText;
        let fragmentShaderText = document.getElementById("fragment-shader").innerText;
        let vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderText);
        gl.compileShader(vertexShader)
        if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(vertexShader));
            gl.deleteShader(vertexShader);
        } else {
            console.log("Vertex Shader Has been compiled successfully! ")
        }

        let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderText);
        gl.compileShader(fragmentShader);

        if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(fragmentShader));
            gl.deleteShader(fragmentShader)
        } else {
            console.log("Fragment Shader Has been Compiled!")
        }
        this._vertexShader = vertexShader;
        this._fragmentShader = fragmentShader;

        let program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program));
        } else {
            console.log("Program linked successfully!")
        }

        gl.validateProgram(program);
        if(!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            console.log("JKDNKJSNGKJNSDFKJ;GNKJS;DFNGKJ;SFNGKJSDNFGKJNDSFKJGNKDJFGKJDSFNGK;JDFNGKJ;DNFGKJ;N");
        }
        gl.useProgram(program)
        //TODO: MOVE TO CONSTRUCTOR
        this._program = program;
        //TODO: RETURN PROGRAM
    }
    #getDotsClipCoordinates() {
        let dots = this._gameObject.dots;
        let dotClipCoordinates = [];

        dots.forEach( dot => {
            // x component
            dotClipCoordinates.push(this._logicalSegmentWidth * (dot[0] + 0.5) - 1);
            dotClipCoordinates.push(this._logicalSegmentHeight * (dot[1]  + 0.5) - 1);
        } )
        return dotClipCoordinates;
    }
    #getPacmanClipCoordinates() {
        let pacmanRenderCoords = [];
        let pacmanPos = this.gameObject.pacman.position;
        // top vertex
        pacmanRenderCoords.push(this._logicalSegmentWidth * (1/2 + pacmanPos[0]) - 1);
        pacmanRenderCoords.push(this._logicalSegmentHeight * (2/3 + pacmanPos[1]) -1);

        // left vertex
        pacmanRenderCoords.push(this._logicalSegmentWidth * (1/3 + pacmanPos[0]) - 1);
        pacmanRenderCoords.push(this._logicalSegmentHeight * (1/3 + pacmanPos[1]) - 1);

        // right vertex
        pacmanRenderCoords.push(this._logicalSegmentWidth * (2/3 + pacmanPos[0]) - 1);
        pacmanRenderCoords.push(this._logicalSegmentHeight * (1/3 + pacmanPos[1]) -1);

        return pacmanRenderCoords;
    }
    #getGhostClipCoordinates(ghost) {
        let ghostRenderCoords = [];
        let ghostPos = ghost.position;
        // bottom right
        ghostRenderCoords.push( this._logicalSegmentWidth * (3/4 + ghostPos[0]) - 1 );
        ghostRenderCoords.push( this._logicalSegmentHeight * (1/4 + ghostPos[1]) - 1);
        // bottom left
        ghostRenderCoords.push( this._logicalSegmentWidth * (1/4 + ghostPos[0]) - 1 );
        ghostRenderCoords.push( this._logicalSegmentHeight * (1/4 + ghostPos[1]) - 1);

        // top left
        ghostRenderCoords.push( this._logicalSegmentWidth * (1/4 + ghostPos[0]) - 1 );
        ghostRenderCoords.push( this._logicalSegmentHeight * (3/4 + ghostPos[1]) - 1);
        // top right
        ghostRenderCoords.push( this._logicalSegmentWidth * (3/4 + ghostPos[0]) - 1 );
        ghostRenderCoords.push( this._logicalSegmentHeight * (3/4 + ghostPos[1]) - 1);

        return ghostRenderCoords;
    }

    #getWallClipCoordinates(wallEntity) {
        let wallClipCoordinates = []
        let leftTopPos = wallEntity.getLeftTopCorner();
        let leftBottomPos = wallEntity.getLeftBottomCorner();
        let rightBottomPos = wallEntity.getRightBottomCorner();
        let rightTopPos = wallEntity.getRightTopCorner();

        // left top
        wallClipCoordinates.push(this._logicalSegmentWidth * leftTopPos[0] - 1);
        wallClipCoordinates.push(this._logicalSegmentHeight * (leftTopPos[1] + 1) - 1);

        // left bottom:
        wallClipCoordinates.push(this._logicalSegmentWidth * leftBottomPos[0] - 1);
        wallClipCoordinates.push(this._logicalSegmentHeight * (leftBottomPos[1]) - 1);

        // right bottom:
        wallClipCoordinates.push(this._logicalSegmentWidth * (rightBottomPos[0] + 1) - 1);
        wallClipCoordinates.push(this._logicalSegmentHeight * (rightBottomPos[1]) - 1);

        // right top:
        wallClipCoordinates.push(this._logicalSegmentWidth * (rightTopPos[0] + 1) - 1);
        wallClipCoordinates.push(this._logicalSegmentHeight * (rightTopPos[1] + 1) - 1);

        return wallClipCoordinates;
    }



}