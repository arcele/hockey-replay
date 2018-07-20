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
				<p>{store.title}</p>
				<p>{store.date}</p>
				<div className="plays" style={{width:500,height:300,overflowY:'auto'}}>
					{ store.plays.map((play, i) => (
						<div key={`play-${i}`}>
							<p style={{fontSize:'45%',}}>{play.long}</p>
							<p style={{fontSize:'33%',color:'#ddd'}}>{play.short}</p>
							<hr />
						</div>
					))}
				</div>
			</div>
		)
	}
}

export default PlayByPlay