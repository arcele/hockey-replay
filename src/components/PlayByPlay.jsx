import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Play from './Play';

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
				this.refs.playbyplay.scrollTop += 1
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
			}, 50)
		}
		playback()
	}

	pause = () => {
		clearTimeout(this.props.store.playback)
		// freeze scrolling
	}

	render() {
		const store = this.props.store
		return(
			<div>
				<p>{store.title}</p>
				<p>{store.date}</p>
				<p>Currently on play {store.currentPlay} and segment {store.currentSegment}</p>
				<div ref="playbyplay" className="plays" style={{width:500,height:300,overflowY:'auto'}}>
					{ store.plays.map((play, i) => (
						<Play key={`play-${i}`} idx={i} data={play} store={store} />
					)) }
				</div>
				<div className="controls" style={{width:500}}>
					<a style={{float:"left"}} href="#" onClick={this.prev}>Prev</a>
					<a style={{float:"left", marginLeft:'20'}} href="#" onClick={this.pause}>Pause</a>
					<a style={{float:"right", marginLeft:'20'}} href="#" onClick={this.play}>Play</a>
					<a style={{float:"right"}} href="#" onClick={this.next}>Next</a>
				</div>
				<div ref="currentsegment" className="currentSegment" style={{width:500, marginTop: '25'}}>
					<p>{store.awayTeam} on ice:</p>
					<p style={{fontSize:'40%'}}>{store.onIce.awayTeam.F}</p>
					<p style={{fontSize:'40%'}}>{store.onIce.awayTeam.D}</p>
					<p>{store.homeTeam} on ice:</p> 						
					<p style={{fontSize:'40%'}}>{store.onIce.homeTeam.F}</p>
					<p style={{fontSize:'40%'}}>{store.onIce.homeTeam.D}</p>
					<p>{store.plays[store.currentPlay].segments && store.plays[store.currentPlay].segments[store.currentSegment].text}</p>

				</div>
			</div>
		)
	}
}

export default PlayByPlay