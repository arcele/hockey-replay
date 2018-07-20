import { observable, action, computed } from "mobx"
import gameData from '../../data/RHL1-29.js'

export default class PlayByPlayModel {
	@observable plays = []
	fullPlaysString = ''
	@observable currentPlay = 0
	@observable title = 'Hockey Replay'
	@observable date = ''

	getLineChanges(play) {
		let ret = {}
		let str = ' - ([^\\.])+ on ice for '
		let re = new RegExp(str, "g")
		let matches
		this.teams.map((team) => {
			str = ' - ([^\\.])+ on ice for ' + team
			re = new RegExp(str, "g")
			matches = play.long.match(re)
			if(matches && matches.length) {
				ret[team] = matches
			}
		})
		return ret
	}

	parsePlays(data) {
		let isPlays, isFullPlays = false
		this.fullPlays = []
		// get basic play data, and game info
		this.plays = data.split('\n').map((line) => {
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
				this.fullPlaysString += line
			}			
			if(isPlays) {
				return { short : line.split('<')[0] }
			}
		}).filter(Boolean);

		// append the full text from the fullPlaysString
		this.plays = this.plays.map((play) => {
			let short = play.short
			let longSearch = short.split(' - ')[1]
			let long, changes, longIdx
			if(longSearch) {
				longIdx = this.fullPlaysString.search(longSearch) + longSearch.length
				long = this.fullPlaysString.slice(0, longIdx)
				this.fullPlaysString = this.fullPlaysString.slice(longIdx)
				changes = this.getLineChanges({ short, long})
			}
			return { short, long, changes }
		})
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

	@computed get homeTeam() {
		return this.title.split(' vs ')[1]
	}

	@computed get awayTeam() {
		return this.title.split( ' vs ')[0]
	}

	@computed get teams() {
		return [this.awayTeam, this.homeTeam]
	}

	@action
	loadGame(file) {
		this.file = file
		console.log('guess we shoudl load:', file)
	}
}