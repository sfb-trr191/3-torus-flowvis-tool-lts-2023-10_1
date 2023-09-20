class DataTexture {

    texture;
    texture_settings;
    texture_data;

    constructor(gl, internalformat, format, type, color_dim) {
        this.texture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_3D, this.texture);
        var target = gl.TEXTURE_3D;
        var level = 0;
        var width = 8;
        var height = 8;
        var depth = 8;
        var border = 0;
        this.texture_data = 0;
        if (type == gl.FLOAT)
            this.texture_data = new Float32Array(width * height * depth * color_dim).fill(0);
        else if (type == gl.INT)
            this.texture_data = new Int32Array(width * height * depth * color_dim).fill(0);
        else
            throw "Error unknown type: " + type;

        gl.texImage3D(target, level, internalformat, width, height, depth, border, format, type, this.texture_data);

        // set the filtering so we don't need mips and it's not filtered
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_3D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        this.texture_settings = { target, level, internalformat, width, height, depth, border, format, type, color_dim };
        //return {texture: texture, texture_data: texture_data, texture_settings: texture_settings};    
    }

    updateDataTexture(gl, texture_data) {
        this.texture_data = texture_data;
        this.update(gl);
    }

    update(gl) {
        gl.bindTexture(gl.TEXTURE_3D, this.texture);
        var target = this.texture_settings.target;
        var level = this.texture_settings.level;
        var internalformat = this.texture_settings.internalformat;
        var width = this.texture_settings.width;
        var height = this.texture_settings.height;
        var depth = this.texture_settings.depth;
        var border = this.texture_settings.border;
        var format = this.texture_settings.format;
        var type = this.texture_settings.type;
        /*
        console.log("updateDataTexture");
        console.log("texture_data.length: " + this.texture_data.length);
        console.log("width: " + width);
        console.log("height: " + height);
        console.log("depth: " + depth);
        */
        gl.texImage3D(target, level, internalformat, width, height, depth, border, format, type, this.texture_data);
    }

    updateDataSlice(gl, slice_index, slice_data) {
        var color_dim = this.texture_settings.color_dim;
        var width = this.texture_settings.width;
        var height = this.texture_settings.height;
        var offset = width * height * color_dim * slice_index;
        this.texture_data.set(slice_data, offset);
    }



    /*
    updateDataTextureSlice(gl, slice_index, slice_data) {
        this.texture_data = texture_data;
        gl.bindTexture(gl.TEXTURE_3D, this.texture);
        var target = this.texture_settings.target;
        var level = this.texture_settings.level;
        var internalformat = this.texture_settings.internalformat;
        var width = this.texture_settings.width;
        var height = this.texture_settings.height;
        var depth = this.texture_settings.depth;
        var border = this.texture_settings.border;
        var format = this.texture_settings.format;
        var type = this.texture_settings.type;
        var xoffset = 0;
        var yoffset = 0;
        var zoffset = slice_index;
        gl.texSubImage3D(target, level, xoffset, yoffset, zoffset, width, height, depth, format, type, slice_data);    
    }
    */

    test() {
        console.log("lol");
    }
}

class DataTextures {

    constructor(gl, p_data_unit) {
        //this.texture_float = generateDataTextureFloat(gl);
        //this.texture_int = generateDataTextureInt(gl);
        this.p_data_unit = p_data_unit;

        var internalformat = gl.R32F;
        var format = gl.RED;
        var type = gl.FLOAT;
        var color_dim = 1;
        this.texture_float = new DataTexture(gl, internalformat, format, type, color_dim);
        this.texture_float.test();

        internalformat = gl.R32I;
        format = gl.RED_INTEGER;
        type = gl.INT;
        this.texture_int = new DataTexture(gl, internalformat, format, type, color_dim);
        this.texture_int.test();
    }

