// đã xong thao tác thêm sửa xóa
import React, { Component } from 'react';

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.isPainting = false
    this.isMove = false
    this.enabled = this.props.enabled
    this.line = []
    this.activeIndex = this.props.activeIndex
    this.prevPos = { offsetX: 0, offsetY: 0 };
    this.prevPosPolygon = []
    this.position = {}
  }

  onMouseDown({ nativeEvent }) {
    if (!this.enabled) return
    const { offsetX, offsetY } = nativeEvent;
    this.isPainting = true;
    if (this.props.drawType === 'RECTANGLE') {
      this.prevPos = { offsetX, offsetY };
    } else if (this.props.drawType === 'POLYGON') {
      const index = this.prevPosPolygon.length - 1
      if (this.prevPosPolygon[index]) {
        this.onDrawPolygon(this.prevPosPolygon)
      }
      if (this.prevPosPolygon[0]) {
        if (this.checkIsFirstPoint(offsetX, offsetY, this.prevPosPolygon[0].offsetX, this.prevPosPolygon[0].offsetY)) {// nếu click lại điểm đầu tiên
          this.prevPosPolygon.push({ offsetX: this.prevPosPolygon[0].offsetX, offsetY: this.prevPosPolygon[0].offsetY });
          this.line.push({
            type: "POLYGON",
            data: this.prevPosPolygon,
          })
          this.prevPosPolygon = []
          this.isPainting = false
          return
        }
      }
      this.prevPosPolygon.push({ offsetX, offsetY });
    }
  }

  onMouseMove({ nativeEvent }) {
    if (!this.enabled) return
    if (this.isPainting) {
      if (this.props.drawType === 'RECTANGLE') {
        const { offsetX, offsetY } = nativeEvent;
        const offSetData = { offsetX, offsetY };
        this.position = {
          start: this.prevPos,
          stop: offSetData,
        };
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();

        this.line.map(item => {
          if (item.type === 'POLYGON') this.onDrawPolygon(item.data)
          if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data)//this.ctx.rect(item.data.offsetX, item.data.offsetY, item.data.width, item.data.height);
        })
        let width = this.position.stop.offsetX - this.position.start.offsetX
        let height = this.position.stop.offsetY - this.position.start.offsetY
        //this.ctx.rect(this.position.start.offsetX, this.position.start.offsetY, width, height);
        this.onDrawRectangle({ offsetX: this.position.start.offsetX, offsetY: this.position.start.offsetY, width: width, height: height })
        this.ctx.stroke()
        this.ctx.closePath();
      } else if (this.props.drawType === 'POLYGON') {
        const { offsetX, offsetY } = nativeEvent;
        const offSetData = { offsetX, offsetY };
        this.position = {
          start: this.prevPosPolygon[this.prevPosPolygon.length - 1],
          stop: offSetData,
        };
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();

        this.line.map(item => {
          if (item.type === 'POLYGON') this.onDrawPolygon(item.data)
          if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data)//this.ctx.rect(item.data.offsetX, item.data.offsetY, item.data.width, item.data.height);
        })
        this.onDrawPolygon(this.prevPosPolygon)
        this.ctx.moveTo(this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX, this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY);
        this.ctx.lineTo(offsetX, offsetY)
        this.ctx.stroke()
        this.ctx.closePath();
      }
    }
  }

  endPaintEvent() {
    if (!this.enabled) return
    if (this.isPainting) {
      if (this.props.drawType === 'RECTANGLE') {
        let width = this.position.stop.offsetX - this.position.start.offsetX
        let height = this.position.stop.offsetY - this.position.start.offsetY
        //this.ctx.rect(this.position.start.offsetX, this.position.start.offsetY, width, height);
        this.onDrawRectangle({ offsetX: this.position.start.offsetX, offsetY: this.position.start.offsetY, width: width, height: height })
        this.line.push({
          type: "RECTANGLE",
          data: {
            offsetX: this.position.start.offsetX,
            offsetY: this.position.start.offsetY,
            width: width,
            height: height,
          }
        })
        this.ctx.stroke()
        this.isPainting = false;
        this.props.onEndDraw(this.line[this.line.length - 1])
      }
    } else {
      if (this.props.drawType === 'POLYGON') {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath();
        this.line.map(item => {
          if (item.type === 'POLYGON') this.onDrawPolygon(item.data)
          if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data)//this.ctx.rect(item.data.offsetX, item.data.offsetY, item.data.width, item.data.height);
        })
        this.ctx.stroke()
        this.ctx.closePath();
        this.props.onEndDraw(this.line[this.line.length - 1])
      }
    }
  }

  checkIsFirstPoint(offsetX, offsetY, firstX, firstY) {
    return offsetX >= (firstX - 10) && offsetX <= (firstX + 10) && offsetY >= (firstY - 10) && offsetY <= (firstY + 10)
  }

  onDrawPolygon(points, active) {
    try {
      this.ctx.moveTo(points[0].offsetX, points[0].offsetY);
      for (let i = 1; i < points.length; i++) {
        let item = points[i]
        this.ctx.fillStyle = active ? this.props.activeStrokeStyle : this.props.strokeStyle
        this.ctx.fillRect(points[i - 1].offsetX - 5, points[i - 1].offsetY - 5, 10, 10);
        this.ctx.fillRect(item.offsetX - 5, item.offsetY - 5, 10, 10);
        this.ctx.moveTo(points[i - 1].offsetX, points[i - 1].offsetY);
        this.ctx.lineTo(item.offsetX, item.offsetY)
      }
    } catch (e) {
      console.log(e)
    }
  }
  onDrawRectangle(data, active) {
    this.ctx.rect(data.offsetX, data.offsetY, data.width, data.height);
    this.ctx.fillStyle = active ? this.props.activeStrokeStyle : this.props.strokeStyle
    this.ctx.fillRect(data.offsetX - 5, data.offsetY - 5, 10, 10);
    this.ctx.fillRect(data.offsetX + data.width - 5, data.offsetY - 5, 10, 10);
    this.ctx.fillRect(data.offsetX - 5, data.offsetY + data.height - 5, 10, 10);
    this.ctx.fillRect(data.offsetX + data.width - 5, data.offsetY + data.height - 5, 10, 10);
  }
  paint(prevPos, currPos, strokeStyle) {

  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }
  componentDidMount() {
    this.props.onRef(this)
    this.initData()
  }

  componentDidUpdate(prevProps) {
    let { width, height, drawType, enabled, activeIndex, data, dataChange } = this.props
    if (width !== prevProps.width || height !== prevProps.height) {
      this.initData()
    }
    if (drawType !== prevProps.drawType) {

    }
    if (enabled !== prevProps.enabled) {
      this.enabled = enabled
    }
    if (activeIndex !== prevProps.activeIndex) {
      this.activeIndex = activeIndex
      this.drawData()
    }
    if (data !== prevProps.data) {
      this.line = JSON.parse(JSON.stringify(data.data))
      this.drawData()
    }
  }

  initData() {
    this.canvas.width = this.props.width;
    this.canvas.height = this.props.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.lineWidth = this.props.lineWidth
    this.ctx.strokeStyle = this.props.strokeStyle

    console.log(this.props.data)
  }
  // getData() {
  //   return this.line
  // }
  drawData() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.line.map((item, index) => {
      let active = index === this.props.activeIndex
      if (active) this.ctx.strokeStyle = this.props.activeStrokeStyle
      if (!active) this.ctx.strokeStyle = this.props.strokeStyle
      this.ctx.beginPath();
      if (item.type === 'POLYGON') this.onDrawPolygon(item.data, active)
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data, active)//this.ctx.rect(item.data.offsetX, item.data.offsetY, item.data.width, item.data.height);
      this.ctx.stroke()
      this.ctx.closePath();
      this.ctx.strokeStyle = this.props.strokeStyle
    })
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
