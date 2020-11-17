// SETTINGS
let fps, show_fps; // frames per second
let show_progress; // show progress line
let show_instructions; // show instructions panel
let duration; // seconds
let rows, cols; // items number
let item_scl; // item scale
let sketch_scl, progress_scl, recording_scl; // scale
let current_mode, next_mode, modes; // modes fsm
let recording, capturer, p5canvas;

let progress, total_frames;
let noise_radius, noise_scl;
let noise_items;
let font;

function preload() {
}

function setup() {
  // SETTINGS
  fps = 60;
  show_fps = false;
  show_progress = false;
  show_instructions = false;
  duration = 15;
  sketch_scl = 0.75;
  progess_scl = 0.8;
  recording_scl = 0.95;
  item_scl = 0.8;
  rows = 25;
  cols = 25;
  noise_radius = 1.5;
  noise_scl = 0.0007;
  next_mode = 0;
  recording = true;

  // canvas creation
  let w, h;
  w = 900;
  h = 900;
  p5canvas = createCanvas(w, h);
  p5canvas.parent('sketch');

  // INITIALIZATION
  current_mode = null;
  progress = 0;
  total_frames = fps * duration;
  setNoiseSeed(); // noise initalization
  modes = ["arcs_1", "arcs_2", "bars", "blobs", "circles_1", "circles_2", "circles_squares", "clocks", "compasses", "constellations", "cosines_1", "cosines_2", "cosines_3", "crosses", "diagonal_lines", "dices", "ellipses", "grids", "half_circles", "hearts", "hollow_circles", "letters_1", "letters_2", "lines_1", "lines_2", "lines_3", "lines_4", "lines_5", "orbits", "pacmen", "polygons_1", "polygons_2", "spirals", "squares_1", "squares_2", "squares_3", "squares_4", "triangles", "wheels", "wifi"];
  if (recording) {
    modes.sort(); // alphabetical sorting
  } else {
      modes = shuffle(modes); // random order
  }

  let scl = height / rows;
  noise_items = [];
  for (let i = 0; i < rows * cols; i++) {
    let x, y; // coordinates of each items center
    x = i % cols * scl + scl/2;
    y = Math.floor(i / cols) * scl + scl/2;
    noise_items.push(
      new NoiseItem(x, y, scl * item_scl, modes[current_mode])
    );
  }

  // skecth settings
  frameRate(fps);
  font = loadFont("/assets/fonts/Roboto-Regular.ttf");
}

function draw() {
  if (current_mode != next_mode) {
    // update mode
    current_mode = next_mode;
    // update all items
    noise_items.forEach((n, i) => {
      n.setMode(modes[current_mode]);
    });
  }

  // progess and noise position calculation
  let percent = progress / total_frames;
  let ntheta, nx, ny;
  ntheta = percent * TWO_PI;
  nx = noise_radius * (cos(ntheta) + 1);
  ny = noise_radius  * (sin(ntheta) + 1);

  // start recording
  if (progress === 0 && recording) {
    capturer = new CCapture({
      format: 'png',
      framerate: fps,
      motionBlurFrames: 1,
      name: `${current_mode}_perlin_${modes[current_mode]}`
    });

    capturer.start();

    console.log("Started recording mode", current_mode + 1, "out of", modes.length, "mode name", modes[current_mode]);
  }

  // background reset
  background(0);
  blendMode(BLEND);

  // show fps
  if (show_fps) {
    push();
    textFont(font);
    textSize(32);
    fill(255);
    noStroke();
    text(Math.floor(frameRate()), 50, 50);
    pop();
  }

  // progress
  if (show_progress) {
    push();
    if (!recording) { // do not scale if recording
      translate(width/2, height/2);
      scale(progess_scl);
      translate(-width/2, -height/2);
    } else {
      translate(width/2, height/2);
      scale(recording_scl);
      translate(-width/2, -height/2);
    }

    strokeWeight(2);
    stroke(255);
    let line_len;
    if (percent >= 0) { // first 25%
      if (percent > 0.25) {
        line_len = width;
      } else {
        line_len = percent * width * 4;
      }
      line(0, 0, line_len, 0);
    }

    if (percent >= .25) {
      if (percent > 0.5) {
        line_len = height;
      } else {
        line_len = (percent - .25) * height * 4;
      }
      line(width, 0, width, line_len);
    }

    if (percent >= .5) {
      if (percent > 0.75) {
        line_len = width;
      } else {
        line_len = (percent - .5) * width * 4;
      }
      line(width, height, width - line_len, height);
    }

    if (percent >= .75) {
      if (percent > 1) {
        line_len = height;
      } else {
        line_len = (percent - .75) * height * 4;
      }
      line(0, height, 0, height - line_len);
    }
    pop();
  }

  // scaling start
  push();
  if (!recording) { // do not scale if recording
    translate(width/2, height/2);
    scale(sketch_scl);
    translate(-width/2, -height/2);
  } else {
    translate(width/2, height/2);
    scale(recording_scl);
    translate(-width/2, -height/2);
  }

  // show items
  noise_items.forEach((n, i) => {
    n.update(nx, ny);
    n.show();
  });

  // scaling end
  pop();

  // show instructions
  if (show_instructions) {
    push();
    let newl = "\n";
    let tab = "\t";
    let text_instructions = `instructions:${newl}${tab}click on the canvas to cycle through the animations${newl}${tab}use arrow keys to navigate through animations${newl}${tab}press space bar to reset animation${newl}${tab}press enter to record${newl}${tab}use F to show fps${newl}${tab}use P to draw a progress line${newl}${tab}use I to toggle informations panel`;
    textFont(font);
    rectMode(CENTER);
    translate(width/2, height/2);
    stroke(255);
    strokeWeight(2);
    fill(0, 220);
    rect(0, 0, width * sketch_scl * .9, height * sketch_scl * .9 / 2);
    noStroke();
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text(text_instructions, 0, 0);
    pop();
  }

  // record frame
  if (recording) {
    capturer.capture(document.getElementById(p5canvas.canvas.id));
  }

  // progress update
  progress++;
  if (progress > total_frames) {
    progress = 0;

    // stops recording
    if (recording) {
      capturer.stop();
      capturer.save();
      console.log("Completed recording mode", current_mode + 1);

      next_mode = current_mode + 1;
      if (next_mode >= modes.length) {
        recording = false;
        next_mode = 0;
        console.log("RECORDING COMPLETE");
      }
    }
  }
}


