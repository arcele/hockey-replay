import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

class Player extends React.Component {

	render() {
		return(<div className="player" team={this.props.team} position={this.props.position} title={this.props.name}>{ this.props.position }</div>)
	}
}

export default Player