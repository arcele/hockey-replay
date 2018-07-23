import { observable, action, computed } from "mobx"
import gameData from '../../data/RHL1-29.js'

export default class PlayByPlayModel {
	@observable plays = []
	@observable game = {
		clock: {
			mins: 20,
			secs: 0
		},
		period : 1,
		onIce: {
			homeTeam: [],
			awayTeam: []
		}
	} // maybe only certain parts of this object should be observable?
	fullPlaysString = ''
	@observable currentPlay = 0		// should be Id or Idx
	@observable currentSegment = 0	// shoudl be Id or Idx
	@observable title = 'Hockey Replay'
	@observable date = ''

	getLineChanges(text) {
		let ret = {}
		let str = ' - ([^\\.])+ on ice for '
		let re = new RegExp(str, "g")
		let matches
		this.teams.map((team) => {
			str = ' - ([^\\.])+ on ice for ' + team
			re = new RegExp(str, "g")
			// we should now loop through the segments for line changes now
			matches = text.match(re)
			if(matches && matches.length) {
				ret[team] = matches
				ret.text = text
			}
		})
		return ret
	}

	// Takes a play string and returns an object with everything we need to store it
	newSegment(text) {
		// eventually we may want this to be an instance of a class, so we can have all
		// of the segment functionality on the segment?  For now, this is pretty rad
		// needed still: scoring plays, clock changes, period changes
		return {
			text,
			lineChanges: this.getLineChanges(text)
		}
	}

	// takes a STHS simulation output file and creates the relevant objects we need to generate a replay
	digestData(data) {
		let isPlays, isFullPlays = false
		this.fullPlays = []
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
				// currently saving the segments as just the inital strings,
				// we want these segments to be objects, so that we can decorate
				// with meta data (line change, score change, etc).
				// do we want those to be react components?  that are isolated from the render,
				// which requires state specific data (to know which play segment is active)
				let segmentTexts = long.split('.') // run a function on these segments to populate line changes on the segments instead of on the plays
				segmentTexts = segmentTexts.slice(0, segmentTexts.length-1)
				segments = segmentTexts.map((text) => {
					// we can add whatever we want on the segment object here
					return this.newSegment(text)
				})
				this.fullPlaysString = this.fullPlaysString.slice(longIdx)
			//	changes = this.getLineChanges({ short, long})
			}
			return { short, segments, long, changes, }
		})
	}

	constructor() {
		this.digestData(gameData) // eventually grab this asych
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

	@computed get currentSegmentObj() {
		return this.plays[this.currentPlay].segments[this.currentSegment]
	}

	@action
	// apply a segment to game object
	processSegment(obj) {
		if(obj.lineChanges[this.awayTeam]) {
			console.log("away line change!", obj.lineChanges[this.awayTeam])
			this.game.onIce.awayTeam = obj.lineChanges[this.awayTeam]
		} else if(obj.lineChanges[this.homeTeam]) {
			console.log("home line change!", obj.lineChanges[this.homeTeam])
			this.game.onIce.homeTeam = obj.lineChanges[this.homeTeam]
		}
	}


	prev() {
		// step back into the previous play segment
		if(this.currentPlay > 0 || this.currentSegment > 0) { // not the first segment
			if(this.currentSegment > 0) {
				this.currentSegment--
			} else {
				this.currentPlay--
				this.currentSegment = this.plays[this.currentPlay].segments.length - 1
			}
		}
		// need to have a reverse process play here.
		console.log('< new segment:', this.currentSegmentObj)
	}

	next() {
		// step forward to the next play segment
		if(this.currentPlay < this.plays.length - 1) { // not on the last play
			if(this.plays[this.currentPlay].segments && this.plays[this.currentPlay].segments.length - 1 > this.currentSegment) { // more segments
				this.currentSegment++
			} else { // end of the play's segments, next play
				this.currentSegment = 0
				this.currentPlay++
			}
		}
		console.log('> new segment:', this.currentSegmentObj)
		this.processSegment(this.currentSegmentObj)
	}
}