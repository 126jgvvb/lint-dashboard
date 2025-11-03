import React, { useState } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card,CardContent } from "../components/ui/Card";
//import { CardContent } from "../components/ui/cardContent";

export const Home = () => {
  const [msisdn, setMsisdn] = useState("0741882818");
  const [name, setName] = useState("delos");
  const [images, setImages] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);

  // simple hash function for strings
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // convert to 32-bit integer
    }
    return hash;
  };
  
  // convert image to hash
  const getImageHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = () => {
          // draw image to canvas for pixel data
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 64; // small size for hashing
          canvas.height = 64;
          ctx.drawImage(img, 0, 0, 64, 64);
  
          const data = ctx.getImageData(0, 0, 64, 64).data;
          let pixelString = "";
          for (let i = 0; i < data.length; i += 4) {
            pixelString += data[i] + "," + data[i + 1] + "," + data[i + 2] + ";";
          }
          resolve(simpleHash(pixelString));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files).slice(0, 4);
    setImages(fileArray);
  };

  const handleCompare=async(file)=>{
    const result1=await getImageHash(file);
    const result2=await getImageHash(images[0]);

    if(result1==result2){
        alert('These images are the same');
    }
    else{
        alert('These images are not the same');
    }

  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    alert("Submit clicked! Implement backend API call here.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-10">
      <Card className="w-full max-w-4xl shadow-2xl rounded-3xl bg-white border border-gray-200">
        <CardContent className="p-10 space-y-10">
          <h1 className="text-4xl font-extrabold text-center text-gray-800">
            Client Form
          </h1>

          {/* Form fields side by side on desktop */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="block mb-2 text-gray-600 font-medium">Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
                className="shadow-sm hover:shadow-md transition"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-600 font-medium">MSISDN</label>
              <Input
                type="tel"
                value={msisdn}
                onChange={(e) => setMsisdn(e.target.value)}
                placeholder="Enter phone number"
                className="shadow-sm hover:shadow-md transition"
              />
            </div>
          </div>

          {/* Drag-and-drop area */}
          <div
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput").click()}
            className="border-4 border-dashed border-blue-300 rounded-3xl p-12 text-center cursor-pointer hover:bg-blue-50 transition-all duration-300 hover:shadow-lg"
          >
            <p className="text-gray-600 text-lg font-medium">
              Drag & drop up to 4 images here, or click to select
            </p>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Image previews with remove buttons */}
          {images.length > 0 && (
            <div className="flex gap-6 overflow-x-auto py-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative w-48 h-48 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm hover:bg-red-600 shadow-md transition"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            className="w-full py-5 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg rounded-xl"
          >
            Submit
          </Button>

           {/* Image comparison */}
           <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">Compare Image</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files[0] && handleCompare(e.target.files[0])}
            />
            {comparisonResult && (
              <p className="mt-3 text-lg font-medium">{comparisonResult}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
