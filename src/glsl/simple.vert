varying vec3 vNor;

void main(){
  vNor = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
