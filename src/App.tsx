import React from 'react';
import {Matrix} from "./matrix";
import "./App.scss";

interface Point { x: number, y: number }
interface Dimensions { width: number, height: number }

interface Transformation {
  multiplicand: Matrix
  additive: Matrix
  chance: number
}

enum Display { SVG, Raster }

interface State {
  transformations: Transformation[]
  offset: {scale: Dimensions, offset: Point}
  points: Point[]
  currentPoint: Matrix
  startingPoint: Point
  display: Display
}

export default class extends React.Component<{}, State> {
  state: State = {
    transformations: [],
    offset: {
      scale:  {width: 1, height: 1},
      offset: {x: 0, y: 0}
    },
    points: [],
    currentPoint: new Matrix([[0], [0]]),
    startingPoint: {x: 0, y: 0},
    display: Display.SVG,
  };


  render() {
    const {display, offset, points, transformations} = this.state;
    return <div className="container">
      <div className="draw-board">
        {(() => {
          switch (display) {
            case Display.Raster:
              return <canvas/>;
            case Display.SVG:
              const {scale: {width: sx, height: sy}, offset: {x: ox, y: oy}} = offset;
              return <svg>
                <g transform={`scale(${sx} ${sy}) translate(${ox} ${oy})`}>
                  {points.map((v, k) => <circle cx={v.x} cy={v.y} r={1} key={k}/>)}
                </g>
              </svg>;
          }
        })()}
      </div>
      <div className="separator"/>
      <div className="options-panel">
        <div className="transformations">
          {transformations.map((v, k) => <TransformationComp key={k} data={v}/>)}
          <div className="add-new">Add new transformation</div>
        </div>
        <div className="separator"/>
        <div className="options">
          {document.location.hash}<br/>
        </div>
      </div>
    </div>
  }
}

interface TransformationProps {
  data: Transformation
}
class TransformationComp extends React.Component<TransformationProps> {
  render() {
    return <div/>;
  }
}