 W = 300;
 H = 150;
 R = 20;

function easeInOutQuad(x) {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}


function easeOutQuart(x) {
    return 1 - Math.pow(1 - x, 4);
}

function easeInQuart(x) {
    return x * x * x * x;
}

function halton (index, base) {
  let fraction = 1;
  let result = 0;
  while (index > 0) {
    fraction /= base;
    result += fraction * (index % base);
    index = Math.floor(index / base); // floor division
  }
  return result;
}


// f(x, y) = (u: x (x^2+y^2)^{-1/2}, v: y(x^2 + y^2)^{-1/2})
// du/dx = 1. (x^2+y^2)^{-1/2} + x(-1/2)(x^2+y^2){-3/2}(2x) = (x^2 + y^2)^{-1/2} - x^2(x^2 + y^2)^{-3/2}
// du/dy = 1.  x(-1/2)(x^2+y^2){-3/2}(2y) = - xy(x^2 + y^2)^{-3/2}
function jac(x, y, tx, ty) {
    let xsqysq = x*x+y*y;
    let dudx = Math.pow(xsqysq, -1/2) - x*x*Math.pow(xsqysq, -3/2);
    let dudy =  -x*y*Math.pow(xsqysq, -3/2);
    let dvdx = dudy;
    let dvdy = Math.pow(xsqysq, -1/2) - y*y*Math.pow(xsqysq, -3/2);


    let ox = tx*dudx + ty*dudy;
    let oy = tx*dvdx +  ty*dvdy;
    // console.log("dudx: ", dudx, "dudy: ", dudy, "dvdx: ", dvdx, "dvdy: ", dvdy, "ox: ", ox, "oy: ", oy);
    return [ox, oy];
}


const interactive_derivative = ( s ) => {
    let pX = R*3;
    let pY = 0;

    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	// myCanvas.parent(document.getElementById('myContainer'));
	myCanvas.parent('interactive-derivative');
    };

    s.draw = () => {
    s.background(255,253,231);

	if (s.mouseIsPressed) {
	    pX = s.mouseX - W/2;
	    pY = s.mouseY - H/2;
	}

	let vecX = (s.mouseX -W/2) - pX;
	let vecY = (s.mouseY - H/2) - pY;



	s.stroke(30,136,229);
	s.strokeWeight(6);
	s.strokeCap(s.SQUARE);
	s.line(pX+W/2, pY+H/2, s.mouseX, s.mouseY);


	const TGTWT = 6;
    const len = Math.sqrt(pX*pX + pY*pY);
	let sX = (TGTWT+R)*pX/len;
	let sY = (TGTWT+R)*pY/len;

	let stv = jac(pX, pY, vecX, vecY);
	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


    s.stroke(255,111,0)
	s.strokeWeight(6);
    s.strokeCap(s.SQUARE);
	s.noFill();
    s.beginShape();
    for(let i = 0; i <= len; ++i) {
        let t = i / len;
        const x0 = pX; const y0 = pY;
        const x1 = s.mouseX - W/2; const y1 = s.mouseY - H/2;

        const xt = (1 - t)*x0 + t*x1;
        const yt = (1 - t)*y0 + t*y1;
        const tlen = Math.sqrt(xt*xt + yt*yt);

        s.curveVertex(W/2 + R*xt/tlen, H/2 + R*yt/tlen);
    }
    s.endShape();


	s.strokeWeight(6);
	s.strokeCap(s.SQUARE);
	s.stroke(216,27,96);;
	s.line(W/2 + sX,
		    H/2 + sY,
		    W/2 +  sX+ 10*stv[0],
		    H/2 +  sY+ 10*stv[1]);

	s.strokeWeight(0);;

    };
};



const transform_anim_normal = ( s ) => {
    let pts = [];
    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	myCanvas.parent('transform-anim-normal');
    };

    let t = 0;

    s.draw = () => {


	const V = 0.02;
    t = (t + V) % (4);
	const NUM_POINTS = 40;
	if (pts.length > NUM_POINTS) {
	    pts.shift();
	}

    const RMOVE = R*3;
    if (t <= 1) { // 0-1
	    pts.push([R*2 + RMOVE * easeInOutQuad(t), 0]);
	} else if (t <= 2) { // 1-2
	    pts.push([R*2 + RMOVE * easeInOutQuad(1), 0]);
    } else if (t <= 3) {
        let tcur = t - 2;
        let trev = 1 - tcur; // 1 - (t - 1) = 1 - t + 1 = 2 - t
	    pts.push([R*2 + RMOVE * easeInOutQuad(trev), 0]);
    } else if (t <= 4) {
	    pts.push([R*2 + RMOVE * easeInOutQuad(0), 0]);
    }


	s.background(238,238,238);
    s.background(255,253,231);
	s.noFill();
	s.stroke(216,27,96);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    s.stroke(216,27,96);
	    s.curveVertex(pts[i][0] + W/2, pts[i][1] +H/2);
	}
	s.endShape();

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


	s.stroke(33,150,243);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    const len = Math.sqrt(pts[i][0] * pts[i][0] + pts[i][1] * pts[i][1]);
	    s.curveVertex(W/2 + R*pts[i][0]/len, H/2 + R*pts[i][1]/len);
	}
	s.endShape();


    };
};

