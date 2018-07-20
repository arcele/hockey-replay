import { observable, action, computed } from "mobx"
import gameData from '../../data/RHL1-29.js'

export default class PlayByPlayModel {
	@observable plays = []
	@observable fullPlays = []
	@observable currentPlay = 0
	@observable title = 'Hockey Replay'
	@observable date = ''

	parsePlays(data) {
		let isPlays, isFullPlays = false
		this.fullPlays = []
		this.plays = data.split('\n').map((line) => {
			console.log('how abotu:', line)
			if(line.search(/STHSGame_Result/g) > -1) {
				this.title = line.split('>')[1]
			} else if(line.search(/STHSGame_NowTime/g) > -1) {
				this.date = line.split('>')[2].split('<')[0]
			} else if(line.search(/STHSGame_PlayByPlayTitle/g) > -1) {
				isPlays = true
			} else if(line.search(/STHSGame_FullPlayByPlayPeriod/g) > -1) {
				isPlays = false
				isFullPlays = true
			}
			if(isFullPlays) {
				this.fullPlays.push(line)
			}			
			if(isPlays) {
				return line.split('<')[0]
			}
		}).filter(Boolean);
	}

	constructor() {
		this.parsePlays(gameData) // eventually grab this asych
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