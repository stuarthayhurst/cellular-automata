import * as glMatrix from "gl-matrix";
import * as torus from "./meshes/torus.js";
import * as sphere from "./meshes/sphere.js";

/**
 * Return a list of vertices in the mesh, and per-triangle lists of origins and indices.
 * @param {Number} width
 * @param {Number} height
 * @param {Number} meshWidthScale
 * @param {Number} meshHeightScale
 * @param {String} shape
 * @returns {[Array<glMatrix.vec3>, Array<glMatrix.vec3>, Array<Number>]}
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
 * @param {Array<glMatrix.vec3>} mesh
 * @param {Array<glMatrix.vec3>} origins
 * @returns {Array<glMatrix.vec3>}
 */
export function calculateNormals(mesh, origins) {
    /** @type {Array<glMatrix.vec3>} */
    let normals = [];
    for (let i = 0; i < origins.length; i++) {
        let normal = glMatrix.vec3.create();
        glMatrix.vec3.sub(normal, mesh[i], origins[i]);
        glMatrix.vec3.normalize(normal, normal);
        normals.push(normal);
    }

    return normals;
}
