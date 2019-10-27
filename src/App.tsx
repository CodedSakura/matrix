import React from 'react';
import {Matrix} from "./matrix";
import "./App.scss";

interface Point { x: number, y: number }
interface Dimensions { width: number, height: number }

interface Transformation {
  multiplicand: Matrix
  additive: Matrix
  chance: number
  name?: string
}

enum Display { SVG, Raster }

interface State {
  transformations: Transformation[]
  offset: {scale: Dimensions, offset: Point}
  points: Point[]
  currentPoint: Matrix
  startingPoint: Point
  display: Display
  maxChance: number
}

export default class extends React.Component<{}, State> {
  state: State = {
    transformations: [{multiplicand: new Matrix([[1, 2], [3, 4]]), additive: new Matrix([[1], [2]]), chance: 100}],
    offset: {
      scale:  {width: 1, height: 1},
      offset: {x: 0, y: 0}
    },
    points: [],
    currentPoint: new Matrix([[0], [0]]),
    startingPoint: {x: 0, y: 0},
    display: Display.SVG,
    maxChance: 100
  };

  changeTransformations = (k: number) => (t: Transformation) => this.setState(s => {s.transformations[k] = t; return s});

  render() {
    const {display, offset, points, transformations, maxChance} = this.state;
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
          {transformations.map((v, k) => <TransformationComp key={k} data={v} id={k} max={maxChance} onChange={this.changeTransformations(k)}/>)}
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
  id: number
  max: number
  onChange(v: Transformation): any
}
class TransformationComp extends React.Component<TransformationProps> {
  changeChance = ({target: {value: v}}: {target: HTMLInputElement}) => {
    const {data, onChange} = this.props;
    data.chance = parseFloat(v);
    onChange(data);
  };
  changeMult = (x: number, y: number) => ({target: {value: v}}: {target: HTMLInputElement}) => {
    const {data, onChange} = this.props;
    data.multiplicand.data[x][y] = parseFloat(v);
    onChange(data);
  };
  changeAdd = (x: number) => ({target: {value: v}}: {target: HTMLInputElement}) => {
    const {data, onChange} = this.props;
    data.additive.data[x][0] = parseFloat(v);
    onChange(data);
  };
  changeName = ({target: {value: v}}: {target: HTMLInputElement}) => {
    const {data, onChange} = this.props;
    data.name = v;
    onChange(data);
  };

  render() {
    const {data, id, max} = this.props;
    return <div>
      <div>
        <div>
          <input type="text" value={data.name || `Transformation #${id+1}`} onChange={this.changeName}/>
        </div>
        <div>
          <input type="number" value={data.chance} onChange={this.changeChance}/> / {max}
        </div>
      </div>
      <div className="matrix">
        {data.multiplicand.data.map((v, x) => <div key={x}>
          {v.map((v, y) => <input type="number" key={y} value={v} onChange={this.changeMult(x, y)}/>)}
        </div>)}
      </div>
      <div className="matrix"><div>x</div><div>y</div></div>
      <div>+</div>
      <div className="matrix">
        {data.additive.data.map((v, x) => <div key={x}><input type="number" value={v[0]} onChange={this.changeAdd(x)}/></div>)}
      </div>
    </div>;
  }
}

class ScrollableNumberInput extends React.Component<{[x: string]: any}> {
  render() {
    return <input {...this.props}/>
  }
}