class NoiseItem {
  constructor(x, y, scl, mode) {
    this.position = createVector(x, y);
    this.noise_position = this.position.copy().mult(noise_scl);
    this.scl = scl;
    this.mode = mode;

    this.noise_value;
    this.color = 255;
  }

  show() {
    push();
    translate(this.position.x, this.position.y);
    strokeWeight(2);
    if (this.mode === "arcs_1") {
      let amplitude = map(this.noise_value, -1, 1, 0, -TWO_PI);
      let alpha = map(this.noise_value, -1, 1, 0, 255);

      noFill();
      stroke(this.color, alpha);
      arc(0, 0, this.scl/2, this.scl/2, amplitude * 2, amplitude);
    } else if (this.mode === "arcs_2") {
      let phi = map(this.noise_value, -1, 1, 0, PI);
      let alpha = map(this.noise_value, -1, 1, 0, 255);
      let scl = 0.8;

      rotate(-PI/2  - phi);
      scale(scl);
      translate(0, this.scl / 2);
      noStroke();
      fill(this.color, alpha);
      arc(0, 0, this.scl, this.scl, -phi, phi);
    } else if (this.mode === "bars") {
      let h = map(this.noise_value, -1, 1, 0, this.scl);
      let bars = 6;
      let w = this.scl / bars;
      let scl = 0.8;

      noStroke();
      fill(this.color);
      translate(-this.scl/2, this.scl/2);

      for (let i = 0; i < bars; i++) {
        let current_h = h * (i + 1);
        while (current_h > this.scl) current_h -= this.scl;

        push();
        translate(w * (i + 0.5), 0);
        scale(scl, 1);
        rect(0, 0, w, -current_h);
        pop();
      }
    } else if (this.mode === "blobs") {
      let rho = map(this.noise_value, -1, 1, this.scl/3, this.scl/2);
      let sides = map(this.noise_value, -1, 1, 3, 15);
      let phi = this.noise_value * PI/2;
      let alpha = map(this.noise_value, -1, 1, 100, 255);

      noStroke();
      fill(this.color, alpha);
      beginShape();
      for (let i = 0; i < sides; i++) {
        let theta = TWO_PI / sides * i + phi;
        let d_rho = cos(theta) * this.scl / 4;
        let vx, vy;
        vx = (rho + d_rho) * cos(theta);
        vy = (rho + d_rho) * sin(theta);
        curveVertex(vx, vy);
      }
      endShape();
    } else if (this.mode === "circles_1") {
      let scl = Math.abs(this.noise_value);

      scale(scl);
      noStroke();
      fill(this.color);
      circle(0, 0, this.scl);
    } else if (this.mode === "circles_2") {
      let size = map(this.noise_value, -1, 1, 0, this.scl * 3);
      let alpha = map(this.noise_value, -1, 1, 50, 255);

      noFill();
      stroke(this.color, alpha);
      circle(0, 0, size);
    } else if (this.mode === "circles_squares") {
      let square_scl = map(this.noise_value, -1, 1, 0, this.scl);
      let circle_scl = map(this.noise_value, -1, 1, this.scl * Math.sqrt(2), 0);
      let rotation = map(this.noise_value, -1, 1, 0, TWO_PI);

      rotate(PI/4 + rotation);
      noFill();
      stroke(this.color);
      strokeWeight(1);
      rectMode(CENTER);
      rect(0, 0, square_scl);
      circle(0, 0, circle_scl);
    } else if (this.mode === "clocks") {
      let seconds = map(this.noise_value, -1, 1, 0, 86400) / 4;
      let hours = Math.floor(seconds / 3600) + 6;
      let minutes = Math.floor(seconds % 3600 / 60);
      let rotation;

      stroke(this.color);
      noFill();
      circle(0, 0, this.scl);


      push();
      rotation = minutes / 60 * TWO_PI - PI;
      rotate(rotation);
      line(0, 0, 0, this.scl / 2 * .7);
      pop();

      push();
      rotation = hours / 60 * TWO_PI - PI;
      rotate(rotation);
      line(0, 0, 0, this.scl / 2 * .4);
      pop();
    } else if (this.mode === "compasses") {
      let rotation = this.noise_value * TWO_PI * 3;
      let scl = 0.6;

      noFill();
      strokeWeight(1);
      stroke(this.color);
      circle(0, 0, this.scl, this.scl);
      scale(scl);
      rotate(rotation);
      noStroke();
      fill(this.color);
      rectMode(CENTER);
      rect(0, 0, this.scl / 12, this.scl);
      triangle(0, -this.scl / 2, -this.scl / 6, -this.scl / 8, this.scl / 6, -this.scl / 8);
    } else if (this.mode === "constellations") {
      let stars = map(this.noise_value, -1, 1, 2, 4);
      let index = Math.floor(stars);
      let primes = [211, 223, 227, 229, 233]

      noStroke();
      fill(this.color);

      for (let i = 0; i < index; i++) {
        let sx, sy;
        sx = stars * primes[index];
        while (sx > this.scl) sx -= this.scl;
        sy = stars * primes[index + 1];
        while (sy > this.scl) sy -= this.scl;


        circle(sx, sy, this.scl / 10);
      }
    } else if (this.mode === "cosines_1") {
      let phi = this.noise_value * TWO_PI * 3;
      let points = 50;
      let periods = 1.5;
      let scl = 0.8;

      scale(scl);
      translate(-this.scl/2, 0);
      noFill();
      stroke(this.color);
      beginShape();
      for (let i = 0; i < points; i++) {
        let cx, cy, theta;
        theta = TWO_PI / points * i * periods;
        cx = this.scl / points * i;
        cy = this.scl / 2 * cos(theta + phi)
        curveVertex(cx, cy);
      }
      endShape();
    }  else if (this.mode === "cosines_2") {
      let points = 50;
      let phi = map(this.noise_value, -1, 1, 0, TWO_PI);
      let periods = map(this.noise_value, -1, 1, 1, 4);
      let weight = map(this.noise_value, -1, 1, 1, 3);
      let scl = 0.8;

      scale(scl);
      translate(-this.scl / 2, 0);
      noFill();
      stroke(this.color);
      strokeWeight(weight);
      beginShape();
      for (let i = 0; i < points; i++) {
        let cx, cy, theta;
        theta = TWO_PI / points * i * periods;
        cx = this.scl / points * i;
        cy = this.scl / 2 * cos(theta + phi)
        curveVertex(cx, cy);
      }
      endShape();
    } else if (this.mode === "cosines_3") {
      let points = 50;
      let scl = 0.8;
      let alpha = TWO_PI * this.noise_value;
      let beta = TWO_PI * this.noise_value * 7;
      let weight = map(this.noise_value, -1, 1, 1, 3);

      translate(0, -this.scl/2);
      stroke(this.color);
      strokeWeight(weight);
      noFill();
      beginShape();
      for (let i = 0; i < points; i++) {
        let cx, cy, theta, gamma;
        theta = TWO_PI / points * i * 3 + alpha;
        gamma = PI / points * i + alpha;

        cy = this.scl / points * i;
        cx = this.scl / 2 * sin(theta) * sin(gamma);
        curveVertex(cx, cy);
      }
      endShape();
    } else if (this.mode === "crosses") {
      let theta = this.noise_value * TWO_PI;

      rotate(theta);
      stroke(this.color);
      line(-this.scl/2, 0, this.scl/2, 0);
      line(0, -this.scl/2, 0, this.scl/2);
    } else if (this.mode === "diagonal_lines") {
      let len = map(this.noise_value, -1, 1, 0, this.scl * Math.sqrt(2));
      let weight = map(this.noise_value, -1, 1, 0, 5);

      push();
      rotate(-PI/4);
      stroke(this.color);
      strokeWeight(weight);
      noFill();
      line(-len/2, 0, len/2, 0);
      pop();
    } else if (this.mode === "dices") {
      let dices = [16, 257, 273, 325, 341, 365]; // binary values of black dots
      let index = Math.floor(map(this.noise_value, -1, 1, 0, dices.length));
      let scl = 0.7;

      push();
      scale(scl);
      translate(-this.scl/2, -this.scl/2);
      noStroke();
      fill(this.color);
      for (let i = 0; i < 9; i++) {
        let bit = dices[index] & 1 << i; // bit masking

        if (bit != 0) {
          let x, y;
          x = i % 3 * this.scl / 3 + this.scl / 6;
          y = Math.floor(i / 3) * this.scl / 3 + this.scl / 6;
          circle(x, y, this.scl/5);
        }
      }
      pop();
    } else if (this.mode === "ellipses") {
      let smin = .2;
      let sx = map(this.noise_value, -1, 1, smin, 1) * this.scl; // ellipse eccentricity
      let sy = map(this.noise_value, -1, 1, 1, smin) * this.scl; // ellipse eccentricity
      let weight = map(this.noise_value, -1, 1, 0, 5);

      noFill();
      stroke(this.color);
      strokeWeight(weight)
      ellipse(0, 0, sx, sy);
    } else if (this.mode === "grids") {
      let grid = [256, 384, 448, 480, 496, 504, 508, 510, 511]; // empty to full grid
      let index = Math.floor(map(this.noise_value, -1, 1, 0, 9));
      let scl = 0.7;

      rotate(PI);
      translate(-this.scl/2, -this.scl/2);
      rectMode(CENTER);
      noStroke();

      for (let i = 0; i < 9; i++) {
        let bit = grid[index] & 1 << i; // bit masking

        if (bit != 0) {
          let x, y;
          x = i % 3 * this.scl / 3 + this.scl / 3;
          y = Math.floor(i / 3) * this.scl / 3 + this.scl / 3;
          push();
          scale(scl);
          rect(x, y, this.scl /3 * scl);
          pop();
        }
      }
    } else if (this.mode === "half_circles") {
      let rotation = map(this.noise_value, -1, 1, 0, TWO_PI);
      let alpha = map(this.noise_value, -1, 1, 0, 255);

      rotate(rotation);
      stroke(this.color, alpha);
      noFill();
      circle(0, 0, this.scl);
      fill(this.color, alpha);
      arc(0, 0, this.scl, this.scl, PI, TWO_PI);
    } else if (this.mode === "hearts") {
      let scl = map(this.noise_value, -1, 1, 0.2, 1.2);
      let phi = this.noise_value * PI/2;
      let size = this.scl / Math.sqrt(2) / 2;
      let alpha = map(this.noise_value, -1, 1, 0, 255);

      noStroke();
      fill(this.color, alpha);

      push();
      scale(scl);
      rotate(-PI/4 + phi);
      rectMode(CENTER);
      rect(0, 0, size, size);
      circle(size/2, 0, size);
      circle(0, -size/2, size);
      pop();
    } else if (this.mode === "hollow_circles") {
      let outer_size = this.scl;
      let inner_size = map(this.noise_value, -1, 1, 0, this.scl * .98);

      noStroke();
      fill(this.color);
      circle(0, 0, outer_size);
      fill(0);
      circle(0, 0, inner_size);
    } else if (this.mode === "letters_1") {
      let letters = ["A", "B", "C", "D", "E", "F"];
      let index = Math.floor(map(this.noise_value, -1, 1, 0, letters.length));
      let current_letter = letters[index];

      textFont(font);
      textSize(this.scl * 1.25);
      fill(this.color);
      textAlign(CENTER, CENTER);
      rectMode(CENTER);
      text(current_letter, 0, 0);
    } else if (this.mode === "letters_2") {
      let number = Math.floor(map(this.noise_value, -1, 1, 0, 6));

      textFont(font);
      textSize(this.scl * 1.25);
      fill(this.color);
      textAlign(CENTER, CENTER);
      rectMode(CENTER);
      text(number, 0, 0);
    } else if (this.mode === "lines_1") {
      let theta = this.noise_value * TWO_PI;
      let scl = 0.9;

      scale(scl);
      rotate(theta);
      stroke(this.color);
      line(0, 0, this.scl, 0);
    } else if (this.mode === "lines_2") {
      let scl = Math.abs(this.noise_value);

      stroke(this.color);
      line(-this.scl/2 * scl, 0, this.scl/2 * scl, 0);
      line(0, -this.scl/2 * (1-scl), 0, this.scl/2 * (1-scl));
    } else if (this.mode === "lines_3") {
      let directions = 8;
      let rotation = Math.floor(map(this.noise_value, -1, 1, 0, directions)) * TWO_PI / directions;
      let phi = PI/2;

      rotate(rotation + phi);
      stroke(this.color);
      noFill();
      line(0, 0, this.scl, 0);
    } else if (this.mode === "lines_4") {
      let rotation = this.noise_value * PI;

      push();
      stroke(this.color);
      rotate(rotation);
      line(0, -this.scl/2, 0, this.scl/2);
      rotate(-2*rotation);
      line(0, -this.scl/2, 0, this.scl/2);
      pop();
    } else if (this.mode === "lines_5") {
      let dh = this.noise_value * this.scl / 2;
      let weight = map(this.noise_value, -1, 1, 0, 5);
      let scl = 0.75;

      noFill();
      stroke(this.color);
      strokeWeight(weight);
      line(-this.scl/2 * scl, dh, this.scl/2 * scl, dh);
    } else if (this.mode === "orbits") {
      let rotation = this.noise_value * TWO_PI;
      stroke(this.color);
      noFill();
      rotate(rotation);
      translate(this.scl, 0);
      circle(0, 0, this.scl / 10);
    } else if (this.mode === "pacmen") {
      let opening = map(this.noise_value, -1, 1, 0, PI/2);
      let size = map(this.noise_value, -1, 1, 0, this.scl)
      let alpha = map(this.noise_value, -1, 1, 0, 255);

      noStroke();
      fill(this.color, alpha);
      arc(0, 0, size, size, opening, TWO_PI - opening)
    } else if (this.mode === "polygons_1") {
      let sides = Math.floor(map(this.noise_value, -1, 1, 3, 8));
      let phi = -PI/2;
      stroke(this.color);
      noFill();
      beginShape();
      for (let i = 0; i < sides; i++) {
        let theta, vx, vy;
        theta = TWO_PI / sides * i + phi;
        vx = this.scl / 2 * cos(theta);
        vy = this.scl / 2 * sin(theta);
        vertex(vx, vy);
      }
      endShape(CLOSE);
    } else if (this.mode === "polygons_2") {
      let sides = Math.floor(map(this.noise_value, -1, 1, 3, 8));
      let rho = map(this.noise_value, -1, 1, this.scl / 8, this.scl / 2);
      let phi = -PI/2;
      stroke(this.color);
      noFill();
      beginShape();
      for (let i = 0; i < sides; i++) {
        let theta, vx, vy;
        theta = TWO_PI / sides * i + phi;
        vx = rho * cos(theta);
        vy = rho * sin(theta);
        vertex(vx, vy);
      }
      endShape(CLOSE);
    } else if (this.mode === "spirals") {
      let len = map(this.noise_value, -1, 1, 2 * PI, 10 * PI);
      let points = 50;
      // following values determined in desmos
      let scl = 1 / 6.2;
      let a = 3.1;
      let b = -0.125;

      scale(scl);
      noFill();
      stroke(this.color);
      strokeWeight(2 / scl);
      beginShape();
      for (let i = 0; i < points; i++) {
        let theta = len / points * (len - i);
        let vx, vy;
        vx = (a + b * theta) * cos(theta) * this.scl;
        vy = (a + b * theta) * sin(theta) * this.scl;

        curveVertex(vx, vy);
      }
      endShape();
    } else if (this.mode === "squares_1") {
      let directions = 7;
      let rotation = Math.floor(map(this.noise_value, -1, 1, 0, directions)) * TWO_PI / directions;
      let phi = PI/2;
      let current_scl = this.scl / Math.sqrt(2);

      rotate(rotation + phi);
      stroke(this.color);
      noFill();
      rectMode(CENTER);
      rect(0, 0, current_scl, current_scl);
    } else if (this.mode === "squares_2") {
      let scl = Math.abs(this.noise_value);
      translate(-this.scl/2, -this.scl/2);
      scale(scl);
      noFill();
      stroke(this.color);
      rectMode(CENTER);
      rect(0, 0, this.scl, this.scl);
    } else if (this.mode === "squares_3") {
      let h = map(this.noise_value, -1, 1, 0, this.scl);

      fill(this.color);
      translate(-this.scl/2, this.scl/2);
      rect(0, 0, this.scl, -h);
    } else if (this.mode === "squares_4") {
      let len = map(this.noise_value, -1, 1, 0, this.scl);

      translate(-this.scl/2, this.scl/2);
      noFill();
      stroke(this.color);
      rect(0, 0, len, -len);
    } else if (this.mode === "triangles") {
      let directions = 8;
      let rotation = Math.floor(map(this.noise_value, -1, 1, 0, directions)) * TWO_PI / directions;
      let phi = PI/2;

      rotate(rotation);
      stroke(this.color);
      noFill();
      beginShape();
      for (let i = 0; i < 3; i++) {
        let theta, vx, vy;
        theta = TWO_PI / 3 * i + phi;
        vx = this.scl / 2 * cos(theta);
        vy = this.scl / 2 * sin(theta);
        vertex(vx, vy);
      }
      endShape(CLOSE);
    } else if (this.mode === "wheels") {
      let rotation = this.noise_value * TWO_PI;
      let lines = Math.floor(map(this.noise_value, -1, 1, 3, 9));
      let scl = 0.75;
      let phi = TWO_PI / lines;
      let len = this.scl / 2;

      scale(scl);
      rotate(rotation);
      noFill();
      stroke(this.color);

      for (let i = 0; i < lines; i++) {
        rotate(phi);
        line(0, 0, len, 0);
      }
    } else if (this.mode === "wifi") {
      let arcs = Math.floor(map(this.noise_value, -1, 1, 1, 7));
      let weight = map(this.noise_value, -1, 1, 1, 3);

      translate(this.scl/2, this.scl/2);
      noStroke();
      fill(this.color);
      circle(0, 0, this.scl/20);
      noFill();
      stroke(this.color);
      strokeWeight(weight);
      for (let i = 0; i < arcs; i++) {
        let size = this.scl / 5 * (i + 1);

        arc(0, 0, size, size, PI, 3/2 * PI);
      }
    }

    pop();
  }