const transform_anim_tangential = ( s ) => {
    let pts = [];
    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	myCanvas.parent('transform-anim-tangential');
    };

    let t = 0;

    s.draw = () => {


	const V = 0.02;
    t = (t + V) % (4);
	const NUM_POINTS = 40;
	if (pts.length > NUM_POINTS) {
	    pts.shift();
	}

    const RMOVE = R*4;
    if (t <= 1) { // 0-1
	    pts.push([R*2, -R*2 + RMOVE * easeInOutQuad(t)]);
	} else if (t <= 2) { // 1-2
	    pts.push([R*2, -R*2 + RMOVE * easeInOutQuad(1)]);
    } else if (t <= 3) {
        let tcur = t - 2;
        let trev = 1 - tcur; // 1 - (t - 1) = 1 - t + 1 = 2 - t
	    pts.push([R*2, -R*2 + RMOVE * easeInOutQuad(trev)]);
    } else if (t <= 4) {
	    pts.push([R*2, -R*2 + RMOVE * easeInOutQuad(0)]);
    }


	s.background(238,238,238);
    s.background(255,253,231);
	s.noFill();
	s.stroke(216,27,96);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    s.stroke(216,27,96);
	    s.curveVertex(pts[i][0] + W/2, pts[i][1] +H/2);
	}
	s.endShape();

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


	s.stroke(33,150,243);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    const len = Math.sqrt(pts[i][0] * pts[i][0] + pts[i][1] * pts[i][1]);
	    s.curveVertex(W/2 + R*pts[i][0]/len, H/2 + R*pts[i][1]/len);
	}
	s.endShape();


    };
};



const transform_anim = ( s ) => {
    let pts = [];
    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	myCanvas.parent('transform-anim');
    };

    let t1 = 0; let t2 = 0;

    s.draw = () => {

    const R1 = R*2; const R2 = R/2; const V1 = 0.01; V2 = 0.05;
    pts.push([R1 * Math.cos(t1) + R2 * Math.cos(t2), R1 * Math.sin(t1) + R2 * Math.sin(t2)]);
    t1 = (t1 + V1) % (2*Math.PI);
    t2 = (t2 + V2) % (2*Math.PI);

	const NUM_POINTS = 40;
	if (pts.length > NUM_POINTS) {
	    pts.shift();
	}

	s.background(238,238,238);
    s.background(255,253,231);
	s.noFill();
	s.stroke(216,27,96);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    s.stroke(216,27,96);
	    s.curveVertex(pts[i][0] + W/2, pts[i][1] +H/2);
	}
	s.endShape();

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


	s.stroke(33,150,243);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    const len = Math.sqrt(pts[i][0] * pts[i][0] + pts[i][1] * pts[i][1]);
	    s.curveVertex(W/2 + R*pts[i][0]/len, H/2 + R*pts[i][1]/len);
	}
	s.endShape();


    };
};


