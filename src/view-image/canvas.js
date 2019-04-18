// completed the operation to edit delete, move, check intersection, move the object
import React, { Component } from 'react';
import PropTypes from 'prop-types'

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.endPaintEvent = this.endPaintEvent.bind(this);
    this.onMouseOut = this.onMouseOut.bind(this)
    this.objectMove = false
    this.objectSelected = { check: false, index: 0, data: {} }
    this.movePoint = false
    this.posMove = { data: {}, index: {} }
    this.isPainting = false
    this.enabled = this.props.enabled
    this.line = []
    this.activeIndex = -1
    this.prevPos = { offsetX: 0, offsetY: 0 };
    this.prevPosPolygon = []
    this.position = {}
  }
  onMouseDown({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    // Identify points to move
    if (!this.objectMove && !this.isPainting) {
      this.onMouseDownMovePoint(offsetX, offsetY)
    }

    // moving objects
    if (!this.isPainting && !this.movePoint) {
      this.onMouseDownMoveObject(offsetX, offsetY)
    }
    // drawing
    if (!this.enabled) return
    this.isPainting = true;
    if (this.props.drawType === 'RECTANGLE') {
      this.onMouseDownRec(offsetX, offsetY)
    } else if (this.props.drawType === 'POLYGON') {
      this.onMouseDownPol(offsetX, offsetY)
    }
  }
  onMouseDownMovePoint(offsetX, offsetY) {
    let checkPointClicked = this.checkPointClicked(offsetX, offsetY)
    if (checkPointClicked.check && !this.objectMove) {
      this.movePoint = true
      this.props.activeIndexChange(checkPointClicked.index.i)
      this.posMove = {
        data: checkPointClicked.data,
        index: checkPointClicked.index,
        type: checkPointClicked.type,
        item: checkPointClicked.item
      }
      return
    } else {
      if (!this.isPainting && !this.objectMove)
        this.props.activeIndexChange(-1)
    }
  }
  onMouseDownMoveObject(offsetX, offsetY) {
    for (let i = 0; i < this.line.length; i++) {
      let item = this.line[i]
      let polygon = []
      if (item.type === "POLYGON") {
        polygon = item.data
      }
      if (item.type === "RECTANGLE") {
        polygon = [
          { offsetX: item.data.offsetX, offsetY: item.data.offsetY },
          { offsetX: item.data.offsetX + item.data.width, offsetY: item.data.offsetY },
          { offsetX: item.data.offsetX + item.data.width, offsetY: item.data.offsetY + item.data.height },
          { offsetX: item.data.offsetX, offsetY: item.data.offsetY + item.data.height }]
      }
      if (this.checkPointInsideObject({ offsetX, offsetY }, polygon)) {
        this.props.activeIndexChange(i)
        this.objectSelected = {
          check: true,
          index: i,
          data: item,
          prevPos: { offsetX: offsetX, offsetY: offsetY }
        }
        this.objectMove = true
        break
      }
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
        if (this.prevPosPolygon.length < 3) return
        this.line.push({
          type: "POLYGON",
          data: this.prevPosPolygon,
        })
        this.prevPosPolygon = []
        this.isPainting = false
        return
      }
    }
    // check the straight line intersecting
    let checkIntersecting = false
    if (this.prevPosPolygon.length > 2) {
      let A = { offsetX: offsetX, offsetY: offsetY },
        B = { offsetX: this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX, offsetY: this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY }
      for (let i = 0; i < this.prevPosPolygon.length - 2; i++) {
        let C = { offsetX: this.prevPosPolygon[i].offsetX, offsetY: this.prevPosPolygon[i].offsetY }
        let D = { offsetX: this.prevPosPolygon[i + 1].offsetX, offsetY: this.prevPosPolygon[i + 1].offsetY }
        if (this.checkIntersecting(A, B, C, D)) {
          alert(this.props.warning)
          return
        }
      }
    }
    // out of check
    if (checkIntersecting) return
    this.prevPosPolygon.push({ offsetX, offsetY });
  }

  onMouseMove({ nativeEvent }) {
    const { offsetX, offsetY } = nativeEvent;
    // moving objects
    if (this.objectMove) {
      this.onMouseMoveObject(offsetX, offsetY)
    }
    // move point
    if (this.movePoint) {
      this.onMouseMovePoint(offsetX, offsetY)
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
  onMouseMoveObject(offsetX, offsetY) {
    let item = clone(this.objectSelected.data)
    let x = offsetX - this.objectSelected.prevPos.offsetX
    let y = offsetY - this.objectSelected.prevPos.offsetY
    if (item.type === "POLYGON") {
      for (let i = 0; i < item.data.length; i++) {
        item.data[i].offsetX += x
        item.data[i].offsetY += y
      }
    }
    if (item.type === "RECTANGLE") {
      item.data.offsetX += x
      item.data.offsetY += y
    }
    this.line[this.objectSelected.index] = item
    this.drawData()
  }
  onMouseMovePoint(offsetX, offsetY) {
    let line = clone(this.line)
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
    if (this.objectMove) {
      this.objectSelected = { check: false, index: 0, data: {} }
      this.objectMove = false
      this.props.onEndMove(this.line)
    }
    if (this.movePoint) {
      this.plusTwoPoint()
      this.movePoint = false
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
  plusTwoPoint() {
    if (!this.props.plusTwoPoint) return
    if (this.posMove.type === "POLYGON") {
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
    if (this.movePoint) {
      this.movePoint = false
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
      this.line = clone(data.data)
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
  checkPointInsideObject(point, polygon) {
    let x = point.offsetX, y = point.offsetY;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i].offsetX, yi = polygon[i].offsetY;
      let xj = polygon[j].offsetX, yj = polygon[j].offsetY;
      let intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };
  value(A, B, M) {
    return (M.offsetX - A.offsetX) * (B.offsetY - A.offsetY) - (M.offsetY - A.offsetY) * (B.offsetX - A.offsetX)
  }
  otherSide(A, B, C, D) {
    return (this.value(A, B, C) * this.value(A, B, D) <= 0) ? 1 : 0
  }
  checkIntersecting(A, B, C, D) {
    return (this.otherSide(A, B, C, D) === 1 && this.otherSide(C, D, A, B) === 1) ? true : false
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

Canvas.defaultProps = {
  drawType: 'RECTANGLE', //POLYGON || RECTANGLE
  enabled: false,
  plusTwoPoint: true,
  data: { data: [] },
  warning: "warning",
  activeIndex: -1,
  width: 100,
  height: 100,
  lineWidth: 1,
  strokeStyle: 'red',
  activeStrokeStyle: 'blue'
};
Canvas.propTypes = {
  prefixCls: PropTypes.string,
  className: PropTypes.string,
  showIndex: PropTypes.bool,
  showPreview: PropTypes.bool,
  activeIndex: PropTypes.number,

  drawType: PropTypes.string, //POLYGON || RECTANGLE
  enabled: PropTypes.bool,
  onEndDraw: PropTypes.func,
  onEndMove: PropTypes.func,
  plusTwoPoint: PropTypes.bool,
  data: PropTypes.object,
  warning: PropTypes.string,
  activeIndex: PropTypes.number,
  activeIndexChange: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number,
  lineWidth: PropTypes.number,
  strokeStyle: PropTypes.string,
  activeStrokeStyle: PropTypes.string
};

export default Canvas;
