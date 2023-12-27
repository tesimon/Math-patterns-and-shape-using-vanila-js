const shapesSelect = document.getElementById("shapesSelect");
const zoomRangeInput = document.getElementById("zoomRangeInput");

const canvas = document.getElementById("canvas");

//setting the width and height of the canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";

//getting the 2d context
const ctx = canvas.getContext("2d");

//gradient for the fill effect which took me almost 10 minutes to figure out haha
let gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
gradient.addColorStop(0, `cyan`);
gradient.addColorStop(0.2, `#9932CC`);
gradient.addColorStop(0.5, "#F8F8FF");
gradient.addColorStop(0.8, `#9932CC`);
gradient.addColorStop(1, "cyan");
ctx.lineWidth = 0.5;
ctx.strokeStyle = gradient;

class Particle {
  constructor(effect) {
    this.effect = effect;
    this.x = Math.floor(this.effect.width * Math.random());
    this.y = Math.floor(this.effect.height * Math.random());
    this.speedX;
    this.speedY;
    this.speedIncrease = Math.random() * 2 - 0.4;
    this.history = [{ x: this.x, y: this.y }];
    this.maxHistory = Math.floor(Math.random() * 50 - 2);
    this.angle;
    this.timer = this.maxHistory * 2;
    window.addEventListener("resize", () => {
      this.reset();
    });
  }
  draw(context) {
    context.beginPath();
    context.moveTo(this.history[0].x, this.history[0].y);
    for (let i = 0; i < this.history.length; i++) {
      context.lineTo(this.history[i].x, this.history[i].y);
    }
    context.stroke();
  }

  update() {
    this.timer--;
    if (this.timer >= 1) {
      let x = Math.floor(this.x / this.effect.projectile);
      let y = Math.floor(this.y / this.effect.projectile);
      let index = y * this.effect.cols + x;
      this.angle = this.effect.flowField[index];
      this.speedX = Math.cos(this.angle) * 2;
      this.speedY = Math.sin(this.angle) * 2;
      this.x += this.speedX * this.speedIncrease;
      this.y += this.speedY * this.speedIncrease;
      this.history.push({ x: this.x, y: this.y });
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    } else if (this.history.length > 1) {
      this.history.shift();
    } else {
      this.reset();
    }
  }

  reset() {
    this.x = Math.floor(this.effect.width * Math.random());
    this.y = Math.floor(this.effect.height * Math.random());
    this.history = [{ x: this.x, y: this.y }];
    this.timer = this.maxHistory * 2;
  }
}

class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.particles = [];
    this.numOfParticles = 10000;
    this.zoomRangeInput = zoomRangeInput;
    this.projectile = 5;
    this.rows;
    this.cols;
    this.curves = 2;
    //zoom levels = 0.15 / 0.09 / 0.04 / /0.03 / 0.02 / 0.009 /
    this.zoom = 0.09;
    this.zoomLevels = [0.07, 0.09, 0.04, 0.03, 0.02, 0.009];
    this.flowField = [];
    this.init();
    this.initZoomInput();
    this.shapesSelect = shapesSelect;
    this.initShapesSelect();
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.particles = [];
      this.init();
      this.renderer(ctx);
    });
  }
  initZoomInput() {
    this.zoomRangeInput.addEventListener("input", () => {
      this.zoom = this.getZoomLevelFromInput();
      this.updateBasedOnZoom();
    });
  }
  updateShapes() {
    this.particles = [];
    this.init();
    this.renderer(ctx);
  }
  initShapesSelect() {
    this.shapesSelect.addEventListener("change", () => {
      // Get the selected value
      const selectedValue = shapesSelect.value;
      if (selectedValue === "spiral") {
        this.curves = 25;
        this.zoom = this.zoomLevels[1];
        this.zoomRangeInput.value = 1;
      } else {
        this.zoom = this.zoomLevels[1];
        this.zoomRangeInput.value = 1;
        this.curves = 2;
      }
      this.updateShapes();
    });
  }

  getZoomLevelFromInput() {
    if (this.zoomRangeInput.value < 1) {
      this.projectile = 1;
    } else this.projectile = 5;
    return this.zoomLevels[this.zoomRangeInput.value];
  }

  updateBasedOnZoom() {
    this.particles = [];
    this.init(); // Reinitialize the effect based on the updated zoom level
    this.renderer(ctx); // Redraw the effect
  }

  init() {
    //initialize the flow field
    this.rows = Math.floor(this.height / this.projectile);
    this.cols = Math.floor(this.width / this.projectile);
    this.flowField = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        // let rAngle = (r / this.rows) * Math.PI;
        let angleFlow =
          (Math.cos(r * this.zoom) + Math.sin(c * this.zoom)) * this.curves;
        this.flowField.push(angleFlow);
      }
    }
    for (let i = 0; i < this.numOfParticles; i++) {
      this.particles.push(new Particle(this));
    }
  }

  renderer(context) {
    this.particles.forEach((particle) => {
      particle.draw(context);
      particle.update();
    });
  }
}

// Create an instance of the Effect class
const effect = new Effect(canvas.width, canvas.height);

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  effect.renderer(ctx);
  requestAnimationFrame(animate);
}
// Start the animation
animate();
