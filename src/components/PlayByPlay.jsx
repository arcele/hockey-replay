import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Play from './Play';
import OnIce from './OnIce'

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

	prev = () => {
		// previous play
		this.props.store.prev()
	}

	next = () => {
		// next play
		this.props.store.next()
		this.scrollToActive()
	}

	play = () => {
		// start stepping through plays
		let playback = () => {
			this.props.store.playback = setTimeout(() => {
				this.next()
				this.play()
			}, 500)
		}
		playback()
	}

	pause = () => {
		clearTimeout(this.props.store.playback)
		// freeze scrolling
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
					<div className="ice">
						<div className={`zone awayZone ${ store.game.puckLocation === 'away' && 'active'}`}></div>
						<div className={`zone neutralZone ${ store.game.puckLocation === 'neutral' && 'active'}`}></div>
						<div className={`zone homeZone ${ store.game.puckLocation === 'home' && 'active'}`}></div>
					</div>
					<OnIce store={store} team={store.awayTeam} players={store.onIce.homeTeam} goalie={store.game.goalies.homeTeam} />
				</div>
			</div>
		)
	}
}

export default PlayByPlay