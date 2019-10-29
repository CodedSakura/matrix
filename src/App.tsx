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

interface State {
  transformations: Transformation[]
  offset: {scale: Dimensions, offset: Point}
  points: Point[]
  currentPoint: Matrix
  startingPoint: Point
  maxChance: number
  lockSize: boolean
}

const matrixToPoint = (m: Matrix): Point => ({x: m.data[0][0], y: m.data[1][0]});

export default class extends React.Component<{}, State> {
  state: State = {
    transformations: [
      {multiplicand: new Matrix([[.5, 0], [0, .5]]), additive: new Matrix([[0], [0]]), chance: 100},
      {multiplicand: new Matrix([[.5, 0], [0, .5]]), additive: new Matrix([[50], [0]]), chance: 100},
      {multiplicand: new Matrix([[.5, 0], [0, .5]]), additive: new Matrix([[0], [50]]), chance: 100},
    ],
    offset: {
      scale:  {width: 1, height: 1},
      offset: {x: 0, y: 0}
    },
    points: [],
    currentPoint: new Matrix([[10], [10]]),
    startingPoint: {x: 10, y: 10},
    maxChance: 300,
    lockSize: true
  };
  drawCont: HTMLDivElement | undefined;
  startPoint: Point|undefined;

  changeTransformations = (k: number) => (t: Transformation) => this.setState(s => {s.transformations[k] = t; return s});
  changeStartingPoint = (n: "x"|"y") => ({target: {value}}: {target: HTMLInputElement}) => this.setState(s => ({startingPoint: {...s.startingPoint, [n]: value}}));

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
          break;
        } else r -= t.chance;
      }
    }
    this.setState({points: points, currentPoint: currentPoint});
  };

  newTransformation = () => {
    this.setState(s => ({transformations: [...s.transformations, {multiplicand: new Matrix([[0,0],[0,0]]), additive: new Matrix([[0,0],[0,0]]), chance: 0}]}))
  };

  setupDrawCont = (r: HTMLDivElement) => {
    if (!this.drawCont && r) {
      r.addEventListener("wheel", this.drawContEvent);
      r.addEventListener("mousedown", this.drawContEvent);
    }
    this.drawCont = r;
  };
  drawContEvent = (e: MouseEvent|WheelEvent) => {
    if (!this.drawCont) return;
    switch (e.type) {
      case "mousedown":
        if (e.button) return;
        this.drawCont.addEventListener("mousemove", this.drawContEvent);
        this.drawCont.addEventListener("mouseup", this.drawContEvent);
        this.startPoint = {x: e.clientX, y: e.clientY};
        break;
      case "mouseup":
        this.drawCont.removeEventListener("mousemove", this.drawContEvent);
        this.drawCont.removeEventListener("mouseup", this.drawContEvent);
        break;
      case "mousemove": {
        if (!this.startPoint) {
          this.startPoint = {x: e.clientX, y: e.clientY};
           return;
        }
        const {offset, scale} = this.state.offset;
        let currentPoint = {x: e.clientX, y: e.clientY};
        offset.x -= (this.startPoint.x - currentPoint.x) / scale.width;
        offset.y -= (this.startPoint.y - currentPoint.y) / scale.height;
        this.setState(s => ({offset: {...s.offset, offset: offset}}));
        this.startPoint = {x: e.clientX, y: e.clientY};
        break;
      }
      case "wheel": {
        const {offset, scale} = this.state.offset;
        const scaleNum = 1.15;
        scale.height *= (Math.sign((e as WheelEvent).deltaY) > 0 ? 1/scaleNum : scaleNum);
        scale.width  *= (Math.sign((e as WheelEvent).deltaY) > 0 ? 1/scaleNum : scaleNum);
        offset.x += scaleNum;
        offset.y += scaleNum;
        this.setState(s => ({offset: {...s.offset, scale: scale}}));
        break;
      }
    }
  };

  render() {
    const {offset, points, transformations, maxChance, startingPoint, lockSize} = this.state;
    return <div className="container">
      <div className="draw-board" ref={this.setupDrawCont}>
        {(() => {
          const {scale: {width: sx, height: sy}, offset: {x: ox, y: oy}} = offset;
          return <svg>
            <g transform={`scale(${sx} ${sy}) translate(${ox} ${oy})`}>
              <CircleList points={points} size={lockSize ? 1 : 1/offset.scale.height} length={points.length}/>
            </g>
          </svg>;
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
          {points.length} points generated<br/>
          <button onClick={() => this.generatePoints(3)}>Generate 3 points</button>
          <button onClick={() => this.generatePoints(1000)}>Generate 1000 points</button>
          <button onClick={() => this.generatePoints(20000)}>Generate 20 000 points</button>
          <button onClick={this.reset}>clear</button>
          <br/>
          <div className="mx-cont">
            <div>Starting point</div>
            <div className="matrix">
              <div><input type="number" value={startingPoint.x} onChange={this.changeStartingPoint("x")}/></div>
              <div><input type="number" value={startingPoint.y} onChange={this.changeStartingPoint("y")}/></div>
            </div>
          </div>
          <button onClick={() => this.setState(s => ({lockSize: !s.lockSize}))}>Scale dot size ({lockSize ? "off" : "on"})</button><br/>
          {document.location.hash}<br/>
        </div>
      </div>
    </div>
  }
}

class CircleList extends React.PureComponent<{points: Point[], size: number, length: number}> {
  render() {
    const {points, size} = this.props;
    return points.map((v, k) => <circle r={size} cx={v.x} cy={v.y} key={k}/>);
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
    return <div className="mx-cont">
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