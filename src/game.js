export default class Game {
    constructor() {
        this.reset()
    }

    static points = {
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 1200
    }

    get level() {
        return Math.floor(this.lines * 0.1)
    }

    getState() {
        const playfield = this.createPlayfield()
        const { y: pieceY, x: pieceX, blocks } = this.activePiece
        let y = 0
        let u = 0

        while(y < this.playfield.length) {
            playfield[y] = []
            let x = 0

            while(x < this.playfield[y].length) {
                playfield[y][x] = this.playfield[y][x]
                x++
            }
            y++
        }

        while(u < blocks.length) {
            let c = 0

            while(c < blocks[u].length) {
                if(blocks[u][c]) {
                    playfield[pieceY + u][pieceX + c] = blocks[u][c]
                }
                
                c++
            }
            u++
        }

        return {
            score: this.score,
            level: this.level,
            lines: this.lines,
            nextPiece: this.nextPiece,
            playfield,
            isGameOver: this.topOut
        }
    }

    reset() {
        this.score = 0
        this.lines = 0
        this.topOut = false
        this.playfield = this.createPlayfield()
        this.activePiece = this.createPiece()
        this.nextPiece = this.createPiece()
    }

    createPlayfield() {
        const playfield = []
        let y = 0

        while(y < 20) {
            playfield[y] = []
            let x = 0

            while(x < 10) {
                playfield[y][x] = 0
                x++
            }
            y++
        }

        return playfield
    }

    createPiece() {
        const index = Math.floor(Math.random() * 7)
        const type = 'IJLOSTZ'[index]
        const piece = {}

        switch(type) {
            case 'I':
                piece.blocks = [
                    [0,0,0,0],
                    [1,1,1,1],
                    [0,0,0,0],
                    [0,0,0,0]
                ]
                break
            case 'J':
                piece.blocks = [
                    [0,0,0],
                    [2,2,2],
                    [0,0,2]
                ]
                break
            case 'L':
                piece.blocks = [
                    [0,0,0],
                    [3,3,3],
                    [3,0,0]
                ]
                break
            case 'O':
                piece.blocks = [
                    [0,0,0,0],
                    [0,4,4,0],
                    [0,4,4,0],
                    [0,0,0,0]
                ]
                break
            case 'S':
                piece.blocks = [
                    [0,0,0],
                    [0,5,5],
                    [5,5,0]
                ]
                break
            case 'T':
                piece.blocks = [
                    [0,0,0],
                    [6,6,6],
                    [0,6,0]
                ]
                break
            case 'Z':
                piece.blocks = [
                    [0,0,0],
                    [7,7,0],
                    [0,7,7]
                ]
                break
            default: 
                throw new Error('Unknow figure type')
        }

        piece.x = Math.floor((10 - piece.blocks[0].length) / 2)
        piece.y = -1

        return piece
    }

    movePieceLeft() {
        this.activePiece.x -= 1

        if(this.hasCollision()) {
            this.activePiece.x += 1
        }
    }

    movePieceRight() {
        this.activePiece.x += 1

        if(this.hasCollision()) {
            this.activePiece.x -= 1
        }
    }

    movePieceDown() {
        if(this.topOut) return 

        this.activePiece.y += 1;

        if(this.hasCollision()) {
            this.activePiece.y -= 1;
            this.lockPiece()
            const clearedLines = this.clearLines()
            this.updateScore(clearedLines)
            this.updatePieces()
        }

        if(this.hasCollision()) {
            this.topOut = true
        }
    }

    rotatePiece() {
        this.rotateBlocks()

        if(this.hasCollision()) {
            this.rotateBlocks(false)
        }
    }

    rotateBlocks(clockwise = true) {
        const blocks = this.activePiece.blocks
        const length = blocks.length
        const x = Math.floor(length / 2)
        const y = length - 1

        for(let i = 0; i < x; i++) {
            for(let j = i; j < y - i; j++) {
                const temp = blocks[i][j]

                if(clockwise) {
                    blocks[i][j] = blocks[y - j][i]
                    blocks[y - j][i] = blocks[y - i][y - j]
                    blocks[y - i][y - j] = blocks[j][y - i]
                    blocks[j][y - i] = temp
                } else {
                    blocks[i][j] = blocks[j][y - i]
                    blocks[j][y - i] = blocks[y - i][y - j]
                    blocks[y - i][y - j] = blocks[y - j][i]
                    blocks[y - j][i] = temp
                }
            }
        }
    }

    hasCollision() {
        const playfield = this.playfield
        const { y: pieceY, x: pieceX, blocks } = this.activePiece;

        for(let y = 0; y < blocks.length; y++) {
            for(let x = 0; x < blocks[y].length; x++) {
                if(
                    blocks[y][x] && 
                    ((playfield[pieceY + y] === undefined || playfield[pieceY + y][pieceX + x] === undefined) ||
                    playfield[pieceY + y][pieceX + x])
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    lockPiece() {
        const playfield = this.playfield
        const { y: pieceY, x: pieceX, blocks } = this.activePiece

        blocks.forEach((_, y) => {
            blocks[y].forEach((_, x) => {
                if(blocks[y][x]) {
                    playfield[pieceY + y][pieceX + x] = blocks[y][x]
                }
            })
        })

    }

    clearLines() {
        let lines = []
        const rows = 20
        const columns = 10

        for(let y = rows - 1; y >= 0; y--) {
            let numberOfBlocks = 0

            for(let x = 0; x < columns; x++) {
                if(this.playfield[y][x]) {
                    numberOfBlocks += 1
                }
            }

            if(numberOfBlocks === 0) break
            else if(numberOfBlocks < columns) continue
            else if(numberOfBlocks === columns) lines.unshift(y)

        }
        for(let index of lines) {
            this.playfield.splice(index, 1)
            this.playfield.unshift(new Array(columns).fill(0))
        }

        return lines.length
    }

    updatePieces() {
        this.activePiece = this.nextPiece
        this.nextPiece = this.createPiece()
    }

    updateScore(clearedLines) {
        if(clearedLines > 0) {
            this.score += Game.points[clearedLines] * (this.level + 1)
            this.lines += clearedLines
        }
    }
}