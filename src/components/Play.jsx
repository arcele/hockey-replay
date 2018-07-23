import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import PlaySegment from './PlaySegment'

@observer
class Play extends React.Component {


	render() {
		let styles = { fontSize: "66%"}		
		const play = this.props.data
		const store = this.props.store

		return (
			<div styles={styles} key={`play-${this.props.idx}`} style={styles}>
				{play.segments && play.segments.map((seg, i) => {
					return(
						<PlaySegment key={`seg-${this.props.idx}-${i}`} store={store} data={seg} segmentId={i} playId={this.props.idx} />
					)
				})}
				<p style={{fontSize:'66%'}}>{play.short}</p>
				<hr />
			</div>
		)
	}
}

export default Play
