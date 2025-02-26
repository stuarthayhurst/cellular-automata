import * as torus from "./meshes/torus.js";
import * as sphere from "./meshes/sphere.js";

/**
 * Return a list of vertices in the mesh, and per-triangle lists of origins and indices.
 * @param {Number} width
 * @param {Number} height
 * @param {Number} meshWidthScale
 * @param {Number} meshHeightScale
 * @param {String} shape
 * @returns {[glMatrix.vec3[], glMatrix.vec3[], Number[]]}
 */
export function calculateMesh(
    width,
    height,
    meshWidthScale,
    meshHeightScale,
    shape,
) {
    let generator;
    if (shape === "torus") {
        generator = torus;
    } else if (shape === "sphere") {
        generator = sphere;
    }

    //Generate the mesh-specific skeleton
    const [skeleton, skeletonOrigins] = generator.generateSkeleton(
        width,
        height,
        meshWidthScale,
        meshHeightScale,
    );

    //Calculate mesh, origins and indices for the skeleton
    return generator.calculateMesh(
        skeleton,
        skeletonOrigins,
        width,
        height,
        meshWidthScale,
        meshHeightScale,
    );
}

/**
 * Return per-vertex, smoothed normals.
 * @param {glMatrix.vec3[]} mesh
 * @param {glMatrix.vec3[]} origins
 * @returns {Number[3][]}
 */
export function calculateNormals(mesh, origins) {
    /** @type {Number[3][]} */
    let normals = [];
    for (let i = 0; i < origins.length; i++) {
        //Calculate vector from the origin to the point
        let normal = [
            mesh[i][0] - origins[i][0],
            mesh[i][1] - origins[i][1],
            mesh[i][2] - origins[i][2],
        ];

        //Normalise the vector
        const len = Math.sqrt(
            normal[0] * normal[0] +
                normal[1] * normal[1] +
                normal[2] * normal[2],
        );
        normal[0] /= len;
        normal[1] /= len;
        normal[2] /= len;

        normals.push(normal);
    }

    return normals;
}
