import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class PlaySegment extends Component {

	componentDidMount() {
		// yeah it did		
	}

	render() {
		const styles = {fontSize:'40%', color:'#666'}
		const { store, data, segmentId, playId } = this.props
		let className = 'segment'
		let key = `seg-${this.props.playId}-${this.props.segmentId}`
		
		if(store.currentPlay === playId && store.currentSegment === segmentId) {
			// Highlight the current play segment
			styles.backgroundColor = '#ddddee'
			className = 'segment active-segment'
		}
		return(
			<div className={className} key={key}>
				<p>
					{playId} : {segmentId} > {data.text}
				</p>
			</div>
		)
	}

}

export default PlaySegment
