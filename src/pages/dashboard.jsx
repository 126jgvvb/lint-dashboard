// src/pages/ForgeryDashboard.jsx
import React, { useState } from "react";
import { CustomDialog } from "../components/ui/dialog";
import { Button } from "../components/ui/Button";
import { CardContent } from "@/components/ui/cardContent";
import clsx from "clsx";
import { Topbar } from "../components/ui/topBar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { deleteForgery } from "../redux/defaultSlice";
import { getOnlineData } from "../redux/defaultSlice";
import { useEffect } from "react";
import { pingServer } from "../redux/defaultSlice";
import { networkObject } from "./network";
import SERVER_IP from "../serverIP";

// Card wrapper
const Card = ({ children, className }) => (
  <div
    className={clsx(
      "bg-white shadow-lg rounded-xl p-4",
      className
    )}
  >
    {children}
  </div>
);

export const ForgeryDashboard = () => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [compareResult, setCompareResult] = useState("");
const [comparisonFile, setComparisonFile] = useState(null);
const [isComparing, setIsComparing] = useState(false);
const [isComparing2, setIsComparing2] = useState(false);
const [renderInfo,setRender]=useState(false);

const [images, setImages] = useState([]);
  const [comparisonResult, setComparisonResult] = useState(null);

const forgeries=useSelector((state)=>state.reducerX.dynamicData.forgeries);
const lastForgeryAttempt=useSelector((state)=>state.reducerX.dynamicData.lastForgeryAttempt);
const navigate = useNavigate();
const dispatch=useDispatch();


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

  // Rotate canvas before hashing
const getRotatedImageHash = (img, angleDeg) => {
  const size = 9;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = size;
  canvas.height = size;

  // Rotate around center
  ctx.translate(size / 2, size / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.drawImage(img, -size / 2, -size / 2, size, size);

  const data = ctx.getImageData(0, 0, size, size).data;
  let hash = "";

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size - 1; x++) {
      const i = (y * size + x) * 4;
      const j = (y * size + x + 1) * 4;

      const gray1 = (data[i] + data[i + 1] + data[i + 2]) / 3;
      const gray2 = (data[j] + data[j + 1] + data[j + 2]) / 3;

      hash += gray1 > gray2 ? "1" : "0";
    }
  }
  return hash;
};




  
// Generate hashes for all 4 rotations
const getImageHashes = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const hashes = [
          getRotatedImageHash(img, 0),
          getRotatedImageHash(img, 90),
          getRotatedImageHash(img, 180),
          getRotatedImageHash(img, 270),
        ];
        resolve(hashes);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
  

  // Hamming distance (how many bits differ between hashes)
