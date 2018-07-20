import { observable, action, computed } from "mobx"
import gameData from '../../data/RHL1-29.js'

export default class PlayByPlayModel {
	@observable plays = []
	@observable currentPlay = 0

	constructor() {
		this.plays = gameData.split('\n')
	}

	@computed get playCount() {
		return this.plays.length
	}

	@computed get thisPlay() {
		return this.plays.length ? this.plays[0] : null
	}

	@action
	loadGame(file) {
		this.file = file
		console.log('guess we shoudl load:', file)
	}
}