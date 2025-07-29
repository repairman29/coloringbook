import React, { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImageUrl("");
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    if (image) {
      formData.append("image", image);
    } else if (imageUrl) {
      formData.append("url", imageUrl);
    } else {
      return;
    }

    const response = await fetch("/api/convert", {
      method: "POST",
      body: formData,
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    setPreview(url);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 flex flex-col items-center gap-6">
      <h1 className="text-3xl font-bold">Image to Coloring Page</h1>
      <div className="w-full max-w-md p-4 bg-white rounded shadow-md">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        <input
          type="text"
          placeholder="Or enter image URL"
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            setImage(null);
          }}
          className="border p-2 w-full mt-2"
        />
        <button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
          Convert to Coloring Page
        </button>
      </div>
      {preview && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Preview:</h2>
          <img src={preview} alt="Preview" className="border rounded max-w-full" />
        </div>
      )}
    </div>
  );
}
