export default class Rectangle {
  constructor(args) {
    this.position = args.position
    this.active = args.active
    this.activeStrokeStyle = args.activeStrokeStyle
    this.strokeStyle = args.strokeStyle
    this.type = "RECTANGLE"
    this.enableMove = true
    this.display = args.display
  }

  activeItem(self) {

  }

  render(self) {
    if (!this.display) return null
    const context = self.ctx;
    let offsetXAvg = 0, offsetYAvg = 0
    context.beginPath();
    context.strokeStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
    context.rect(this.position.offsetX, this.position.offsetY, this.position.width, this.position.height);
    if (this.active && this.enableMove) {
      context.fillRect(this.position.offsetX - 5, this.position.offsetY - 5, 10, 10);
      context.fillRect(this.position.offsetX + this.position.width - 5, this.position.offsetY - 5, 10, 10);
      context.fillRect(this.position.offsetX - 5, this.position.offsetY + this.position.height - 5, 10, 10);
      context.fillRect(this.position.offsetX + this.position.width - 5, this.position.offsetY + this.position.height - 5, 10, 10);
    }
    offsetXAvg = this.position.width < 0 ? this.position.offsetX + this.position.width : this.position.offsetX
    offsetYAvg = this.position.height < 0 ? this.position.offsetY + this.position.height : this.position.offsetY
    context.font = "bold 15px Arial";
    context.fillRect(offsetXAvg - 1, offsetYAvg - 20, context.measureText("Xin chào").width + 15, 20);
    context.fillStyle = "#ffffff"
    context.fillText('Xin chào', offsetXAvg + 5, offsetYAvg - 5)
    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
    context.closePath();
    context.stroke();
  }
}
