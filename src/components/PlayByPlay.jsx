import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class PlayByPlay extends React.Component {

	@observable playByPlay = []
	@observable gameTitle = 'RHL Game 1-29'

	componentDidMount() {
		// yes, yes it did
	}

	render() {
		const store = this.props.store
		return(
			<div>
				<p>Hey, this is gonna be a game replay, it's going to be really rad.</p>
				<p>{store.playCount} Plays</p>
				<p>:{store.thisPlay}</p>
				{ store.plays.map((play) => (
					<p>$> {play}</p>
				))}
			</div>
		)
	}
}

export default PlayByPlay