import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

@observer
class PlaySegment extends Component {

	componentDidMount() {
		// yeah it did		
	}

	jumpTo(e, store) {
		while(store.currentPlay < e.currentTarget.getAttribute('play') || store.currentSegment < e.currentTarget.getAttribute('segment')) {
			store.next()
		}
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
			<div className={className} key={key} play={this.props.playId} segment={this.props.segmentId} onClick={ (e) => this.jumpTo(e, this.props.store) }>
				<div className="playId">{playId}</div>
				<div className="segmentId">{segmentId}</div>
				<div className="text">{data.text}</div>
			</div>
		)
	}

}

export default PlaySegment
