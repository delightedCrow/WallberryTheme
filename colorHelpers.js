var WBColor = {
  isImageLight: function(img) {
    // this function thanks to ToniTornado's SO answer:
    // https://stackoverflow.com/questions/13762864/image-dark-light-detection-client-sided-script

    var fuzzy = 0.2;
    // create canvas
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);

    var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    var data = imageData.data;
    var r,g,b, max_rgb;
    var light = 0, dark = 0;

    for(var x = 0, len = data.length; x < len; x+=4) {
        r = data[x];
        g = data[x+1];
        b = data[x+2];

        max_rgb = Math.max(Math.max(r, g), b);
        if (max_rgb < 128)
            dark++;
        else
            light++;
    }

    var dl_diff = ((light - dark) / (img.width*img.height));
    if (dl_diff + fuzzy < 0){
      return false; /* dark */
    } else {
      return true  /* light */
    }
  }
};
