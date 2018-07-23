import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class Play extends React.Component {


	render() {
		let styles = { fontSize: "66%"}		
		const play = this.props.data
		const store = this.props.store

		return (
			<div styles={styles} key={`play-${this.props.idx}`} style={styles}>
				{play.segments && play.segments.map((seg, i) => {
					const styles = {fontSize:'40%', color:'#666'}
					if(store.currentPlay === this.props.idx && store.currentSegment === i) {
						// Highlight the current play segment
						styles.backgroundColor = '#ddddee'
					}
					return(
						<p style={styles} key={`seg-${this.props.idx}-${i}`}>{this.props.idx} - {i} : {seg}</p>
					)
				})}
				<p style={{fontSize:'66%'}}>{play.short}</p>
				<hr />
			</div>
		)
	}
}

export default Play
