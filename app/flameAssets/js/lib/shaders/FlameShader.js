

THREE.FlameShader = {

  uniforms: {

    "noise": { type: "t", value: null },
	"rainbow": { type: "t", value: null },
	"grad": { type: "t", value: null },
	"time": { type: "f", value: 0 },
  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform float opacity;",
	"uniform float time;",

    "uniform sampler2D noise;",
	"uniform sampler2D rainbow;",
	"uniform sampler2D grad;",

    "varying vec2 vUv;",

    "void main() {",
	"vec2 aUvs = vec2(vUv.x ,vUv.y - time*0.03);",
	"vec2 bUvs = vec2(vUv.x ,vUv.y - time*0.06);",
    "float uvChange = texture2D(noise, aUvs).r;",
	"uvChange+=texture2D(noise, bUvs).g;",
	"uvChange*=texture2D(rainbow, vUv).a;",
	"uvChange*=texture2D(grad, vUv).r;",
	"vec2 cUvs = vec2(vUv.x ,vUv.y + uvChange);",
	"float g = texture2D(rainbow, cUvs).g;",
	"float b = texture2D(rainbow, vUv).b;",
	"float r = texture2D(rainbow, cUvs).r;",
	"float a = texture2D(rainbow, cUvs).a;",
	"gl_FragColor = vec4(g,g+r,g+r,a);",

    "}"

  ].join("\n")

};
