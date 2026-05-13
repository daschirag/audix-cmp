// src/hooks/useConsentValidation.js
import { useState, useCallback } from 'react';
import { consentFormSchema, getMissingMandatoryIds, getMandatoryProgress } from '../utils/consentSchema';

export const useConsentValidation = () => {
  const [errors, setErrors] = useState([]);

  const validateForm = useCallback((formData) => {
    const result = consentFormSchema.safeParse(formData);

    if (!result.success) {
      const errorMessages = [];

      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'mandatoryConsents') {
          errorMessages.push(`Missing mandatory consents: ${issue.message}`);
        } else if (issue.path[0] === 'guardian') {
          errorMessages.push(`Guardian: ${issue.message}`);
        } else if (issue.path[0] === 'guardianAgreements') {
          errorMessages.push(issue.message);
        } else {
          errorMessages.push(issue.message);
        }
      });

      setErrors(errorMessages);
      return false;
    }

    setErrors([]);
    return true;
  }, []);

  const getMissingIds = useCallback((selected = {}) => {
    return getMissingMandatoryIds(selected);
  }, []);

  const getProgress = useCallback((selected = {}) => {
    return getMandatoryProgress(selected);
  }, []);

  return {
    errors,
    setErrors,
    validateForm,
    getMissingIds,
    getProgress,
  };
};