const hammingDistance = (hash1, hash2) => {
  let dist = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) dist++;
  }
  return dist;
};

  
const handleFiles = (files) => {
  // take max 4 new files
  let fileArray = Array.from(files).slice(0, 7);

  // merge with existing images
  let merged = [...images, ...fileArray];

  setImages(merged);
};


  const handleCompare=async()=>{
console.log(">>>>>",images[1]);

try{
    const hash1=await getImageHashes(selectedFile);
    const hash2=await getImageHashes(comparisonFile);

    
  const distance = hammingDistance(hash1, hash2);

   // Finding the minimum distance between any rotation
   let minDist = Infinity;

   for (let h1 of hash1) {
     for (let h2 of hash2) {
       minDist = Math.min(minDist, hammingDistance(h1, h2));
     }
   }

    if(minDist<=5){
        alert('These images are the same,distance obtained between pixels:',distance);
    }
    else{
        alert('These images are not the same');
    }
  }
  catch(e){
    console.log("Error during comparison:",e);
  }
  finally{         
  }
  }

  const deleteForgeryObj =async (id) => {
    console.log('deleting forgery object:',id);

    if (await networkObject.isNetworkError()) {
        alert('Network Error');
        return;
    }

    const result = networkObject.sendPostRequest({ id:id},'/admin/delete-forgery');
    result.then((result) => {

        if (result.ok) {
            alert('Done deleting forgery');
            dispatch(deleteForgery({ forgeryID:id}));
        }
        else {
          alert('Error Occured');
            console.error('Something went wrong while polling the server');

        }
    })

}

  const processImages=()=>{
    setImages([selectedFile,comparisonFile]);
    setCompareResult("");
      handleCompare();
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    alert("Oops to Mr.delos");
  };

  /* Forgery records with timestamp
  const forgeries = [
    { id: 1, name: "John Doe", msisdn: "256700123456", img: "/sample1.png", timestamp: "2025-09-01 10:45" },
    { id: 2, name: "Jane Smith", msisdn: "256701234567", img: "/sample2.png", timestamp: "2025-08-31 15:20" },
  ];*/

  /* Fake compare
  const handleCompare = () => {
    if (!selectedFile){
      alert('No image selected');
      return;
    }

    if (selectedFile.name.includes("1")) {
      setCompareResult("Match found in quarantined images");
    } else {
      setCompareResult("No match found");
    }
  };*/

  useEffect(()=>{
    dispatch(pingServer());
    dispatch(getOnlineData());
    setTimeout(()=>{
      setRender(true);
    },2000);
    //  if(serverActive){ dispatch(getOnlineData());}
},[dispatch])

  return (
 renderInfo ?   <div>
          <Topbar/>
      {/* Stat Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <h3 className="text-sm text-gray-600">Total Forgeries</h3>
          <p className="text-2xl font-bold">{forgeries.length}</p>
        </Card>
        <Card className={'h-30 overflow-y-scroll border p-4'}>
          <h3 className="text-sm text-gray-600">Unique MSISDNs</h3>
          { forgeries.map((f)=>(
   <div className="contact-per-name space-x-3">
   <label className=" font-bold" >{(f.name).includes('=') ? f.name.slice(0,f.name.indexOf('=')).split('|')[0]:f.name.split('|')[0]}</label>
   <label className=" font-bold">{(f.msisdn).includes(',') ? f.msisdn.slice(0,f.msisdn.indexOf(',')):f.msisdn}</label>
     {
    // new Set(forgeries.map((f) => f.MSISDNS.length)).size
     }
   
   </div>
          ))
         
}
        </Card>
        <Card>
          <h3 className="text-sm text-gray-600">Last Attempt</h3>
          <p className="text-2xl text-green-700 font-bold">{lastForgeryAttempt}</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-red-700 border-b">
              <th className="p-2">Name</th>
              <th className="p-2">MSISDN</th>
              <th className="p-2">Image</th>
              <th className="p-2">Reject Reason</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody className="max-h-200 overflow-auto " >
            {forgeries.map((f) => (
              <tr key={f.id} className="border-b  hover:bg-gray-100 hover:text-green-600 cursor-pointer transition-colors ">
                <td className="p-2">{ (f.name).includes('=') ? f.name.slice(0,f.name.indexOf('=')).replace(/\|/g," "):f.name.split('|')}</td>
                <td className="p-2">{(f.msisdn).includes(',') ? f.msisdn.slice(0,f.msisdn.indexOf(',')):f.msisdn}</td>

                <td className="p-2">
                  <img src={SERVER_IP+f.images[0]} alt="img" className="w-12 h-12 object-cover rounded-lg border shadow-sm rounded-md" />
                </td>
                <td className="p-2 max-w-[200px] overflow-x-hidden">{f.rejectReason}</td>
                <td className="p-2 space-x-8">
                
                  <Button variant="secondary" 
                       size="sm"
                    onClick={() => navigate(`/details/${f.id}`)}>View</Button>
                  
                  <Button variant="destructive" onClick={()=>deleteForgeryObj(f.id)} size="sm">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Compare Upload */}
      <Card className="mt-6 shadow-lg border border-gray-200 rounded-2xl">
  <CardContent className="p-6">
    <h3 className="text-xl font-bold mb-6 text-red-900">Upload & Compare</h3>

    <div className="grid grid-cols-2 gap-6">
      {/* First image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload Image
        </label>
        <input
          type="file" id="upload1"
          accept="image/*"
          className="w-full text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900"
          onChange={(e) =>{setSelectedFile(e.target.files[0]); }}
        />
        {selectedFile && (
          <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300" >
          <img id="upload1-img"
            src={URL.createObjectURL(selectedFile)}
            alt="Uploaded Preview"
            className="h-40 w-full object-cover rounded-lg border mt-4 shadow-sm"
          />
             
          </div>
        )}
      </div>

      {/* Second image */}
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select Image to Compare With
        </label>
        <input
          type="file" id="upload2"
          accept="image/*"
          className="w-full text-sm border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:border-red-900 focus:ring-2 focus:ring-red-900"
          onChange={(e) =>{setComparisonFile(e.target.files[0]);  }}
        />
        {comparisonFile && (
          <div className="relative w-48 h-48 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
          <img id="upload2-img"
            src={URL.createObjectURL(comparisonFile)}
            alt="Comparison Preview"
            className="h-40 w-full object-cover rounded-lg border mt-4 shadow-sm"
          />
          
          </div>
        )}
      </div>
    </div>

    {/* Action button */}
    <div className="mt-6 flex space-x-3 justify-center">
      <Button
        className={`px-6 py-2 ${isComparing?'bg-grey-900 disabled' :'bg-red-900 hover:bg-red-700'  }  text-white font-semibold rounded-lg shadow`}
        onClick={() => {
          setIsComparing2(true);
          processImages();
          setTimeout(()=>{
            setIsComparing2(false);
          },2000);
        }}
      >
        Compare
      </Button>

      <Button
        className={`px-6 py-2 ${isComparing?'bg-grey-900 disabled' :'bg-red-900 hover:bg-red-700'  }  text-white font-semibold rounded-lg shadow`}
        onClick={() => {
        document.getElementById('upload1').value='';
        document.getElementById('upload1-img').src='';

        document.getElementById('upload2').value='';
        document.getElementById('upload2-img').src='';

        setSelectedFile(null);
        setComparisonFile(null);
        setIsComparing2(false);

        setImages([]);
        }}
      >
        Reset
      </Button>
    </div>

    {/* Progress indicator */}
    {isComparing2 && (
   <div className="flex flex-col items-center mt-6">
   <div className="w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
   <p className="text-sm text-gray-600 mt-2 text-center">
     Comparing images...
   </p>
 </div>
 
    )}

    {/* Result */}
    {compareResult && !isComparing && (
      <p className="mt-6 text-lg font-medium text-center text-gray-800">
        {compareResult}
      </p>
    )}
  </CardContent>
</Card>


   {/* Drag Upload */}
   <Card className="mt-6 shadow-lg border border-gray-200 rounded-2xl">
  <CardContent className="p-6">
    <h3 className="text-xl font-bold mb-6 text-red-900">Drag & Compare</h3>
    <div
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => document.getElementById("fileInput").click()}
            className="border-4 border-dashed border-red-300 rounded-3xl p-12 text-center cursor-pointer hover:bg-blue-50 transition-all duration-300 hover:shadow-lg"
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

    
         {/* Action button */}
    <div className="mt-6 flex justify-center">
      <Button
        className={`px-6 py-2 ${isComparing?'bg-grey-900 disabled' :'bg-red-900 hover:bg-red-700'  } bg-red-900 hover:bg-red-700 text-white font-semibold rounded-lg shadow`}
        onClick={() => {
          setIsComparing(true);
            processImages();
            setTimeout(()=>{setIsComparing(false)},2000);
          }}
      >
        Compare
      </Button>
      </div>

       {/* Progress indicator */}
    {isComparing && (
      <div className="mt-6">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 bg-red-900 rounded-full animate-pulse w-3/4"></div>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">
          Comparing images...
        </p>
      </div>
    )}
        
  </CardContent>
</Card>



      {/* Dialog for Adding Forgery */}
      <CustomDialog open={open} onClose={() => setOpen(false)} title="Add Forgery">
        <form>
          <label className="block mb-2">Name</label>
          <input type="text" id="name" className="border rounded p-2 w-full mb-4" />
          <label className="block mb-2">MSISDN</label>
          <input type="text" id="msisdn" className="border rounded p-2 w-full mb-4" />
          <label className="block mb-2">Upload Image</label>
          {
       //   <input type="file" id="selected_images"  onChange={(e) => handleFiles(e.target.files)} className="mb-4" />
}
          <Button type="submit">Save Forgery</Button>
        </form>
      </CustomDialog>
    </div>:
     <div className="flex flex-col items-center mt-60">
     <div className="w-12 h-12 border-4 border-red-900 border-t-transparent rounded-full animate-spin"></div>
     <p className="text-sm text-gray-600 mt-2 text-center">
     Please wait...
   </p>
   </div>
  );
};
