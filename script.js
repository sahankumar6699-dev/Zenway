body {
  margin: 0;
  overflow: hidden;
  font-family: Arial, sans-serif;
  background: black;
}

canvas {
  display: block;
}

#ui {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  z-index: 10;
}

/* Steering */
#steering {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  width: 140px;
  height: 140px;
  display: none;
  z-index: 100;
}

#wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid rgba(255,255,255,0.9);
  background: radial-gradient(circle, rgba(255,255,255,0.1), rgba(0,0,0,0.6));
  touch-action: none;
  position: relative;
}

#wheel::before,
#wheel::after {
  content: "";
  position: absolute;
  background: rgba(255,255,255,0.7);
}

#wheel::before {
  width: 4px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

#wheel::after {
  height: 4px;
  width: 100%;
  top: 50%;
  transform: translateY(-50%);
}
