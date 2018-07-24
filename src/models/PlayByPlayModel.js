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
		lineChanges: {
			awayTeam: [],
			homeTeam: [],
		},
		possessionPlayer: [],
	} // maybe only certain parts of this object should be observable?
	fullPlaysString = ''
	@observable currentPlay = 0		// should be Id or Idx
	@observable currentSegment = 0	// shoudl be Id or Idx
	@observable title = 'Hockey Replay'
	@observable date = ''

	getLineChanges(text) {
		let ret = {}
		this.teams.map((team) => {
			if(text.search(` on ice for ${team}`) > -1) {
				ret = {
					team,
					text
				}
			}
		})
		return ret
	}

	getPossessionPlayer(text) {
		let player = undefined
		// try to determine the player with the puck
		if(text.match(/(.+) wins face-off/i)) {	// winner of a faceoff
			player = text.match(/(.+) wins face-off/i)[1].trim()
		}

		if(text.match(/Pass to (.+) in/)) { // pass to player 'in' a new zone
			player = text.match(/Pass to (.+) in/)[1].trim()
		} else if(text.match(/Pass to (.+)$/)) { // pass to player
			player = text.match(/Pass to (.+)$/)[1].trim()
		}

		return player
	}

	// Takes a play string and returns an object with everything we need to store it
	newSegment(text) {
		// eventually we may want this to be an instance of a class, so we can have all
		// of the segment functionality on the segment?  For now, this is pretty rad
		// needed still: scoring plays, clock changes, period changes
		let newSeg = {
			text,
			lineChanges: this.getLineChanges(text),
			hasPuck: this.getPossessionPlayer(text),
		}
		return newSeg
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
			let long, changes, longIdx, segments, hasPuck
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
			//	hasPuck = this.getPossessionPlayer(longSearch)
			//	changes = this.getLineChanges({ short, long})
			}
			// what does this even do?
			return { short, segments, long, changes, hasPuck, }
		})
	}

	// takes the full line text of a play segment for a line change
	// and just returns an array of all the players within
	formatOnIce(val) {
		if(!val) {
			return undefined
		}
		return val.text.split(' - ')[1].split(' are on ice')[0].split(',').map((untrim) => (untrim.trim()))
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

	// get the most recent possession player from the possession stack
	@computed get inPossession() {
		return this.game.possessionPlayer.length > 0 ? this.game.possessionPlayer[0] : undefined
	}

	// return an object of all players on ice based upon the most recent line changes
	@computed get onIce() {
		if(!this.game.lineChanges || (!this.game.lineChanges.awayTeam && !this.game.lineChanges.homeTeam)) {
			return { awayTeam: [], homeTeam: []}
		}
		// this is messy, we should probably store the line changes more cleanly, but
		// this gives us all the players on the ice
		return {
			awayTeam: (this.formatOnIce(this.game.lineChanges.awayTeam.find((chg) => {
						return(chg.text.search('Forward Lineup #') > -1)
					})) || []).concat(this.formatOnIce(this.game.lineChanges.awayTeam.find((chg) => {
						return(chg.text.search('Defense Lineup #') > -1)
					}))),
			homeTeam: (this.formatOnIce(this.game.lineChanges.homeTeam.find((chg) => {
						return(chg.text.search('Forward Lineup #') > -1)
					})) || []).concat(this.formatOnIce(this.game.lineChanges.homeTeam.find((chg) => {
						return(chg.text.search('Defense Lineup #') > -1)
					})))
		}
	}

	@computed get currentSegmentObj() {
		return this.plays[this.currentPlay].segments ? this.plays[this.currentPlay].segments[this.currentSegment] : []
	}

	@action
	// apply a segment to game object
	processSegment(obj) {
		if(obj.lineChanges) {
			if(obj.lineChanges.team === this.homeTeam) {
				this.game.lineChanges.homeTeam.unshift(obj)
			} else if(obj.lineChanges.team === this.awayTeam) {
				this.game.lineChanges.awayTeam.unshift(obj)
			}
		}
		if(obj.hasPuck) {
			console.log('has puck changed', obj.hasPuck)
			this.game.possessionPlayer.unshift(obj.hasPuck)
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
//		console.log('< new segment:', this.currentSegmentObj)
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
//		console.log('> new segment:', this.currentSegmentObj)
		this.processSegment(this.currentSegmentObj)
	}
}