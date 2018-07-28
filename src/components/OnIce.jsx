import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class OnIce extends React.Component {

	render() {
		const { team, players, store } = this.props
		let className = 'player'
		return(
			<div className="onIce">
				<p><b>{team}</b> on ice:</p>
				{players && players.map((p, i) => {
					if(store.inPossession === p) {
						className = 'player possession'
					}
					return(<div className={className} key={`player-onice-away-${i}`}>{p}</div>)
				})}
			</div>
		)
	}
}

export default OnIce