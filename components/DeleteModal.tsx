"use client";
import { useState } from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  title: string;
}

export default function DeleteModal({ isOpen, onClose, onConfirm, loading, title }: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Supprimer cette annonce ?</h2>
        <p className="text-gray-600 mb-2">
          Vous êtes sur le point de supprimer "{title}".
        </p>
        <p className="text-gray-600 mb-6">
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-outline flex-1"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}