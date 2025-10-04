import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { usePolls } from '../contexts/PollContext';
import { Plus, X, Eye, EyeOff, Clock } from 'lucide-react';

const schema = yup.object({
  title: yup.string().required('Title is required').max(500, 'Title must be less than 500 characters'),
  description: yup.string().required('Description is required').max(2000, 'Description must be less than 2000 characters'),
  options: yup.array()
    .of(yup.string().required('Option cannot be empty'))
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed'),
  visibility: yup.string().oneOf(['public', 'private']).required('Visibility is required'),
  expiresAt: yup.string()
    .required('Expiry date is required')
    .test('is-future', 'Expiry date must be in the future', function(value) {
      if (!value) return false;
      return new Date(value) > new Date();
    }),
  allowedUserIds: yup.array().optional()
});

const CreatePoll = () => {
  const { createPoll } = usePolls();
  const navigate = useNavigate();
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      visibility: 'public',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16) // 1 hour from now
    }
  });

  // Set the default value for datetime input
  useEffect(() => {
    const defaultTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
    setValue('expiresAt', defaultTime);
  }, [setValue]);

  const visibility = watch('visibility');

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      setValue('options', newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setValue('options', newOptions);
  };

  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    setIsSubmitting(true);
    setError('');

    try {
      // Filter out empty options
      const validOptions = data.options.filter(option => option.trim() !== '');
      
      if (validOptions.length < 2) {
        setError('At least 2 valid options are required');
        setIsSubmitting(false);
        return;
      }

      // Check for duplicate options
      const uniqueOptions = [...new Set(validOptions)];
      if (uniqueOptions.length !== validOptions.length) {
        setError('Options must be unique');
        setIsSubmitting(false);
        return;
      }

      // Validate expiry time (max 2 hours)
      const expiresAt = new Date(data.expiresAt);
      const now = new Date();
      const maxExpiry = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      if (expiresAt > maxExpiry) {
        setError('Poll duration cannot exceed 2 hours');
        setIsSubmitting(false);
        return;
      }

      const pollData = {
        ...data,
        options: validOptions,
        expiresAt: expiresAt.toISOString()
      };

      console.log('Sending poll data:', pollData);
      const result = await createPoll(pollData);
      console.log('Create poll result:', result);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-poll">
      <div className="page-header">
        <h1>Create New Poll</h1>
        <p>Create a new poll for users to vote on</p>
      </div>

      <div className="create-poll-card">
        <form onSubmit={handleSubmit(onSubmit)} className="create-poll-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Poll Title *</label>
            <input
              {...register('title')}
              type="text"
              id="title"
              placeholder="Enter poll title"
              className={errors.title ? 'error' : ''}
            />
            {errors.title && (
              <span className="field-error">{errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              {...register('description')}
              id="description"
              placeholder="Describe what this poll is about"
              rows="4"
              className={errors.description ? 'error' : ''}
            />
            {errors.description && (
              <span className="field-error">{errors.description.message}</span>
            )}
          </div>

          <div className="form-group">
            <label>Poll Options *</label>
            <div className="options-container">
              {options.map((option, index) => (
                <div key={index} className="option-input-group">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className={errors.options?.[index] ? 'error' : ''}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="remove-option-btn"
                    >
                      <X />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="add-option-btn"
                >
                  <Plus className="btn-icon" />
                  Add Option
                </button>
              )}
            </div>
            {errors.options && (
              <span className="field-error">{errors.options.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="visibility">Visibility *</label>
            <div className="radio-group">
              <label className="radio-item">
                <input
                  {...register('visibility')}
                  type="radio"
                  value="public"
                />
                <div className="radio-content">
                  <Eye className="radio-icon" />
                  <div>
                    <div className="radio-label">Public</div>
                    <div className="radio-description">Anyone can view and vote</div>
                  </div>
                </div>
              </label>
              
              <label className="radio-item">
                <input
                  {...register('visibility')}
                  type="radio"
                  value="private"
                />
                <div className="radio-content">
                  <EyeOff className="radio-icon" />
                  <div>
                    <div className="radio-label">Private</div>
                    <div className="radio-description">Only selected users can view and vote</div>
                  </div>
                </div>
              </label>
            </div>
            {errors.visibility && (
              <span className="field-error">{errors.visibility.message}</span>
            )}
          </div>

          {visibility === 'private' && (
            <div className="form-group">
              <label>Allowed Users</label>
              <div className="private-users-note">
                <p>Note: For private polls, you'll need to specify user IDs. This feature will be enhanced in future versions.</p>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="expiresAt">Expiry Date & Time *</label>
            <div className="datetime-input">
              <Clock className="input-icon" />
              <input
                {...register('expiresAt')}
                type="datetime-local"
                id="expiresAt"
                className={errors.expiresAt ? 'error' : ''}
              />
            </div>
            <div className="input-help">
              Poll will be active for maximum 2 hours from now
            </div>
            {errors.expiresAt && (
              <span className="field-error">{errors.expiresAt.message}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePoll;
