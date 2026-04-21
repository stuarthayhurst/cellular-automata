#version 300 es
precision mediump float;
precision highp int;

in vec3 fragPos;
in vec3 normal;
flat in uint alive;
flat in uint mapped;

out vec4 outColour;

uniform vec3 cameraPos;
uniform vec3 baseColour;
uniform vec3 cellColour;
uniform vec3 unmappedColour;
uniform int activeCellMode;

float ambientStrength = 0.3;
float diffuseStrength = 0.6;
float specularStrength = 0.125;

//Shared between modelFrag.glsl and gridFrag.glsl
vec3 weightCell(vec3 cellColour, vec3 baseColour, uint alive) {
    const float range = 3.0; //(2 ^ bitsPerChannel) - 1
    float weight = 1.0 - (1.0 / range) * float(alive - 1u);
    return cellColour * weight + baseColour * (1.0 - weight);
}

void main() {
    //Check if the cell is active, return early if it is
    //Skip this if we're in the first pass of raised cells
    if (activeCellMode != 1 && alive > 0u) {
        outColour = vec4(weightCell(cellColour, baseColour, alive), 1.0);
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

    //Darken active cells for raised cells first pass
    if (activeCellMode == 1 && alive > 0u) {
        fragColour *= 0.1f;
    }

    //Combine results
    outColour = vec4((ambientStrength + diffuse + specular) * fragColour, 1.0);
}
