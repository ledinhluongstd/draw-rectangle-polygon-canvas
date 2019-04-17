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
  prevPosPolygon = []//{ offsetX: 0, offsetY: 0 };

  onMouseDown({ nativeEvent }) {
    //if(!this.isPainting) return
    const { offsetX, offsetY } = nativeEvent;
    const index = this.prevPosPolygon.length - 1
    this.isPainting = true;
    if (this.prevPosPolygon[index]) {
      this.onDrawPolygon(this.prevPosPolygon)
    }
    if (this.prevPosPolygon[0]) {
      if (this.checkIsFirstPoint(offsetX, offsetY, this.prevPosPolygon[0].offsetX, this.prevPosPolygon[0].offsetY)) {// nếu click lại điểm đầu tiên
        this.prevPosPolygon.push({ offsetX: this.prevPosPolygon[0].offsetX, offsetY: this.prevPosPolygon[0].offsetY });
        this.line.push({
          type: "POLYGON",
          data: this.prevPosPolygon
        })
        this.prevPosPolygon = []
        this.isPainting = false
        return
      }
    }
    this.prevPosPolygon.push({ offsetX, offsetY });

  }
  checkIsFirstPoint(offsetX, offsetY, firstX, firstY) {
    return offsetX >= (firstX - 10) && offsetX <= (firstX + 10) && offsetY >= (firstY - 10) && offsetY <= (firstY + 10)
  }
  onDrawPolygon(points) {
    this.ctx.moveTo(points[0].offsetX, points[0].offsetY);
    for (let i = 1; i < points.length; i++) {
      let item = points[i]
      this.ctx.lineTo(item.offsetX, item.offsetY)
    }
  }
  onMouseMove({ nativeEvent }) {
    if (this.isPainting) {
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      this.position = {
        start: this.prevPosPolygon[this.prevPosPolygon.length - 1],
        stop: offSetData,
      };
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();

      this.line.map(item => {
        this.onDrawPolygon(item.data)
      })
      this.onDrawPolygon(this.prevPosPolygon)
      this.ctx.moveTo(this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX, this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY);
      this.ctx.lineTo(offsetX, offsetY)
      this.ctx.stroke()
      this.ctx.closePath();
    }
  }

  endPaintEvent() {
    if (!this.isPainting) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.beginPath();

      this.line.map(item => {
        this.onDrawPolygon(item.data)
      })
      this.ctx.stroke()
      this.ctx.closePath();
    }
    return
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
      console.log(this.line)
      this.isPainting = false;
    }
  }

  paint(prevPosPolygon, currPos, strokeStyle) {

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
