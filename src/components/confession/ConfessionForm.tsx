import React, { useState } from 'react';
import { ConfessionFormData } from '../../types';
import AudioRecorder from '../common/AudioRecorder';

interface ConfessionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData | ConfessionFormData) => Promise<void>;
  isLoading?: boolean; // This prop is now ignored in favor of local state
}

const ConfessionForm: React.FC<ConfessionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ConfessionFormData>({
    city: '',
    sex: '',
    age: '',
    description: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ConfessionFormData, string>>>({});
  const [useVoice, setUseVoice] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof ConfessionFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ConfessionFormData, string>> = {};

    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.sex) newErrors.sex = 'Gender is required';
    if (!formData.age) {
      newErrors.age = 'Age is required';
    } else if (parseInt(formData.age) < 13 || parseInt(formData.age) > 100) {
      newErrors.age = 'Age must be between 13 and 100';
    }
    if (!useVoice) {
      if (!formData.description.trim()) {
        newErrors.description = 'Confession is required';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Confession must be at least 10 characters';
      } else if (formData.description.trim().length > 1000) {
        newErrors.description = 'Confession must be less than 1000 characters';
      }
    } else {
      if (!audioBlob) {
        newErrors.description = 'Please record your confession.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRecordingComplete = (blob: Blob | null) => {
    setAudioBlob(blob);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (useVoice && audioBlob) {
        const formDataToSend = new FormData();
        formDataToSend.append('city', formData.city);
        formDataToSend.append('sex', formData.sex);
        formDataToSend.append('age', formData.age);
        formDataToSend.append('audio', audioBlob, 'confession.webm');
        await onSubmit(formDataToSend);
      } else {
        await onSubmit(formData);
      }
      setFormData({ city: '', sex: '', age: '', description: '' });
      setAudioBlob(null);
      setErrors({});
    } catch (error) {
      // Optionally show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ city: '', sex: '', age: '', description: '' });
    setAudioBlob(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Share Your Confession</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close confession form"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="confession-city" className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                id="confession-city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`input-field ${errors.city ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your city"
                autoComplete="address-level2"
              />
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="confession-sex" className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                id="confession-sex"
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                className={`input-field ${errors.sex ? 'border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.sex && <p className="text-red-500 text-sm mt-1">{errors.sex}</p>}
            </div>

            <div>
              <label htmlFor="confession-age" className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                id="confession-age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className={`input-field ${errors.age ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter your age"
                min="13"
                max="100"
                autoComplete="bday"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <div className="flex items-center mb-2">
                <label
                  htmlFor={useVoice ? "confession-audio" : "confession-description"}
                  className="block text-sm font-medium text-gray-700"
                >
                  Your Confession *
                </label>
                <button
                  type="button"
                  className="ml-4 px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs"
                  onClick={() => setUseVoice(v => !v)}
                >
                  {useVoice ? 'Type Instead' : 'Record Voice'}
                </button>
              </div>
              {useVoice ? (
                <div>
                  <AudioRecorder onRecordingComplete={handleRecordingComplete} />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  {audioBlob && (
                    <audio controls src={URL.createObjectURL(audioBlob)} className="mt-2" id="confession-audio" />
                  )}
                </div>
              ) : (
                <div>
                  <textarea
                    id="confession-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={5}
                    className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Share your confession anonymously... What's on your mind?"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-2">
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    <p className="text-gray-500 text-sm ml-auto">
                      {formData.description.length}/1000
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    Submitting...
                  </span>
                ) : (
                  'Submit Confession'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConfessionForm;
