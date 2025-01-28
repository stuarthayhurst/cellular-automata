#version 300 es

in vec2 inPosition;
out vec2 position;

void main() {
    position = inPosition;
    gl_Position = vec4(inPosition.x, inPosition.y, 0.0, 1.0);
}
