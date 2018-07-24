import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import PlaySegment from './PlaySegment'

@observer
class Play extends React.Component {


	render() {	
		const play = this.props.data
		const store = this.props.store

		return (
			<div className="play" key={`play-${this.props.idx}`}>
				{play.segments && play.segments.map((seg, i) => {
					return(
						<PlaySegment key={`seg-${this.props.idx}-${i}`} store={store} data={seg} segmentId={i} playId={this.props.idx} />
					)
				})}
				<p>{play.short}</p>
			</div>
		)
	}
}

export default Play
