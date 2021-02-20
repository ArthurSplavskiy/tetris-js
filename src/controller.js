export default class Controller {
    constructor(game, view) {
        this.game = game
        this.view = view
        this.intervalId = null
        this.isPlaying = false

        document.addEventListener('keydown', this.handleKeyDown.bind(this))
        document.addEventListener('keyup', this.handleKeyUp.bind(this))

        this.view.renderStartScreen()
    }

    update() {
        this.game.movePieceDown()
        this.updateView()
    }

    play() {
        this.isPlaying = true
        this.startTimer()
        this.updateView()
    }

    pause() {
        this.isPlaying = false
        this.stopTimer()
        this.updateView()
    }

    reset() {
        this.game.reset()
        this.play()
    }

    updateView() {
        const state = this.game.getState()

        if(state.isGameOver) {
            this.view.renderEndScreen(state)
        } else if(this.isPlaying) {
            this.view.renderMainScreen(state)
        } else {
            this.view.renderPauseScreen()
        }
    }

    startTimer() {
        const speed = 1000 - this.game.getState().level * 100
        console.log(speed)

        if(!this.intervalId) {
            this.intervalId = setInterval(() => {
                this.update()
            }, speed > 0 ? speed : 100 )
        }
    }

    stopTimer() {
        if(this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }
    }

    handleKeyDown(e) {
        const state = this.game.getState()

        switch(e.keyCode) {
            case 13: // ENTER
                if(state.isGameOver) {
                    this.reset()
                } else if(this.isPlaying) {
                    this.pause()
                } else {
                    this.play()
                }
                break
            case 37: // LEFT ARROW
                this.game.movePieceLeft()
                this.view.renderMainScreen(this.game.getState())
                break
            case 38: // UP ARROW
                this.game.rotatePiece()
                this.view.renderMainScreen(this.game.getState())
                break
            case 39: // RIGHT ARROW
                this.game.movePieceRight()
                this.view.renderMainScreen(this.game.getState())
                break
            case 40: // DOWN ARROW
                // this.stopTimer()
                this.game.movePieceDown()
                this.view.renderMainScreen(this.game.getState())
                break
        }
    }

    handleKeyUp(e) {
        switch(e.keyCode) {
            case 40: // DOWN ARROW
                this.startTimer()
                break
        }
    }
}