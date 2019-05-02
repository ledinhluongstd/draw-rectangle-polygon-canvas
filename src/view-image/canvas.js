// completed the operation to edit delete, move, check intersection, move the object
import React, { Component } from 'react';
import PropTypes from 'prop-types'
import Rectangle from './rectangle';
import Polygon from './polygon';

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
    this.onKeyPress = this.onKeyPress.bind(this)
    this.objectMove = false
    this.objectSelected = { check: false, index: 0, position: {} }
    this.movePoint = false
    this.posMove = { position: {}, index: {} }
    this.isPainting = false
    this.enabled = this.props.enabled
    this.line = []
    this.activeIndex = -1
    this.prevPos = { offsetX: 0, offsetY: 0 };
    this.prevPosPolygon = []
    this.position = {}

    ///////////////////
    //this.rectangle = []
  }
  componentWillMount() {

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
        position: checkPointClicked.position,
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
        polygon = item.position
      }
      if (item.type === "RECTANGLE") {
        polygon = [
          { offsetX: item.position.offsetX, offsetY: item.position.offsetY },
          { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY },
          { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY + item.position.height },
          { offsetX: item.position.offsetX, offsetY: item.position.offsetY + item.position.height }]
      }
      if (this.checkPointInsideObject({ offsetX, offsetY }, polygon)) {
        this.props.activeIndexChange(i)
        this.objectSelected = {
          check: true,
          index: i,
          position: item,
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
        let polygon = new Polygon({
          type: "POLYGON",
          position: this.prevPosPolygon,
          active: false,
          strokeStyle: this.props.strokeStyle,
          activeStrokeStyle: this.props.activeStrokeStyle
        })
        this.line.push(polygon)
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
    // check move on object
    this.onMouseMoveCursor(offsetX, offsetY)
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
  onMouseMoveCursor(offsetX, offsetY) {
    for (let i = 0; i < this.line.length; i++) {
      let item = this.line[i]
      let polygon = []
      if (item.type === "POLYGON") {
        polygon = item.position
      }
      if (item.type === "RECTANGLE") {
        polygon = [
          { offsetX: item.position.offsetX, offsetY: item.position.offsetY },
          { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY },
          { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY + item.position.height },
          { offsetX: item.position.offsetX, offsetY: item.position.offsetY + item.position.height }]
      }
      if (this.checkPointInsideObject({ offsetX, offsetY }, polygon)) {
        this.canvas.style.cursor = 'grab'
        break
      } else {
        this.canvas.style.cursor = ''
      }
    }
  }
  onMouseMoveObject(offsetX, offsetY) {
    let item = clone(this.objectSelected.position)
    if (this.objectSelected.position.type === "RECTANGLE")
      item = new Rectangle(item)
    if (this.objectSelected.position.type === "POLYGON")
      item = new Polygon(item)

    let x = offsetX - this.objectSelected.prevPos.offsetX
    let y = offsetY - this.objectSelected.prevPos.offsetY
    if (item.type === "POLYGON") {
      for (let i = 0; i < item.position.length; i++) {
        item.position[i].offsetX += x
        item.position[i].offsetY += y
      }
    }
    if (item.type === "RECTANGLE") {
      item.position.offsetX += x
      item.position.offsetY += y
    }
    this.line[this.objectSelected.index] = item
    this.drawData()
  }

  onMouseMovePoint(offsetX, offsetY) { // chưa làm
    let line = clone(this.line)
    for (let i = 0; i < line.length; i++) {
      let item = line[i]
      if (item.type === 'RECTANGLE')
        line[i] = new Rectangle(item)
      if (item.type === 'POLYGON')
        line[i] = new Polygon(item)
    }
    if (this.posMove.type === 'POLYGON') {
      line[this.posMove.index.i].position[this.posMove.index.j] = { offsetX: offsetX, offsetY: offsetY }
      this.line = line
      this.drawData()
    }
    if (this.posMove.type === 'RECTANGLE') {
      let recPoint = this.posMove.item
      if (this.posMove.index.j === 2) {
        let width = recPoint.width + (offsetX - this.posMove.position.offsetX)
        let height = recPoint.height + (offsetY - this.posMove.position.offsetY)
        line[this.posMove.index.i].position = { offsetX: recPoint.offsetX, offsetY: recPoint.offsetY, width: width, height: height }
      }
      if (this.posMove.index.j === 0) {
        let width = recPoint.width - (offsetX - this.posMove.position.offsetX)
        let height = recPoint.height - (offsetY - this.posMove.position.offsetY)
        line[this.posMove.index.i].dapositionta = { offsetX: offsetX, offsetY: offsetY, width: width, height: height }
      }
      if (this.posMove.index.j === 1) {
        let width = recPoint.width + (offsetX - this.posMove.position.offsetX)
        let height = recPoint.height - (offsetY - this.posMove.position.offsetY)
        line[this.posMove.index.i].position = { offsetX: recPoint.offsetX, offsetY: offsetY, width: width, height: height }
      }
      if (this.posMove.index.j === 3) {
        let width = recPoint.width - (offsetX - this.posMove.position.offsetX)
        let height = recPoint.height + (offsetY - this.posMove.position.offsetY)
        line[this.posMove.index.i].position = { offsetX: offsetX, offsetY: recPoint.offsetY, width: width, height: height }
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
      item.render(this)
      //if (item.type === 'POLYGON') this.onDrawPolygon(item.position)
      //if (item.type === 'RECTANGLE') this.onDrawRectangle(item.position)
    })
    let rectangle = new Rectangle({
      type: "RECTANGLE",
      position: {
        width: this.position.stop.offsetX - this.position.start.offsetX,
        height: this.position.stop.offsetY - this.position.start.offsetY,
        offsetX: this.position.start.offsetX,
        offsetY: this.position.start.offsetY
      },
      active: false,
      strokeStyle: this.props.strokeStyle,
      activeStrokeStyle: this.props.activeStrokeStyle
    })
    rectangle.render(this)
    // let width = this.position.stop.offsetX - this.position.start.offsetX
    // let height = this.position.stop.offsetY - this.position.start.offsetY
    // this.onDrawRectangle({ offsetX: this.position.start.offsetX, offsetY: this.position.start.offsetY, width: width, height: height })
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
      if (item.type === 'POLYGON') this.onDrawPolygon(item.position)
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.position)
    })
    this.onDrawPolyline(this.prevPosPolygon)
    this.ctx.moveTo(this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetX, this.prevPosPolygon[this.prevPosPolygon.length - 1].offsetY);
    this.ctx.lineTo(offsetX, offsetY)
    this.ctx.stroke()
    this.ctx.closePath();
  }
  endPaintEvent() {
    if (this.objectMove) {
      this.objectSelected = { check: false, index: 0, position: {} }
      this.objectMove = false
      this.props.onEndMove(this.line)
    }
    if (this.movePoint) {
      this.plusTwoPoint()
      this.movePoint = false
      this.posMove = { position: {}, index: {} }
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
      let dataBefore = this.line[this.posMove.index.i].position[this.posMove.index.j - 1] ?
        this.line[this.posMove.index.i].position[this.posMove.index.j - 1] :
        this.line[this.posMove.index.i].position[this.line[this.posMove.index.i].position.length - 1]
      let dataAfter = this.line[this.posMove.index.i].position[this.posMove.index.j + 1] ?
        this.line[this.posMove.index.i].position[this.posMove.index.j + 1] :
        this.line[this.posMove.index.i].position[0]

      let before = {
        offsetX: (dataBefore.offsetX + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetX) / 2,
        offsetY: (dataBefore.offsetY + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetY) / 2
      }
      let after = {
        offsetX: (dataAfter.offsetX + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetX) / 2,
        offsetY: (dataAfter.offsetY + this.line[this.posMove.index.i].position[this.posMove.index.j].offsetY) / 2
      }
      this.line[this.posMove.index.i].position.splice(this.posMove.index.j, 0, before);
      this.line[this.posMove.index.i].position.splice(this.posMove.index.j + 2, 0, after);
    }
  }
  endPaintEventRec() {
    this.isPainting = false;
    let width = this.position.stop.offsetX - this.position.start.offsetX
    let height = this.position.stop.offsetY - this.position.start.offsetY

    let rectangle = new Rectangle({
      type: "RECTANGLE",
      position: {
        width: width,
        height: height,
        offsetX: this.position.start.offsetX,
        offsetY: this.position.start.offsetY,
      },
      active: false,
      strokeStyle: this.props.strokeStyle,
      activeStrokeStyle: this.props.activeStrokeStyle
    })
    rectangle.render(this)

    // this.onDrawRectangle({ offsetX: this.position.start.offsetX, offsetY: this.position.start.offsetY, width: width, height: height })
    this.line.push(rectangle)
    this.ctx.stroke()
    this.props.onEndDraw(this.line[this.line.length - 1])
  }
  endPaintEventPol() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.beginPath();
    this.line.map(item => {
      if (item.type === 'POLYGON') this.onDrawPolygon(item.position)
      if (item.type === 'RECTANGLE') this.onDrawRectangle(item.position)
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
  onKeyPress(e) {

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
    }
  }
  onDrawRectangle(position, active) {
    this.ctx.rect(position.offsetX, position.offsetY, position.width, position.height);
    this.ctx.fillStyle = active ? this.props.activeStrokeStyle : this.props.strokeStyle
    this.ctx.fillRect(position.offsetX - 5, position.offsetY - 5, 10, 10);
    this.ctx.fillRect(position.offsetX + position.width - 5, position.offsetY - 5, 10, 10);
    this.ctx.fillRect(position.offsetX - 5, position.offsetY + position.height - 5, 10, 10);
    this.ctx.fillRect(position.offsetX + position.width - 5, position.offsetY + position.height - 5, 10, 10);
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
      // console.log(this.line[activeIndex])
      // if(activeIndex!==-1)
      // this.line[activeIndex].activeItem(this)
      this.drawData()
    }
    if (data !== prevProps.data) {
      let line = clone(data.data)
      for (let i = 0; i < line.length; i++) {
        let item = line[i]
        if (item.type === 'RECTANGLE')
          line[i] = new Rectangle(item)
        if (item.type === 'POLYGON')
          line[i] = new Polygon(item)
      }
      this.line = line
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
      item.render(this)
      // let active = index === this.props.activeIndex
      // if (active) this.ctx.strokeStyle = this.props.activeStrokeStyle
      // if (!active) this.ctx.strokeStyle = this.props.strokeStyle
      // this.ctx.beginPath();
      // if (item.type === 'POLYGON') {
      //   this.onDrawPolygon(item.position, active)
      // }
      // if (item.type === 'RECTANGLE') this.onDrawRectangle(item.position, active)
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
        check = this.checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY, 10) ||
          this.checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY, 10) ||
          this.checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY + item.position.height, 10) ||
          this.checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY + item.position.height, 10)
        if (check) {
          if (this.checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY, 10)) return { check: true, type: item.type, position: { offsetX: item.position.offsetX, offsetY: item.position.offsetY }, index: { i: i, j: 0 }, item: item.position }
          if (this.checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY, 10)) return { check: true, type: item.type, position: { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY }, index: { i: i, j: 1 }, item: item.position }
          if (this.checkRangePoint(offsetX, offsetY, item.position.offsetX + item.position.width, item.position.offsetY + item.position.height, 10)) return { check: true, type: item.type, position: { offsetX: item.position.offsetX + item.position.width, offsetY: item.position.offsetY + item.position.height }, index: { i: i, j: 2 }, item: item.position }
          if (this.checkRangePoint(offsetX, offsetY, item.position.offsetX, item.position.offsetY + item.position.height, 10)) return { check: true, type: item.type, position: { offsetX: item.position.offsetX, offsetY: item.position.offsetY + item.position.height }, index: { i: i, j: 3 }, item: item.position }
        }
      }
      if (item.type === "POLYGON") {
        for (let j = 0; j < item.position.length; j++) {
          let point = item.position[j]
          check = this.checkRangePoint(offsetX, offsetY, point.offsetX, point.offsetY, 10)
          if (check) {
            return { check: true, type: item.type, position: { offsetX: point.offsetX, offsetY: point.offsetY }, index: { i: i, j: j } }
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
      let intersect = ((yi > y) !== (yj > y))
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
        tabIndex="0"
        ref={(ref) => (this.canvas = ref)}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        onMouseDown={this.onMouseDown}
        onMouseLeave={this.endPaintEvent}
        onMouseUp={this.endPaintEvent}
        onMouseMove={this.onMouseMove}
        onMouseOut={this.onMouseOut}
        onKeyPress={this.onKeyPress}
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
