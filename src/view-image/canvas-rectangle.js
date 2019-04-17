import React, { Component } from 'react';

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
  }
  isPainting = false;
  line = [];
  prevPos = { offsetX: 0, offsetY: 0 };

  onMouseDown({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    this.isPainting = true;
    this.prevPos = { offsetX, offsetY };
  }

  onMouseMove({ nativeEvent }) {
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      this.position = {
        start: this.prevPos,
        stop: offSetData,
      };
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();

      this.line.map(item => {
        this.ctx.rect(item.data.x, item.data.y, item.data.width, item.data.height);
      })
      let width = this.position.stop.offsetX - this.position.start.offsetX
      let height = this.position.stop.offsetY - this.position.start.offsetY
      this.ctx.rect(this.position.start.offsetX, this.position.start.offsetY, width, height);
      this.ctx.stroke()
      this.ctx.closePath();
    }
  }

  endPaintEvent() {
    if (this.isPainting) {
      let width = this.position.stop.offsetX - this.position.start.offsetX
      let height = this.position.stop.offsetY - this.position.start.offsetY
      this.ctx.rect(this.position.start.offsetX, this.position.start.offsetY, width, height);


      this.line.push({
        type: "RECTANGLE",
        data: {
          x: this.position.start.offsetX,
          y: this.position.start.offsetY,
          width: width,
          height: height,
        }
      })
      this.ctx.stroke()
      this.isPainting = false;
    }
  }

  paint(prevPos, currPos, strokeStyle) {

  }

  componentDidMount() {
    let { width, height } = this.props
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = 'red'
  }

  componentDidUpdate(prevProps) {
    let { width, height } = this.props
    if (width !== prevProps.width || height !== prevProps.height) {
      this.canvas.width = this.props.width;
      this.canvas.height = this.props.height;
      this.ctx = this.canvas.getContext('2d');
      this.ctx.lineWidth = 2
      this.ctx.strokeStyle = 'red'
    }
  }
  render() {
    return (
      <canvas
        ref={(ref) => (this.canvas = ref)}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onMouseDown={this.onMouseDown}
        onMouseLeave={this.endPaintEvent}
        onMouseUp={this.endPaintEvent}
        onMouseMove={this.onMouseMove}
      />
    );
  }
}

export default Canvas;
