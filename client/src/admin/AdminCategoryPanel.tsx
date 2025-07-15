import React, { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

// 🌐 Cloudinary & API base from env
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_BASE = import.meta.env.VITE_API_URL;

type Category = {
  _id?: string;
  name: string;
  image: string;
};

const AdminCategoryPanel = () => {
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!name || !imageFile) {
      toast.error('Category name and image are required.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      // Upload to Cloudinary
      const cloudinaryRes = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      const imageUrl = cloudinaryData.secure_url;

      if (!imageUrl) throw new Error('Image upload failed');

      // Save to MongoDB
      const mongoRes = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image: imageUrl }),
      });

      if (!mongoRes.ok) throw new Error('Failed to save category');

      await fetchCategories();
      toast.success('Category added!');
      setName('');
      setImageFile(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error(err);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Delete failed');

      await fetchCategories();
      toast.success('Category deleted');
    } catch (err) {
      console.error(err);
      toast.error('Error deleting category');
    }
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const parsed = results.data as Category[];
        let successCount = 0;
        let errorCount = 0;

        for (const cat of parsed) {
          if (!cat.name || !cat.image) {
            errorCount++;
            continue;
          }

          try {
            const res = await fetch(`${API_BASE}/api/categories`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(cat),
            });

            if (!res.ok) throw new Error('Failed to add');

            successCount++;
          } catch (err) {
            console.error(err);
            errorCount++;
          }
        }

        toast.success(`${successCount} categories added, ${errorCount} failed`);
        await fetchCategories();

        // Clear file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Manage Categories</h2>

      {/* Add Category Manually */}
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        className="w-full p-2 mb-4 border rounded"
      />

      <div
        className="w-full h-40 border-2 border-dashed rounded flex items-center justify-center bg-gray-50 mb-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="preview" className="h-full object-contain" />
        ) : (
          <span className="text-gray-400">Drag & drop image here</span>
        )}
      </div>

      <button
        onClick={handleUpload}
        className="mb-6 w-full bg-black text-white py-2 rounded hover:bg-gray-800"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Add Category'}
      </button>

      {/* Bulk Upload */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Bulk Upload Categories via CSV</h3>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
          "
        />
      </div>

      {/* Existing Categories */}
      <h3 className="text-xl font-semibold mb-3">Existing Categories</h3>
      <ul className="space-y-4">
        {categories.map((cat) => (
          <li
            key={cat._id}
            className="flex items-center justify-between bg-gray-100 p-3 rounded shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img
                src={cat.image}
                alt={cat.name}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <span className="text-lg font-medium">{cat.name}</span>
            </div>
            <div className="flex gap-2">
              <button className="text-blue-600 hover:underline" disabled>
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat._id!)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategoryPanel;
