import React from 'react'
import PropTypes from 'prop-types'
import { Rnd } from "react-rnd";
import ReactDOM from 'react-dom';
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
      rnd: [],
      rnd_width_const: 120,
      rnd_height_const: 100,
      rnd_mask_width: 0,
      rnd_mask_height: 0,
      addNote: false,
      enableResizing: {
        bottom: true,
        bottomLeft: true,
        bottomRight: true,
        left: true,
        right: true,
        top: true,
        topLeft: true,
        topRight: true
      }
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
  onRndResize(e, direction, ref, delta, position, index) {
    this.state.rnd[index].position.width = ref.offsetWidth
    this.state.rnd[index].position.height = ref.offsetHeight
    this.forceUpdate()
  }
  onRndDragStop(e, d, index) {
    this.state.rnd[index].position.x = d.x
    this.state.rnd[index].position.y = d.y
    this.forceUpdate()
  }
  onRndDragStart(SyntheticMouseEvent, data, index) {
//console.log(data)
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
    localStorage.setItem(this.props.image.src + "rnd", JSON.stringify(this.state.rnd));
  }
  delete(index) {
    this.state.rnd.splice(index, 1)
    this.forceUpdate()
  }
  loadDataRnd(src) {
    this.state.rnd = []
    this.forceUpdate()
    let rnd = localStorage.getItem(src + "rnd")
    if (!rnd) return
    this.state.rnd = JSON.parse(rnd)
    this.forceUpdate()
  }
  changeElement(e, index) {
    this.state.rnd[index].evaluate = e.target.value
  }
  onMouseClick(e) {
    const { rnd_width_const, rnd_height_const } = this.state
    const rndMask = ReactDOM.findDOMNode(this.refs['rnd-mask'])
    const imageWrapper = ReactDOM.findDOMNode(this.refs['image-wrapper'])
    const offsetLeft = rndMask.offsetLeft + imageWrapper.offsetLeft
    const offsetTop = rndMask.offsetTop + imageWrapper.offsetTop
    let rnd_x = e.clientX  - (offsetLeft)// + (this.image.width * this.state.zoom )
    let rnd_y = e.clientY - (offsetTop) //+(this.image.height * this.state.zoom )
    let position = {
      width: rnd_width_const,
      height: rnd_height_const,
      x: rnd_x,
      y: rnd_y
    }
    this.state.rnd.push({
      position: position,
      //evaluate: evaluate
    })
    this.state.addNote = false
    this.forceUpdate()
  }
  render() {
    const { image, index, showIndex } = this.props;
    const { offset, zoom, loading } = this.state;
    const { rnd_mask_width, rnd_mask_height, enableResizing } = this.state
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
          <div className='rnd-mask' style={{ width: rnd_mask_width, height: rnd_mask_height }} ref="rnd-mask">
            {this.state.rnd.map((item, index) => {
              style.transform = `translate(${item.position.x}px, ${item.position.y}px) !important` 
              console.log(style)
              return (
                <Rnd
                  key={index}
                  style={style}
                  //default={item.position}
                  position={{
                    x: item.position.x,
                    y: item.position.y,
                  }}
                  size={{
                    width: item.position.width,
                    height: item.position.height,
                  }}
                  onResize={(e, direction, ref, delta, position) => this.onRndResize(e, direction, ref, delta, position, index)}
                  onDragStart={(SyntheticMouseEvent, data) => this.onRndDragStart(SyntheticMouseEvent, data, index)}
                  onDragStop={(e, d) => this.onRndDragStop(e, d, index)}
                  disableDragging={false}
                  enableResizing={enableResizing}
                  minWidth={50}
                  minHeight={50}
                >
                  <div className='rnd' >
                    <div className='row object-title'>
                      <div className='object'>Object</div>
                      <div className='title'>Title</div>
                      <div className='close' onClick={() => this.delete(index)}>X</div>
                    </div>
                    <div className='details'>

                    </div>
                  </div>
                </Rnd>
              )
            })}
          </div>
        </div>
        <div className="rnd_evaluate">
          {this.state.rnd.map((item, index) => {
            return (
              <div className='row col' key={index}>
                <input key={index} type='text' value={item.evaluate} onChange={(e) => this.changeElement(e, index)} />
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