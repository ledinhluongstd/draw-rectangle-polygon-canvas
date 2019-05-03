export default class Polygon {
  constructor(args) {
    this.position = args.position
    this.active = args.active
    this.activeStrokeStyle = args.activeStrokeStyle
    this.strokeStyle = args.strokeStyle
    this.type = "POLYGON"
    this.enableMove = true
    this.display = args.display //|| true
  }
  activeItem(self) {

  }

  destroy() {

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
  render(self) {
    if (!this.display) return null
    const context = self.ctx;
    const points = this.position
    let offsetXAvg = 0, offsetYAvg = 0
    let offsetXText = 0, offsetYText = 0
    context.beginPath();
    context.moveTo(points[0].offsetX, points[0].offsetY);
    offsetXAvg += points[0].offsetX / points.length
    offsetYAvg += points[0].offsetY / points.length
    for (let i = 1; i < points.length; i++) {
      let item = points[i]
      context.strokeStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
      context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
      if (this.active && this.enableMove) {
        context.fillRect(points[i - 1].offsetX - 5, points[i - 1].offsetY - 5, 10, 10);
        context.fillRect(item.offsetX - 5, item.offsetY - 5, 10, 10);
      }
      context.moveTo(points[i - 1].offsetX, points[i - 1].offsetY);
      context.lineTo(item.offsetX, item.offsetY)
      offsetXAvg += points[i].offsetX / points.length
      offsetYAvg += points[i].offsetY / points.length
    }
    context.moveTo(points[points.length - 1].offsetX, points[points.length - 1].offsetY);
    context.lineTo(points[0].offsetX, points[0].offsetY)
    if (this.checkPointInsideObject({ offsetX: offsetXAvg, offsetY: offsetYAvg }, this.position)) {
      offsetXText = offsetXAvg
      offsetYText = offsetYAvg
    } else {
      offsetXText = points[0].offsetX
      offsetYText = points[0].offsetY
    }
    context.font = "bold 15px Arial";
    context.fillRect(offsetXText - (context.measureText("Xin chào").width / 2), offsetYText, context.measureText("Xin chào").width + 15, 20);
    context.fillStyle = "#ffffff"
    context.fillText('Xin chào', offsetXText - (context.measureText("Xin chào").width / 2) + 5, offsetYText + 15)
    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
    context.closePath();
    context.stroke();
  }
}