const transform = ( s ) => {
    let pts = [];
    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	myCanvas.parent('transform');
    };

    s.draw = () => {

	pts.push([s.mouseX - W/2, s.mouseY -H/2]);
	const NUM_POINTS = 10;
	if (pts.length > NUM_POINTS) {
	    pts.shift();
	}

	s.background(238,238,238);
    s.background(255,253,231);
	s.noFill();
	s.stroke(216,27,96);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    s.stroke(216,27,96);
	    s.curveVertex(pts[i][0] + W/2, pts[i][1] +H/2);
	}
	s.endShape();

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


	s.stroke(33,150,243);
	s.strokeWeight(6);
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
	    const len = Math.sqrt(pts[i][0] * pts[i][0] + pts[i][1] * pts[i][1]);
	    s.curveVertex(W/2 + R*pts[i][0]/len, H/2 + R*pts[i][1]/len);
	}
	s.endShape();


    };
};
const crumple = ( s ) => {
    const fn = 100; // total # of frames
    let fi = 0; // current frame.
    let pts = []
    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	myCanvas.parent(document.getElementById('crumple'));
    }

    s.draw = () => {
    s.background(255,253,231);
	s.noFill();

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);

	// generate points using halton sequence?
	// homotope points.
	const NFRAME_POINTS = 100;
	const NFRAME_TRANSFORM = 40;
	const NFRAME_STAY = 20;
	const NFRAME_HIDE = 20;


	let c0 = s.color(216,27,96, 255);
	let c1 = s.color(30,136,229, 128);
	const BORDER = 60;

	fi++;
	let fcur = fi;
	
	s.strokeWeight(6);

	if (fcur < NFRAME_POINTS) {
	    if (fcur == 0) {
		pts = [];
	    } else {
		let rRand = 2*R + halton(fcur, 2) * 6*R;
		let thetaRand = halton(fcur, 3) * 2 * Math.PI
		
		pts.push([rRand * Math.cos(thetaRand), rRand * Math.sin(thetaRand)]);
	    }
	    for(let i = 0; i < pts.length; ++i) {
		let x0 = pts[i][0];
		let y0 = pts[i][1];
		
		let t = Math.min(1, (fcur - i)/5);
		let ct = s.color(c0);
		ct.setAlpha(255*t);
		s.stroke(ct);
		s.point(W/2 + x0, H/2 + y0);
	    }
	    return;
	} else {
	    fcur -= NFRAME_POINTS;
        }

	if (fcur < NFRAME_STAY) {
	    let t = fcur /NFRAME_STAY;
	    for(let i = 0; i < pts.length; ++i) {
		let x0 = pts[i][0];
		let y0 = pts[i][1];
		let x1 = R*x0/Math.sqrt(x0*x0 + y0*y0);
		let y1 = R*y0/Math.sqrt(x0*x0 + y0*y0);
		s.stroke(c0);
		s.point(W/2 + x0, H/2 + y0);		
	    }
	    return;
	} else { fcur -= NFRAME_STAY };

	
	if (fcur < NFRAME_TRANSFORM) {
	    let t = fcur/NFRAME_TRANSFORM;
	    t = easeOutQuart(t);
	    for(let i = 0; i < pts.length; ++i) {
		let x0 = pts[i][0];
		let y0 = pts[i][1];
		let x1 = R*x0/Math.sqrt(x0*x0 + y0*y0);
		let y1 = R*y0/Math.sqrt(x0*x0 + y0*y0);

		s.stroke(s.lerpColor(c0, c1, t));
		s.point(W/2 + (1-t)*x0 + t*x1, H/2 + (1-t)*y0 + t*y1);		
	    }
	    return;
	    
	} else {
	    fcur -= NFRAME_TRANSFORM;
	}

	if (fcur < NFRAME_STAY) {
	   for(let i = 0; i < pts.length; ++i) {
		let x0 = pts[i][0];
		let y0 = pts[i][1];
		let x1 = R*x0/Math.sqrt(x0*x0 + y0*y0);
		let y1 = R*y0/Math.sqrt(x0*x0 + y0*y0);
	        s.stroke(c1);
		s.point(W/2 + x1, H/2 + y1);		
	   }
	   return;
	} else {
	    fcur -= NFRAME_STAY;
	}
	
	if (fcur < NFRAME_HIDE) {
	    let t = fcur /NFRAME_HIDE;
	    t = easeInQuart(t);
	    for(let i = 0; i < pts.length; ++i) {
		let x0 = pts[i][0];
		let y0 = pts[i][1];
		let x1 = R*x0/Math.sqrt(x0*x0 + y0*y0);
		let y1 = R*y0/Math.sqrt(x0*x0 + y0*y0);
		let ct = s.color(c1);
		ct.setAlpha(128*(1.0 - t));
		s.stroke(ct);
		s.point(W/2 + x1, H/2 + y1);		
	    }
	    return;
	}

	// pause.
	if (fcur < 50) { return; }

	// ran no animation. exhausted.
	fi = 0;
	pts = [];
	return;
    };
};

