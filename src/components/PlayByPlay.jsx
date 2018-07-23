import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Play from './Play';

@observer
class PlayByPlay extends React.Component {

	@observable playByPlay = []
	@observable gameTitle = 'RHL Game 1-29'

	componentDidMount() {
		// yes, yes it did
	}

	prev = () => {
		// previous play
		this.props.store.prev()
	}

	next = () => {
		// next play
		this.props.store.next()
	}

	render() {
		const store = this.props.store
		return(
			<div>
				<p>{store.title}</p>
				<p>{store.date}</p>
				<p>Currently on play {store.currentPlay} and segment {store.currentSegment}</p>
				<div className="plays" style={{width:500,height:300,overflowY:'auto'}}>
					{ store.plays.map((play, i) => (
						<Play idx={i} data={play} store={store} />
					)) }
				</div>
				<div className="controls" style={{width:500}}>
					<a style={{float:"left"}} href="#" onClick={this.prev}>Prev</a>

					<a style={{float:"right"}} href="#" onClick={this.next}>Next</a>
				</div>
			</div>
		)
	}
}

export default PlayByPlay