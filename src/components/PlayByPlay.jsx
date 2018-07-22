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
				<div className="plays" style={{width:500,height:300,overflowY:'auto'}}>
					{ store.plays.map((play, i) => (
						<Play idx={i} data={play} store={store} />
					)) }
				</div>
				<div className="controls">
					<a href="#" onClick={this.prev}>Prev</a>
					<a href="#" onClick={this.next}>Next</a>
				</div>
			</div>
		)
	}
}

export default PlayByPlay