const static_derivative = ( s ) => {

    let pts = [];

    let fi = 0;
    let fv = 1;

    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	// myCanvas.parent(document.getElementById('myContainer'));
	myCanvas.parent('static-derivative');

	for (let i = -50; i < 50; ++i) {
        let x = i*2;
        let y =  1.5*R;
        pts.push([i, x, y]);
	}
    };

    s.draw = () => {
    s.background(255,253,231);

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


	s.stroke(66,66,66);
	s.strokeWeight(4);
    s.strokeCap(s.SQUARE);
	s.noFill();
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
        let x = pts[i][1];
        let y =  pts[i][2];
	    s.curveVertex(W/2 + x, H/2 + y);
	}
	s.endShape();



    const LEN = 30;
    if (fv == 1 && fi == pts.length - LEN - 1) { fv = -1; }
    if (fv == -1 && fi == 1 ) { fv = 1; }
    fi += fv;

    // purple
	s.strokeWeight(6);
    s.stroke(106,27,154);
	s.noFill();
	s.beginShape();
	for (let i = fi; i < fi + LEN; ++i) {
        let x = pts[i][1];
        let y =  pts[i][2];
	    s.curveVertex(W/2 + x, H/2 + y);
	}
	s.endShape();

    const xmid = pts[fi+LEN/2][1];
    const ymid = pts[fi+LEN/2][2];

    // blue
    s.strokeWeight(0);
    s.fill(33,150,243);
    s.ellipse(W/2 + xmid, H/2 + ymid, 10, 10);


    // orange
    s.stroke(255,111,0)
	s.strokeWeight(6);
    s.strokeCap(s.SQUARE);
	s.noFill();
	s.beginShape();
	for (let i = fi; i < fi + LEN; ++i) {
        let x = pts[i][1];
        let y =  pts[i][2];
        let px = R*x/Math.sqrt(x*x+y*y);
        let py = R*y/Math.sqrt(x*x+y*y);
	    s.curveVertex(W/2 + px, H/2 + py);
	}
	s.endShape();



    // pink
    const pxmid = R*xmid/Math.sqrt(xmid*xmid+ymid*ymid);
    const pymid = R*ymid/Math.sqrt(xmid*xmid+ymid*ymid);
    s.strokeWeight(0);
    s.fill(233,30,99);
    s.ellipse(W/2 + pxmid, H/2 + pymid, 10, 10);

    };
};


const linear_derivative = ( s ) => {
    let pts = [];

    let fi = 0;

    s.setup = () => {
	let myCanvas = s.createCanvas(W, H);
	// myCanvas.parent(document.getElementById('myContainer'));
	myCanvas.parent('linear-derivative');

	for (let i = -50; i < 50; ++i) {
        let x = i*2;
        let y =  1.5*R;
        pts.push([i, x, y]);
	}
    };

    s.draw = () => {
    s.background(255,253,231);

	s.strokeWeight(0);
	s.fill(69,90,100);
	s.ellipse(W/2, H/2, 2*R, 2*R);


	s.stroke(66,66,66);
	s.strokeWeight(4);
    s.strokeCap(s.SQUARE);
	s.noFill();
	s.beginShape();
	for (let i = 0; i < pts.length; ++i) {
        let x = pts[i][1];
        let y =  pts[i][2];
	    s.curveVertex(W/2 + x, H/2 + y);
	}
	s.endShape();


    fi = (fi + 0.01) % (2*Math.PI);
    const LEN = Math.cos(fi) * Math.cos(fi)*40;
    const MID = 50;

    // purple
	s.strokeWeight(6);
    s.stroke(106,27,154);
	s.noFill();
	s.beginShape();
	for (let i = Math.floor(MID-LEN); i < Math.ceil(MID + LEN); ++i) {
        let x = pts[i][1];
        let y =  pts[i][2];
	    s.curveVertex(W/2 + x, H/2 + y);
	}
	s.endShape();

    const xmid = pts[MID][1];
    const ymid = pts[MID][2];

    // blue
    s.strokeWeight(0);
    s.fill(33,150,243);
    s.ellipse(W/2 + xmid, H/2 + ymid, 10, 10);


    // orange
    s.stroke(255,111,0)
	s.strokeWeight(6);
    s.strokeCap(s.SQUARE);
	s.noFill();
	s.beginShape();
	for (let i = Math.floor(MID-LEN); i < Math.ceil(MID + LEN); ++i) {
        let x = pts[i][1];
        let y =  pts[i][2];
        let px = R*x/Math.sqrt(x*x+y*y);
        let py = R*y/Math.sqrt(x*x+y*y);
	    s.curveVertex(W/2 + px, H/2 + py);
	}
	s.endShape();



    // pink
    const pxmid = R*xmid/Math.sqrt(xmid*xmid+ymid*ymid);
    const pymid = R*ymid/Math.sqrt(xmid*xmid+ymid*ymid);
    s.strokeWeight(0);
    s.fill(233,30,99);
    s.ellipse(W/2 + pxmid, H/2 + pymid, 10, 10);

    };
};


let p5_crumple = new p5(crumple);
let p5_transform = new p5(transform);
let p5_transform_anim = new p5(transform_anim);
let p5_transform_anim_normal = new p5(transform_anim_normal);
let p5_transform_anim_tangential = new p5(transform_anim_tangential);
let p5_interactive_derivative = new p5(interactive_derivative);
let p5_static_derivative = new p5(static_derivative);
let p5_linear_derivative = new p5(linear_derivative);


