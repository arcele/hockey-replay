import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class OnIce extends React.Component {

	render() {
		const { team, goalie, store } = this.props
		let className = 'player'
		const players = this.props.players.slice(0)  // gonna mutate the f out of this
		players.unshift(goalie)
		return(
			<div className="onIce">
				<p><b>{team}</b> on ice:</p>
				{players && players.map((p, i) => {
					return(<div className={store.inPossession === p ? 'player possession' : ' player'}
							key={`player-onice-away-${i}`}>{p}</div>)
				})}
			</div>
		)
	}
}

export default OnIce