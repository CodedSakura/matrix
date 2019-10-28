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

const matrixToPoint = (m: Matrix): Point => ({x: m.data[0][0], y: m.data[1][0]});

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
  // drawCont: HTMLDivElement | null = null;

  changeTransformations = (k: number) => (t: Transformation) => this.setState(s => {s.transformations[k] = t; return s});

  reset = () => {
    const {y, x} = this.state.startingPoint;
    const current = new Matrix([[x], [y]]);
    this.setState({points: [], currentPoint: current});
  };
  generatePoints = (count: number) => {
    let {points, currentPoint, transformations, maxChance} = this.state;
    while (count--) {
      let r = Math.random() * maxChance;
      for (const t of transformations) {
        if (r - t.chance <= 0) {
          // console.log(t.multiplicand, currentPoint, t.additive);
          currentPoint = t.multiplicand.mult(currentPoint).add(t.additive);
          // console.log(currentPoint);
          points.push(matrixToPoint(currentPoint));
        } else r -= t.chance;
      }
    }
    this.setState({points: points, currentPoint: currentPoint});
  };

  newTransformation = () => {
    this.setState(s => ({transformations: [...s.transformations, {multiplicand: new Matrix([[0,0],[0,0]]), additive: new Matrix([[0,0],[0,0]]), chance: 0}]}))
  };

  render() {
    const {display, offset, points, transformations, maxChance} = this.state;
    return <div className="container">
      <div className="draw-board">
        {(() => {
          switch (display) {
            case Display.Raster: {
              return <canvas/>;
            }
            case Display.SVG: {
              const {scale: {width: sx, height: sy}, offset: {x: ox, y: oy}} = offset;
              return <svg>
                <g transform={`scale(${sx} ${sy}) translate(${ox} ${oy})`}>
                  {points.map((v, k) => <circle cx={v.x} cy={v.y} r={1} key={k}/>)}
                </g>
              </svg>;
            }
          }
        })()}
      </div>
      <div className="separator"/>
      <div className="options-panel">
        <div className="transformations">
          {transformations.map((v, k) => <TransformationComp key={k} data={v} id={k} max={maxChance} onChange={this.changeTransformations(k)}/>)}
          <div className="add-new" onClick={this.newTransformation}>Add new transformation</div>
        </div>
        <div className="separator"/>
        <div className="options">
          {document.location.hash}<br/>
          <button onClick={() => this.generatePoints(3)}>Generate 3 points</button>
          <button onClick={this.reset}>clear</button>
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

// class ScrollableNumberInput extends React.Component<{[x: string]: any}> {
//   render() {
//     return <input {...this.props}/>
//   }
// }