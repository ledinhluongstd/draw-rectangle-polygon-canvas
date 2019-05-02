// import Bullet from './Bullet';
// import Particle from './Particle';
// import { rotatePoint, randomNumBetween } from './helpers';

export default class Polygon {
  constructor(args) {
    // console.log(args)
    this.position = args.position
    this.active = args.active
    this.activeStrokeStyle = args.activeStrokeStyle
    this.strokeStyle = args.strokeStyle
    this.type = "POLYGON"
    this.active = args.active || false
    this.enableMove = args.enableMove
    this.display = args.display //|| true
    // this.position = args.position
    // this.velocity = {
    //   x: 0,
    //   y: 0
    // }
    // this.rotation = 0;
    // this.rotationSpeed = 6;
    // this.speed = 0.15;
    // this.inertia = 0.99;
    // this.radius = 20;
    // this.lastShot = 0;
    // this.create = args.create;
    // this.onDie = args.onDie;
  }
  activeItem(self) {
    // console.log(2)
    // this.active = true
    // this.render(self)
    // this.forceUpdate()
  }
  destroy() {

  }
  // destroy(){
  //   this.delete = true;
  //   this.onDie();

  //   // Explode
  //   for (let i = 0; i < 60; i++) {
  //     const particle = new Particle({
  //       lifeSpan: randomNumBetween(60, 100),
  //       size: randomNumBetween(1, 4),
  //       position: {
  //         x: this.position.x + randomNumBetween(-this.radius/4, this.radius/4),
  //         y: this.position.y + randomNumBetween(-this.radius/4, this.radius/4)
  //       },
  //       velocity: {
  //         x: randomNumBetween(-1.5, 1.5),
  //         y: randomNumBetween(-1.5, 1.5)
  //       }
  //     });
  //     this.create(particle, 'particles');
  //   }
  // }

  // rotate(dir){
  //   if (dir == 'LEFT') {
  //     this.rotation -= this.rotationSpeed;
  //   }
  //   if (dir == 'RIGHT') {
  //     this.rotation += this.rotationSpeed;
  //   }
  // }

  // accelerate(val){
  //   this.velocity.x -= Math.sin(-this.rotation*Math.PI/180) * this.speed;
  //   this.velocity.y -= Math.cos(-this.rotation*Math.PI/180) * this.speed;

  //   // Thruster particles
  //   let posDelta = rotatePoint({x:0, y:-10}, {x:0,y:0}, (this.rotation-180) * Math.PI / 180);
  //   const particle = new Particle({
  //     lifeSpan: randomNumBetween(20, 40),
  //     size: randomNumBetween(1, 3),
  //     position: {
  //       x: this.position.x + posDelta.x + randomNumBetween(-2, 2),
  //       y: this.position.y + posDelta.y + randomNumBetween(-2, 2)
  //     },
  //     velocity: {
  //       x: posDelta.x / randomNumBetween(3, 5),
  //       y: posDelta.y / randomNumBetween(3, 5)
  //     }
  //   });
  //   this.create(particle, 'particles');
  // }
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
    // console.log('222222222222222222222222222222222')

    // console.log(this)
    // console.log(self)
    // // Controls
    // if (state.keys.up) {
    //   this.accelerate(1);
    // }
    // if (state.keys.left) {
    //   this.rotate('LEFT');
    // }
    // if (state.keys.right) {
    //   this.rotate('RIGHT');
    // }
    // if (state.keys.space && Date.now() - this.lastShot > 300) {
    //   const bullet = new Bullet({ ship: this });
    //   this.create(bullet, 'bullets');
    //   this.lastShot = Date.now();
    // }

    // // Move
    // this.position.x += this.velocity.x;
    // this.position.y += this.velocity.y;
    // this.velocity.x *= this.inertia;
    // this.velocity.y *= this.inertia;

    // // Rotation
    // if (this.rotation >= 360) {
    //   this.rotation -= 360;
    // }
    // if (this.rotation < 0) {
    //   this.rotation += 360;
    // }

    // // Screen edges
    // if (this.position.x > state.screen.width) this.position.x = 0;
    // else if (this.position.x < 0) this.position.x = state.screen.width;
    // if (this.position.y > state.screen.height) this.position.y = 0;
    // else if (this.position.y < 0) this.position.y = state.screen.height;

    // Draw
    if (!this.display) return null

    const context = self.ctx;
    const points = this.position
    let offsetXAvg = 0, offsetYAvg = 0
    let offsetXText = 0, offsetYText = 0
    // context.save();
    // context.translate(this.position.x, this.position.y);
    // context.rotate(this.rotation * Math.PI / 180);
    //context.strokeStyle = '#ffffff';
    //context.fillStyle = '#000000';
    //context.lineWidth = 2;
    context.beginPath();


    context.moveTo(points[0].offsetX, points[0].offsetY);
    offsetXAvg += points[0].offsetX / points.length
    offsetYAvg += points[0].offsetY / points.length

    for (let i = 1; i < points.length; i++) {
      let item = points[i]
      context.strokeStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
      context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
      if (this.active) {
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

    // context.fillRect(offsetXText, offsetYText, 70, 20);
    context.font = "bold 15px Arial";
    context.fillRect(offsetXText - (context.measureText("Xin chào").width / 2), offsetYText, context.measureText("Xin chào").width + 15, 20);
    context.fillStyle = "#ffffff"

    context.fillText('Xin chào', offsetXText - (context.measureText("Xin chào").width / 2) + 5, offsetYText + 15)

    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle

    // context.lineTo(100, 100);
    // context.lineTo(200, 200);
    // context.lineTo(300, 300);
    // context.lineTo(400, 400);



    context.closePath();
    // context.fill();
    context.stroke();
    // context.restore();
  }
}
