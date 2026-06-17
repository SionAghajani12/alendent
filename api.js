/* Frontend data layer — talks to the Alendent backend (server.js).
   Products & brands live in the SQLite database; images upload to /uploads. */

(function () {
  const json = (r) => {
    if (!r.ok) {
      if (r.status === 405 || r.status === 404) {
        throw new Error(
          "Backend not reachable. Run  node server.js  and open http://localhost:3000 " +
          "(not Live Server or the file directly)."
        );
      }
      throw new Error("Request failed: " + r.status);
    }
    return r.json();
  };

  window.api = {
    // ---- Products ----
    getProducts: () => fetch("/api/products").then(json),
    saveProduct: (p) =>
      fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      }).then(json),
    deleteProduct: (id) =>
      fetch("/api/products/" + encodeURIComponent(id), { method: "DELETE" }).then(json),

    // ---- Brands ----
    getBrands: () => fetch("/api/brands").then(json),
    saveBrand: (b) =>
      fetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(b),
      }).then(json),
    deleteBrand: (name) =>
      fetch("/api/brands/" + encodeURIComponent(name), { method: "DELETE" }).then(json),

    // ---- Image upload ----
    // Resizes client-side, uploads, returns a hosted URL like "/uploads/ab12.jpg"
    uploadImage: async (file, maxSize = 900, quality = 0.85) => {
      const dataUrl = await window.resizeImageFile(file, maxSize, quality);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      }).then(json);
      return res.url;
    },
  };

  /* Read an image file, downscale it on a canvas, return a JPEG/PNG data URL. */
  window.resizeImageFile = function (file, maxSize = 900, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Could not load image"));
        img.onload = () => {
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          // PNG keeps transparency (good for logos); JPEG is smaller for photos
          const isPng = /png|svg/i.test(file.type);
          resolve(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };
})();
