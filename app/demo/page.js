'use client';

import React from 'react';
import { useEmailStore } from '@/store/emailStore';
import { useVideoStore } from '@/store/videoStore';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function VideoUploadForm() {
  const email = useEmailStore(state => state.email);
  const setEmail = useEmailStore(state => state.setEmail);

  const videos = useVideoStore(state => state.videos);
  const setVideos = useVideoStore(state => state.setVideos);

  const router = useRouter();

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    setVideos(videoFiles);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email || videos.length === 0) {
      alert('Please provide an email and upload at least one video.');
      console.log('Submission blocked: Missing email or videos');
      return;
    }
  
    const formData = new FormData();
    formData.append('email', email);
    videos.forEach(file => formData.append('files', file));
  
    try {
      console.log('Uploading data:', { email, videoCount: videos.length });
  
      const response = await axios.post('http://localhost:8000///upload_data', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      console.log('Upload successful:', response.data);
      router.push('/dashboard'); // Navigate to dashboard
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900/40 backdrop-blur-lg border border-gray-800/50 rounded-3xl shadow-2xl p-10 w-full max-w-2xl space-y-8 text-white"
      >
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text text-center">
          Upload Videos
        </h2>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="block w-full px-4 py-2 bg-gray-800/60 text-white border border-gray-700/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-1">
            Upload Video Files
          </label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-300 bg-gray-800/60 border border-gray-700/40 rounded-xl p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
          <p className="text-xs text-gray-500 mt-2">You can select multiple video files</p>
        </div>

        {videos.length > 0 && (
          <div className="bg-gray-800/40 border border-gray-700/30 rounded-xl p-4 text-sm text-gray-300 space-y-2">
            <p className="font-medium text-gray-400">Files Selected:</p>
            <ul className="list-disc ml-5 space-y-1">
              {videos.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
