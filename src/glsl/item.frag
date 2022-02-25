uniform vec3 color;
uniform float shadow;
uniform float alpha;

varying vec3 vNor;

void main(void) {
  vec4 dest = vec4(color, alpha);
  dest.rgb -= vNor.z * 0.25;
  dest.rgb += vNor.y * 0.25;
  dest.rgb -= 0.25;
  gl_FragColor = dest;
}
