import { observable, action, computed } from "mobx"
import gameData from '../../data/RHL1-29.js'

export default class PlayByPlayModel {
	@observable plays = []
	fullPlaysString = ''
	@observable currentPlay = 0
	@observable currentSegment = 0
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
			// we should now loop through the segments for line changes now
			matches = play.long.match(re)
			if(matches && matches.length) {
				ret[team] = matches
				ret.play = play
			}
		})
		return ret
	}

	parsePlays(data) {
		let isPlays, isFullPlays = false
		this.fullPlays = []
		// get basic play data, and game info

		// each "play" in this.plays holds the main play text
		// with the clock and end of the "full play text"
		// each play will also contain a group of segments that
		// hold more information about the play

		// currently each 'play' is just a line from a text file, we should turn this into
		// an array of 'Play' models so that we can do all of our play related functionality
		// there, this Model should only be for things related to the actual play by play

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
		}).filter((x) => { if(x && x.short != '') { return x } });

		// create the play segments here from the fullPlaysString
		this.plays = this.plays.map((play) => {
			let short = play.short
			let longSearch = short.split(' - ')[1]
			let long, changes, longIdx, segments
			if(longSearch) {
				longIdx = this.fullPlaysString.search(longSearch) + longSearch.length
				long = this.fullPlaysString.slice(0, longIdx)
				segments = long.split('.') // run a function on these segments to populate line changes on the segments instead of on the plays
				segments = segments.slice(0, segments.length-1)
				this.fullPlaysString = this.fullPlaysString.slice(longIdx)
				changes = this.getLineChanges({ short, long})
			}
			return { short, segments, long, changes }
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

	prev() {
		if(this.currentPlay > 0 || this.currentSegment > 0) { // not the first segment
			if(this.currentSegment > 0) {
				this.currentSegment--
			} else {
				this.currentPlay--
				this.currentSegment = this.plays[this.currentPlay].segments.length - 1
			}
		}
	}

	next() {		
		if(this.currentPlay < this.plays.length - 1) { // not on the last play
			if(this.plays[this.currentPlay].segments && this.plays[this.currentPlay].segments.length - 1 > this.currentSegment) { // more segments
				this.currentSegment++
			} else { // end of the play's segments, next play
				this.currentSegment = 0
				this.currentPlay++
			}
		}
	}
}