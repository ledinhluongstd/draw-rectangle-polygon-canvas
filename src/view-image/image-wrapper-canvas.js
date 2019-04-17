import React from 'react'
import PropTypes from 'prop-types'
import { Rnd } from "react-rnd";
import ReactDOM from 'react-dom';

import Canvas from './canvas'
// import Canvas from './canvas-fabricjs' // vẽ bằng thư viện fabricjs
//import Canvas from './canvas-polygon' // vẽ polygon ok
//import Canvas from './canvas-rectangle' // vẽ rectangle ok
//import Canvas from './canvas-polygon-reactangle' // vẽ polygon và rectangle ok

const constants_1 = require("./constants");
const style = {
  display: "flex",
  border: "solid 1px #ddd",
  background: "transparent",
  zIndex: 1000
};
class ImageWrapper extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      loading: false,
      onload: false,
      zoom: 0,
      offset: constants_1.OFFSET_DEFAULT,
      addNote: false,
      drawType: 'RECTANGLE',
      enabledCanvas: false,
      lineData: [],
      activeIndex: -1,
    };
    this.draggable = false;
    this.offsetRange = constants_1.OFFSET_DEFAULT;
    this.clientOffset = {
      x: undefined,
      y: undefined
    };
  }
  loadImage(src) {
    this.state.loading = true;
    this.setState(this.state);
    this.src = new Image();
    this.src.src = src;
    this.src.onload = () => {
      if (!this.src)
        return;
      this.state.loading = false;
      this.state.onload = true;

      this.setState(this.state);
      if (this.src.complete) {
        this.state.rnd_mask_width = this.image.width
        this.state.rnd_mask_height = this.image.height
        this.forceUpdate()
      }
    };
    this.src.onerror = () => {
      if (!this.src)
        return;
      this.state.loading = false;
      this.state.onload = false;
      this.setState(this.state);
    };
  }
  resetOffset() {
    this.state.offset = constants_1.OFFSET_DEFAULT;
    this.setState(this.state);
  }
  setOffsetRange() {
    const zoom = this.state.zoom;
    const dx = this.image.scrollWidth * (1 + zoom / 2) - this.imageOuter.clientWidth;
    const dy = this.image.scrollHeight * (1 + zoom / 2) - this.imageOuter.clientHeight;
    this.offsetRange = {
      x: Math.max(0, dx / 2),
      y: Math.max(0, dy / 2)
    };
  }
  zoomIn() {
    if (!this.state.onload)
      return;
    this.state.zoom = Math.min(this.state.zoom + 1, constants_1.ZOOM_LEVEL.MAX);
    this.setState(this.state);
    this.setOffsetRange();
  }
  zoomOut() {
    if (!this.state.onload)
      return;
    this.state.zoom = Math.max(0, this.state.zoom - 1);
    this.setState(this.state);
    this.resetOffset();
    this.setOffsetRange();
  }
  onMoveStart(e) {
    if (this.state.enabledCanvas) return
    if (this.state.activeIndex !== -1) return
    if (!this.offsetRange.x && !this.offsetRange.y) {
      return;
    }
    this.clientOffset = {
      x: e.clientX,
      y: e.clientY
    };
    this.draggable = true;
  }
  onMove(e) {
    if (this.state.enabledCanvas) return
    if (this.state.activeIndex !== -1) return

    if (!e.clientX && !e.clientY || !this.draggable) {
      return;
    }
    const offset = {
      x: e.clientX - this.clientOffset.x,
      y: e.clientY - this.clientOffset.y,
    };
    this.clientOffset = {
      x: e.clientX,
      y: e.clientY
    };
    this.state.offset = {
      x: this.state.offset.x + offset.x,
      y: this.state.offset.y + offset.y,
    };
    this.setState(this.state);
  }
  onMoveEnd(e) {
    if (this.state.enabledCanvas) return
    if (this.state.activeIndex !== -1) return
    if (!this.mounted)
      return;
    this.draggable = false;
    this.setOffsetRange()
    const offset = {
      x: Math.abs(this.state.offset.x),
      y: Math.abs(this.state.offset.y)
    };
    if (Math.abs(this.state.offset.x) >= this.offsetRange.x) {
      this.state.offset.x = this.state.offset.x < 0 ? Math.min(0, -(this.offsetRange.x)) : Math.max(0, this.offsetRange.x);
      this.setState(this.state);
    }
    if (Math.abs(this.state.offset.y) >= this.offsetRange.y) {
      this.state.offset.y = this.state.offset.y < 0 ? Math.min(0, -(this.offsetRange.y)) : Math.max(0, this.offsetRange.y);
      this.setState(this.state);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.image.src != nextProps.image.src) {
      this.loadDataRnd(nextProps.image.src)
      this.resetOffset();
      this.loadImage(nextProps.image.src);
      this.setState({
        zoom: 0
      });
    }
  }

  componentDidMount() {
    this.loadDataRnd(this.props.image.src)
    this.mounted = true;
    this.loadImage(this.props.image.src);
    window.addEventListener('resize', this.setOffsetRange.bind(this));
    document.documentElement.addEventListener("mouseup", this.onMoveEnd.bind(this));
  }
  componentWillUnmount() {
    this.mounted = false;
    if (!!this.src) {
      this.src = undefined;
    }
    window.removeEventListener('resize', this.setOffsetRange.bind(this));
    document.documentElement.removeEventListener("mouseup", this.onMoveEnd.bind(this));
  }

  onMouseDown(e) {
    if (!this.state.addNote) {
      this.onMoveStart(e)
    } else {
      this.onMouseClick(e)
    }
  }
  addNote() {
    this.state.addNote = !this.state.addNote
    this.forceUpdate()
  }
  save() {
    localStorage.setItem(this.props.image.src + "rnd-2", JSON.stringify(this.state.lineData));
  }
  delete(index) {
    this.state.lineData.splice(index, 1)
    //this.state.dataChange = !this.state.dataChange
    this.forceUpdate()
  }
  loadDataRnd(src) {
    this.state.lineData = []
    this.forceUpdate()
    let rndStorage = localStorage.getItem(src + "rnd-2")
    if (!rndStorage) return
    this.state.lineData = JSON.parse(rndStorage)
    this.forceUpdate()
  }
  changeElement(e, random) {

  }
  onMouseClick(e) {

  }
  drawRectangle() {
    this.state.drawType = 'RECTANGLE'
    this.state.enabledCanvas = true
    this.forceUpdate()
  }
  drawPolygon() {
    this.state.drawType = 'POLYGON'
    this.state.enabledCanvas = true
    this.forceUpdate()
  }
  disabledIsPainting() {
    this.state.enabledCanvas = false
    this.forceUpdate()
  }
  onEndDraw(data) {
    if (data) {
      this.state.lineData.push(data)
    }
    this.state.enabledCanvas = false
    this.forceUpdate()
  }
  onEndMove(data) {
    this.state.lineData = data
    this.forceUpdate()
  }
  activeIndexChange(index) {
    this.state.activeIndex = index
    this.forceUpdate()
  }
  render() {
    const { image, index, showIndex } = this.props;
    const { offset, zoom, loading } = this.state;
    const { rnd_mask_width, rnd_mask_height } = this.state
    const value = `translate3d(${offset.x}px, ${offset.y}px, 0px)`;
    const imageCls = `zoom-${zoom} image-outer ${this.draggable ? 'dragging' : ''}`;
    const caption = (React.createElement("p", { className: "caption" },
      image.title ? React.createElement("span", { className: "title" }, image.title) : null,
      image.title && image.content ? React.createElement("span", null, ` - `) : null,
      image.title ? React.createElement("span", { className: "content" }, image.content) : null));

    return (
      <div className="image-wrapper" ref='image-wrapper'>
        <div style={{ transform: value }} ref={(component) => this.imageOuter = component} className={imageCls}>
          {loading ? <div className="spinner">
            <div className="bounce">
            </div>
          </div> : <img className="image" ref={(component) => this.image = component}
            src={image.src} draggable={false}
            onDragStart={(e) => e.preventDefault()} onMouseMove={this.onMove.bind(this)} onMouseDown={this.onMouseDown.bind(this)} onMouseUp={this.onMoveEnd.bind(this)} />}
        </div>
        <div className={'rnd-container ' + imageCls} style={{ transform: value }}
          onDragStart={(e) => e.preventDefault()}
          onMouseMove={this.onMove.bind(this)}
          onMouseDown={this.onMouseDown.bind(this)}
          onMouseUp={this.onMoveEnd.bind(this)} >
          {loading ? null : <div className='rnd-mask' style={{ width: rnd_mask_width, height: rnd_mask_height }} ref="rnd-mask">
            <Canvas
              drawType={this.state.drawType} //POLYGON || RECTANGLE
              enabled={this.state.enabledCanvas}
              onEndDraw={this.onEndDraw.bind(this)}
              onEndMove={this.onEndMove.bind(this)}
              onRef={ref => (this.canvas = ref)}
              data={{ data: this.state.lineData }}
              //dataChange={this.state.dataChange}
              activeIndex={this.state.activeIndex}
              activeIndexChange={this.activeIndexChange.bind(this)}
              // style
              width={rnd_mask_width}
              height={rnd_mask_height}
              lineWidth={1}
              strokeStyle={'red'}
              activeStrokeStyle={'blue'}
            />
          </div>}
        </div>
        <div className="rnd_evaluate">
          {this.state.lineData.map((item, index) => {
            return (
              <div key={index} style={{ backgroundColor: this.state.activeIndex === index ? 'blue' : 'white' }}>
                <button className="btn" onClick={() => this.setState({ activeIndex: index })}>{index}</button>
                <button className="btn" onClick={() => this.delete(index)}>Xóa</button>

              </div>
            )
          })}
        </div>
        <div className="tool-bar">
          {showIndex && <div className="index-indicator">
            {index}
            {caption}
          </div>}
          <div className="button-group">
            <div className=" button" onClick={this.drawRectangle.bind(this)}>
              Rec
            </div>
            <div className=" button" onClick={this.drawPolygon.bind(this)}>
              Pol
            </div>
            <div className=" button" onClick={this.save.bind(this)}>
              Save
            </div>
            <div className=" button" onClick={this.addNote.bind(this)}>
              Add
            </div>
            <div className="zoom-out button" onClick={this.zoomOut.bind(this)}>

            </div>
            <div className="zoom-in button" onClick={this.zoomIn.bind(this)}>

            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ImageWrapper