// import Bullet from './Bullet';
// import Particle from './Particle';
// import { rotatePoint, randomNumBetween } from './helpers';

export default class Rectangle {
  constructor(args) {
    // console.log(args)
    this.position = args.position
    this.active = args.active
    this.activeStrokeStyle = args.activeStrokeStyle
    this.strokeStyle = args.strokeStyle
    this.type = "RECTANGLE"
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
    // console.log(1)
    // this.active = true
    // this.render(self)
    // this.forceUpdate()
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

  render(self) {
    // console.log('1111111111111111111111111111111111111111111111111111')
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
    if(!this.display) return null
    // console.log('1111')
    const context = self.ctx;
    let offsetXAvg = 0, offsetYAvg = 0

    // context.save();
    // context.translate(this.position.x, this.position.y);
    // context.rotate(this.rotation * Math.PI / 180);
    //context.strokeStyle = '#ffffff';
    //context.fillStyle = '#000000';
    //context.lineWidth = 2;
    context.beginPath();
    context.strokeStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
    context.fillStyle = this.active ? this.activeStrokeStyle : this.strokeStyle
    context.rect(this.position.offsetX, this.position.offsetY, this.position.width, this.position.height);
    if (this.active) {
      context.fillRect(this.position.offsetX - 5, this.position.offsetY - 5, 10, 10);
      context.fillRect(this.position.offsetX + this.position.width - 5, this.position.offsetY - 5, 10, 10);
      context.fillRect(this.position.offsetX - 5, this.position.offsetY + this.position.height - 5, 10, 10);
      context.fillRect(this.position.offsetX + this.position.width - 5, this.position.offsetY + this.position.height - 5, 10, 10);
    }
    offsetXAvg = this.position.width < 0 ? this.position.offsetX + this.position.width : this.position.offsetX
    offsetYAvg = this.position.height < 0 ? this.position.offsetY + this.position.height : this.position.offsetY

    context.font = "bold 15px Arial";
    context.fillRect(offsetXAvg, offsetYAvg, context.measureText("Xin chào").width + 15, 20);
    context.fillStyle = "#ffffff"
    context.fillText('Xin chào', offsetXAvg + 5, offsetYAvg + 15)
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
