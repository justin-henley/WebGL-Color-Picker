/* 
Course:     CSCI 431 VA
Project:    8 - A Free Choice Project
Author:     Justin Henley, jahenley@mail.fhsu.edu
Date:       2021-11-10

Description:    I chose to do problem 11 from the textbook, an interactive color picker.
                "8.11 Write an interactive program that will return the colors of pixels on the display."
                I chose to display the result in a variety of RGB formats to get extra programming practice.
*/
"use strict";

// Create and initialize program variables
let canvas;
let gl;
let program;

// Only four positions needed for a square drawn as a strip or fan
const numPositions = 4;
const positionsArray = [];
const colorsArray = [];

// Square will be rendered as a triangle fan requiring only 4 vertices to be pushed
// Does not take arguments since only a single square is drawn
const fan = () => {
  // Vertices of the square
  // Must be arranged in proper order to be drawn as a triangle strip
  const i = 0.9;
  const vertices = [
    vec4(i, i, 0, 1),
    vec4(-i, i, 0, 1),
    vec4(-i, -i, 0, 1),
    vec4(i, -i, 0, 1),
  ];

  // Colors for each vertex to be interpolated across the face of the square
  const vertexColors = [
    vec4(1.0, 0.0, 0.0, 1.0), // Red
    vec4(0.0, 1.0, 0.0, 1.0), // Green
    vec4(0.0, 0.0, 1.0, 1.0), // Blue
    vec4(1.0, 0.0, 1.0, 1.0), // Magenta
  ];

  // Iterate over the arrays and push the vertices and colors
  for (let vert of vertices) {
    positionsArray.push(vert);
  }
  for (let color of vertexColors) {
    colorsArray.push(color);
  }
};

// Initiation function called once window has loaded
window.onload = () => {
  canvas = document.getElementById("webgl-canvas");

  // Drawing buffer must be preserved for color picking to work
  gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true });
  if (!gl) alert("WebGL 2.0 isn't available");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // Load shaders
  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Push vertices and colors
  fan();

  // Initialize attribute buffers
  // Color buffer
  const cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

  const colorLoc = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  // Vertex buffer
  const vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

  const positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  // Event listener for clicks on the canvas
  canvas.addEventListener("mousedown", (event) => {
    let x = event.clientX;
    let y = canvas.height - event.clientY;

    // Get the string representation of the color in multiple formats
    const colorStrings = pickAndParse(x, y);

    // Display values on the page
    // Select the output div and set its background color to the selected color
    const outputDiv = document.querySelector("#color-output");
    outputDiv.style["background-color"] = colorStrings["RGB Hexadecimal"];
    // Display the picked color in all computed representations
    outputDiv.innerHTML = `
            <table>
                <tr>
                    <th>Color Type</th>
                    <th>Color Value</th>
                </tr>
                <tr>
                    <td>${Object.keys(colorStrings)[0]}&emsp;</td>
                    <td>${Object.values(colorStrings)[0]}</td>
                </tr>
                <tr>
                    <td>${Object.keys(colorStrings)[1]}</td>
                    <td>${Object.values(colorStrings)[1]}</td>
                </tr>
                <tr>
                    <td>${Object.keys(colorStrings)[2]}</td>
                    <td>${Object.values(colorStrings)[2]}</td>
                </tr>
            </table>
        `;
  });

  // Render the image
  render();
};

// Render function
// Renders a single triangle fan
const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, numPositions);
  requestAnimationFrame(render);
};

// Takes a x and y coordinate to pick a color from that location
// Returns an object containing strings representing the color in RGB hexadecimal, RGB decimal, and RGB normalized decimal forms
const pickAndParse = (x, y) => {
  // Color is read in as an array of unsigned integers in the range [0, 255]
  let colorDec = new Uint8Array(4);
  gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, colorDec);

  const colorHex = []; // Hexadecimal color components
  const colorNorm = []; // Normalized decimal color components

  // Convert colors to hexadecimal representation
  colorDec.forEach((i) => {
    // Convert colors to hexadecimal representation
    let hex = i === 0 ? "00" : i.toString(16).toUpperCase();
    // Left-pad the hex value if necessary
    if (hex.length === 1) hex = "0" + hex;
    colorHex.push(hex);

    // Convert colors to normalized decimal representation
    colorNorm.push((i / 255.0).toFixed(3));
  });

  // Convert hex to a string
  const hexColor = `#${colorHex[0]}${colorHex[1]}${colorHex[2]}`;
  // Convert decimal to a string
  const decColor = `${colorDec[0]}, ${colorDec[1]}, ${colorDec[2]}`;
  // Convert normalized decimal to a string
  const normColor = `${colorNorm[0]}, ${colorNorm[1]}, ${colorNorm[2]}`;

  // Return string representations in an object
  return {
    "RGB Hexadecimal": hexColor,
    "RGB Decimal": decColor,
    "RGB Normalized": normColor,
  };
};
