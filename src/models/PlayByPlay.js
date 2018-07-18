import { observable, action, computed } from "mobx"

export default class PlayByPlayModel {
	@observable plays = []

	@computed
	getPlayCount() {
		return this.plays.length
	}

	@action
	loadGame(file) {
		this.file = file
		console.log('guess we shoudl load:', file)
	}
}