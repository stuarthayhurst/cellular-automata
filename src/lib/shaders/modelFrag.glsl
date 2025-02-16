#version 300 es
precision mediump float;

in vec3 fragPos;
in vec3 normal;
flat in uint alive;
flat in uint mapped;

out vec4 outColour;

uniform vec3 cameraPos;
uniform vec3 baseColour;
uniform vec3 cellColour;
uniform vec3 unmappedColour;

float ambientStrength = 0.3;
float diffuseStrength = 0.6;
float specularStrength = 0.125;

void main() {
    //Check if the cell is active, return early if it is
    if (alive > uint(0)) {
        outColour = vec4(cellColour, 1.0);
        return;
    }

    vec3 lightPos = cameraPos;

    //Diffuse lighting
    vec3 normNormal = normalize(normal);
    vec3 lightDir = normalize(lightPos - fragPos);
    float diffuse = max(dot(normNormal, lightDir), 0.0);
    diffuse *= diffuseStrength;

    //Specular lighting
    vec3 viewDir = normalize(cameraPos - fragPos);
    vec3 reflectDir = reflect(-lightDir, normNormal);
    float specular = pow(max(dot(cameraPos, reflectDir), 0.0), 2.0);
    specular *= specularStrength;
    specular /= distance(fragPos, lightPos);

    vec3 fragColour;
    if (mapped == 1u) {
        fragColour = baseColour;
    } else {
        fragColour = unmappedColour;
    }

    //Combine results
    outColour = vec4((ambientStrength + diffuse + specular) * fragColour, 1.0);
}