    /*
    generateDataTextureFloat(gl) {
        var internalformat = gl.R32F;
        var format = gl.RED;
        var type = gl.FLOAT;
        var color_dim = 1;
        var texture = new DataTexture(gl, internalformat, format, type, color_dim);
        return texture;
    }

    generateDataTextureInt(gl) {
        var internalformat = gl.R32I;
        var format = gl.RED_INTEGER;
        var type = gl.INT;
        var color_dim = 1;
        return new DataTexture(gl, internalformat, format, type, color_dim);
    }
    */

    update(gl) {
        this.texture_float.texture_settings.width = this.p_data_unit.texture_size_x;
        this.texture_float.texture_settings.height = this.p_data_unit.texture_size_y;
        this.texture_float.texture_settings.depth = this.p_data_unit.texture_size_float_z;
        this.texture_float.updateDataTexture(gl, this.p_data_unit.arrayf);

        this.texture_int.texture_settings.width = this.p_data_unit.texture_size_x;
        this.texture_int.texture_settings.height = this.p_data_unit.texture_size_y;
        this.texture_int.texture_settings.depth = this.p_data_unit.texture_size_int_z;
        this.texture_int.updateDataTexture(gl, this.p_data_unit.arrayi);
    }
}

class DataTexture3D_RGBA {

    constructor(gl) {
        var internalformat = gl.RGBA32F;
        var format = gl.RGBA;
        var type = gl.FLOAT;
        var color_dim = 4;
        this.texture = new DataTexture(gl, internalformat, format, type, color_dim);
        this.texture.test();
    }

    initDimensions(gl, width, height, depth) {
        var changed = this.texture.texture_settings.width != width
            || this.texture.texture_settings.height != height
            || this.texture.texture_settings.depth != depth;
        if(!changed)
            return;
        var data = new Float32Array(width * height * depth * this.texture.texture_settings.color_dim).fill(0);
        this.updateData(gl, width, height, depth, data);
    }

    updateData(gl, width, height, depth, data) {
        this.texture.texture_settings.width = width;
        this.texture.texture_settings.height = height;
        this.texture.texture_settings.depth = depth;
        this.texture.updateDataTexture(gl, data);
    }

    updateSlice(gl, slice_index, slice_data) {
        this.texture.updateDataSlice(gl, slice_index, slice_data);
    }

    update(gl) {
        this.texture.update(gl);
    }

    copyFrom(gl, other){
        this.texture.texture_settings.width = other.texture.texture_settings.width;
        this.texture.texture_settings.height = other.texture.texture_settings.height;
        this.texture.texture_settings.depth = other.texture.texture_settings.depth;
        var data = other.texture.texture_data;
        this.texture.updateDataTexture(gl, data);
    }
}

class DataTexture3D_R {

    constructor(gl) {
        var internalformat = gl.R32F;
        var format = gl.RED;
        var type = gl.FLOAT;
        var color_dim = 1;
        this.texture = new DataTexture(gl, internalformat, format, type, color_dim);
        this.texture.test();
    }

    initDimensions(gl, width, height, depth) {
        var changed = this.texture.texture_settings.width != width
            || this.texture.texture_settings.height != height
            || this.texture.texture_settings.depth != depth;
        if(!changed)
            return;
        var data = new Float32Array(width * height * depth * this.texture.texture_settings.color_dim).fill(0);
        this.updateData(gl, width, height, depth, data);
    }

    updateData(gl, width, height, depth, data) {
        this.texture.texture_settings.width = width;
        this.texture.texture_settings.height = height;
        this.texture.texture_settings.depth = depth;
        this.texture.updateDataTexture(gl, data);
    }

    updateSlice(gl, slice_index, slice_data) {
        this.texture.updateDataSlice(gl, slice_index, slice_data);
    }

    update(gl) {
        this.texture.update(gl);
    }

    copyFrom(gl, other){
        this.texture.texture_settings.width = other.texture.texture_settings.width;
        this.texture.texture_settings.height = other.texture.texture_settings.height;
        this.texture.texture_settings.depth = other.texture.texture_settings.depth;
        var data = other.texture.texture_data;
        this.texture.updateDataTexture(gl, data);
    }
}

module.exports = {DataTextures, DataTexture3D_RGBA, DataTexture3D_R};