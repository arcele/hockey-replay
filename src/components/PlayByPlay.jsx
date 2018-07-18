import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class PlayByPlay extends React.Component {

	@observable gameTitle = 'RHL Game 1-29'

	render() {
		return(
			<div>
				<p>Hey, this is gonna be a game replay, it's going to be really rad.</p>
			</div>
		)
	}
}

export default PlayByPlay