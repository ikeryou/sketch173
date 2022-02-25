uniform vec3 color;
uniform float alpha;
uniform float gray;
uniform float brightness;

const float redScale   = 0.298912;
const float greenScale = 0.586611;
const float blueScale  = 0.114478;
const vec3  monochromeScale = vec3(redScale, greenScale, blueScale);

void main(void) {
  vec4 dest = vec4(color, alpha);
  dest.rgb += brightness;

  float grayColor = dot(dest.rgb, monochromeScale);
  dest.rgb = mix(dest.rgb, vec3(grayColor * 1.5), gray);

  gl_FragColor = dest;
}
