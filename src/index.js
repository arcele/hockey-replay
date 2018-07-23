import React from "react";
import { render } from "react-dom";
import DevTools from "mobx-react-devtools";

import PlayByPlay from './components/PlayByPlay'
import PlayByPlayModel from './models/PlayByPlayModel'

const store = new PlayByPlayModel();

render(
  <div>
    <DevTools />
    <PlayByPlay store={store} />
  </div>,
  document.getElementById("root")
);

window.store = store;