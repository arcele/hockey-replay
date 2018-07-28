import React, { Component } from "react";
import { observable, action } from "mobx";
import { observer } from "mobx-react";

class Player extends React.Component {

	render() {
		return(<div className="player">{ this.props.name }</div>)
	}
}

export default Player