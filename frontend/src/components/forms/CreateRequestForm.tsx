'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { requestService } from '@/services/requestService';
import { AxiosError } from 'axios';
import { RequestType } from '@/types';

interface Props {
  onSuccess: () => void;
}

export default function CreateRequestForm({ onSuccess }: Props) {
  const [type, setType] = useState<RequestType>('LEAVE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic fields
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [itemName, setItemName] = useState('');
  const [amount, setAmount] = useState('');
  const [hours, setHours] = useState('');
  const [overtimeDate, setOvertimeDate] = useState('');

  // PROJECT_COMPLETION Fields
  const [actualStartDate, setActualStartDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [projectLink, setProjectLink] = useState('');
  const [finalDocument, setFinalDocument] = useState<File | null>(null);
  const [summary, setSummary] = useState('');

  // OD_REQUEST Fields
  const [odDate, setOdDate] = useState('');
  const [approvedByFaculty, setApprovedByFaculty] = useState('');
  const [supportingDocument, setSupportingDocument] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }

    // Additional Validations
    if (type === 'PROJECT_COMPLETION') {
      if (completionDate && actualEndDate && new Date(completionDate) < new Date(actualEndDate)) {
        toast.error('Completion Date cannot be before Actual End Date');
        return;
      }
      if (!projectLink && !finalDocument) {
        toast.error('Either Project Link or Final Document must be provided');
        return;
      }
    }

    setIsLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        // Common
        startDate: type === 'LEAVE' ? startDate : undefined,
        endDate: type === 'LEAVE' ? endDate : undefined,
        itemName: type === 'PURCHASE' ? itemName : undefined,
        amount: type === 'PURCHASE' ? parseFloat(amount) : undefined,
        hours: type === 'OVERTIME' ? parseInt(hours) : undefined,
        overtimeDate: type === 'OVERTIME' ? overtimeDate : undefined,
        // PROJECT_COMPLETION
        actualStartDate: type === 'PROJECT_COMPLETION' ? actualStartDate : undefined,
        actualEndDate: type === 'PROJECT_COMPLETION' ? actualEndDate : undefined,
        completionDate: type === 'PROJECT_COMPLETION' ? completionDate : undefined,
        projectLink: type === 'PROJECT_COMPLETION' ? projectLink : undefined,
        summary: type === 'PROJECT_COMPLETION' ? summary : undefined,
        finalDocument: type === 'PROJECT_COMPLETION' ? (finalDocument || undefined) : undefined,
        // OD_REQUEST
        odDate: type === 'OD_REQUEST' ? odDate : undefined,
        approvedByFaculty: type === 'OD_REQUEST' ? approvedByFaculty : undefined,
        supportingDocument: type === 'OD_REQUEST' ? (supportingDocument || undefined) : undefined,
      };

      await requestService.createRequest(payload);
      toast.success('Request submitted successfully!');
      resetForm();
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setItemName('');
    setAmount('');
    setHours('');
    setOvertimeDate('');
    setActualStartDate('');
    setActualEndDate('');
    setCompletionDate('');
    setProjectLink('');
    setFinalDocument(null);
    setSummary('');
    setOdDate('');
    setApprovedByFaculty('');
    setSupportingDocument(null);
  };

  const renderDynamicFields = () => {
    switch (type) {
      case 'LEAVE':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" required />
            </div>
          </div>
        );
      case 'PROJECT_COMPLETION':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="label">Actual Start Date</label>
                <input type="date" value={actualStartDate} onChange={(e) => setActualStartDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label">Actual End Date</label>
                <input type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label">Completion Date</label>
                <input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="input-field" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Project Link (Optional)</label>
                <input type="url" value={projectLink} onChange={(e) => setProjectLink(e.target.value)} className="input-field" placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="label">Final Document (PDF)</label>
                <input type="file" accept=".pdf" onChange={(e) => setFinalDocument(e.target.files?.[0] || null)} className="file-input" />
              </div>
            </div>
            <div>
              <label className="label">Project Summary</label>
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="input-field h-20 resize-none" placeholder="Briefly summarize the results..." required />
            </div>
          </div>
        );
      case 'PURCHASE':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Item Name</label>
              <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="input-field" placeholder="E.g. MacBook Pro" required />
            </div>
            <div>
              <label className="label">Amount ($)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="input-field" placeholder="0.00" required />
            </div>
          </div>
        );
      case 'OVERTIME':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input type="date" value={overtimeDate} onChange={(e) => setOvertimeDate(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="label">Hours</label>
              <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="input-field" placeholder="8" required />
            </div>
          </div>
        );
      case 'OD_REQUEST':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">On-Duty Date</label>
                <input type="date" value={odDate} onChange={(e) => setOdDate(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="label">Approved By Faculty (Optional)</label>
                <input type="text" value={approvedByFaculty} onChange={(e) => setApprovedByFaculty(e.target.value)} className="input-field" placeholder="Name of Faculty" />
              </div>
            </div>
            <div>
              <label className="label">Supporting Document (Optional)</label>
              <input type="file" onChange={(e) => setSupportingDocument(e.target.files?.[0] || null)} className="file-input" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">New Request</h2>
        <button onClick={() => setIsOpen(!isOpen)}
          className={`btn-${isOpen ? 'secondary' : 'primary'} text-sm py-1.5 px-3`}>
          {isOpen ? '− Cancel' : '+ New Request'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Request Type</label>
              <select
                value={type}
                onChange={(e) => {
                  const newType = e.target.value as RequestType;
                  setType(newType);
                  resetForm();
                  setTitle('');
                  setDescription('');
                }}
                className="input-field"
              >
                <option value="LEAVE">🌴 Leave Request</option>
                <option value="PROJECT_COMPLETION">✅ Project Completion</option>
                <option value="PURCHASE">💰 Purchase Request</option>
                <option value="OVERTIME">⏰ Overtime Claim</option>
                <option value="OD_REQUEST">📍 On-Duty Request</option>
              </select>
            </div>
            <div>
              <label className="label">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="Brief title"
                required
              />
            </div>
          </div>

          {renderDynamicFields()}

          <div>
            <label className="label">{type === 'OD_REQUEST' ? 'Reason / Purpose' : 'Description / Justification'}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field h-24 resize-none"
              placeholder="Provide more context..."
              maxLength={2000}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? 'Submitting...' : 'Submit Request'}
            </button>
            <button type="button" onClick={() => setIsOpen(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      )}

      <style jsx>{`
        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.25rem;
        }
        .file-input {
          width: 100%;
          font-size: 0.875rem;
          color: #4b5563;
          file-selector-button: {
            background-color: #f3f4f6;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            padding: 0.25rem 0.5rem;
            margin-right: 0.5rem;
            cursor: pointer;
          }
        }
      `}</style>
    </div>
  );
}
