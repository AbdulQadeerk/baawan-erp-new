/**
 * ItemFileUpload — React equivalent of Angular's ItemFileUploadComponent
 * Angular: src/app/shared/item-file-upload/item-file-upload.component.ts
 */
import React, { useState, useEffect } from 'react';
import { UploadCloud, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { toast } from '../lib/toast';

interface ItemFileUploadProps {
  formResult: any;
  onUploadSuccess?: (fileList: any[]) => void;
}

export const ItemFileUpload: React.FC<ItemFileUploadProps> = ({
  formResult,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (formResult?.id && formResult?.images) {
      const list = formResult.images.map((img: any) => ({
        ...img,
        filePath: img.filePath || (img.fileName ? `Uploads/Item/${img.fileName}` : null),
      }));
      setFileList(list);
    }
  }, [formResult]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select only image files (JPEG, PNG, GIF, WebP, BMP)');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size should not exceed 5MB');
      e.target.value = '';
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !formResult?.id) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('attachedFile', selectedFile);
    formData.append('id', formResult.id);

    try {
      const data = await apiClient.post('/api/Item/UploadDocument', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newFile = {
        fileName: data.fileName + (data.isError ? data.errorMessage : ''),
        filePath: data.filePath,
        id: data.id,
        status: data.status,
        tableId: data.tableId,
      };

      const newList = [...fileList, newFile];
      setFileList(newList);
      setSelectedFile(null);
      toast.success('Item image added successfully.');
      onUploadSuccess?.(newList);
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (item: any, index: number) => {
    if (!window.confirm(`Do you want delete the image - ${item.fileName}?`)) return;

    if (item.id) {
      try {
        await apiClient.post('/api/Item/DeleteDocument', { id: item.id, tableId: formResult.id });
        const newList = fileList.filter((_, i) => i !== index);
        setFileList(newList);
        toast.success('Record Deleted');
        onUploadSuccess?.(newList);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete image');
      }
    } else {
      const newList = fileList.filter((_, i) => i !== index);
      setFileList(newList);
      onUploadSuccess?.(newList);
    }
  };

  const toggleStatus = async (item: any) => {
    const newStatus = !item.status;
    try {
      await apiClient.post('/api/Item/UpdateDocumentStatus', { id: item.id, status: newStatus });
      setFileList((prev) => prev.map((img) => (img.id === item.id ? { ...img, status: newStatus } : img)));
      toast.success('Record Updated');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <UploadCloud size={18} className="text-blue-600" /> Image Upload
      </h3>

      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <input
            type="file"
            id="item-file-upload"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 cursor-pointer"
          />
        </div>
        <button
          type="button"
          disabled={!selectedFile || isUploading}
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      {fileList.length > 0 && (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-left text-xs uppercase text-slate-500 font-bold">
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">File Name</th>
                <th className="px-4 py-2 text-center">Status</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fileList.map((item, idx) => (
                <tr key={idx} className="border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-2">
                    {item.filePath ? (
                      <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src={`https://api.baawanerp.com/${item.filePath}`} alt={item.fileName} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">N/A</div>
                    )}
                  </td>
                  <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300">
                    {item.fileName}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => toggleStatus(item)}
                      className={`p-1.5 rounded-full ${item.status ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}
                      title="Toggle Status"
                    >
                      {item.status ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {item.filePath && (
                        <a
                          href={`https://api.baawanerp.com/${item.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          title="View Image"
                        >
                          <Eye size={16} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemove(item, idx)}
                        className="p-1.5 text-rose-600 bg-rose-50 dark:bg-rose-900/30 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                        title="Delete Image"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
