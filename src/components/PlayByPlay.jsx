import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Play from './Play';
import OnIce from './OnIce'
import Player from './Player'

@observer
class PlayByPlay extends React.Component {

	@observable playByPlay = []
	@observable gameTitle = 'RHL Game 1-29'

	componentDidMount() {
		// load initial play
		this.props.store.processSegment(this.props.store.currentSegmentObj)
	}

	scrollToActive = () => {
		// this is currently lame and just jumps ahead 25 pixels
		// need to determine where the scroll top is of the now
		// 'active' element and scroll to it instead, this works for now though
		let i = 0
		let smoothScroll = () => {
			i++;
			setTimeout(() => {
				this.refs.plays.scrollTop += 1
				if(i < 20) { // scroll top doesn't matches our active el
					smoothScroll()
				}
			}), 25
		}
		smoothScroll()
	}

	prev = (e) => {
		// previous play
		if(e) e.preventDefault()
		this.props.store.prev()
	}

	next = (e) => {
		// next play
		if(e) e.preventDefault()
		this.props.store.next()
		this.scrollToActive()
	}

	play = (e) => {
		// start stepping through plays
		if(e) e.preventDefault()
		let playback = (e) => {
			this.props.store.playback = setTimeout(() => {
				this.next()
				this.play()
			}, 1200)
		}
		playback(e)
	}

	pause = (e) => {
		e.preventDefault()
		clearTimeout(this.props.store.playback)
		// freeze scrolling
	}

	positionByIdx = (idx) => {
		// temporary function to get a player position by index in the onIce array
		// need to handle power play here, if there's fewer than 5 guys, then 
		// we need the first two to be PK1, PK2, last 2 can be D, that'd work aight
		switch(idx) {
			case 0:
				return 'C'
			case 1:
				return 'LW'
			case 2:
				return 'RW'
			case 3:
				return 'LD'
			case 4:
				return 'RD'
			default:
				return 'G'
		}
	}

	isPossessionPlayer = (name) => {
		return this.props.store.inPossession === name ? 'yes' : 'nah'
	}

	render() {
		const store = this.props.store
		let className = 'player'
		return(
			<div>
				<h1>{store.title}</h1>
				<h2>{store.date}</h2>
				<div className="playByPlay">
					<div ref="plays" className="plays">
						{ store.plays.map((play, i) => (
							<Play key={`play-${i}`} idx={i} data={play} store={store} />
						)) }
					</div>
			
					<div className="controls">
						<div className="summary">Play: { store.currentPlay}, Segment: {store.currentSegment }</div>
						<a className="prev" href="#" onClick={this.prev}>Prev</a>
						<a className="pause" href="#" onClick={this.pause}>Pause</a>
						<a className="play" href="#" onClick={this.play}>Play</a>
						<a className="next" href="#" onClick={this.next}>Next</a>
					</div>
				</div>
				<div className="currentSegment">
					<div className="lastSegmentText">
						<p><b>Last Play:</b> {store.plays[store.currentPlay].segments && store.plays[store.currentPlay].segments[store.currentSegment].text}</p>
					</div>
					<OnIce store={store} team={store.awayTeam} players={store.onIce.awayTeam} goalie={store.game.goalies.awayTeam} />
					<div className="ice" zone={store.game.puckLocation} faceoff={store.game.isFaceOff}>
						<div className={`zone awayZone ${ store.game.puckLocation === 'away' && 'active'}`}></div>
						<div className={`zone neutralZone ${ store.game.puckLocation === 'neutral' && 'active'}`}></div>
						<div className={`zone homeZone ${ store.game.puckLocation === 'home' && 'active'}`}></div>
						<Player position='G' number={66} team="awayTeam" possession={this.isPossessionPlayer(store.game.goalies.awayTeam)} name={store.game.goalies.awayTeam} />
						<Player position='G' number={55} team="homeTeam" possession={this.isPossessionPlayer(store.game.goalies.homeTeam)} name={store.game.goalies.homeTeam} />
						{store.onIce.awayTeam && store.onIce.awayTeam.map((p, i) => {
							return(<Player position={this.positionByIdx(i)} possession={this.isPossessionPlayer(p)} key={10 + i} name={p} team="awayTeam" />)
						})}
						{store.onIce.homeTeam && store.onIce.homeTeam.map((p, i) => {
							return(<Player position={this.positionByIdx(i)} possession={this.isPossessionPlayer(p)} key={20 + i} name={p} team="homeTeam" />)
						})}
					</div>
					<OnIce store={store} team={store.homeTeam} players={store.onIce.homeTeam} goalie={store.game.goalies.homeTeam} />
				</div>
			</div>
		)
	}
}

export default PlayByPlay