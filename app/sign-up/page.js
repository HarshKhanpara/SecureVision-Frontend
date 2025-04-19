'use client';

import { redirect } from 'next/navigation';
import { useState } from 'react';

function Input({ type, name, value, onChange, placeholder }) {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-black px-3 py-2 shadow-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

function Button({ children, type, onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">{children}</div>
  );
}

function CardHeader({ title }) {
  return (
    <div className="mb-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
  );
}

function CardContent({ children }) {
  return <div className="space-y-5">{children}</div>;
}

export default function AuthPage() {
  const [form, setForm] = useState({
    email: '',
    cctv1: '',
    cctv2: '',
    cctv3: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email.trim()) {
      setError('Email is required.');
      return;
    }
    setError('');

    const cctvUrls = [form.cctv1, form.cctv2, form.cctv3].filter((url) => url.trim() !== '');
    console.log('Email:', form.email);
    console.log('Filled CCTV URLs:', cctvUrls);
    redirect(`/dashboard?email=${form.email}&cctvUrls=${encodeURIComponent(JSON.stringify(cctvUrls))}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <Card>
        <CardHeader title="Register CCTV Feeds" />
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CCTV URL 1 <span className="text-gray-400 text-sm">(optional)</span>
              </label>
              <Input
                type="url"
                name="cctv1"
                value={form.cctv1}
                onChange={handleChange}
                placeholder="https://example.com/cctv1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CCTV URL 2 <span className="text-gray-400 text-sm">(optional)</span>
              </label>
              <Input
                type="url"
                name="cctv2"
                value={form.cctv2}
                onChange={handleChange}
                placeholder="https://example.com/cctv2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CCTV URL 3 <span className="text-gray-400 text-sm">(optional)</span>
              </label>
              <Input
                type="url"
                name="cctv3"
                value={form.cctv3}
                onChange={handleChange}
                placeholder="https://example.com/cctv3"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <Button type="submit">Submit</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
