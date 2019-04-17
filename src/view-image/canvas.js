// đã xong thao tác thêm sửa xóa
import React, { Component } from 'react';

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this)
    this.isPainting = false
    this.isMove = false
    this.posMove = { data: {}, index: {} }
    this.enabled = this.props.enabled
    this.line = []
    this.activeIndex = this.props.activeIndex
    this.prevPos = { offsetX: 0, offsetY: 0 };
    this.prevPosPolygon = []
    this.position = {}
  }
  onMouseDown({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    let checkPointClicked = this.checkPointClicked(offsetX, offsetY)
    if (checkPointClicked.check) {
      this.isMove = true
      this.props.activeIndexChange(checkPointClicked.index.i)
      this.posMove = {
        data: checkPointClicked.data,
        index: checkPointClicked.index,
        type: checkPointClicked.type,
        item: checkPointClicked.item
      }
      return
    } else {
      if (!this.isPainting)
        this.props.activeIndexChange(-1)
    }

    if (!this.enabled) return
    this.isPainting = true;
    if (this.props.drawType === 'RECTANGLE') {
      this.onMouseDownRec(offsetX, offsetY)
    } else if (this.props.drawType === 'POLYGON') {
      this.onMouseDownPol(offsetX, offsetY)
    }
  }
  onMouseDownRec(offsetX, offsetY) {
    this.prevPos = { offsetX, offsetY };
  }
  onMouseDownPol(offsetX, offsetY) {
    const index = this.prevPosPolygon.length - 1
    if (this.prevPosPolygon[index]) {
      this.onDrawPolyline(this.prevPosPolygon)
    }
    if (this.prevPosPolygon[0]) {
      if (this.checkRangePoint(offsetX, offsetY, this.prevPosPolygon[0].offsetX, this.prevPosPolygon[0].offsetY, 10)) {
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
  onMouseMove({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    if (this.isMove) {
      let line = JSON.parse(JSON.stringify(this.line))
      if (this.posMove.type === 'POLYGON') {
        line[this.posMove.index.i].data[this.posMove.index.j] = { offsetX: offsetX, offsetY: offsetY }
        this.line = line
        this.drawData()
      }
      if (this.posMove.type === 'RECTANGLE') {
        let recPoint = this.posMove.item
        if (this.posMove.index.j === 2) {
          let width = recPoint.width + (offsetX - this.posMove.data.offsetX)
          let height = recPoint.height + (offsetY - this.posMove.data.offsetY)
          line[this.posMove.index.i].data = { offsetX: recPoint.offsetX, offsetY: recPoint.offsetY, width: width, height: height }
        }
        if (this.posMove.index.j === 0) {
          let width = recPoint.width - (offsetX - this.posMove.data.offsetX)
          let height = recPoint.height - (offsetY - this.posMove.data.offsetY)
          line[this.posMove.index.i].data = { offsetX: offsetX, offsetY: offsetY, width: width, height: height }
        }
        if (this.posMove.index.j === 1) {
          let width = recPoint.width + (offsetX - this.posMove.data.offsetX)
          let height = recPoint.height - (offsetY - this.posMove.data.offsetY)
          line[this.posMove.index.i].data = { offsetX: recPoint.offsetX, offsetY: offsetY, width: width, height: height }
        }
        if (this.posMove.index.j === 3) {
          let width = recPoint.width - (offsetX - this.posMove.data.offsetX)
          let height = recPoint.height + (offsetY - this.posMove.data.offsetY)
          line[this.posMove.index.i].data = { offsetX: offsetX, offsetY: recPoint.offsetY, width: width, height: height }
        }
        this.line = line
        this.drawData()
      }
    }

    if (!this.enabled) return

    if (this.isPainting) {
      if (this.props.drawType === 'RECTANGLE') {
        this.onMouseMoveRec(offsetX, offsetY)
      } else if (this.props.drawType === 'POLYGON') {
        this.onMouseMovePol(offsetX, offsetY)
      }
    }
  }
  onMouseMoveRec(offsetX, offsetY) {
    const offSetData = { offsetX, offsetY };
    this.position = {
      start: this.prevPos,
      stop: offSetData,
    };
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.map(item => {
      if (item.type === 'POLYGON') this.onDrawPolygon(item.data)
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data)
    })
    let width = this.position.stop.offsetX - this.position.start.offsetX
    let height = this.position.stop.offsetY - this.position.start.offsetY
    this.onDrawRectangle({ offsetX: this.position.start.offsetX, offsetY: this.position.start.offsetY, width: width, height: height })
    this.ctx.stroke()
    this.ctx.closePath();
  }
  onMouseMovePol(offsetX, offsetY) {
    const offSetData = { offsetX, offsetY };
    this.position = {
      start: this.prevPosPolygon[this.prevPosPolygon.length - 1],
      stop: offSetData,
    };
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.map(item => {
      if (item.type === 'POLYGON') this.onDrawPolygon(item.data)
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data)
    })
    this.onDrawPolyline(this.prevPosPolygon)
    this.ctx.moveTo(this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX, this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY);
    this.ctx.lineTo(offsetX, offsetY)
    this.ctx.stroke()
    this.ctx.closePath();
  }
  endPaintEvent() {
    if (this.isMove) {
      if (this.posMove.type === "POLYGON") {
        // cộng thêm 2 điểm
        let dataBefore = this.line[this.posMove.index.i].data[this.posMove.index.j - 1] ?
          this.line[this.posMove.index.i].data[this.posMove.index.j - 1] :
          this.line[this.posMove.index.i].data[this.line[this.posMove.index.i].data.length - 1]
        let dataAfter = this.line[this.posMove.index.i].data[this.posMove.index.j + 1] ?
          this.line[this.posMove.index.i].data[this.posMove.index.j + 1] :
          this.line[this.posMove.index.i].data[0]

        let before = {
          offsetX: (dataBefore.offsetX + this.line[this.posMove.index.i].data[this.posMove.index.j].offsetX) / 2,
          offsetY: (dataBefore.offsetY + this.line[this.posMove.index.i].data[this.posMove.index.j].offsetY) / 2
        }
        let after = {
          offsetX: (dataAfter.offsetX + this.line[this.posMove.index.i].data[this.posMove.index.j].offsetX) / 2,
          offsetY: (dataAfter.offsetY + this.line[this.posMove.index.i].data[this.posMove.index.j].offsetY) / 2
        }
        this.line[this.posMove.index.i].data.splice(this.posMove.index.j, 0, before);
        this.line[this.posMove.index.i].data.splice(this.posMove.index.j + 2, 0, after);
      }
      this.isMove = false
      this.posMove = { data: {}, index: {} }
      this.props.onEndMove(this.line)
    }
    if (!this.enabled) return
    if (this.isPainting) {
      if (this.props.drawType === 'RECTANGLE') {
        this.endPaintEventRec()
      }
    } else {
      if (this.props.drawType === 'POLYGON') {
        this.endPaintEventPol()
      }
    }
  }
  endPaintEventRec() {
    this.isPainting = false;
    let width = this.position.stop.offsetX - this.position.start.offsetX
    let height = this.position.stop.offsetY - this.position.start.offsetY
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
    this.props.onEndDraw(this.line[this.line.length - 1])
  }
  endPaintEventPol() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.map(item => {
      if (item.type === 'POLYGON') this.onDrawPolygon(item.data)
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data)
    })
    this.ctx.stroke()
    this.ctx.closePath();
    this.props.onEndDraw(this.line[this.line.length - 1])
  }
  onMouseOut() {
    if (this.isMove) {
      this.isMove = false
    }
  }
  checkRangePoint(offsetX, offsetY, firstX, firstY, range) {
    return offsetX >= (firstX - range) && offsetX <= (firstX + range) && offsetY >= (firstY - range) && offsetY <= (firstY + range)
  }
  onDrawPolyline(points, active) {
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
      this.ctx.lineTo(points[0].offsetX, points[0].offsetY)
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
      this.prevPos = { offsetX: 0, offsetY: 0 };
      this.prevPosPolygon = []
      this.position = { start: {}, stop: {} }
      this.isPainting = false;
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
  }
  drawData() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.line.map((item, index) => {
      let active = index === this.props.activeIndex
      if (active) this.ctx.strokeStyle = this.props.activeStrokeStyle
      if (!active) this.ctx.strokeStyle = this.props.strokeStyle
      this.ctx.beginPath();
      if (item.type === 'POLYGON') {
        this.onDrawPolygon(item.data, active)
      }
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.data, active)
      this.ctx.stroke()
      this.ctx.closePath();
      this.ctx.strokeStyle = this.props.strokeStyle
    })
  }
  checkPointClicked(offsetX, offsetY) {
    let check = false
    for (let i = 0; i < this.line.length; i++) {
      let item = this.line[i]
      if (item.type === "RECTANGLE") {
        check = this.checkRangePoint(offsetX, offsetY, item.data.offsetX, item.data.offsetY, 10) ||
          this.checkRangePoint(offsetX, offsetY, item.data.offsetX + item.data.width, item.data.offsetY, 10) ||
          this.checkRangePoint(offsetX, offsetY, item.data.offsetX, item.data.offsetY + item.data.height, 10) ||
          this.checkRangePoint(offsetX, offsetY, item.data.offsetX + item.data.width, item.data.offsetY + item.data.height, 10)
        if (check) {
          if (this.checkRangePoint(offsetX, offsetY, item.data.offsetX, item.data.offsetY, 10)) return { check: true, type: item.type, data: { offsetX: item.data.offsetX, offsetY: item.data.offsetY }, index: { i: i, j: 0 }, item: item.data }
          if (this.checkRangePoint(offsetX, offsetY, item.data.offsetX + item.data.width, item.data.offsetY, 10)) return { check: true, type: item.type, data: { offsetX: item.data.offsetX + item.data.width, offsetY: item.data.offsetY }, index: { i: i, j: 1 }, item: item.data }
          if (this.checkRangePoint(offsetX, offsetY, item.data.offsetX + item.data.width, item.data.offsetY + item.data.height, 10)) return { check: true, type: item.type, data: { offsetX: item.data.offsetX + item.data.width, offsetY: item.data.offsetY + item.data.height }, index: { i: i, j: 2 }, item: item.data }
          if (this.checkRangePoint(offsetX, offsetY, item.data.offsetX, item.data.offsetY + item.data.height, 10)) return { check: true, type: item.type, data: { offsetX: item.data.offsetX, offsetY: item.data.offsetY + item.data.height }, index: { i: i, j: 3 }, item: item.data }
        }
      }
      if (item.type === "POLYGON") {
        for (let j = 0; j < item.data.length; j++) {
          let point = item.data[j]
          check = this.checkRangePoint(offsetX, offsetY, point.offsetX, point.offsetY, 10)
          if (check) {
            return { check: true, type: item.type, data: { offsetX: point.offsetX, offsetY: point.offsetY }, index: { i: i, j: j } }
          }
        }
      }
    }
    return { check: check }
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
        onMouseOut={this.onMouseOut}
      />
    );
  }
}

export default Canvas;