  update(nx, ny) {
    this.noise_value = noise.noise4D(this.noise_position.x, this.noise_position.y, nx, ny);
  }

  setMode(new_mode) {
    this.mode = new_mode;
  }
}


function setNoiseSeed() {
  let seed;

  if (!recording) {
    let msec = new Date().getTime();
    seed = msec;
  } else {
    seed = "RECORDING";
  }
  noise = new SimplexNoise(seed);
}

function mouseClicked() {
  if (!recording) { // somehow this function gets called when the recorder starts downloading the frames
    next_mode = current_mode + 1;
    if (next_mode >= modes.length) {
      next_mode = 0; // wrap around
    }
  }
}

function keyPressed() {
  if (keyCode === 37 || keyCode === 38) { // left / up key
    next_mode = current_mode - 1;
  } else if (keyCode === 39 || keyCode === 40) { // right / down key
    next_mode = current_mode + 1;
  } else if (keyCode === 32) { // spacebar
    setNoiseSeed();
    progress = 0;
  } else if (keyCode === 13) { // enter
    setNoiseSeed()
    recording = !recording;
    progress = 0;
    next_mode = 0;

    if (recording) {
      console.log("RECORDING STARTED");
    } else {
      console.log("RECORDING STOPPED");
    }
  } else if (keyCode === 73) { // i
    show_instructions = !show_instructions;
  } else if (keyCode === 70) { // f
    show_fps = !show_fps;
  } else if (keyCode === 80) { // p
    show_progress = !show_progress;
  }

  if (next_mode < 0) next_mode += modes.length;
  else if (next_mode >= modes.length) next_mode -= modes.length;
}

function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
