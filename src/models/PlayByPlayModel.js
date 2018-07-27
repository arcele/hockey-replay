import { observable, action, computed } from "mobx"
import gameData from '../../data/RHL1-29.js'

export default class PlayByPlayModel {
	@observable plays = []			// all plays for the game
	@observable currentPlay = 0		// index of the currentPlay in plays
	@observable currentSegment = 0	// index of the currentSegment within the currentPlay
	@observable game = {			// current game state at currentPlay/currentSegment
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
		penalizedPlayers: [],
		puckLocation: -1
	} // maybe only certain parts of this object should be observable?
	fullPlaysString = ''
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

	// Determine which player has possession of the puck based upon the play text undefined
	// is returned if it can not be determined, -1 is returned if the puck is free or out of play
	getPossessionPlayer(text) {
		let player = undefined
		// Array of regexes that we'll attempt to match players from via the play text
		let matches = [
			/(.+) wins face-off/i,		// face off win by player
			/Pass to (.+) in.+/,		// Pass to player into a new zone
			/Pass to (.+)$/,			// Pass to player within the zone
			/Deflect By (.+)$/,			// Deflection by
			/.+ intercepted by (.+)$/,	// Pass interception by player
			/uck .etr..ved by (.+) for .+$/,	// puck picked up by player (retrieved||retreived)
			/uck .etr..ved by (.+)$/,	// Puck picked up by player (retrieved||retreived)
			/Stopped by (.+) with.+$/	// Stopped by player (goalie)
		]
		// using find so that we only match the first result, i know i could do something better here
		matches.find((m) => {
			if(text.match(m)) {
				player = text.match(m)[1].trim()
				return true
			}
		})
		// nobodies
		if(	text.match(/Shot Misses the Net/) ||
			text.match(/Puck is out of play/) ||
			text.match(/ loses puck/) ||
			text.match(/Puck is dumped in/)
			) { // Nobody
				player = -1
		}
		return player
	}

	getPenalizedPlayer(text) {
		let player = undefined
		if(text.match(/Penalty to (.+) for .+/)) {
			player = text.match(/Penalty to (.+) for .+/)[1]
		}
		return player
	}

	// Determine where on the ice the puck is based on the play text, return names are:
	// 'away||home||neutral||outofplay'
	getPuckLocation(text) {
		let zone = undefined
		if(text.match(/in neutral zone/)) {
			zone = 'neutral'
		} else if(text.search(this.homeTeam + ' zone') > -1) {
			zone = 'home'
		} else if(text.search(this.awayTeam + ' zone') > -1) {
			zone = 'away'
		} else if(text.search(/uck is out of play/) > -1) {
			zone = 'outofplay'
		}
		return zone
	}

	// Takes a play string and returns an object with everything we need to store it
	newSegment(text) {
		// eventually we may want this to be an instance of a class, so we can have all
		// of the segment functionality on the segment?  For now, this is pretty rad
		// needed still: scoring plays, clock changes, period changes
		let outText = text
		if(text.search('</h4') > -1) {
			outText = text.split('</h4>')[1]
		}
		let newSeg = {
			text: outText,
			lineChanges: this.getLineChanges(text),
			hasPuck: this.getPossessionPlayer(text),
			penalizedPlayer: this.getPenalizedPlayer(text),
			puckLocation: this.getPuckLocation(text)
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
			} else if(line.search(/STHSGame_PlayByPlayPeriod">2nd/g) > -1) {
				// just store the first period for now
				isPlays = false
			} else if(line.search(/"STHSGame_FullPlayByPlayPeriod">1st period/g) > -1) {
				isPlays = false
				isFullPlays = true
			} else if(line.search(/"STHSGame_FullPlayByPlayPeriod">2nd period/g) > -1) {
				// just store the 1st period for now
				isFullPlays = false
			}
			if(isFullPlays) {
				this.fullPlaysString += line
			}			
			if(isPlays) {
				return { short : line.split('<')[0] }				
			}
		}).filter((x) => { if(x && x.short != '') { return x } });

		// there is no 'end of period' play, this allows all play segments after the 
		// final 'play' to be attached to the correct period
		this.plays.push(({short: ' - End of Period.'}))

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
			console.log('and we still have :', this.fullPlaysString)
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
		if(obj.penalizedPlayer) {
			console.log('player penalized', obj.penalizedPlayer)
			this.game.penalizedPlayers.unshift(obj.hasPuck)
		}
		if(obj.puckLocation) {
			console.log('puck now in zone:', obj.puckLocation)
			this.game.puckLocation = obj.puckLocation
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
		// reverse process play shoudl actually process every single segment up to this point to ensure that it's accurate
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